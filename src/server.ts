import express from 'express';
import colors from 'colors';
import router from './router';
import { connectDb } from './config/db';
import limiter from './middleware/rateLimiter';
import circuitBreakerMiddleware from './middleware/circuitBreaker';
import { errorMessages } from './config/messages';

// Instancia de express
const server = express();

// Middleware para leer datos de formularios
server.use(express.json());

// Configuración de limitador de tasa
server.use(limiter);

// Configuración de rutas
server.use('/api/inventory', router);

// Iniciar conexión a la base de datos
connectDb().catch((err) => {
  console.error(colors.bgRed.white(errorMessages.dbConnection), err);
  process.exit(1); // Finaliza el proceso si la conexión falla
});

// Configuración de circuito de interrupción
server.use(circuitBreakerMiddleware);

export default server;
