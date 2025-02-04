import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { config } from './constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

const redisClient = process.env.NODE_ENV === 'test' ? new RedisMock() : new Redis({
  host: config.redisUrl.split(':')[0],
  port: parseInt(config.redisUrl.split(':')[1], 10),
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  }
});

redisClient.on('connect', () => {
  console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
});

redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;