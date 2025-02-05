import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import { validateInputOutput, validateQuantity, validateProductId } from './middleware/validateInventory';
import InventoryController from './controllers/inventoryController';
import { withCircuitBreaker } from './middleware/circuitBreaker';

const router = Router();

// Common validation middleware
const commonValidations = [
  validateProductId,
  validateQuantity,
  validateInputOutput,
  handleInputErrors
];

// Common stock validation middleware
const stockValidations = [
  body('product_id').isInt().withMessage('product_id debe ser un número entero'),
  body('quantity').isFloat({ gt: 0 }).withMessage('quantity debe ser un número mayor que 0'),
  body('input_output').isIn([1, 2]).withMessage('input_output debe ser 1 (entrada) o 2 (salida)')
];

// Routes with improved middleware organization
router.get('/', 
  withCircuitBreaker, 
  InventoryController.getAllStocks
);

router.get('/:product_id',
  param('product_id').isInt().withMessage('product_id debe ser un número entero'),
  handleInputErrors,
  withCircuitBreaker,
  InventoryController.getStockByProductId
);

router.post('/',
  stockValidations,
  commonValidations,
  withCircuitBreaker,
  InventoryController.addStock
);

router.put('/update',
  stockValidations,
  commonValidations,
  withCircuitBreaker,
  InventoryController.updateStock
);

// Route for deleting a product
router.delete('/:product_id',
  param('product_id').isInt().withMessage('product_id debe ser un número entero'),
  handleInputErrors,
  withCircuitBreaker,
  InventoryController.deleteProduct
);

export default router;