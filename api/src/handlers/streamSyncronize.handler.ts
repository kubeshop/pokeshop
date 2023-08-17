import PokeAPIService from '@pokemon/services/pokeApi.service';
import PokemonSyncronizer, { TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { StreamingService } from '@pokemon/services/stream.service';
import { KafkaMessage } from 'kafkajs'

const pokemonSyncronizationHandler = async (message: KafkaMessage) => {
  const pokeApiService = new PokeAPIService();
  const pokemonSyncronizer = PokemonSyncronizer(pokeApiService);

  const messageString = message.value?.toString() || "";
  if (messageString === "") {
    return;
  }

  const { id }: TPokemonSyncMessage = JSON.parse(messageString);
  await pokemonSyncronizer.sync(id);
};

export default function setupWorker(streamService: StreamingService<TPokemonSyncMessage>) {
  streamService.subscribe(pokemonSyncronizationHandler);
}
