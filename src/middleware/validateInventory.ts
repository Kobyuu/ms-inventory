import { Request, Response, NextFunction } from 'express';
import { HTTP, ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';

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
  const { product_id } = req.body;
  
  if (!product_id) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_DATA
    });
  }
  next();
};