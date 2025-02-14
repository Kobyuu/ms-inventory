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
        console.log('Cached Product:', cachedProduct); // Debug log
        const validationError = ProductValidationMiddleware.validateProduct(cachedProduct);
        if (validationError) return validationError;
        return ProductValidationMiddleware.createSuccessResponse(cachedProduct as IProduct);
      }

      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE.URL}/${productId}`);
      // Fix: Extract the product from the nested data property
      const product: IProduct = {
        productId: productResponse.data.id,  // Map id to productId
        name: productResponse.data.name,
        price: productResponse.data.price,
        activate: productResponse.data.activate
      };
      
      console.log('API Product Response:', product); // Debug log
      
      const validationError = ProductValidationMiddleware.validateProduct(product);
      if (validationError) {
        console.log('Validation Error:', validationError); // Debug log
        return validationError;
      }

      await cacheService.setToCache(cacheKey, product);
      return ProductValidationMiddleware.createSuccessResponse(product);

    } catch (error: any) {
      console.error('Service Error:', error); // Debug log
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