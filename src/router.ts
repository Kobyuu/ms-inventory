import { Router } from 'express';
import { commonValidations, stockValidations, productIdValidation } from './middleware/validationRouter';
import InventoryController from './controllers/inventoryController';
import { withCircuitBreaker } from './middleware/circuitBreaker';

const router = Router();

// Routes with improved middleware organization
router.get('/', 
  withCircuitBreaker, 
  InventoryController.getAllStocks
);

router.get('/:productId',
  productIdValidation,
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

export default router;