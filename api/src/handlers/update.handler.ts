import { jsonResponse } from '@pokemon/middlewares/response';
import { validate } from '@pokemon/middlewares/validation';
import { getPokemonRepository, Pokemon } from '@pokemon/repositories';
import UpdatePokemon from '@pokemon/validators/updatePokemon';

export const update = async (ctx: { status; body; params }) => {
  const { id = '0' } = ctx.params || {};
  const repository = getPokemonRepository();

  const pokemon = await repository.findOne(+id);
  if (!pokemon) {
    ctx.status = 404;
    return;
  }

  return await repository.update(+id, new Pokemon({ ...ctx.body }));
};

export default function setupRoute(router) {
  router.patch('/pokemon/:id', validate(UpdatePokemon), jsonResponse(), update);
}
