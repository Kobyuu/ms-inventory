import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

// Configuración del rate limiter de solicitudes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Ventana de tiempo: 15 minutos
  max: 100000,               // Máximo de solicitudes permitidas por IP
  message: {
    status: HTTP.TOO_MANY_REQUESTS,    
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED  
  },
});

export default limiter;