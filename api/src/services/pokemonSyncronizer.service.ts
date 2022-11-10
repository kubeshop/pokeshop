import { SpanKind } from '@opentelemetry/api';
import { getPokemonRepository, Pokemon } from '@pokemon/repositories';
import { createQueueService } from '@pokemon/services/queue.service';
import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';

export const MESSAGE_GROUP = 'queue.synchronizePokemon';

export type TPokemonSyncMessage = {
  id: number;
};

const PokemonSyncronizer = pokeApiService => {
  const queue = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);
  const repository = getPokemonRepository();

  return {
    async queue(message: TPokemonSyncMessage) {
      return queue.send(message);
    },
    async sync(pokemonId: Number) {
      const parentSpan = await getParentSpan();
      const span = await createSpan('import pokemon', parentSpan, { kind: SpanKind.INTERNAL });

      try {
        return await runWithSpan(span, async () => {
          const data = await pokeApiService.getPokemon(pokemonId);
          await repository.create(new Pokemon({ ...data }));
        });
      } catch (ex) {
        console.log(ex);
      } finally {
        span.end();
      }
    },
  };
};

export default PokemonSyncronizer;
