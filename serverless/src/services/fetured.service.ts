import { getCacheService } from '../services/cache.service';
import { getPokemonRepository, Pokemon } from '../repositories';

const FeaturedService = () => {
  const cacheService = getCacheService<Pokemon[]>();
  const repository = getPokemonRepository();
  const key = 'featured-list';

  return {
    async get() {
      const fromCache = await cacheService.get(key);

      if (!!fromCache) return fromCache;

      const pokemons = await repository.findMany({ where: { isFeatured: true } });
      await cacheService.set(key, pokemons);

      return pokemons;
    },
  };
};

export default FeaturedService;
