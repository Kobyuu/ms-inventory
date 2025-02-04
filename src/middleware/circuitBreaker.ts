import circuitBreaker from 'opossum';
import express from 'express';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

const breakerOptions = {
  timeout: 3000, // Si una solicitud toma más de 3 segundos, se considera fallida
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000, // El circuito se cierra después de 30 segundos
};

// Función que maneja la lógica del Circuit Breaker
const breakerFunction = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Aquí puedes agregar la lógica específica que deseas proteger con el Circuit Breaker
  next();
};

const breaker = new circuitBreaker(breakerFunction, breakerOptions);

// Middleware del Circuit Breaker
const circuitBreakerMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  breaker.fire(req, res, next).catch((err) => {
    console.error('Circuit Breaker Error:', err);
    res.status(HTTP.SERVICE_UNAVAILABLE).json({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
  });
};

export default circuitBreakerMiddleware;