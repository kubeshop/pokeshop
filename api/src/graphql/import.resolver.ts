import PokeAPIService from '@pokemon/services/pokeApi.service';
import PokemonSyncronizer from '@pokemon/services/pokemonSyncronizer.service';

const pokeApiService = new PokeAPIService();
const pokemonSyncronizer = PokemonSyncronizer(pokeApiService);

const importPokemon = async ({ id = 0, ignoreCache = false }) => {
  await pokemonSyncronizer.queue({ id, ignoreCache });

  return { id };
};

export default importPokemon;
