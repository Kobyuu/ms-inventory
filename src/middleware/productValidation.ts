import { IProduct, IProductResponse } from '../types/types';
import { HTTP, ERROR_MESSAGES } from '../config/constants';

export class ProductValidationMiddleware {
  static createErrorResponse(error: string, statusCode: number): IProductResponse {
    return {
      data: {} as IProduct,
      error,
      statusCode
    };
  }

  static createSuccessResponse(data: IProduct): IProductResponse {
    return {
      data,
      statusCode: HTTP.OK
    };
  }

  static validateProduct(product: IProduct | null): IProductResponse | null {
    if (!product) {
      return this.createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP.NOT_FOUND);
    }

    if (!product.active) {
      return this.createErrorResponse(ERROR_MESSAGES.PRODUCT_INACTIVE, HTTP.NOT_FOUND);
    }

    return null;
  }
}