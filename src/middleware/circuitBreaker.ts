import CircuitBreaker from 'opossum';
import axios from 'axios';
import { ERROR_MESSAGES } from '../config/constants';

// Función que realiza una solicitud HTTP
async function fetchData(url: string) {
  const response = await axios.get(url);
  return response.data;
}

// Opciones del Circuit Breaker
const options = {
  timeout: 3000, // Tiempo máximo para una solicitud (en milisegundos)
  errorThresholdPercentage: 50, // Umbral de error para abrir el circuito
  resetTimeout: 5000 // Tiempo para intentar cerrar el circuito nuevamente (en milisegundos)
};

// Crear una instancia del Circuit Breaker
const breaker = new CircuitBreaker(fetchData, options);

// Manejar eventos del Circuit Breaker
breaker.on('open', () => console.warn('Circuito abierto'));
breaker.on('halfOpen', () => console.info('Circuito en estado medio abierto'));
breaker.on('close', () => console.info('Circuito cerrado'));
breaker.on('fallback', () => console.error(ERROR_MESSAGES.SERVICE_UNAVAILABLE));

// Función para realizar una solicitud con el Circuit Breaker
export async function fetchDataWithCircuitBreaker(url: string) {
  try {
    const data = await breaker.fire(url);
    return data;
  } catch (error) {
    console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
    throw error;
  }
}