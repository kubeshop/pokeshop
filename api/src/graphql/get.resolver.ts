import { getPokemonRepository, Pokemon } from '@pokemon/repositories';
import { SearchOptions } from '../repositories/pokemon.repository';

type PokemonList = {
  items: Pokemon[];
  totalCount: number;
};

const get = async (query: SearchOptions): Promise<PokemonList> => {
  const repository = getPokemonRepository();

  const [items, totalCount] = await Promise.all([repository.findMany(query), repository.count()]);

  return {
    items,
    totalCount,
  };
};

export default get;