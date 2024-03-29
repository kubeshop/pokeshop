import { SpanKind } from '@opentelemetry/api';
import { Span } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes, DbSystemValues } from '@opentelemetry/semantic-conventions';
import { InstrumentedComponent } from '../telemetry/instrumented.component';
import { Redis } from 'ioredis';
import { CustomTags } from '../constants/tags';

const { REDIS_URL = '' } = process.env;
const defaultExpireTimeInSeconds = 300; // 5 minutes

export interface CacheService<T> {
  isAvailable(): Promise<boolean>;
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  invalidate(key: string): Promise<void>;
}

function getCacheService<T>(): CacheService<T> {
  const redisCacheService = new RedisCacheService<T>(REDIS_URL);
  return new InstrumentedCacheService(redisCacheService, redisCacheService.redis);
}

class InstrumentedCacheService<T> extends InstrumentedComponent implements CacheService<T> {
  private readonly cacheService: CacheService<T>;
  readonly redis: Redis;

  public constructor(cacheService: CacheService<T>, redis: Redis) {
    super();
    this.cacheService = cacheService;
    this.redis = redis;
  }

  getBaseAttributes() {
    const { username, db } = this.redis.options;

    return {
      [SemanticAttributes.DB_SYSTEM]: DbSystemValues.REDIS,
      [SemanticAttributes.DB_USER]: username,
      [SemanticAttributes.DB_CONNECTION_STRING]: REDIS_URL,
      [SemanticAttributes.DB_REDIS_DATABASE_INDEX]: db,
    };
  }

  async isAvailable(): Promise<boolean> {
    return this.instrumentMethod('ping', SpanKind.CLIENT, async (span: Span) => {
      const result = await this.cacheService.isAvailable();

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'ping',
        [SemanticAttributes.DB_STATEMENT]: 'ping',
        [CustomTags.DB_RESULT]: result,
      });

      return result;
    });
  }

  async get(key: string): Promise<T | null> {
    return this.instrumentMethod(`get ${key}`, SpanKind.CLIENT, async (span: Span) => {
      const result = await this.cacheService.get(key);

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'get',
        [CustomTags.CACHE_HIT]: !!result,
        [SemanticAttributes.DB_STATEMENT]: `get ${key}`,
        [CustomTags.DB_PAYLOAD]: JSON.stringify({ key }),
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async set(key: string, value: T): Promise<void> {
    return this.instrumentMethod(`setx ${key}`, SpanKind.CLIENT, async (span: Span) => {
      const result = this.cacheService.set(key, value);

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'setx',
        [SemanticAttributes.DB_STATEMENT]: `setx ${key} "${defaultExpireTimeInSeconds}"  "${JSON.stringify(value)}"`,
        [CustomTags.DB_PAYLOAD]: JSON.stringify({ key, value }),
        [CustomTags.DB_RESULT]: JSON.stringify(result),
      });

      return result;
    });
  }

  async invalidate(key: string): Promise<void> {
    return this.instrumentMethod(`del ${key}`, SpanKind.CLIENT, async (span: Span) => {
      await this.cacheService.invalidate(key);

      span.setAttributes({
        ...this.getBaseAttributes(),
        [SemanticAttributes.DB_OPERATION]: 'del',
        [SemanticAttributes.DB_STATEMENT]: `del ${key}`,
        [CustomTags.DB_PAYLOAD]: JSON.stringify({ key }),
      });
    });
  }
}

class RedisCacheService<T> implements CacheService<T> {
  readonly redis: Redis;

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
    await this.redis.setex(key, defaultExpireTimeInSeconds, JSON.stringify(value));
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const response = await this.redis.ping();
      return response === 'PONG';
    } catch (ex) {
      return false;
    }
  }

  public async invalidate(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

export { getCacheService };
