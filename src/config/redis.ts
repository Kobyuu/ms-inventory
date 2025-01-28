import Redis from 'ioredis';
import { config } from './env';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

const redisClient = new Redis(config.redisUrl);

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;
