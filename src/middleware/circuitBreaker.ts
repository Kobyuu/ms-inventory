import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP, CIRCUIT_BREAKER_MESSAGES } from '../config/constants';

const options = {
    timeout: 3000, // Si la operación tarda más de 3 segundos, se considera un fallo
    errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
    resetTimeout: 30000 // El circuito se cierra después de 30 segundos
};

// Creación del CircuitBreaker con una función que simplemente llama a next()
const breaker = new CircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
    next();
}, options);

// Configuración del fallback para cuando el circuito está abierto
breaker.fallback((req: Request, res: Response) => {
    res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
});

// Eventos del CircuitBreaker para monitorear su estado
breaker.on('open', () => console.log(CIRCUIT_BREAKER_MESSAGES.OPEN));
breaker.on('halfOpen', () => console.log(CIRCUIT_BREAKER_MESSAGES.HALF_OPEN));
breaker.on('close', () => console.log(CIRCUIT_BREAKER_MESSAGES.CLOSED));

// Middleware que utiliza el CircuitBreaker
export const withCircuitBreaker = (req: Request, res: Response, next: NextFunction) => {
    breaker.fire(req, res, next).catch(next);
};

// Exportación del breaker para que pueda ser utilizado en pruebas
export { breaker };