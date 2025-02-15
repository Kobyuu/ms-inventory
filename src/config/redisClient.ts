import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { CONFIG } from './constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { RedisConfig } from '../types/types';

const parseRedisUrl = (url: string): RedisConfig => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || CONFIG.REDIS.HOST,
      port: parseInt(redisUrl.port || CONFIG.REDIS.PORT.toString(), 10)
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.REDIS_URL_PARSE, error);
    return {
      host: CONFIG.REDIS.HOST,
      port: CONFIG.REDIS.PORT
    };
  }
};

const redisConfig = parseRedisUrl(CONFIG.REDIS.URL);

const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times: number): number => {
        return Math.min(
          times * CONFIG.RETRY.DELAY, 
          CONFIG.REDIS.RETRY_DELAY
        );
      }
    });

if (process.env.NODE_ENV !== 'test') {
  redisClient.on('connect', () => {
    console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
  });
}

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;