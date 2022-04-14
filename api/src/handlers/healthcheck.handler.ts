import { jsonResponse } from '@pokemon/middlewares/response';
import { getCacheService } from '@pokemon/services/cache.service';
import { MESSAGE_GROUP, TPokemonSyncMessage } from '@pokemon/services/pokemonSyncronizer.service';
import { createQueueService } from '@pokemon/services/queue.service';
import { prisma } from '@pokemon/utils/db';

const cache = getCacheService();
const queue = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);

const isDatabaseAvailable = async () => {
  try {
    const response: Array<Object> = await prisma.$queryRaw`SELECT 1`;
    return response.length > 0
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
