import { prisma } from '../utils/db';
import { Prisma } from '@prisma/client';
import { jsonResponse } from '../middlewares/response';

const search = async (ctx) => {
  const { skip = '0', take = '20', s = '' } = ctx.request.query || {};
  const query: Prisma.PokemonFindManyArgs = { skip: +skip, take: +take, where: { name: { contains: s } } };

  const [items, totalCount] = await Promise.all([
    prisma.pokemon.findMany(query),
    prisma.pokemon.count({
      where: { name: { contains: s } },
    }),
  ]);

  return {
    totalCount,
    items,
  };
};

export default function setupRoute(router) {
  router.get(
    '/pokemon/search',
    jsonResponse(),
    search
  );
};
