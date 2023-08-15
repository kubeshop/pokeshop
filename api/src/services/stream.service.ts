import { context, propagation, Span, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { SemanticAttributes, MessagingOperationValues, MessagingDestinationKindValues } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import { createSpanFromContext, runWithSpan } from '@pokemon/telemetry/tracing';
import { Kafka, Consumer, KafkaMessage } from 'kafkajs'
import { CustomTags } from '../constants/Tags';

const { KAFKA_BROKER = '', KAFKA_TOPIC = '', KAFKA_CLIENT_ID = '' } = process.env;

export interface StreamingService<T> {
  subscribe(callback: Function): Promise<void>;
}

function createStreamingService<T>(): StreamingService<T> {
  const stream = new KafkaStreamService(KAFKA_TOPIC);
  return new InstrumentedKafkaStreamService(KAFKA_TOPIC, stream);
}

class InstrumentedKafkaStreamService<T> extends InstrumentedComponent implements StreamingService<T> {
  private readonly topic: string;
  private readonly streamService: StreamingService<T>;

  public constructor(topic: string, streamService: StreamingService<T>) {
    super();
    this.topic = topic;
    this.streamService = streamService;
  }

  getBaseAttributes() {
    return {
      [SemanticAttributes.MESSAGING_SYSTEM]: 'kafka',
      [SemanticAttributes.MESSAGING_DESTINATION]: this.topic,
      [SemanticAttributes.MESSAGING_DESTINATION_KIND]: MessagingDestinationKindValues.TOPIC,
    };
  }

  public async subscribe(callback: Function): Promise<void> {
    const instrumentedCallback = async (message: KafkaMessage) => {
      const headers = message.headers ?? {};
      const parentContext = propagation.extract(context.active(), headers);
      const span = await createSpanFromContext(
        `${this.topic} ${MessagingOperationValues.PROCESS}`,
        parentContext,
        {
          kind: SpanKind.CONSUMER,
        }
      );

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.MESSAGING_OPERATION]: MessagingOperationValues.PROCESS,
        [SemanticAttributes.MESSAGE_ID]: message.key?.toString(),
        [CustomTags.MESSAGING_PAYLOAD]: JSON.stringify(message),
      });

      try {
        return await runWithSpan(span, async () => callback(message));
      } catch (ex) {
        span.recordException(ex);
        span.setStatus({ code: SpanStatusCode.ERROR });
      } finally {
        span.end();
      }
    };

    const response = await this.streamService.subscribe(instrumentedCallback);
    return response;
  }
}

class KafkaStreamService<T> implements StreamingService<T> {
  private client: Kafka | null = null;
  private consumer: Consumer | null = null;
  private readonly topic: string;

  public constructor(topic: string) {
    this.topic = topic;
  }

  private async connect(): Promise<Consumer> {
    if (this.consumer !== null) {
      return this.consumer;
    }

    try {
      const client = new Kafka({
        clientId: KAFKA_CLIENT_ID,
        brokers: [KAFKA_BROKER]
      });

      const consumer = client.consumer({ groupId: 'test-group' });
      await consumer.connect();

      this.client = client;
      this.consumer = consumer;
    } catch (ex) {
      throw new Error(`could not connect to stream service: ${ex}`);
    }

    return this.consumer;
  }

  public async subscribe(callback: Function): Promise<void> {
    const consumer = await this.connect();

    return consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await callback(message);
      },
    })
  }
}

export { createStreamingService };
