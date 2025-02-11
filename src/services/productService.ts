import axiosClient from '../config/axiosClient';
import { CONFIG } from '../config/constants/enviroment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { cacheService } from './redisCacheService';
import { IProductResponse } from '../types/types';
import breaker from '../middleware/circuitBreaker';
import { AxiosError } from 'axios';

export class ProductService {
  static async getProductById(productId: number): Promise<{ data?: IProductResponse; error?: string; statusCode: number }> {
    return breaker.fire(async () => {
      const cacheKey = `product:${productId}`;
      try {
        // Try to get data from cache first
        const cachedProduct = await cacheService.getFromCache(cacheKey);
        if (cachedProduct) {
          return { data: cachedProduct, statusCode: HTTP.OK };
        }

        // If not in cache, fetch from product service
        const url = `${CONFIG.PRODUCT_SERVICE_URL}/${productId}`;
        console.log('Requesting product from:', url);
        const response = await axiosClient.get<IProductResponse>(url);

        // Verify response data
        if (!response.data || !response.data.data) {
          return { error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
        }

        // Store in cache and return
        await cacheService.setToCache(cacheKey, response.data);
        return { data: response.data, statusCode: HTTP.OK };

      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === HTTP.NOT_FOUND) {
          return { error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
        }

        // Log and return generic error
        console.error('Error fetching product:', error instanceof Error ? error.message : 'Unknown error');
        return { error: ERROR_MESSAGES.HTTP_REQUEST, statusCode: HTTP.INTERNAL_SERVER_ERROR };
      }
    });
  }
}

export const productService = ProductService; // Export the class instead of an instance