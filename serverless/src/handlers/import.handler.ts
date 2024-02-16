import { PromiseHandler } from '@lambda-middleware/utils';
import { composeHandler } from '@lambda-middleware/compose';
import { classValidator } from '@lambda-middleware/class-validator';
import ImportPokemon from '../validators/importPokemon';
import PokemonSynchronizer from '../services/pokemonSynchronizer.service';
import PokeAPIService from '../services/pokeApi.service';

const pokeApiService = new PokeAPIService();
const syncronizer = PokemonSynchronizer(pokeApiService);

const importPokemon: PromiseHandler<{ body: { id } }> = async ({ body: { id } }) => {
  await syncronizer.queue({ id });

  return {
    id,
  };
};

export default composeHandler(
  classValidator({
    bodyType: ImportPokemon,
  }),
  importPokemon
);
