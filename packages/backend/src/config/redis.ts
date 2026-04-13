import Redis from 'ioredis';
import { config } from './index';

const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 10) {
      console.error('Redis: maximum retry attempts reached, giving up');
      return null;
    }
    return Math.min(times * 200, 5000);
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
  console.error('Redis: connection error', err.message);
});

export default redis;
