import circuitBreaker from 'opossum';
import express from 'express';
import { errorMessages } from '../config/messages';

const breakerOptions = {
  timeout: 3000, // Si una solicitud toma más de 3 segundos, se considera fallida
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000, // El circuito se cierra después de 30 segundos
};

const breaker = new circuitBreaker(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  next();
}, breakerOptions);

const circuitBreakerMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  breaker.fire(req, res, next).catch((err) => {
    res.status(503).json({ message: errorMessages.serviceUnavailable });
  });
};

export default circuitBreakerMiddleware;