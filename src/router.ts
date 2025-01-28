import { Router } from 'express';
import { handleInputErrors } from './middleware/handleInputErrors';
import InventoryController from './controllers/inventoryController';

const router = Router();

// Obtener todos los registros de inventario
router.get('/', InventoryController.getAllStocks);

// Obtener stock por ID de producto
router.get('/:product_id', InventoryController.getStockByProductId);

// Agregar nuevo registro de inventario con validación
router.post('/', handleInputErrors, InventoryController.addStock);

// Modificar la cantidad en el inventario con validación
router.put('/update', handleInputErrors, InventoryController.updateStock);

export default router;
