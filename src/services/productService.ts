import { IProduct, IProductResponse } from '../types/types';
import axiosClient from '../config/axiosClient';
import { CONFIG } from '../config/constants/enviroment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { cacheService } from './redisCacheService';
import { ProductValidationMiddleware } from '../middleware/productValidation';

class ProductService {
  async getProductById(productId: number): Promise<IProductResponse> {
    const cacheKey = `product:${productId}`;
    try {
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        const validationError = ProductValidationMiddleware.validateProduct(cachedProduct);
        if (validationError) return validationError;
        return ProductValidationMiddleware.createSuccessResponse(cachedProduct as IProduct);
      }

      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE_URL}/${productId}`);
      const product = productResponse.data;
      
      const validationError = ProductValidationMiddleware.validateProduct(product);
      if (validationError) return validationError;

      await cacheService.setToCache(cacheKey, product);
      return ProductValidationMiddleware.createSuccessResponse(product as IProduct);

    } catch (error: any) {
      if (error.response?.status === HTTP.NOT_FOUND) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
          HTTP.NOT_FOUND
        );
      }
      console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
      return ProductValidationMiddleware.createErrorResponse(
        ERROR_MESSAGES.HTTP_REQUEST, 
        HTTP.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new ProductService();