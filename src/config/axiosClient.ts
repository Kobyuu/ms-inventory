import axios from 'axios';
import axiosRetry from 'axios-retry';
import { CONFIG } from './constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DYNAMIC_MESSAGES, HTTP } from './constants';
import { cacheService } from '../services/redisCacheService';

const axiosClient = axios.create({
  baseURL: CONFIG.PRODUCT_SERVICE.URL,
  timeout: CONFIG.PRODUCT_SERVICE.TIMEOUT,
});

// Configurar axios-retry
axiosRetry(axiosClient, {
  retries: CONFIG.RETRY.ATTEMPTS,
  retryDelay: (retryCount) => {
    console.log(DYNAMIC_MESSAGES.RETRY_ATTEMPT(retryCount));
    return retryCount * CONFIG.RETRY.DELAY;
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status ?? 0) >= HTTP.INTERNAL_SERVER_ERROR;
  },
});

// Interceptor para cache con Redis
axiosClient.interceptors.request.use(async (config) => {
  const cacheKey = `cache:${config.url}`;
  const cachedData = await cacheService.getFromCache(cacheKey);

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

// Interceptor para cache con Redis
axiosClient.interceptors.response.use(async (response) => {
  if (response.config.method === 'get') {
    const cacheKey = `cache:${response.config.url}`;
    await cacheService.setToCache(cacheKey, response.data);
  }
  return response;
}, (error) => {
  console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
  return Promise.reject(error);
});

export default axiosClient;