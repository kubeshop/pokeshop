import { PromiseHandler } from '@lambda-middleware/utils';
import { prisma } from '../utils/db';

const remove: PromiseHandler = async ({ pathParameters }) => {
  const { id = '0' } = pathParameters || {};

  const pokemon = await prisma.pokemon.delete({
    where: { id: +id },
  });

  return pokemon;
};

export default remove;
