import PokeAPIService from '@pokemon/services/pokeApi.service';
import PokemonSyncronizer, { TQueueMessage } from '@pokemon/services/pokemonSyncronizer.service';

const pokemonSyncronizationHandler = async (body) => {
  const pokeApiService = PokeAPIService()
  const pokemonSyncronizer = PokemonSyncronizer(pokeApiService);
  const { id }: TQueueMessage = JSON.parse(body);

  await pokemonSyncronizer.sync(id);
};

export default function setupWorker(queueService) {
  queueService.subscribe(pokemonSyncronizationHandler);
}
