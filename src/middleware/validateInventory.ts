import { Request, Response, NextFunction } from 'express';
import { HTTP, ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';
import productService from '../services/productService';

// Valida que la operación sea de entrada o salida (1 o 2)
export const validateInputOutput = (req: Request, res: Response, next: NextFunction) => {
  const { input_output } = req.body;

    if (input_output !== INPUT_OUTPUT.INPUT && input_output !== INPUT_OUTPUT.OUTPUT) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INPUT_OUTPUT
    });
  }
  next();
};

// Valida que la cantidad sea un número positivo
export const validateQuantity = (req: Request, res: Response, next: NextFunction) => {
  const { quantity } = req.body;
  
    if (!quantity || quantity <= 0) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.QUANTITY
    });
  }
  next();
};

// Valida que exista un ID de producto en la petición
export const validateProductId = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.body;
  
    if (!productId) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_DATA
    });
  }
  next();
};

// Valida que el producto exista y esté activo en el catálogo
export const validateActiveProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtiene el ID del producto de los parámetros o del body
    const productIdParam = req.params.productId || req.body.productId;
    const productId = parseInt(productIdParam);
    
    // Valida que el ID sea un número válido
    if (isNaN(productId)) {
      return res.status(HTTP.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_DATA
      });
    }

    const productResponse = await productService.getProductById(productId);

    if (productResponse.statusCode === HTTP.OK) {
      next();
      return;
    }
    
    return res.status(HTTP.NOT_FOUND).json({
      error: ERROR_MESSAGES.PRODUCT_NOT_FOUND
    });
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.HTTP_REQUEST
    });
  }
};