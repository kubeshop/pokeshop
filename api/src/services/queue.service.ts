import { SQS } from 'aws-sdk';
const { SQS_QUEUE_URL = '' } = process.env;

const QueueService = <T>(messageGroup: string) => {
  const sqs = new SQS();

  return {
    async send(message: T) {
      const result = await sqs
        .sendMessage({
          MessageBody: JSON.stringify(message),
          QueueUrl: SQS_QUEUE_URL,
          MessageGroupId: messageGroup,
        })
        .promise();

      return result;
    },
  };
};

export default QueueService;
