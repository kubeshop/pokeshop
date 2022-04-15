import { SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import ampqlib from 'amqplib';

const { RABBITMQ_HOST = '' } = process.env;

export interface QueueService<T> {
  healthcheck(): Promise<boolean>;
  send(message: T): Promise<boolean>;
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

  public async healthcheck(): Promise<boolean> {
    return this.instrumentMethod('QueueService healthcheck', () => this.queueService.healthcheck());
  }

  public async send(message: T): Promise<boolean> {
    return this.instrumentMethod('QueueService send', () => this.queueService.send(message));
  }

  public async subscribe(callback: Function): Promise<void> {
    const parentSpan = await getParentSpan();

    const instrumentedCallback = async (message) => {
      const span = await createSpan('rabbitmq process', parentSpan);
      try {
        return await runWithSpan(span, async () => callback(message));
      } catch (ex) {
        span.recordException(ex);
        span.setStatus({ code: SpanStatusCode.ERROR });
      } finally {
        span.end();
      }
    }

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
    if (useCache && this.channel) {
      return this.channel;
    }

    try {
      const connection = await ampqlib.connect(`amqp://${RABBITMQ_HOST}`);
      const channel = await connection.createChannel();
      await channel.assertQueue(this.messageGroup);
      this.channel = channel;
    } catch (ex) {
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
      return false;
    }
  }

  public async send(message: T): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const channel = await this.connect();
        const messageSent = channel.sendToQueue(this.messageGroup, Buffer.from(JSON.stringify(message)))
        resolve(messageSent);
      } catch (ex) {
        reject(false);
      }
    });
  }

  public async subscribe(callback: Function): Promise<void> {
    const channel = await this.connect();
    const onConsume = async (message) => {
      if (message) {
        try {
          await callback(message);
          channel.ack(message);
        } catch(ex) {
          channel.nack(message);
          throw ex;
        }
      }
    }
    channel.consume(this.messageGroup, onConsume)
  }
};

export { createQueueService };
