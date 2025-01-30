import './validateEnv'; // Importar la validación de las variables de entorno
import { DEFAULTS } from './constants'; // Importar los valores predeterminados

// Exportar variables de entorno parseadas si es necesario
export const config = {
    databaseUrl: process.env.DATABASE_URL!,
    port: parseInt(process.env.PORT ?? DEFAULTS.PORT.toString(), 10),
    productServiceUrl: process.env.PRODUCT_SERVICE_URL!,
    redisUrl: process.env.REDIS_URL!,
    cacheExpiry: parseInt(process.env.CACHE_EXPIRY ?? DEFAULTS.CACHE_EXPIRY.toString(), 10),
};