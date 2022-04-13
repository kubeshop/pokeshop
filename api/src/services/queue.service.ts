import ampqlib from 'amqplib';

const { RABBITMQ_HOST = '' } = process.env;

class QueueService<T> {
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
      channel.close();
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
        }
      }
    }
    channel.consume(this.messageGroup, onConsume)
  }
};

export default QueueService;
