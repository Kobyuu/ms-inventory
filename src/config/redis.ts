import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { CONFIG } from './constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DEFAULTS } from './constants';

const parseRedisUrl = (url: string) => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || DEFAULTS.REDIS_HOST,
      port: parseInt(redisUrl.port || DEFAULTS.REDIS_PORT.toString(), 10)
    };
  } catch (error) {
    console.error('Error parsing Redis URL:', error);
    // Valores por defecto si hay error en el parsing
    return {
      host: DEFAULTS.REDIS_HOST,
      port: DEFAULTS.REDIS_PORT
    };
  }
};

const redisConfig = parseRedisUrl(CONFIG.REDIS_URL);

const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      retryStrategy: (times) => {
        return Math.min(times * 50, DEFAULTS.REDIS_RETRY_DELAY);
      }
    });

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;