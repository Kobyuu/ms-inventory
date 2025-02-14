import '../validateEnv'; 
import { DEFAULTS } from './defaults'; 

export const CONFIG = {
    PORT: parseInt(process.env.PORT ?? DEFAULTS.PORT.toString(), 10),
    DATABASE_URL: process.env.DATABASE_URL ?? DEFAULTS.DATABASE_URL,
    PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL ?? DEFAULTS.PRODUCT_SERVICE_URL,
    REDIS_URL: process.env.REDIS_URL ?? DEFAULTS.REDIS_URL,
    CACHE_EXPIRY: parseInt(process.env.CACHE_EXPIRY ?? DEFAULTS.CACHE_EXPIRY.toString(), 10),
    RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS ?? DEFAULTS.RETRY_ATTEMPTS.toString(), 10),
    RETRY_DELAY: parseInt(process.env.RETRY_DELAY ?? DEFAULTS.RETRY_DELAY.toString(), 10),
    REDIS_HOST: process.env.REDIS_HOST ?? DEFAULTS.REDIS_HOST,
    REDIS_PORT: parseInt(process.env.REDIS_PORT ?? DEFAULTS.REDIS_PORT.toString(), 10),
    REDIS_RETRY_DELAY: parseInt(process.env.REDIS_RETRY_DELAY ?? DEFAULTS.REDIS_RETRY_DELAY.toString(), 10),
    DB_POOL: {
        MAX_CONNECTIONS: parseInt(process.env.DB_POOL_MAX ?? DEFAULTS.DB_POOL.MAX_CONNECTIONS.toString(), 10),
        MIN_CONNECTIONS: parseInt(process.env.DB_POOL_MIN ?? DEFAULTS.DB_POOL.MIN_CONNECTIONS.toString(), 10),
        IDLE_TIME: parseInt(process.env.DB_POOL_IDLE ?? DEFAULTS.DB_POOL.IDLE_TIME.toString(), 10),
        ACQUIRE_TIMEOUT: parseInt(process.env.DB_POOL_ACQUIRE ?? DEFAULTS.DB_POOL.ACQUIRE_TIMEOUT.toString(), 10)
    },
};