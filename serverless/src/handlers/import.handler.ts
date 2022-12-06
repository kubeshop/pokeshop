import { PromiseHandler } from '@lambda-middleware/utils';
import { composeHandler } from '@lambda-middleware/compose';
import { classValidator } from '@lambda-middleware/class-validator';
import { prisma } from '../utils/db';
import ImportPokemon from '../validators/importPokemon';
import PokeAPIService from '../services/pokeApi.service';
import ImageDownloader from '../services/imageDownloader.service';

const pokeApiService = PokeAPIService();
const downloader = ImageDownloader();

const importPokemon: PromiseHandler = async (event: { body: ImportPokemon }) => {
  const { name = '', id = 0 } = event.body;

  const { imageUrl, ...createPokemonData } = await pokeApiService.getPokemon(id ? `${id}` : name);
  const pokemon = await prisma.pokemon.create({
    data: createPokemonData,
  });

  await downloader.queue({
    id: pokemon.id,
    url: imageUrl,
  });

  return pokemon;
};

export default composeHandler(
  classValidator({
    bodyType: ImportPokemon,
  }),
  importPokemon
);
