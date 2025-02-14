import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants';

export function validateEnv(): void {
    const requiredEnvVars = [
        'DATABASE_URL',
        'DB_POOL_MAX',
        'DB_POOL_MIN',
        'DB_POOL_IDLE',
        'DB_POOL_ACQUIRE',
        'PORT',
        'PRODUCT_SERVICE_URL',
        'PRODUCT_SERVICE_TIMEOUT',
        'REDIS_URL',
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_RETRY_DELAY',
        'CACHE_EXPIRY',
        'RETRY_ATTEMPTS',
        'RETRY_DELAY',
        'NODE_ENV'  
    ];

    requiredEnvVars.forEach((env) => {
        if (!process.env[env]) {
            throw new Error(`${ERROR_MESSAGES.ENV_VAR_NOT_DEFINED}: ${env}`);
        }
    });
}