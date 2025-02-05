import request from 'supertest'; // Librería para realizar pruebas HTTP
import express from 'express'; // Framework de Node.js para crear servidores
import CircuitBreaker from 'opossum'; // Implementación de Circuit Breaker
import { withCircuitBreaker, breaker } from '../middleware/circuitBreaker'; // Middleware de Circuit Breaker
import { ERROR_MESSAGES, HTTP } from '../config/constants'; // Constantes para mensajes de error y códigos HTTP

const app = express(); // Crear una instancia de Express

// Definir una ruta de prueba que usa el middleware de Circuit Breaker
app.get('/test', withCircuitBreaker, (req, res) => {
    res.status(200).send('Success');
});

// Pruebas para el middleware de Circuit Breaker
describe('CircuitBreaker Middleware', () => {
    it('should allow the request to pass through when the circuit is closed', async () => {
        // Verifica que la solicitud pase cuando el circuito está cerrado
        const response = await request(app).get('/test');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Success');
    });

    it('should return service unavailable when the circuit is open', async () => {
        // Simula el estado abierto del circuito
        breaker.open();

        // Realiza una solicitud y espera un estado de servicio no disponible
        const response = await request(app).get('/test');
        expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
        expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });

        // Restablece el estado del Circuit Breaker
        breaker.close();
    });

    it('should handle errors and open the circuit', async () => {
        // Simula un error para abrir el Circuit Breaker
        const errorBreaker = new CircuitBreaker(async () => {
            throw new Error('Test error'); // Lanza un error simulado
        }, {
            timeout: 3000, // Tiempo límite de ejecución de 3 segundos
            errorThresholdPercentage: 50, // Umbral de error del 50%
            resetTimeout: 30000 // Tiempo de reinicio de 30 segundos
        });

        // Define un fallback cuando el Circuit Breaker está abierto
        errorBreaker.fallback((): { status: number, message: string } => {
            return { status: HTTP.SERVICE_UNAVAILABLE, message: ERROR_MESSAGES.SERVICE_UNAVAILABLE };
        });

        // Crea una nueva instancia de Express con una ruta que usa el Circuit Breaker
        const errorApp = express();
        errorApp.get('/error-test', (req, res, next) => {
            errorBreaker.fire().then((result: { status: number, message: string }) => {
                res.status(result.status).json({ message: result.message });
            }).catch(next);
        });

        // Prueba la ruta y verifica que responde con servicio no disponible
        const response = await request(errorApp).get('/error-test');
        expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
        expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });
    });
});
