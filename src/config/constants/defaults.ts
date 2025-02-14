export const DEFAULTS = {
    PORT: 4002,
    NODE_ENV: 'development', 
    DATABASE: {
        URL: 'postgres://postgres:1234@postgres:5432/ms-inventory',
        POOL: {
            MAX_CONNECTIONS: 5,
            MIN_CONNECTIONS: 1,
            IDLE_TIME: 600000, // 10 minutos en milisegundos
            ACQUIRE_TIMEOUT: 30000 // 30 segundos en milisegundos
        }
    },
    PRODUCT_SERVICE: {
        URL: 'http://ms-catalog_app:4001/api/product',
        TIMEOUT: 5000  // Already exists, but need to ensure it's used consistently
    },
    REDIS: {
        URL: 'redis://redis:6379',
        HOST: 'redis',
        PORT: 6379,
        RETRY_DELAY: 2000,
        CACHE_EXPIRY: 3600
    },
    RETRY: {
        ATTEMPTS: 3,
        DELAY: 1000
    }
};