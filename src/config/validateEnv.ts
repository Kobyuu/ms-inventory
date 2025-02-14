import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants';

// Validar las variables de entorno requeridas
const requiredEnvVars = [
    'DATABASE_URL',
    'PRODUCT_SERVICE_URL',
    'REDIS_URL',
    'PORT',
    'CACHE_EXPIRY',
    'RETRY_ATTEMPTS',
    'RETRY_DELAY',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_RETRY_DELAY',
    'DB_POOL_MAX',
    'DB_POOL_MIN',
    'DB_POOL_IDLE',
    'DB_POOL_ACQUIRE',
];

requiredEnvVars.forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`${ERROR_MESSAGES.ENV_VAR_NOT_DEFINED}: ${env}`);
    }
});