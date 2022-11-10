import syncronizeHandler from '@pokemon/handlers/syncronize.handler';
import { createQueueService } from '@pokemon/services/queue.service';
import { MESSAGE_GROUP, TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { setupSequelize } from '@pokemon/utils/db';

async function startWorker() {
  await setupSequelize();
  const pokemonSyncronizationQueueService = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);
  syncronizeHandler(pokemonSyncronizationQueueService);
}

startWorker();
