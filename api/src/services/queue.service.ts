import Stomp from 'stomp-client';
const { ACTIVEMQ_HOST = '' } = process.env;

const QueueService = <T>(messageGroup: string) => {
  const stompClient = new Stomp(ACTIVEMQ_HOST, 61613);

  return {
    isConnected: false,

    async healthcheck() {
      return await new Promise((resolve, reject) => {
        stompClient.connect(() => {
          stompClient.disconnect()
          resolve(true)
        }, () => resolve(false))
      })
    },

    async connect() {
      if (this.isConnected) {
        return true;
      }

      const sessionId = await new Promise((resolve, reject) => {
        stompClient.connect(resolve, reject)
      });

      this.isConnected = !!sessionId

      return this.isConnected
    },

    async send(message: T) {
      return new Promise(async (resolve) => {
        const isConnected = await this.connect();
        if (!isConnected) {
          throw new Error("could not connect to queue service");
        }
        stompClient.publish(messageGroup, JSON.stringify(message));
        resolve(null);
      });
    },

    subscribe(callback) {
      return new Promise(async (resolve) => {
        const isConnected = await this.connect();
        if (!isConnected) {
          throw new Error("could not connect to queue service");
        }

        const subscribeCallback = (body, headers) => {
          callback(body)
          resolve(null);
        };

        stompClient.subscribe(messageGroup, subscribeCallback)
      });
    }
  };
};

export default QueueService;
