import CircuitBreaker from 'opossum';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

const options = {
    timeout: 3000, // Si la operación tarda más de 3 segundos, se considera un fallo
    errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
    resetTimeout: 30000 // El circuito se cierra después de 30 segundos
};

const breaker = new CircuitBreaker(async (req: Request, res: Response, next: NextFunction) => {
    next();
}, options);

breaker.fallback((req: Request, res: Response) => {
    res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
});

breaker.on('open', () => console.log('Circuito abierto'));
breaker.on('halfOpen', () => console.log('Circuito medio abierto'));
breaker.on('close', () => console.log('Circuito cerrado'));

export const withCircuitBreaker = (req: Request, res: Response, next: NextFunction) => {
    breaker.fire(req, res, next).catch(next);
};

export { breaker };