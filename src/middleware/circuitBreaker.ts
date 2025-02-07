import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP, CIRCUIT_BREAKER_MESSAGES } from '../config/constants';

const options = {
  timeout: 3000, // Si la operación tarda más de 3 segundos, se considera un fallo
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000 // El circuito se cierra después de 30 segundos
};

const breaker = new CircuitBreaker(async (func: Function, ...args: any[]) => {
  return await func(...args);
}, options);

// Configuración del fallback para cuando el circuito está abierto
breaker.fallback(() => {
  return { error: ERROR_MESSAGES.SERVICE_UNAVAILABLE, statusCode: HTTP.SERVICE_UNAVAILABLE };
});

// Eventos del CircuitBreaker para monitorear su estado
breaker.on('open', () => console.log(CIRCUIT_BREAKER_MESSAGES.OPEN));
breaker.on('halfOpen', () => console.log(CIRCUIT_BREAKER_MESSAGES.HALF_OPEN));
breaker.on('close', () => console.log(CIRCUIT_BREAKER_MESSAGES.CLOSED));

export const withCircuitBreaker = (req: Request, res: Response, next: NextFunction) => {
  if (breaker.opened) {
    return res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
  }

  breaker.fire(() => Promise.resolve())
    .then(() => next())
    .catch(() => res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE }));
};

export default breaker;
