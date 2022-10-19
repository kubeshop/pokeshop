import PokeAPIService from '@pokemon/services/pokeApi.service';
import PokemonSyncronizer, { TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { setupSequelize } from '@pokemon/utils/db';

export async function startWorker(event: any) {
  await setupSequelize();
  const pokeApiService = new PokeAPIService();
  const pokemonSyncronizer = PokemonSyncronizer(pokeApiService);
  for (const record of event.Records){
    const { id }: TPokemonSyncMessage = JSON.parse(record.body);
    await pokemonSyncronizer.sync(id);
  }
}
