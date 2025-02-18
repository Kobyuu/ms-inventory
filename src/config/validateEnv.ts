import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants';

// Valida la presencia de todas las variables de entorno requeridas
export function validateEnv(): void {
    // Lista de variables de entorno necesarias para la aplicación
    const requiredEnvVars = [
        'DATABASE_URL',             // URL de conexión a la base de datos
        'DB_POOL_MAX',              // Máximo de conexiones en el pool
        'DB_POOL_MIN',              // Mínimo de conexiones en el pool
        'DB_POOL_IDLE',             // Tiempo máximo de inactividad
        'DB_POOL_ACQUIRE',          // Tiempo máximo para obtener conexión
        'PORT',                     // Puerto del servidor
        'PRODUCT_SERVICE_URL',      // URL del servicio de productos
        'PRODUCT_SERVICE_TIMEOUT',  // Tiempo límite para peticiones
        'REDIS_URL',                // URL de conexión a Redis
        'REDIS_HOST',               // Host de Redis
        'REDIS_PORT',               // Puerto de Redis
        'REDIS_RETRY_DELAY',        // Tiempo entre reintentos de Redis
        'CACHE_EXPIRY',             // Tiempo de expiración de caché
        'RETRY_ATTEMPTS',           // Número de reintentos
        'RETRY_DELAY',              // Tiempo entre reintentos
        'NODE_ENV',                 // Entorno de ejecución
        'DIALECT',                  // Dialecto de la base de datos
        'MODELS_PATH',              // Ruta de los modelos
        'LOGGING'                   // Estado del logging de la base de datos
    ];

    // Verifica cada variable y lanza error si falta alguna
    requiredEnvVars.forEach((env) => {
        if (!process.env[env]) {
            throw new Error(`${ERROR_MESSAGES.ENV_VAR_NOT_DEFINED}: ${env}`);
        }
    });
}