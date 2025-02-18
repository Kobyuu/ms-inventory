import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ERROR_MESSAGES, SUCCESS_MESSAGES , CONFIG} from './constants';
import { RedisConfig } from '../types/types';

// Analiza la URL de Redis y extrae la configuración
const parseRedisUrl = (url: string): RedisConfig => {
  try {
    const redisUrl = new URL(url);
    return {
      host: redisUrl.hostname || CONFIG.REDIS.HOST,
      port: parseInt(redisUrl.port || CONFIG.REDIS.PORT.toString(), 10)
    };
  } catch (error) {
    // Si hay error, usa configuración por defecto
    console.error(ERROR_MESSAGES.REDIS_URL_PARSE, error);
    return {
      host: CONFIG.REDIS.HOST,
      port: CONFIG.REDIS.PORT
    };
  }
};

// Obtiene la configuración de Redis desde la URL
const redisConfig = parseRedisUrl(CONFIG.REDIS.URL);

// Crea cliente Redis (mock para tests, real para producción)
const redisClient = process.env.NODE_ENV === 'test' 
  ? new RedisMock() 
  : new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      // Estrategia de reintentos exponencial con límite
      retryStrategy: (times: number): number => {
        return Math.min(
          times * CONFIG.RETRY.DELAY, 
          CONFIG.REDIS.RETRY_DELAY
        );
      }
    });

// Manejador de conexión exitosa (excepto en tests)
if (process.env.NODE_ENV !== 'test') {
  redisClient.on('connect', () => {
    console.log(SUCCESS_MESSAGES.REDIS_CONNECTION);
  });
}

// Manejador de errores de conexión
redisClient.on('error', (err) => {
  console.error(ERROR_MESSAGES.REDIS_CONNECTION, err);
});

export default redisClient;