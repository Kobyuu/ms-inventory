import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG } from './constants/enviroment';
import { ERROR_MESSAGES, DYNAMIC_MESSAGES } from './constants';

const axiosClient = axios.create({
  baseURL: CONFIG.PRODUCT_SERVICE_URL,
  timeout: 5000,
});

// Configurar axios-retry
axiosRetry(axiosClient, {
  retries: CONFIG.RETRY_ATTEMPTS, // Número de reintentos
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * CONFIG.RETRY_DELAY; // Retraso entre reintentos (en milisegundos)
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