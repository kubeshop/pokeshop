import { jsonResponse } from '../middlewares/response';
import { prisma } from '../utils/db';

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
