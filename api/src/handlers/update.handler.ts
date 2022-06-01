import UpdatePokemon from '@pokemon/validators/updatePokemon';
import { validate } from '@pokemon/middlewares/validation';
import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository, Pokemon } from '@pokemon/repositories';

const update = async (ctx: { status; body; params }) => {
  const { id = '0' } = ctx.params || {};
  const repository = getPokemonRepository();

  const pokemon = await repository.findOne(+id);
  if (!pokemon) {
    ctx.status = 404;
    return;
  }

  const updatedPokemon = await repository.update(+id, new Pokemon({ ...ctx.body }));

  return updatedPokemon;
};

export default function setupRoute(router) {
  router.patch('/pokemon/:id', validate(UpdatePokemon), jsonResponse(), update);
}
