import QueueService from './queue.service';
import download from 'download';
import StorageService from './storage.service';

const MESSAGE_GROUP = 'download-image';

export type TQueueMessage = {
  url: string;
  id: number;
};

const ImageDownloader = () => {
  const queue = QueueService<TQueueMessage>(MESSAGE_GROUP);
  const storage = StorageService();

  return {
    async queue(message: TQueueMessage) {
      return queue.send(message);
    },
    async download(name: string, imageUrl: string) {
      const imageData: Buffer = await download(imageUrl);

      return storage.save(imageData, name);
    },
  };
};

export default ImageDownloader;
