import { body, param } from 'express-validator';
import { handleInputErrors } from './handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId } from './validateInventory';
import { ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';

// Common validation middleware
export const commonValidations = [
  validateProductId,
  validateQuantity,
  validateInputOutput,
  handleInputErrors
];

// Common stock validation middleware
export const stockValidations = [
  body('productId').isInt().withMessage('El ID del producto debe ser un número entero'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
  body('input_output')
    .optional({ nullable: true })
    .isIn([INPUT_OUTPUT.INPUT, INPUT_OUTPUT.OUTPUT])
    .withMessage('El tipo de operación debe ser INPUT (1) u OUTPUT (2)'),
  handleInputErrors
];

export const addStockValidations = [
  body('productId').isInt().withMessage('El ID del producto debe ser un número entero'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
];

// Validation for productId parameter
export const productIdValidation = [
  param('productId').isInt().withMessage(ERROR_MESSAGES.INVALID_DATA),
  handleInputErrors
];