export const DEFAULTS = {
    PORT: 4002,
    DATABASE_URL: 'postgres://postgres:password@postgres:5432/ms-inventory',
    PRODUCT_SERVICE_URL: 'http://ms-catalog:4001/api/products',
    REDIS_URL: 'redis://redis:6379',
    CACHE_EXPIRY: 3600,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // en milisegundos
    REDIS_HOST: 'redis',
    REDIS_PORT: 6379,
    REDIS_RETRY_DELAY: 2000 // en milisegundos
};