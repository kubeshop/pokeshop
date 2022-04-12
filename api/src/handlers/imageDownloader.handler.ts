import PokeAPIService from '../services/pokeApi.service';
import PokemonSyncronizer, { TQueueMessage } from '../services/pokemonSyncronizer.service';

const imageDownloaderHandler = async (body) => {
  const pokeApiService = PokeAPIService()
  const pokemonSyncronizer = PokemonSyncronizer(pokeApiService);
  const { id }: TQueueMessage = JSON.parse(body);

  await pokemonSyncronizer.sync(id);
};

export default function setupWorker(queueService) {
  queueService.subscribe(imageDownloaderHandler);
}
