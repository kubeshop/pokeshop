import { prisma } from '../utils/db';
import QueueService from './queue.service';

export const MESSAGE_GROUP = '/queue/downloadImage';

export type TQueueMessage = {
  id: number;
};

const PokemonSyncronizer = (pokeApiService) => {
  const queue = QueueService<TQueueMessage>(MESSAGE_GROUP);

  return {
    async queue(message: TQueueMessage) {
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
