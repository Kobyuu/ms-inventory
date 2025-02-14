import { Request, Response, NextFunction } from 'express';
import { HTTP, ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';
import productService from '../services/productService';
import { ProductValidationMiddleware } from './productValidation';

// Remove duplicated validateProduct function

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

    const validationError = ProductValidationMiddleware.validateProduct(productResponse.data);
    if (validationError) {
      return res.status(validationError.statusCode).json({
        error: validationError.error
      });
    }
    
    next();
  } catch (error) {
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.HTTP_REQUEST
    });
  }
};