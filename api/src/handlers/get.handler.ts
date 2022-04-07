import { PromiseHandler } from '@lambda-middleware/utils';
import { prisma } from '../utils/db';
import { APIGatewayEvent } from 'aws-lambda';

const get: PromiseHandler = async ({ queryStringParameters }: APIGatewayEvent) => {
  const { skip = '0', take = '20' } = queryStringParameters || {};
  const query = { skip: +skip, take: +take };

  const [items, totalCount] = await Promise.all([prisma.pokemon.findMany(query), prisma.pokemon.count()]);

  return {
    totalCount,
    items,
  };
};

export default get;
