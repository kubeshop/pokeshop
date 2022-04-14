import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories';

const search = async (ctx) => {
  const { skip = '0', take = '20', s = '' } = ctx.request.query || {};
  const query = { skip: +skip, take: +take, where: { name: { contains: s } } };

  const repository = getPokemonRepository();

  const [items, totalCount] = await Promise.all([
    repository.findMany(query),
    repository.count({
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
