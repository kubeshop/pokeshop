import { PromiseHandler } from '@lambda-middleware/utils';
import { composeHandler } from '@lambda-middleware/compose';
import { classValidator } from '@lambda-middleware/class-validator';
import { prisma } from '../utils/db';
import UpdatePokemon from '../validators/updatePokemon';
import { APIGatewayEvent } from 'aws-lambda';

const update: PromiseHandler = async ({ body, pathParameters }: APIGatewayEvent & { body: UpdatePokemon }) => {
  const { id = '0' } = pathParameters || {};

  const pokemon = await prisma.pokemon.update({
    where: { id: +id },
    data: body,
  });

  return pokemon;
};

export default composeHandler(
  classValidator({
    bodyType: UpdatePokemon,
  }),
  update
);
