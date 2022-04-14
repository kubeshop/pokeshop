import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import Redis from 'ioredis';

const { REDIS_URL = '' } = process.env;
const defaultExpireTime = 20;

export interface CacheService<T> {
  isAvailable(): Promise<boolean>;
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
}

function getCacheService<T>(): CacheService<T> {
  const redisCacheService = new RedisCacheService<T>(REDIS_URL);
  return new InstrumentedCacheService(redisCacheService);
}

class InstrumentedCacheService<T> implements CacheService<T> {
  
  private readonly cacheService: CacheService<T>;

  public constructor(cacheService: CacheService<T>) {
    this.cacheService = cacheService;
  }

  async isAvailable(): Promise<boolean> {
    const parentStan = await getParentSpan();
    const span = await createSpan('CacheService isAvailable', parentStan);
    const result = await runWithSpan(span, async () => this.cacheService.isAvailable());
    span.end();

    return result;
  }

  async get(key: string): Promise<T | undefined> {
    const parentStan = await getParentSpan();
    const span = await createSpan('CacheService get', parentStan);
    const result = await runWithSpan(span, async () => this.cacheService.get(key));
    span.end();

    return result;
  }

  async set(key: string, value: T): Promise<void> {
    const parentStan = await getParentSpan();
    const span = await createSpan('CacheService set', parentStan);
    const result = await runWithSpan(span, async () => this.cacheService.set(key, value));
    span.end();

    return result;
  }
}

class RedisCacheService<T> implements CacheService<T> {

  private readonly redis: Redis.Redis;

  public constructor(redisUrl: string) {
    this.redis = new Redis({
      host: redisUrl
    });
  }

  public async get(key: string): Promise<T | undefined> {
    const result = await this.redis.get(key);
    return result ? (JSON.parse(result) as T) : undefined;
  }

  public async set(key: string, value: T): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', defaultExpireTime);
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const response = await this.redis.ping();
      return (response === "PONG")
    } catch (ex) {
      return false;
    }
  }
}

export { getCacheService };
