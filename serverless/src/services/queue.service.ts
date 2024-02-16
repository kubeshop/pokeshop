import { context, propagation, Span, SpanKind, trace, SpanStatusCode } from '@opentelemetry/api';
import { SQSRecord } from 'aws-lambda';
import { SQS } from '@aws-sdk/client-sqs';
import { SemanticAttributes, MessagingOperationValues } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '../telemetry/instrumented.component';
import { snakeCase } from 'lodash';
import { CustomTags } from '../constants/tags';
import { createSpanFromContext, runWithSpan } from '../telemetry/tracing';

const { SQS_QUEUE_URL = '' } = process.env;

export interface QueueService<T> {
  send(message: T, headers?: any): Promise<boolean>;
}

function createQueueService<T>(
  messageGroup: string
): QueueService<T> & { withWorker: (message: SQSRecord, handler: (message: SQSRecord) => void) => void } {
  const rabbitQueue = new SQSQueueService(messageGroup);
  return new InstrumentedSQSQueueService(messageGroup, rabbitQueue);
}

class InstrumentedSQSQueueService<T> extends InstrumentedComponent implements QueueService<T> {
  private readonly messageGroup: string;
  private readonly queueService: QueueService<T>;

  public constructor(messageGroup: string, queueService: QueueService<T>) {
    super();
    this.messageGroup = messageGroup;
    this.queueService = queueService;
  }

  getBaseAttributes() {
    return {
      [SemanticAttributes.MESSAGING_SYSTEM]: 'sqs',
      [SemanticAttributes.MESSAGING_URL]: SQS_QUEUE_URL,
      [SemanticAttributes.NET_PEER_NAME]: SQS_QUEUE_URL,
      [SemanticAttributes.MESSAGING_DESTINATION]: this.messageGroup,
    };
  }

  public async send(message: T): Promise<boolean> {
    return this.instrumentMethod(`${this.messageGroup} publish`, SpanKind.PRODUCER, async (span: Span) => {
      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.MESSAGING_OPERATION]: 'publish',
        [CustomTags.MESSAGING_PAYLOAD]: JSON.stringify(message),
      });

      const headers = {};
      propagation.inject(trace.setSpan(context.active(), span), headers);
      Object.entries(headers).forEach(([key, value]) => {
        span.setAttribute(`${CustomTags.MESSAGING_HEADER}.${snakeCase(key)}`, JSON.stringify([value]));
      });

      return this.queueService.send(message, headers);
    });
  }

  public async withWorker(message: SQSRecord, handler: (message: SQSRecord) => void) {
    const messageGroup = this.messageGroup;
    const baseAttributes = this.getBaseAttributes();

    const { messageAttributes, messageId } = message;
    const headers = Object.entries(messageAttributes).reduce(
      (acc, [key, { stringValue }]) => ({ ...acc, [key]: stringValue }),
      {}
    );
    const parentContext = propagation.extract(context.active(), headers);

    const span = await createSpanFromContext(`${messageGroup} ${MessagingOperationValues.PROCESS}`, parentContext, {
      kind: SpanKind.CONSUMER,
    });

    span.setAttributes({
      ...baseAttributes,
      [SemanticAttributes.MESSAGING_OPERATION]: MessagingOperationValues.PROCESS,
      [SemanticAttributes.MESSAGE_ID]: messageId,
      [CustomTags.MESSAGING_PAYLOAD]: JSON.stringify(message),
    });

    try {
      return await runWithSpan(span, async () => handler(message));
    } catch (ex) {
      span.recordException(ex);
      span.setStatus({ code: SpanStatusCode.ERROR });
    } finally {
      span.end();
    }
  }
}

class SQSQueueService<T> implements QueueService<T> {
  private readonly messageGroup: string;
  private sqs: SQS;

  public constructor(messageGroup: string) {
    this.messageGroup = messageGroup;
    this.sqs = new SQS();
  }

  public async send(message: T, headers): Promise<boolean> {
    const result = await this.sqs.sendMessage({
      MessageBody: JSON.stringify(message),
      QueueUrl: SQS_QUEUE_URL,
      MessageGroupId: this.messageGroup,
      MessageAttributes: Object.entries(headers).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: { DataType: 'String', StringValue: value },
        }),
        {}
      ),
    });

    return !!result.MessageId;
  }
}

export { createQueueService };
