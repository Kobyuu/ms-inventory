import { IProduct, IProductResponse } from '../types/types';
import axiosClient from '../config/axiosClient';
import { HTTP, ERROR_MESSAGES, CONFIG } from '../config/constants';
import { cacheService } from './redisCacheService';
import { ProductValidationMiddleware } from '../middleware/productValidation';

class ProductService {
  // Obtiene un producto por ID desde caché o servicio externo
  async getProductById(productId: number): Promise<IProductResponse> {
    const cacheKey = `product:${productId}`;
    try {
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        // Validación del producto en caché
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

      // Obtención del producto desde el servicio externo
      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE.URL}/${productId}`);
      
      // Validación de respuesta
      if (!productResponse.data) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.PRODUCT_NOT_FOUND,
          HTTP.NOT_FOUND
        );
      }

      // Mapeo de datos del producto
      const product: IProduct = {
        productId: productResponse.data.data.id,
        name: productResponse.data.data.name,
        price: productResponse.data.data.price,
        activate: productResponse.data.data.activate
      };

      // Validación del producto obtenido
      if (!this.isValidProduct(product)) {
        return ProductValidationMiddleware.createErrorResponse(
          ERROR_MESSAGES.INVALID_DATA,
          HTTP.BAD_REQUEST
        );
      }

      await cacheService.setToCache(cacheKey, product);
      return ProductValidationMiddleware.createSuccessResponse(product);
    } catch (error: any) {
      // Manejo de errores específicos
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

  // Valida que un objeto cumpla con la estructura de IProduct
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