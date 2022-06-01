import { Span } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '@pokemon/telemetry/instrumented.component';
import Redis from 'ioredis';
import { CustomTags } from '../constants/Tags';

const { REDIS_URL = '' } = process.env;
const defaultExpireTime = 20;

export interface CacheService<T> {
  isAvailable(): Promise<boolean>;
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
}

function getCacheService<T>(): CacheService<T> {
  const redisCacheService = new RedisCacheService<T>(REDIS_URL);
  return new InstrumentedCacheService(redisCacheService, redisCacheService.redis);
}

class InstrumentedCacheService<T> extends InstrumentedComponent implements CacheService<T> {
  private readonly cacheService: CacheService<T>;
  readonly redis: Redis.Redis;

  public constructor(cacheService: CacheService<T>, redis: Redis.Redis) {
    super();
    this.cacheService = cacheService;
    this.redis = redis;
  }

  getBaseAttributes() {
    const { username, db } = this.redis.options;

    return {
      [SemanticAttributes.DB_SYSTEM]: 'redis',
      [SemanticAttributes.DB_USER]: username,
      [SemanticAttributes.DB_CONNECTION_STRING]: REDIS_URL,
      [SemanticAttributes.DB_REDIS_DATABASE_INDEX]: db,
    };
  }

  async isAvailable(): Promise<boolean> {
    return this.instrumentMethod('cache is available', async (span: Span) => {
      const result = await this.cacheService.isAvailable();

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'healthcheck',
        [CustomTags.DB_RESULT]: result,
      });

      return result;
    });
  }

  async get(key: string): Promise<T | null> {
    return this.instrumentMethod('get value from cache', async (span: Span) => {
      const result = await this.cacheService.get(key);

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'get',
        [CustomTags.DB_PAYLOAD]: JSON.stringify({ key }),
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async set(key: string, value: T): Promise<void> {
    return this.instrumentMethod('set value on cache', async (span: Span) => {
      const result = this.cacheService.set(key, value);
      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'set',
        [CustomTags.DB_PAYLOAD]: JSON.stringify({ key, value }),
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }
}

class RedisCacheService<T> implements CacheService<T> {
  readonly redis: Redis.Redis;

  public constructor(redisUrl: string) {
    this.redis = new Redis({
      host: redisUrl,
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
      return response === 'PONG';
    } catch (ex) {
      return false;
    }
  }
}

export { getCacheService };
