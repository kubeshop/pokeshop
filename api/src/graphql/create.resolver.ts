import { getPokemonRepository, Pokemon } from '@pokemon/repositories';

const create = async (raw: Pokemon): Promise<Pokemon> => {
  const repository = getPokemonRepository();

  return repository.create(new Pokemon(raw));
};

export default create;
