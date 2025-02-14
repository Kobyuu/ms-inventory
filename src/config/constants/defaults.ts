export const DEFAULTS = {
    PORT: 4002,
    DATABASE_URL: 'postgres://postgres:1234@postgres:5432/ms-inventory',
    PRODUCT_SERVICE_URL: 'http://ms-catalog_app:4001/api/product',
    REDIS_URL: 'redis://redis:6379',
    CACHE_EXPIRY: 3600,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // en milisegundos
    REDIS_HOST: 'redis',
    REDIS_PORT: 6379,
    REDIS_RETRY_DELAY: 2000, // en milisegundos
    DB_POOL: {
        MAX_CONNECTIONS: 5,
        MIN_CONNECTIONS: 1,
        IDLE_TIME: 600000, // 10 minutos en milisegundos
        ACQUIRE_TIMEOUT: 30000 // 30 segundos en milisegundos
    },
};