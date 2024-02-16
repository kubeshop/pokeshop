import { PromiseHandler } from '@lambda-middleware/utils';
import { getPokemonRepository } from '../repositories';

const get: PromiseHandler = async ({ queryStringParameters }) => {
  const { skip = '0', take = '100' } = queryStringParameters || {};
  const query = { skip: +skip, take: +take };
  const repository = getPokemonRepository();

  const [items, totalCount] = await Promise.all([repository.findMany(query), repository.count()]);

  return {
    totalCount,
    items,
  };
};

export default get;
