import syncronizeHandler from '@pokemon/handlers/streamSyncronize.handler';
import { createStreamingService } from '@pokemon/services/stream.service';
import { TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { setupSequelize } from '@pokemon/utils/db';

async function startWorker() {
  await setupSequelize();
  const pokemonSyncronizationStreamingService = createStreamingService<TPokemonSyncMessage>();
  syncronizeHandler(pokemonSyncronizationStreamingService);
}

startWorker();
