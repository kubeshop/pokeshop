import { Pokemon } from '@prisma/client';
import { prisma } from '../utils/db';
import CacheService from './cache.service';

const FeaturedService = () => {
  const cacheService = CacheService<Pokemon[]>();
  const key = 'featured-list';

  return {
    async get() {
      const fromCache = await cacheService.get(key);

      if (!!fromCache) return fromCache;

      const fromDb = await prisma.pokemon.findMany({ where: { isFeatured: true } });
      await cacheService.set(key, fromDb);

      return fromDb;
    },
  };
};

export default FeaturedService;
