import { PromiseHandler } from '@lambda-middleware/utils';
import { composeHandler } from '@lambda-middleware/compose';
import { classValidator } from '@lambda-middleware/class-validator';
import ImageDownloader from '../services/imageDownloader.service';
import { prisma } from '../utils/db';
import CreatePokemon from '../validators/createPokemon';

const create: PromiseHandler = async (event: { body: CreatePokemon }) => {
  const { name = '', type = '', isFeatured = false, imageUrl = '' } = event.body;

  const pokemon = await prisma.pokemon.create({
    data: {
      name,
      type,
      isFeatured,
    },
  });

  if (!!imageUrl) {
    const downloader = ImageDownloader();

    await downloader.queue({
      id: pokemon.id,
      url: imageUrl,
    });
  }

  return pokemon;
};

export default composeHandler(
  classValidator({
    bodyType: CreatePokemon,
  }),
  create
);
