import '../validateEnv'; 
import { DEFAULTS } from './defaults'; 

// Exportar variables de entorno parseadas si es necesario
export const CONFIG = {
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: parseInt(process.env.PORT ?? DEFAULTS.PORT.toString(), 10),
    PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL!,
    REDIS_URL: process.env.REDIS_URL!,
    CACHE_EXPIRY: parseInt(process.env.CACHE_EXPIRY ?? DEFAULTS.CACHE_EXPIRY.toString(), 10),
    RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS ?? DEFAULTS.RETRY_ATTEMPTS.toString(), 10),
    RETRY_DELAY: parseInt(process.env.RETRY_DELAY ?? DEFAULTS.RETRY_DELAY.toString(), 10),
};