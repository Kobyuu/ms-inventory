import express from 'express';
import router from './router';
import limiter from './middleware/rateLimiter';
import { handleInputErrors } from './middleware/handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId } from './middleware/validateInventory';

// Instancia de express
const server = express();

// Middleware para leer datos de formularios
server.use(express.json());

// Configuración de limitador de tasa
server.use(limiter);

// Configuración de rutas
server.use('/api/inventory', router);

export default server;