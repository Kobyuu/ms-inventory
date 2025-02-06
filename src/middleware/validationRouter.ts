import { body, param } from 'express-validator';
import { handleInputErrors } from './handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId } from './validateInventory';

// Common validation middleware
export const commonValidations = [
  validateProductId,
  validateQuantity,
  validateInputOutput,
  handleInputErrors
];

// Common stock validation middleware
export const stockValidations = [
  body('product_id').isInt().withMessage('product_id debe ser un número entero'),
  body('quantity').isFloat({ gt: 0 }).withMessage('quantity debe ser un número mayor que 0'),
  body('input_output').isIn([1, 2]).withMessage('input_output debe ser 1 (entrada) o 2 (salida)'),
  handleInputErrors
];

// Validation for product_id parameter
export const productIdValidation = [
  param('product_id').isInt().withMessage('product_id debe ser un número entero'),
  handleInputErrors
];