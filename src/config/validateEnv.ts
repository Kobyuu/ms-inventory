import 'dotenv/config'; // Cargar las variables de entorno al inicio
import { ERROR_MESSAGES } from './constants';

// Validar las variables de entorno requeridas
['DATABASE_URL', 'PRODUCT_SERVICE_URL', 'REDIS_URL'].forEach((env) => {
    if (!process.env[env]) {
        throw new Error(`${ERROR_MESSAGES.ENV_VAR_NOT_DEFINED}: ${env}`);
    }
});