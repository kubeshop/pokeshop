import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories/pokemon.repository';

const remove = async (ctx) => {
  const { id = '0' } = ctx.params || {};
  const repository = getPokemonRepository();

  const pokemon = await repository.delete(+id);

  return pokemon;
};

export default function setupRoute(router) {
  router.delete(
    '/pokemon/:id',
    jsonResponse(),
    remove
  )
};
