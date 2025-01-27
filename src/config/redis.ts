import Redis from 'ioredis';
import { config } from './env';
import { errorMessages, successMessages } from './messages';

const redisClient = new Redis(config.redisUrl);

redisClient.on('connect', () => {
  console.log(successMessages.redisConnection);
});

redisClient.on('error', (err) => {
  console.error(errorMessages.redisConnection, err);
});

export default redisClient;
