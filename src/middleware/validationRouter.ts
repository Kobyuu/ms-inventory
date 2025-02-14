import { body, param } from 'express-validator';
import { handleInputErrors } from './handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId, validateActiveProduct } from './validateInventory';
import { ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';

// Common validation middleware with active product validation
export const commonValidations = [
  validateProductId,
  validateActiveProduct,  
  validateQuantity,
  validateInputOutput,
  handleInputErrors
];

// Specific validation for getting stock by productId
export const productIdValidation = [
  param('productId').isInt().withMessage(ERROR_MESSAGES.INVALID_DATA),
  validateActiveProduct,  // También validamos aquí el estado activo
  handleInputErrors
];

// Validation for adding stock
export const addStockValidations = [
  body('productId').isInt().withMessage('El ID del producto debe ser un número entero'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
  validateActiveProduct,  // Validamos el estado activo al agregar stock
  handleInputErrors
];

// Validation for updating stock
export const stockValidations = [
  body('productId').isInt().withMessage('El ID del producto debe ser un número entero'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
  body('input_output')
    .isIn([INPUT_OUTPUT.INPUT, INPUT_OUTPUT.OUTPUT])
    .withMessage('El tipo de operación debe ser INPUT (1) u OUTPUT (2)'),
  validateActiveProduct,  // Validamos el estado activo al actualizar stock
  handleInputErrors
];