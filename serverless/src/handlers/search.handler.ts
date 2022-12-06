import { PromiseHandler } from '@lambda-middleware/utils';
import { prisma } from '../utils/db';
import { Prisma } from '@prisma/client';

const search: PromiseHandler = async ({ queryStringParameters }) => {
  const { skip = '0', take = '20', s = '' } = queryStringParameters || {};
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

export default search;
