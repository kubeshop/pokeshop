import { SQSEvent } from 'aws-lambda';
import ImageDownloader, { TQueueMessage } from '../services/imageDownloader.service';
import { prisma } from '../utils/db';

const imageDownloaderHandler = async ({ Records }: SQSEvent) => {
  const imageDownloader = ImageDownloader();

  await Promise.all(
    Records.map(async ({ body }) => {
      const { id, url }: TQueueMessage = JSON.parse(body);
      const pokemon = await prisma.pokemon.findUnique({ where: { id } });

      if (!!pokemon) {
        const imageUrl = await imageDownloader.download(`pokemon/${pokemon.id}`, url);

        return await prisma.pokemon.update({
          where: { id },
          data: {
            imageUrl,
          },
        });
      }

      return pokemon;
    })
  );

  return {
    success: true,
  };
};

export default imageDownloaderHandler;
