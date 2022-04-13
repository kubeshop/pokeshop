import { prisma } from '@pokemon/utils/db';
import { createQueueService } from '@pokemon/services/queue.service';

export const MESSAGE_GROUP = '/queue/syncronizePokemon';

export type TPokemonSyncMessage = {
  id: number;
};

const PokemonSyncronizer = (pokeApiService) => {
  const queue = createQueueService<TPokemonSyncMessage>(MESSAGE_GROUP);

  return {
    async queue(message: TPokemonSyncMessage) {
      return queue.send(message);
    },
    async sync(pokemonId: Number) {
      const data = await pokeApiService.getPokemon(pokemonId);
      await prisma.pokemon.create({
        data
      });
    },
  };
};

export default PokemonSyncronizer;
