// circuitBreaker.ts
import CircuitBreaker from 'opossum';
import { ERROR_MESSAGES, CIRCUIT_BREAKER_MESSAGES } from '../config/constants';

const options = {
  timeout: 3000, // Si la operación tarda más de 3 segundos, se considera un fallo
  errorThresholdPercentage: 50, // Si el 50% de las solicitudes fallan, el circuito se abre
  resetTimeout: 30000 // El circuito se cierra después de 30 segundos
};

class CustomCircuitBreaker {
  private breaker: CircuitBreaker;

  constructor() {
    // Inicializamos con una función dummy; esta acción se reemplazará en cada llamada a fire().
    this.breaker = new CircuitBreaker(() => Promise.resolve(), options);

    this.breaker.fallback(() => {
      throw new Error(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    });

    this.breaker.on('open', () => console.log(CIRCUIT_BREAKER_MESSAGES.OPEN));
    this.breaker.on('halfOpen', () => console.log(CIRCUIT_BREAKER_MESSAGES.HALF_OPEN));
    this.breaker.on('close', () => console.log(CIRCUIT_BREAKER_MESSAGES.CLOSED));
  }

  /**
   * Ejecuta la operación pasada dentro del contexto del circuit breaker.
   * @param operation Función asíncrona que contiene la lógica de negocio.
   */
  async fire(operation: () => Promise<any>): Promise<any> {
    // Reemplazamos dinámicamente la acción del breaker por la operación que queremos ejecutar.
    return this.breaker.fire(operation);
  }
}

// Instanciamos un breaker para cada operación que queramos cubrir.
export const breakers = {
  getAllStocks: new CustomCircuitBreaker(),
  getStockByProductId: new CustomCircuitBreaker(),
  addStock: new CustomCircuitBreaker(),
  updateStock: new CustomCircuitBreaker(),
};

export default CustomCircuitBreaker;