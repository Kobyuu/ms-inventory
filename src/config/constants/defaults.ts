export const DEFAULTS = {
    // Configuración básica del servidor
    PORT: 4002,
    NODE_ENV: 'development', 

    // Configuración de base de datos PostgreSQL
    DATABASE: {
        URL: 'postgres://postgres:1234@postgres:5432/ms-inventory',
        POOL: {
            MAX_CONNECTIONS: 5,         // Máximo de conexiones simultáneas
            MIN_CONNECTIONS: 1,         // Mínimo de conexiones mantenidas
            IDLE_TIME: 600000,          // 10 minutos de tiempo inactivo
            ACQUIRE_TIMEOUT: 30000      // 30 segundos para timeout de conexión
        }
    },

    // Configuración del servicio de productos
    PRODUCT_SERVICE: {
        URL: 'http://ms-catalog_app:4001/api/product',
        TIMEOUT: 5000                   // Timeout para peticiones al servicio
    },

    // Configuración de Redis para caché
    REDIS: {
        URL: 'redis://redis:6379',      // URL de conexión a Redis
        HOST: 'redis',                  // Host del servidor Redis
        PORT: 6379,                     // Puerto de Redis
        RETRY_DELAY: 2000,              // Tiempo entre reintentos (2 segundos)
        CACHE_EXPIRY: 3600              // Tiempo de expiración de caché (1 hora)
    },

    // Configuración de reintentos para operaciones
    RETRY: {
        ATTEMPTS: 3,                    // Número máximo de reintentos
        DELAY: 1000                     // Tiempo entre reintentos (1 segundo)
    }
};