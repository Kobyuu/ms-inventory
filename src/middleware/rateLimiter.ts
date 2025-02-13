import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100000, // Limite de 100 solicitudes por IP
  message: {
    status: HTTP.TOO_MANY_REQUESTS,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
  },
});

export default limiter;