import { Router } from 'express';
import { commonValidations, stockValidations, addStockValidations, productIdValidation } from './middleware/validationRouter';
import InventoryController from './controllers/inventoryController';

const router = Router();

router.get('/', 
  InventoryController.getAllStocks
);

router.get('/:productId',
  productIdValidation,
  InventoryController.getStockByProductId
);

router.post('/',
  addStockValidations, // Usar validaciones específicas para addStock
  commonValidations,
  InventoryController.addStock
);

router.put('/update',
  stockValidations,
  commonValidations,
  InventoryController.updateStock
);

export default router;