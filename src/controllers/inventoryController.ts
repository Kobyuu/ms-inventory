import { Request, Response } from 'express';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT } from '../config/constants';
import inventoryService from '../services/inventoryService';
import productService from '../services/productService';

class InventoryController {
  static async getAllStocks(req: Request, res: Response): Promise<Response> {
    try {
      const stocks = await inventoryService.getAllStocks();
      return res.status(HTTP.OK).json(stocks);
    } catch (e: any) {
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.GET_ALL_STOCKS,
        error: e.message
      });
    }
  }

  static async getStockByProductId(req: Request, res: Response): Promise<Response> {
    const { productId } = req.params;
    try {
      const stock = await inventoryService.getStockByProductId(Number(productId));
      if (!stock) {
        return res.status(HTTP.NOT_FOUND).json({
          message: ERROR_MESSAGES.STOCK_NOT_FOUND
        });
      }
      return res.status(HTTP.OK).json(stock);
    } catch (e: any) {
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID,
        error: e.message
      });
    }
  }

  static async addStock(req: Request, res: Response): Promise<Response> {
    const { productId, quantity, input_output } = req.body;
    if (input_output !== INPUT_OUTPUT.INPUT) {
      return res.status(HTTP.BAD_REQUEST).json({ message: ERROR_MESSAGES.INPUT_OUTPUT });
    }
    try {
      const productResponse = await productService.getProductById(productId);
      if (productResponse.statusCode === HTTP.NOT_FOUND) {
        return res.status(HTTP.NOT_FOUND).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }
      const addedStock = await inventoryService.addStock(productId, quantity, input_output);
      return res.status(HTTP.CREATED).json({
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        updatedStock: addedStock
      });
    } catch (e: any) {
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.ADD_STOCK,
        error: e.message
      });
    }
  }

  static async updateStock(req: Request, res: Response): Promise<Response> {
    const { productId, quantity, input_output } = req.body;
    if (quantity <= 0) {
      return res.status(HTTP.BAD_REQUEST).json({ message: ERROR_MESSAGES.INVALID_DATA });
    }
    try {
      const productResponse = await productService.getProductById(productId);
      if (productResponse.statusCode === HTTP.NOT_FOUND) {
        return res.status(HTTP.NOT_FOUND).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }
      const updatedStock = await inventoryService.updateStock(productId, quantity, input_output);
      return res.status(HTTP.OK).json({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        updatedStock
      });
    } catch (e: any) {
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.UPDATE_STOCK,
        error: e.message
      });
    }
  }
}

export default InventoryController;
