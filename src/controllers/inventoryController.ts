import { Request, Response } from 'express';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import inventoryService from '../services/inventoryService';
import { productService } from '../services/productService';

class InventoryController {
  static async getAllStocks(req: Request, res: Response): Promise<Response> {
    try {
      const response = await inventoryService.getAllStocks();
      if (response.error) {
        return res.status(response.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
          message: response.error
        });
      }
      return res.status(HTTP.OK).json(response);
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
      const response = await inventoryService.getStockByProductId(Number(productId));
      if (response.error) {
        return res.status(response.statusCode || HTTP.NOT_FOUND).json({
          message: response.error
        });
      }
      return res.status(HTTP.OK).json(response);
    } catch (e: any) {
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID,
        error: e.message
      });
    }
  }

  static async addStock(req: Request, res: Response): Promise<Response> {
    const { productId, quantity, input_output } = req.body;
    try {
      const productResponse = await productService.getProductById(productId);
      if (productResponse.statusCode === HTTP.NOT_FOUND) {
        return res.status(HTTP.NOT_FOUND).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }
      if (productResponse.statusCode !== HTTP.OK) {
        return res.status(productResponse.statusCode).json({ message: productResponse.error });
      }

      const response = await inventoryService.addStock(productId, quantity, input_output);
      if (response.error) {
        return res.status(response.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
          message: response.error
        });
      }
      return res.status(HTTP.CREATED).json({
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        data: response.data
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
    try {
      const productResponse = await productService.getProductById(productId);
      if (productResponse.statusCode === HTTP.NOT_FOUND) {
        return res.status(HTTP.NOT_FOUND).json({ 
          message: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
        });
      }
      if (productResponse.statusCode !== HTTP.OK) {
        return res.status(productResponse.statusCode).json({ 
          message: productResponse.error 
        });
      }

      const response = await inventoryService.updateStock(productId, quantity, input_output);
      if (response.error) {
        return res.status(response.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
          message: response.error
        });
      }
      
      return res.status(HTTP.OK).json({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        data: response.data  // Changed from updatedStock to data
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
