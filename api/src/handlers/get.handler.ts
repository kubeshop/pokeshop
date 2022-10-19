import { logError } from '@pokemon/handlers/logError';
import { getPokemonRepository } from '@pokemon/repositories';
import { getTracer } from '@pokemon/telemetry/tracing';
import { setupSequelize } from '@pokemon/utils/db';
import { jsonResponse } from '../middlewares/response';

export const get = (runMigration= false) => async (ctx) => {
  const { skip = '0', take = '20' } = ctx?.request?.query || {};
  const query = { skip: +skip, take: +take };

  try {
    if (runMigration) {
      await getTracer();
      await setupSequelize();
    }
    const repository = getPokemonRepository();
    const [items, totalCount] = await Promise.all([repository.findMany(query), repository.count()]);
    return {
      totalCount,
      items,
    };
  } catch (e) {
    logError(e);
    return {
      totalCount: 0,
      items: [],
    };
  }
};

export default function setupRoute(router) {
  router.get('/pokemon', jsonResponse(200), get());
}
