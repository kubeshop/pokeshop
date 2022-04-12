import { prisma } from '../utils/db';
import UpdatePokemon from '../validators/updatePokemon';
import { validate } from '../middlewares/validation';
import { jsonResponse } from '../middlewares/response';

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
