import request from 'supertest';
import express from 'express';
import CircuitBreaker from 'opossum';
import { withCircuitBreaker, breaker } from '../middleware/circuitBreaker';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

const app = express();

app.get('/test', withCircuitBreaker, (req, res) => {
    res.status(200).send('Success');
});

describe('CircuitBreaker Middleware', () => {
    it('should allow the request to pass through when the circuit is closed', async () => {
        const response = await request(app).get('/test');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Success');
    });

    it('should return service unavailable when the circuit is open', async () => {
        // Simulate circuit open state
        breaker.open();

        const response = await request(app).get('/test');
        expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
        expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });

        // Reset the circuit breaker state
        breaker.close();
    });

    it('should handle errors and open the circuit', async () => {
        // Simulate an error to open the circuit
        const errorBreaker = new CircuitBreaker(async () => {
            throw new Error('Test error');
        }, {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        });

        // Set up fallback for the errorBreaker
        errorBreaker.fallback((): { status: number, message: string } => {
            return { status: HTTP.SERVICE_UNAVAILABLE, message: ERROR_MESSAGES.SERVICE_UNAVAILABLE };
        });

        const errorApp = express();
        errorApp.get('/error-test', (req, res, next) => {
            errorBreaker.fire().then((result: { status: number, message: string }) => {
                            res.status(result.status).json({ message: result.message });
            }).catch(next);
        });

        const response = await request(errorApp).get('/error-test');
        expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
        expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
    });
});