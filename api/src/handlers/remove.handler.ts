import { PromiseHandler } from '@lambda-middleware/utils';
import { prisma } from '../utils/db';
import { APIGatewayEvent } from 'aws-lambda';

const remove: PromiseHandler = async ({ pathParameters }: APIGatewayEvent) => {
  const { id = '0' } = pathParameters || {};

  const pokemon = await prisma.pokemon.delete({
    where: { id: +id },
  });

  return pokemon;
};

export default remove;
