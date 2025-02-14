import '../validateEnv';
import { DEFAULTS } from './defaults';

export const CONFIG = {
    PORT: parseInt(process.env.PORT ?? DEFAULTS.PORT.toString(), 10),
    DATABASE: {
        URL: process.env.DATABASE_URL ?? DEFAULTS.DATABASE.URL,
        POOL: {
            MAX_CONNECTIONS: parseInt(process.env.DB_POOL_MAX ?? DEFAULTS.DATABASE.POOL.MAX_CONNECTIONS.toString(), 10),
            MIN_CONNECTIONS: parseInt(process.env.DB_POOL_MIN ?? DEFAULTS.DATABASE.POOL.MIN_CONNECTIONS.toString(), 10),
            IDLE_TIME: parseInt(process.env.DB_POOL_IDLE ?? DEFAULTS.DATABASE.POOL.IDLE_TIME.toString(), 10),
            ACQUIRE_TIMEOUT: parseInt(process.env.DB_POOL_ACQUIRE ?? DEFAULTS.DATABASE.POOL.ACQUIRE_TIMEOUT.toString(), 10)
        }
    },
    PRODUCT_SERVICE: {
        URL: process.env.PRODUCT_SERVICE_URL ?? DEFAULTS.PRODUCT_SERVICE.URL,
        TIMEOUT: parseInt(process.env.PRODUCT_SERVICE_TIMEOUT ?? DEFAULTS.PRODUCT_SERVICE.TIMEOUT.toString(), 10)
    },
    REDIS: {
        URL: process.env.REDIS_URL ?? DEFAULTS.REDIS.URL,
        HOST: process.env.REDIS_HOST ?? DEFAULTS.REDIS.HOST,
        PORT: parseInt(process.env.REDIS_PORT ?? DEFAULTS.REDIS.PORT.toString(), 10),
        RETRY_DELAY: parseInt(process.env.REDIS_RETRY_DELAY ?? DEFAULTS.REDIS.RETRY_DELAY.toString(), 10),
        CACHE_EXPIRY: parseInt(process.env.CACHE_EXPIRY ?? DEFAULTS.REDIS.CACHE_EXPIRY.toString(), 10)
    },
    RETRY: {
        ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS ?? DEFAULTS.RETRY.ATTEMPTS.toString(), 10),
        DELAY: parseInt(process.env.RETRY_DELAY ?? DEFAULTS.RETRY.DELAY.toString(), 10)
    }
};