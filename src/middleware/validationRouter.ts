import { body, param } from 'express-validator';
import { handleInputErrors } from './handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId, validateActiveProduct } from './validateInventory';
import { ERROR_MESSAGES, INPUT_OUTPUT } from '../config/constants';

// Middleware de validación común que incluye producto activo, cantidad y tipo de operación
export const commonValidations = [
  validateProductId,
  validateActiveProduct,
  validateQuantity,
  validateInputOutput,
  handleInputErrors
];

// Validación específica para obtener stock por ID de producto
export const productIdValidation = [
  param('productId').isInt().withMessage(ERROR_MESSAGES.INVALID_DATA),
  validateActiveProduct, 
  handleInputErrors
];

// Validación para agregar nuevo stock
export const addStockValidations = [
  body('productId').isInt().withMessage('El ID del producto debe ser un número entero'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
  validateActiveProduct,
  handleInputErrors
];

// Validación para actualizar stock existente
export const stockValidations = [
  body('productId').isInt().withMessage('El ID del producto debe ser un número entero'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo'),
  body('input_output')
    .isIn([INPUT_OUTPUT.INPUT, INPUT_OUTPUT.OUTPUT])
    .withMessage('El tipo de operación debe ser INPUT (1) u OUTPUT (2)'),
  validateActiveProduct, 
  handleInputErrors
];