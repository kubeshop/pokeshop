import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories';
import { getCacheService } from '@pokemon/services/cache.service';
import { MESSAGE_GROUP, TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { createQueueService } from '@pokemon/services/queue.service';

const cache = getCacheService();
const queue = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);
const repository = getPokemonRepository();

const isDatabaseAvailable = async () => {
  try {
    await repository.count();
    return true
  } catch (ex) {
    return false;
  }
}

const healthcheck = async (ctx, next) => {
  const [ cacheAvailable, databaseAvailable, queueAvailable ] = await Promise.all([
    cache.isAvailable(),
    isDatabaseAvailable(),
    queue.healthcheck()
  ]);

  const requiredDependencies = [cacheAvailable, databaseAvailable, queueAvailable];

  const response = {
    cache: cacheAvailable,
    database: databaseAvailable,
    queue: queueAvailable,
  }

  if (requiredDependencies.some(item => !item)) {
    ctx.status = 500;
  }

  return response
};

export default function setupRoute(router) {
  router.get(
    '/pokemon/healthcheck',
    jsonResponse(200),
    healthcheck
  );
}
