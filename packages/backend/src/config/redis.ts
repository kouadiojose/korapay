import Redis from 'ioredis';
import { config } from './index';

let redis: Redis;

try {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times: number): number | null {
      if (times > 5) {
        console.warn('Redis: maximum retry attempts reached, running without Redis');
        return null;
      }
      return Math.min(times * 500, 5000);
    },
    reconnectOnError(err: Error): boolean {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ECONNREFUSED'];
      return targetErrors.some((e) => err.message.includes(e));
    },
  });

  redis.on('connect', () => {
    console.log('Redis: connected');
  });

  redis.on('error', (err: Error) => {
    console.error('Redis: connection error -', err.message);
  });

  redis.connect().catch((err) => {
    console.warn('Redis: initial connection failed -', err.message);
  });
} catch (err) {
  console.warn('Redis: failed to initialize, running without Redis');
  redis = new Redis({ lazyConnect: true });
}

export default redis;
