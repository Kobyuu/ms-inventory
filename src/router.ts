import { Router } from 'express';
import { commonValidations, stockValidations, productIdValidation } from './middleware/validationRouter';
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
  stockValidations,
  commonValidations,
  InventoryController.addStock
);

router.put('/update',
  stockValidations,
  commonValidations,
  InventoryController.updateStock
);

export default router;