import express from 'express';
import router from './router';
import limiter from './middleware/rateLimiter';

// Instancia de express
const server = express();

// Middleware para leer datos de formularios
server.use(express.json());

// Configuración de rate limiter
server.use(limiter);

// Configuración de rutas
server.use('/api/inventory', router);

export default server;