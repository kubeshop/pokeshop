import Redis from 'ioredis';

const { REDIS_URL = '' } = process.env;
const defaultExpireTime = 20;

const CacheService = <T>() => {
  const redis = new Redis({
    host: REDIS_URL,
  });

  return {
    async get<K = T>(key: string): Promise<K | undefined> {
      const result = await redis.get(key);

      return result ? (JSON.parse(result) as K) : undefined;
    },
    async set<K = T>(key: string, value: K) {
      return redis.set(key, JSON.stringify(value), 'EX', defaultExpireTime);
    },
  };
};

export default CacheService;
