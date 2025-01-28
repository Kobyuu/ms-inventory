import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from './env';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

const redisClient = process.env.NODE_ENV === 'test' ? new RedisMock() : new Redis(config.redisUrl);

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;