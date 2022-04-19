import { Span } from '@opentelemetry/sdk-trace-base';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import { createSpan, getParentSpan, runWithSpan } from '@pokemon/telemetry/tracing';
import Redis from 'ioredis';

const { REDIS_URL = '' } = process.env;
const defaultExpireTime = 20;

export interface CacheService<T> {
  isAvailable(): Promise<boolean>;
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
}

function getCacheService<T>(): CacheService<T> {
  const redisCacheService = new RedisCacheService<T>(REDIS_URL);
  return new InstrumentedCacheService(redisCacheService);
}

class InstrumentedCacheService<T> extends InstrumentedComponent implements CacheService<T> {
  
  private readonly cacheService: CacheService<T>;

  public constructor(cacheService: CacheService<T>) {
    super();
    this.cacheService = cacheService;
  }

  async isAvailable(): Promise<boolean> {
    return this.instrumentMethod('CacheService isAvailable', async (span: Span) => {
      span.setAttribute('db.operation', 'healthcheck');
      
      const result = await this.cacheService.isAvailable();
      span.setAttribute('db.result', result);

      return result;
    });
  }

  async get(key: string): Promise<T | null> {
    return this.instrumentMethod('CacheService get', async (span: Span) => {
      span.setAttribute('db.operation', 'get');

      const result = await this.cacheService.get(key);
      span.setAttribute('db.result', JSON.stringify(result));

      return result;
    });
  }

  async set(key: string, value: T): Promise<void> {
    return this.instrumentMethod('CacheService set', async (span: Span) => {
      span.setAttribute('db.operation', 'set');
      span.setAttribute('db.operation.params', JSON.stringify({key, value}));
      return this.cacheService.set(key, value);
    });
  }
}

class RedisCacheService<T> implements CacheService<T> {

  private readonly redis: Redis.Redis;

  public constructor(redisUrl: string) {
    this.redis = new Redis({
      host: redisUrl
    });
  }

  public async get(key: string): Promise<T | null> {
    const result = await this.redis.get(key);
    return result ? (JSON.parse(result) as T) : null;
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
