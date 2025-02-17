import { Request, Response } from 'express';
import { HTTP, ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT } from '../config/constants';
import { ErrorResponse } from '../types/types';
import inventoryService from '../services/inventoryService';
import productService from '../services/productService';

class InventoryController {
  // Verifica existencia y estado del producto
  private static async verifyProduct(productId: number): Promise<ErrorResponse | null> {
    const productResponse = await productService.getProductById(productId);
    // Valida si el producto no existe
    if (productResponse.statusCode === HTTP.NOT_FOUND) {
      return {
        status: HTTP.NOT_FOUND,
        json: { message: ERROR_MESSAGES.PRODUCT_NOT_FOUND }
      };
    }
    // Valida otros errores del servicio
    if (productResponse.statusCode !== HTTP.OK) {
      return {
        status: productResponse.statusCode,
        json: { message: productResponse.error || ERROR_MESSAGES.PRODUCT_NOT_FOUND }
      };
    }
    return null;
  }

  // Obtiene todos los registros de stock
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

  // Obtiene el stock de un producto específico
  static async getStockByProductId(req: Request, res: Response): Promise<Response> {
    const { productId } = req.params;
    try {
      const stock = await inventoryService.getStockByProductId(Number(productId));
      // Valida si existe stock para el producto
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

  // Agrega nuevo stock al inventario
  static async addStock(req: Request, res: Response): Promise<Response> {
    const { productId, quantity } = req.body;
    try {
      // Verifica existencia del producto
      const productError = await InventoryController.verifyProduct(productId);
      if (productError) {
        return res.status(productError.status).json(productError.json);
      }

      // Procesa la adición de stock
      const result = await inventoryService.addStock(productId, quantity, INPUT_OUTPUT.INPUT);
      
      // Maneja errores en la operación
      if (result.error || !result.data) {
        return res.status(result.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
          message: result.error || ERROR_MESSAGES.ADD_STOCK
        });
      }

      return res.status(HTTP.CREATED).json({
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        updatedStock: result.data
      });
    } catch (e: any) {
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({
        message: ERROR_MESSAGES.ADD_STOCK,
        error: e.message
      });
    }
  }

  // Actualiza el stock existente
  static async updateStock(req: Request, res: Response): Promise<Response> {
    const { productId, quantity, input_output } = req.body;
    try {
      // Verifica existencia del producto
      const productError = await InventoryController.verifyProduct(productId);
      if (productError) {
        return res.status(productError.status).json(productError.json);
      }

      // Procesa la actualización de stock
      const result = await inventoryService.updateStock(productId, quantity, input_output);
      
      // Maneja errores en la operación
      if (result.error || !result.data) {
        return res.status(result.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
          message: result.error || ERROR_MESSAGES.UPDATE_STOCK
        });
      }

      return res.status(HTTP.OK).json({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        updatedStock: result.data
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
