import { prisma } from '../utils/db';
import ImportPokemon from '../validators/importPokemon';
import PokeAPIService from '../services/pokeApi.service';
import PokemonSyncronizer from '../services/pokemonSyncronizer.service'
import { validate } from '../middlewares/validation';
import { jsonResponse } from '../middlewares/response';

const pokeApiService = PokeAPIService();
const pokemonSyncronizer = PokemonSyncronizer(pokeApiService);

const importPokemon = async (ctx: { body: ImportPokemon }) => {
  const { id = 0 } = ctx.body;

  await pokemonSyncronizer.queue({
    id: id,
  });

  return {
    id
  };
};

export default function setupRoute(router) {
  router.post(
    '/pokemon/import',
    validate(ImportPokemon),
    jsonResponse(200),
    importPokemon
  )
};
