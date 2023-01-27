import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories';
import { getCacheService } from '@pokemon/services/cache.service';

const cache = getCacheService();

const remove = async ctx => {
  const { id = '0' } = ctx.params || {};
  const repository = getPokemonRepository();

  const pokemon = await repository.findOne(id);
  if (!pokemon) {
    ctx.status = 404;
    return;
  }

  cache.set(`pokemon-${id}`, null)

  await repository.delete(+id);
  return pokemon;
};

export default function setupRoute(router) {
  router.delete('/pokemon/:id', jsonResponse(), remove);
}
