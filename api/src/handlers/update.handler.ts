import UpdatePokemon from '@pokemon/validators/updatePokemon';
import { validate } from '@pokemon/middlewares/validation';
import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository, Pokemon } from '@pokemon/repositories';

const update = async (ctx: { body, params }) => {
  const { id = '0' } = ctx.params || {};
  const repository = getPokemonRepository();

  const pokemon = await repository.update(+id, new Pokemon({ ...ctx.body }));

  return pokemon;
};

export default function setupRoute(router) {
  router.patch(
    '/pokemon/:id',
    validate(UpdatePokemon),
    jsonResponse(),
    update
  );
}
