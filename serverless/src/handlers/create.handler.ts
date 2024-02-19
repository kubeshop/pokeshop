import { PromiseHandler } from '@lambda-middleware/utils';
import { composeHandler } from '@lambda-middleware/compose';
import { classValidator } from '@lambda-middleware/class-validator';
import CreatePokemon from '../validators/createPokemon';
import { getPokemonRepository, Pokemon } from '../repositories';

const create: PromiseHandler<{ body: CreatePokemon }> = async ({body}) => {
  const { name = '', type = '', isFeatured = false, imageUrl = '' } = body;

  const repository = getPokemonRepository();

  const pokemon = await repository.create(
    new Pokemon({
      name,
      type,
      isFeatured,
      imageUrl,
    })
  );

  return pokemon;
};

export default composeHandler(
  classValidator({
    bodyType: CreatePokemon,
  }),
  create
);
