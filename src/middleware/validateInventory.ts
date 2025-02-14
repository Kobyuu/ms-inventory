import { Request, Response, NextFunction } from 'express';
import { HTTP, ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';
import { IProduct, IProductResponse } from '../types/types';
import productService from '../services/productService';

// Funciones de utilidad para respuestas
const createErrorResponse = (error: string, statusCode: number): IProductResponse => ({
  data: {} as IProduct,
  error,
  statusCode
});

// Validaciones de producto
export const validateProduct = (product: IProduct | null): IProductResponse | null => {
  if (!product) {
    return createErrorResponse(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP.NOT_FOUND);
  }

  if (!product.active) {
    return createErrorResponse(ERROR_MESSAGES.PRODUCT_INACTIVE, HTTP.NOT_FOUND);
  }

  return null;
};

// Middleware de validación
export const validateInputOutput = (req: Request, res: Response, next: NextFunction) => {
  const { input_output } = req.body;

  if (input_output !== INPUT_OUTPUT.INPUT && input_output !== INPUT_OUTPUT.OUTPUT) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INPUT_OUTPUT
    });
  }
  next();
};

export const validateQuantity = (req: Request, res: Response, next: NextFunction) => {
  const { quantity } = req.body;
  
  if (!quantity || quantity <= 0) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.QUANTITY
    });
  }
  next();
};

export const validateProductId = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_DATA
    });
  }
  next();
};

export const validateActiveProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId || req.body.productId);
    const productResponse = await productService.getProductById(productId);

    if (!productResponse.data?.active) {
      return res.status(HTTP.NOT_FOUND).json({
        error: ERROR_MESSAGES.PRODUCT_INACTIVE
      });
    }
    next();
  } catch (error) {
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.HTTP_REQUEST
    });
  }
};