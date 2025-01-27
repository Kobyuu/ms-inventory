import Redis from 'ioredis';
import { config } from './env';

const redisClient = new Redis(config.redisUrl);

redisClient.on('connect', () => {
  console.log('Conectado a Redis');
});

redisClient.on('error', (err) => {
  console.error('Error en Redis:', err);
});

export default redisClient;
