import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories';

const get = async (ctx, next) => {
  const { skip = '0', take = '20' } = ctx.request.query || {};
  const query = { skip: +skip, take: +take };

  const repository = getPokemonRepository();

  const [items, totalCount] = await Promise.all([repository.findMany(query), repository.count()]);

  return {
    totalCount,
    items,
  };
};

export default function setupRoute(router) {
  router.get('/pokemon', jsonResponse(200), get);
}
