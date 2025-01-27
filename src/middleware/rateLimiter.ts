import rateLimit from 'express-rate-limit';
import { errorMessages } from '../config/messages';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 solicitudes por IP
  message: errorMessages.rateLimitExceeded,
});

export default limiter;