import { validateEnv } from '../validateEnv';
import { DEFAULTS } from './defaults';

// Valida variables de entorno requeridas
validateEnv();

// Extrae variables de entorno
const {
    DATABASE_URL,
    NODE_ENV,
    PORT,
    RETRY_ATTEMPTS,
    REDIS_URL,
    REDIS_HOST,
    REDIS_PORT,
    CACHE_EXPIRY,
    RETRY_DELAY,
    PRODUCT_SERVICE_URL,
    PRODUCT_SERVICE_TIMEOUT,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_POOL_IDLE,
    DB_POOL_ACQUIRE,
    DIALECT,
    MODELS_PATH,
    LOGGING,
} = process.env;

// Configuración global de la aplicación
export const CONFIG = {
    // Configuración básica del servidor
    PORT: parseInt(PORT ?? DEFAULTS.PORT.toString(), 10),
    NODE_ENV: NODE_ENV ?? 'development',

    // Configuración de base de datos y pool de conexiones
    DATABASE: {
        URL: DATABASE_URL ?? DEFAULTS.DATABASE.URL,
        DIALECT: DIALECT ?? DEFAULTS.DATABASE.DIALECT,
        MODELS_PATH: MODELS_PATH ?? DEFAULTS.DATABASE.MODELS_PATH,
        LOGGING: LOGGING ? LOGGING === 'true' : DEFAULTS.DATABASE.LOGGING,
        POOL: {
            MAX_CONNECTIONS: parseInt(DB_POOL_MAX ?? DEFAULTS.DATABASE.POOL.MAX_CONNECTIONS.toString(), 10),
            MIN_CONNECTIONS: parseInt(DB_POOL_MIN ?? DEFAULTS.DATABASE.POOL.MIN_CONNECTIONS.toString(), 10),
            IDLE_TIME: parseInt(DB_POOL_IDLE ?? DEFAULTS.DATABASE.POOL.IDLE_TIME.toString(), 10),
            ACQUIRE_TIMEOUT: parseInt(DB_POOL_ACQUIRE ?? DEFAULTS.DATABASE.POOL.ACQUIRE_TIMEOUT.toString(), 10)
        },
        HOOKS: {
            AFTER_DISCONNECT: 'afterDisconnect'
        }
    },

    // Configuración del servicio de productos
    PRODUCT_SERVICE: {
        URL: PRODUCT_SERVICE_URL ?? DEFAULTS.PRODUCT_SERVICE.URL,
        TIMEOUT: parseInt(PRODUCT_SERVICE_TIMEOUT ?? DEFAULTS.PRODUCT_SERVICE.TIMEOUT.toString(), 10)
    },

    // Configuración de Redis y caché
    REDIS: {
        URL: REDIS_URL ?? DEFAULTS.REDIS.URL,
        HOST: REDIS_HOST ?? DEFAULTS.REDIS.HOST,
        PORT: parseInt(REDIS_PORT ?? DEFAULTS.REDIS.PORT.toString(), 10),
        RETRY_DELAY: parseInt(RETRY_DELAY ?? DEFAULTS.REDIS.RETRY_DELAY.toString(), 10),
        CACHE_EXPIRY: parseInt(CACHE_EXPIRY ?? DEFAULTS.REDIS.CACHE_EXPIRY.toString(), 10)
    },

    // Configuración de reintentos
    RETRY: {
        ATTEMPTS: parseInt(RETRY_ATTEMPTS ?? DEFAULTS.RETRY.ATTEMPTS.toString(), 10),
        DELAY: parseInt(RETRY_DELAY ?? DEFAULTS.RETRY.DELAY.toString(), 10)
    }
} as const;