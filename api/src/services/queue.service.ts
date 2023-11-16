import { context, propagation, Span, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { SemanticAttributes, MessagingOperationValues } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import { createSpanFromContext, runWithSpan } from '@pokemon/telemetry/tracing';
import ampqlib from 'amqplib';
import { snakeCase } from 'lodash';
import { CustomTags } from '../constants/Tags';

const { RABBITMQ_HOST = '' } = process.env;

export interface QueueService<T> {
  healthcheck(): Promise<boolean>;
  send(message: T, headers?: any): Promise<boolean>;
  subscribe(callback: Function): Promise<void>;
}

function createQueueService<T>(messageGroup: string): QueueService<T> {
  const rabbitQueue = new RabbitQueueService(messageGroup);
  return new InstrumentedRabbitQueueService(messageGroup, rabbitQueue);
}

class InstrumentedRabbitQueueService<T> extends InstrumentedComponent implements QueueService<T> {
  private readonly messageGroup: string;
  private readonly queueService: QueueService<T>;

  public constructor(messageGroup: string, queueService: QueueService<T>) {
    super();
    this.messageGroup = messageGroup;
    this.queueService = queueService;
  }

  getBaseAttributes() {
    return {
      [SemanticAttributes.MESSAGING_SYSTEM]: 'rabbitmq',
      [SemanticAttributes.MESSAGING_URL]: RABBITMQ_HOST,
      [SemanticAttributes.NET_PEER_NAME]: RABBITMQ_HOST,
      [SemanticAttributes.MESSAGING_DESTINATION]: this.messageGroup,
    };
  }

  public async healthcheck(): Promise<boolean> {
    return this.instrumentMethod(`${this.messageGroup} publish`, SpanKind.INTERNAL, async (span: Span) => {
      span.setAttributes(this.getBaseAttributes());

      return this.queueService.healthcheck();
    });
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

  public async subscribe(callback: Function): Promise<void> {
    const instrumentedCallback = async (message: ampqlib.ConsumeMessage) => {
      const headers = message.properties.headers ?? {};
      const parentContext = propagation.extract(context.active(), headers);

      console.log('Extracting headers from message to get OTel data...')
      console.log('Message headers: ', headers)
      console.log('Context: ', parentContext)

      const span = await createSpanFromContext(
        `${this.messageGroup} ${MessagingOperationValues.PROCESS}`,
        parentContext,
        {
          kind: SpanKind.CONSUMER,
        }
      );

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.MESSAGING_OPERATION]: MessagingOperationValues.PROCESS,
        [SemanticAttributes.MESSAGE_ID]: message.properties.messageId,
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

    const response = await this.queueService.subscribe(instrumentedCallback);
    return response;
  }
}

class RabbitQueueService<T> implements QueueService<T> {
  private channel: ampqlib.Channel | null = null;
  private readonly messageGroup: string;

  public constructor(messageGroup: string) {
    this.messageGroup = messageGroup;
  }

  private async connect(useCache: boolean = true): Promise<ampqlib.Channel> {
    let lastError;
    for (let i = 0; i < 10; i++) {
      try {
        return await this._connect(useCache)
      } catch (ex) {
        lastError = ex
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    throw new Error(`could not connect after 10 tries: ${lastError?.message}`)
  }

  private async _connect(useCache: boolean = true): Promise<ampqlib.Channel> {
    if (useCache && this.channel) {
      return this.channel;
    }

    try {
      const connection = await ampqlib.connect(`amqp://${RABBITMQ_HOST}`);
      const channel = await connection.createChannel();
      await channel.assertQueue(this.messageGroup);
      this.channel = channel;
    } catch (ex) {
      await this.handleException(ex);
      throw new Error(`could not connect to queue service: ${ex}`);
    }

    return this.channel;
  }

  public async healthcheck(): Promise<boolean> {
    try {
      const channel = await this.connect(false);
      await channel.assertQueue(this.messageGroup);
      await channel.close();
      return true;
    } catch (ex) {
      await this.handleException(ex);
      return false;
    }
  }

  public async send(message: T, headers?: any): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const channel = await this.connect();
        const messageSent = channel.sendToQueue(this.messageGroup, Buffer.from(JSON.stringify(message)), { headers });
        resolve(messageSent);
      } catch (ex) {
        this.handleException(ex);
        reject(false);
      }
    });
  }

  public async subscribe(callback: Function): Promise<void> {
    const channel = await this.connect(false);
    const onConsume = async message => {
      if (message) {
        try {
          await callback(message);
          channel.ack(message);
        } catch (ex) {
          this.handleException(ex);
          channel.nack(message);
          throw ex;
        }
      }
    };
    const reconnect = () => setTimeout(() => this.subscribe(callback), 1000);
    channel.on("close", reconnect);
    channel.on("error", reconnect);
    channel.consume(this.messageGroup, onConsume);
  }

  private async handleException(ex: Error): Promise<void> {
    if (ex.message == "Channel closed") {
      this.channel = null;
    }
  }
}

export { createQueueService };
