import { body, param } from 'express-validator';
import { handleInputErrors } from './handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId } from './validateInventory';
import { ERROR_MESSAGES } from '../config/constants/messages';

// Common validation middleware
export const commonValidations = [
  validateProductId,
  validateQuantity,
  validateInputOutput,
  handleInputErrors
];

// Common stock validation middleware
export const stockValidations = [
  body('productId').isInt().withMessage(ERROR_MESSAGES.INVALID_DATA),
  body('quantity').isFloat({ gt: 0 }).withMessage(ERROR_MESSAGES.QUANTITY),
  body('input_output').isIn([1, 2]).withMessage(ERROR_MESSAGES.INPUT_OUTPUT),
  handleInputErrors
];

// Validation for productId parameter
export const productIdValidation = [
  param('productId').isInt().withMessage(ERROR_MESSAGES.INVALID_DATA),
  handleInputErrors
];