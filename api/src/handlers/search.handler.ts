import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories';
import { Op } from 'sequelize';

const search = async (ctx) => {
  const { skip = '0', take = '20', s = '' } = ctx.request.query || {};
  const query = { skip: +skip, take: +take, where: { name: { [Op.iLike]: `%${s}%` } } };

  const repository = getPokemonRepository();

  const [items, totalCount] = await Promise.all([
    repository.findMany(query),
    repository.count({
      where: { name: { [Op.iLike]: `%${s}%` } },
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
