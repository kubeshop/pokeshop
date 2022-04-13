import { jsonResponse } from '@pokemon/middlewares/response';
import { prisma } from '@pokemon/utils/db';

const remove = async (ctx) => {
  const { id = '0' } = ctx.params || {};

  const pokemon = await prisma.pokemon.delete({
    where: { id: +id },
  });

  return pokemon;
};

export default function setupRoute(router) {
  router.delete(
    '/pokemon/:id',
    jsonResponse(),
    remove
  )
};
