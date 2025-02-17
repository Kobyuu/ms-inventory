import { IProduct, IProductResponse } from '../types/types';
import { HTTP, ERROR_MESSAGES } from '../config/constants';

export class ProductValidationMiddleware {
  // Crea una respuesta de error con mensaje y código de estado
  static createErrorResponse(error: string, statusCode: number): IProductResponse {
    return {
      data: {} as IProduct,
      error,
      statusCode
    };
  }

  // Crea una respuesta exitosa con los datos del producto
  static createSuccessResponse(data: IProduct): IProductResponse {
    return {
      data,
      statusCode: HTTP.OK
    };
  }

  // Valida la existencia del producto y retorna la respuesta apropiada
  static validateProduct(product: IProduct | null): IProductResponse {
    // Verifica si el producto existe
    if (!product) {
      return this.createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP.NOT_FOUND);
    }
    return this.createSuccessResponse(product);
  }
}