import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleInputErrors } from './middleware/handleInputErrors';
import InventoryController from './controllers/inventoryController';

const router = Router();

// Obtener todos los registros de inventario
router.get('/', InventoryController.getAllStocks);

// Obtener stock por ID de producto
router.get('/:product_id', 
  param('product_id').isInt().withMessage('product_id debe ser un número entero'),
  handleInputErrors, 
  InventoryController.getStockByProductId
);

// Agregar nuevo registro de inventario con validación
router.post('/', 
  body('product_id').isInt().withMessage('product_id debe ser un número entero'),
  body('quantity').isFloat({ gt: 0 }).withMessage('quantity debe ser un número mayor que 0'),
  body('input_output').isIn([1, 2]).withMessage('input_output debe ser 1 (entrada) o 2 (salida)'),
  handleInputErrors, 
  InventoryController.addStock
);

// Modificar la cantidad en el inventario con validación
router.put('/update', 
  body('product_id').isInt().withMessage('product_id debe ser un número entero'),
  body('quantity').isFloat({ gt: 0 }).withMessage('quantity debe ser un número mayor que 0'),
  body('input_output').isIn([1, 2]).withMessage('input_output debe ser 1 (entrada) o 2 (salida)'),
  handleInputErrors, 
  InventoryController.updateStock
);

export default router;
