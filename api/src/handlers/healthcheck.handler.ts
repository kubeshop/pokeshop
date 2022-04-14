import { jsonResponse } from '@pokemon/middlewares/response';
import { getPokemonRepository } from '@pokemon/repositories/pokemon.repository';
import { getCacheService } from '@pokemon/services/cache.service';
import { MESSAGE_GROUP, TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { createQueueService } from '@pokemon/services/queue.service';

const cache = getCacheService();
const queue = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);
const repository = getPokemonRepository();

const isDatabaseAvailable = async () => {
  try {
    const response: number = await repository.count();
    return !!response
  } catch (ex) {
    return false;
  }
}

const healthcheck = async (ctx, next) => {
  const response = {
    cache: await cache.isAvailable(),
    database: await isDatabaseAvailable(),
    queue: await queue.healthcheck(),
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
