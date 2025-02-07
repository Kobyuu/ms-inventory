import request from 'supertest';
import express from 'express';
import breaker, { withCircuitBreaker } from '../middleware/circuitBreaker';
import { ERROR_MESSAGES, HTTP } from '../config/constants';

const app = express();

// Definir una ruta de prueba que usa el middleware de Circuit Breaker
app.get('/test', withCircuitBreaker, (req, res) => {
  res.status(200).send('Success');
});

// Pruebas para el middleware de Circuit Breaker
describe('CircuitBreaker Middleware', () => {
  it('should allow the request to pass through when the circuit is closed', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Success');
  });

  it('should return service unavailable when the circuit is open', async () => {
    breaker.open();

    // Asegurar que el estado se propague
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await request(app).get('/test');
    expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
    expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });

    breaker.close();
  });

  it('should handle errors and open the circuit', async () => {
    // Generamos múltiples fallos para superar el umbral de error
    for (let i = 0; i < 5; i++) {
      try {
        await breaker.fire(() => Promise.reject(new Error('Test error')));
      } catch (err) {
        // Ignoramos los errores ya que queremos solo disparar el fallo
      }
    }

    // Esperamos a que el breaker se abra realmente
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verificamos que el breaker realmente esté abierto
    expect(breaker.opened).toBe(true);

    // Ahora hacemos la solicitud y verificamos que devuelva 503
    const response = await request(app).get('/test');
    expect(response.status).toBe(HTTP.SERVICE_UNAVAILABLE);
    expect(response.body).toEqual({ message: ERROR_MESSAGES.SERVICE_UNAVAILABLE });

    // Restablecemos el estado del circuito para futuras pruebas
    breaker.close();
  });
});
