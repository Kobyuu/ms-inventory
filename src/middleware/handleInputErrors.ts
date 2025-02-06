import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HTTP, ERROR_MESSAGES } from '../config/constants';

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP.BAD_REQUEST).json({
      message: ERROR_MESSAGES.INVALID_DATA,
      errors: errors.array()
    });
  }

  next();
};