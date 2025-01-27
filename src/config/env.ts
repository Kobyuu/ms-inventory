import 'dotenv/config'; // Cargar las variables de entorno al inicio

// Validar las variables de entorno requeridas
['DATABASE_URL', 'PORT', 'PRODUCT_SERVICE_URL', 'REDIS_URL', 'CACHE_EXPIRY'].forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`La variable de entorno ${env} no está definida.`);
    }
});

// Exportar variables de entorno parseadas si es necesario
export const config = {
    databaseUrl: process.env.DATABASE_URL!,
    port: parseInt(process.env.PORT || '4002', 10),
    productServiceUrl: process.env.PRODUCT_SERVICE_URL!,
    redisUrl: process.env.REDIS_URL!,
    cacheExpiry: parseInt(process.env.CACHE_EXPIRY || '3600', 10),
};
