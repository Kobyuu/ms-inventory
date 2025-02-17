import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG } from './constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DYNAMIC_MESSAGES, HTTP } from './constants';
import { cacheService } from '../services/redisCacheService';

// Cliente HTTP con configuración base
const axiosClient = axios.create({
  baseURL: CONFIG.PRODUCT_SERVICE.URL,
  timeout: CONFIG.PRODUCT_SERVICE.TIMEOUT,
});

// Configuración de reintentos para peticiones fallidas
axiosRetry(axiosClient, {
  retries: CONFIG.RETRY.ATTEMPTS,
  // Calcula el tiempo de espera entre reintentos
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * CONFIG.RETRY.DELAY;
  },
  // Define condiciones para reintentar peticiones
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ?? 0) >= HTTP.INTERNAL_SERVER_ERROR;
  },
});

// Interceptor de peticiones para verificar caché
axiosClient.interceptors.request.use(async (config) => {
  const cacheKey = `cache:${config.url}`;
  const cachedData = await cacheService.getFromCache(cacheKey);

  // Si hay datos en caché para peticiones GET, los retorna
  if (cachedData && config.method === 'get') {
    config.adapter = async () => {
      return {
        data: cachedData,
        status: HTTP.OK,
        statusText: SUCCESS_MESSAGES.OK,
        headers: {},
        config,
        request: {},
      };
    };
  }

  return config;
});

// Interceptor de respuestas para almacenar en caché
axiosClient.interceptors.response.use(async (response) => {
  // Guarda en caché solo las respuestas GET
  if (response.config.method === 'get') {
    const cacheKey = `cache:${response.config.url}`;
    await cacheService.setToCache(cacheKey, response.data);
  }
  return response;
}, (error) => {
  // Manejo de errores en las peticiones
  console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
  return Promise.reject(error);
});

export default axiosClient;