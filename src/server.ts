import express from 'express';
import router from './router';
import limiter from './middleware/rateLimiter';
import circuitBreakerMiddleware from './middleware/circuitBreaker';

// Instancia de express
const server = express();

// Middleware para leer datos de formularios
server.use(express.json());

// Configuración de limitador de tasa
server.use(limiter);

// Configuración de circuito de interrupción
server.use(circuitBreakerMiddleware);

// Configuración de rutas
server.use('/api/inventory', router);

export default server;
