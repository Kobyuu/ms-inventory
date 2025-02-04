import CircuitBreaker from 'opossum';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

// Función que realiza una solicitud HTTP
async function makeHttpRequest(url: string) {
  const response = await axios.get(url);
  return response.data;
}

// Opciones del Circuit Breaker
const options = {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 5000
};

// Crear una instancia del Circuit Breaker
const breaker = new CircuitBreaker(makeHttpRequest, options);

// Manejar eventos del Circuit Breaker
breaker.on('open', () => console.warn('Circuit Breaker: Open'));
breaker.on('halfOpen', () => console.info('Circuit Breaker: Half Open'));
breaker.on('close', () => console.info('Circuit Breaker: Closed'));

// Middleware para Express
export function withCircuitBreaker(req: Request, res: Response, next: NextFunction) {
  next();
}

// Mantener la función existente para uso directo
export async function fetchDataWithCircuitBreaker(url: string) {
  try {
    return await breaker.fire(url);
  } catch (error) {
    console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
    throw error;
  }
}