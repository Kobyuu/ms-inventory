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
        // Validar que cachedProduct tenga todas las propiedades necesarias
        if (!this.isValidProduct(cachedProduct)) {
          return ProductValidationMiddleware.createErrorResponse(
            ERROR_MESSAGES.INVALID_DATA,
            HTTP.BAD_REQUEST
          );
        }
        const validationError = ProductValidationMiddleware.validateProduct(cachedProduct);
        if (validationError) return validationError;
        return ProductValidationMiddleware.createSuccessResponse(cachedProduct as IProduct);
      }

      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE.URL}/${productId}`);
      
      // Validar que la respuesta tenga datos
      if (!productResponse.data) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PRODUCT_NOT_FOUND,
          HTTP.NOT_FOUND
        );
      }

      const product: IProduct = {
        productId: productResponse.data.data.id,
        name: productResponse.data.data.name,
        price: productResponse.data.data.price,
        activate: productResponse.data.data.activate
      };

      // Validar que el producto tenga todas las propiedades necesarias
      if (!this.isValidProduct(product)) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.INVALID_DATA,
          HTTP.BAD_REQUEST
        );
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

  private isValidProduct(product: any): product is IProduct {
    return (
      product &&
      typeof product.productId === 'number' &&
      typeof product.name === 'string' &&
      typeof product.price === 'number' &&
      typeof product.activate === 'boolean'
    );
  }
}

export default new ProductService();