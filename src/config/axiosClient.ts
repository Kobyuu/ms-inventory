import axios from 'axios';
import axiosRetry from 'axios-retry';
import { config } from './env';
import { ERROR_MESSAGES } from './constants';

const axiosClient = axios.create({
  baseURL: config.productServiceUrl,
  timeout: 5000,
});

// Configurar axios-retry
axiosRetry(axiosClient, {
  retries: 3, // Número de reintentos
  retryDelay: (retryCount) => {
    console.log(`Intento de reintento: ${retryCount}`);
    return retryCount * 1000; // Retraso entre reintentos (en milisegundos)
  },
  retryCondition: (error) => {
    // Reintentar solo si es un error de red o un error 5xx
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ?? 0) >= 500;
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
    return Promise.reject(error);
  }
);

export default axiosClient;