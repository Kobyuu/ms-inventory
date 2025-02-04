import CircuitBreaker from 'opossum';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP } from '../config/constants';
import { CircuitBreakerService } from '../types/types';

class HttpCircuitBreaker implements CircuitBreakerService {
  private breaker: CircuitBreaker;

  constructor() {
    const options = {
      timeout: 3000,
      errorThresholdPercentage: 50,
      resetTimeout: 5000,
      name: 'HTTP Circuit Breaker'
    };

    const makeHttpRequest = async (url: string) => {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
        throw error;
      }
    };

    this.breaker = new CircuitBreaker(makeHttpRequest, options);
    this.setupEventHandlers();
  }
  onStateChange(callback: (state: string) => void): void {
    throw new Error('Method not implemented.');
  }

  private setupEventHandlers(): void {
    this.breaker.on('open', () => console.warn('Circuit Breaker: Open - Service is unavailable'));
    this.breaker.on('halfOpen', () => console.info('Circuit Breaker: Half Open - Testing service availability'));
    this.breaker.on('close', () => console.info('Circuit Breaker: Closed - Service is operational'));
    this.breaker.on('fallback', () => console.warn('Circuit Breaker: Fallback - Using backup operation'));
  }

  isOpen(): boolean {
    return this.breaker.opened;
  }

  async fire<T>(url: string): Promise<T> {
    if (this.breaker.opened) {
      throw new Error(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    }
    return await this.breaker.fire(url) as T;
  }
}

const circuitBreaker = new HttpCircuitBreaker();

export function withCircuitBreaker(req: Request, res: Response, next: NextFunction) {
  if (circuitBreaker.isOpen()) {
    return res.status(HTTP.SERVICE_UNAVAILABLE).json({
      message: ERROR_MESSAGES.SERVICE_UNAVAILABLE
    });
  }

  circuitBreaker.fire(req.originalUrl)
    .then(() => next())
    .catch((error) => {
      console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
      res.status(HTTP.SERVICE_UNAVAILABLE).json({
        message: ERROR_MESSAGES.SERVICE_UNAVAILABLE
      });
    });
}

export async function fetchDataWithCircuitBreaker(url: string) {
  return circuitBreaker.fire(url);
}