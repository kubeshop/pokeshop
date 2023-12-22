import { context, propagation, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes, MessagingOperationValues, MessagingDestinationKindValues } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import { createSpanFromContext, runWithSpan } from '@pokemon/telemetry/tracing';
import { Kafka, Consumer, KafkaMessage, IHeaders } from 'kafkajs'
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

  private extractHeaders(message: KafkaMessage) : IHeaders {
    const kafkaHeaders = message.headers ?? {};
    const headers = {};

    // as Kafka send headers as buffers, we need to convert them to
    // string, otherwise OTel SDK will not capture the trace context
    for (let key in kafkaHeaders) {
      let value = kafkaHeaders[key] || "";
      if (value.toString !== undefined) {
        value = value.toString();
      }
      headers[key] = value;
    }

    return headers
  }
  
  public async subscribe(callback: Function): Promise<void> {
    const instrumentedCallback = async (message: KafkaMessage) => {
      const headers = this.extractHeaders(message);
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

    return this.streamService.subscribe(instrumentedCallback);
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
      this.client = new Kafka({
        clientId: KAFKA_CLIENT_ID,
        brokers: [KAFKA_BROKER]
      });

      await this.waitForTopicCreation();

      this.consumer = this.client.consumer({ groupId: 'test-group' });
      await this.consumer.connect();
    } catch (ex) {
      throw new Error(`could not connect to stream service: ${ex}`);
    }

    return this.consumer;
  }

  public async subscribe(callback: Function): Promise<void> {
    const consumer = await this.connect();

    await consumer.subscribe({ topic: this.topic, fromBeginning: true });

    const { CRASH } = consumer.events;
    await consumer.on(CRASH, () => {
      // make the node process crash on purpose,
      // so we can restart the worker
      process.exit(-1);
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        await callback(message);
      },
    })
  }

  private async waitForTopicCreation() : Promise<void> {
    if (this.client === null) {
      return
    }

    const admin = this.client.admin()
    await admin.connect()

    while (true) {
      const topics = await admin.listTopics()
      
      if (topics.includes(this.topic)) {
        await admin?.disconnect()
        return  
      }

      await sleep(5_000); //wait for 5 seconds
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { createStreamingService };
