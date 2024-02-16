import { SpanKind } from '@opentelemetry/api';
import { SQSRecord } from 'aws-lambda';
import { getPokemonRepository, Pokemon } from '../repositories';
import { createQueueService } from './queue.service';
import { createSpan, getParentSpan, runWithSpan } from '../telemetry/tracing';
import { getCacheService } from './cache.service';
import { TPokemon } from './pokeApi.service';

export const MESSAGE_GROUP = 'queue.synchronizePokemon';

export type TPokemonSyncMessage = {
  id: number;
};

const PokemonSynchronizer = pokeApiService => {
  const queue = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);
  const repository = getPokemonRepository();
  const cache = getCacheService<TPokemon>();

  return {
    async queue(message: TPokemonSyncMessage) {
      return queue.send(message);
    },
    async sync(message: SQSRecord) {
      return queue.withWorker(message, async ({ body }) => {
        const { id }: TPokemonSyncMessage = JSON.parse(body);
        const parentSpan = await getParentSpan();
        const span = await createSpan('import pokemon', parentSpan, { kind: SpanKind.INTERNAL });

        try {
          return await runWithSpan(span, async () => {
            let pokemon = await cache.get(`pokemon_${id}`);
            if (!pokemon) {
              pokemon = await pokeApiService.getPokemon(id);
              await cache.set(`pokemon_${id}`, pokemon!);
            }

            await repository.create(new Pokemon({ ...pokemon }));
          });
        } finally {
          span.end();
        }
      });
    },
  };
};

export default PokemonSynchronizer;
