import { prisma } from '@pokemon/utils/db';
import UpdatePokemon from '@pokemon/validators/updatePokemon';
import { validate } from '@pokemon/middlewares/validation';
import { jsonResponse } from '@pokemon/middlewares/response';

const update = async (ctx: { body, params }) => {
  const { id = '0' } = ctx.params || {};

  const pokemon = await prisma.pokemon.update({
    where: { id: +id },
    data: ctx.body,
  });

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
