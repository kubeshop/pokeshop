import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories';
import { getCacheService } from '@pokemon/services/cache.service';

const cache = getCacheService();
const repository = getPokemonRepository();

const getById = async (ctx, next) => {
  const { id = '0' } = ctx.params || {};

  const cachedPokemon = await cache.get(`pokemon-${id}`);
  if (!!cachedPokemon) {
    return cachedPokemon; // cache hit
  }

  const databasePokemon = await repository.findOne(id);

  if (!!databasePokemon) {
    cache.set(`pokemon-${id}`, databasePokemon);
  }

  if (!databasePokemon) {
    ctx.status = 404;
    return;
  }

  return databasePokemon;
};

export default function setupRoute(router) {
  router.get('/pokemon/:id', jsonResponse(200), getById);
}
