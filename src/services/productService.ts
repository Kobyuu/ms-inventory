import { IProduct, IProductResponse } from '../types/types';
import axiosClient from '../config/axiosClient';
import { CONFIG } from '../config/constants/enviroment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { cacheService } from './redisCacheService';

class ProductService {
  async getProductById(productId: number): Promise<IProductResponse> {
    const cacheKey = `product:${productId}`;
    try {
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        return { 
          data: cachedProduct as IProduct,
          statusCode: HTTP.OK 
        };
      }

      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE_URL}/${productId}`);
      if (!productResponse.data) {
        return { 
          data: {} as IProduct,
          error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
          statusCode: HTTP.NOT_FOUND 
        };
      }

      await cacheService.setToCache(cacheKey, productResponse.data);
      return { 
        data: productResponse.data as IProduct,
        statusCode: HTTP.OK 
      };
    } catch (error: any) {
      if (error.response?.status === HTTP.NOT_FOUND) {
        return {
          data: {} as IProduct,
          error: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
          statusCode: HTTP.NOT_FOUND
        };
      }
      console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
      return {
        data: {} as IProduct,
        error: ERROR_MESSAGES.HTTP_REQUEST,
        statusCode: HTTP.INTERNAL_SERVER_ERROR
      };
    }
  }
}

export default new ProductService();