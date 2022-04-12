import { jsonResponse } from '../middlewares/response';
import { prisma } from '../utils/db';

const get = async (ctx, next) => {
  const { skip = '0', take = '20' } = ctx.request.query || {};
  const query = { skip: +skip, take: +take };

  const [items, totalCount] = await Promise.all([prisma.pokemon.findMany(query), prisma.pokemon.count()]);

  return {
    totalCount,
    items,
  };
};

export default function setupRoute(router) {
  router.get(
    '/pokemon',
    jsonResponse(200),
    get
  );
}
