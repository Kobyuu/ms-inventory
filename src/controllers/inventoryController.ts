import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import axiosClient from '../config/axiosClient';
import { config } from '../config/constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT, HTTP } from '../config/constants';

class InventoryController {
  static async getAllStocks(req: Request, res: Response): Promise<Response> {
    try {
      const stocks = await inventoryService.getAllStocks();
      return res.status(HTTP.OK).json(stocks);
    } catch (error) {
      console.error(ERROR_MESSAGES.GET_ALL_STOCKS, error);
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.GET_ALL_STOCKS, error });
    }
  }

  static async getStockByProductId(req: Request, res: Response): Promise<Response> {
    const { product_id } = req.params;
    try {
      const stock = await inventoryService.getStockByProductId(Number(product_id));
      if (!stock) {
        return res.status(HTTP.NOT_FOUND).json({ message: ERROR_MESSAGES.STOCK_NOT_FOUND });
      }
      return res.status(HTTP.OK).json(stock);
    } catch (error) {
      console.error(ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, error);
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, error });
    }
  }

  static async addStock(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, input_output } = req.body;
    if (!product_id || quantity <= 0 || input_output !== INPUT_OUTPUT.INPUT) {
      return res.status(HTTP.BAD_REQUEST).json({
        message: ERROR_MESSAGES.INPUT_OUTPUT,
      });
    }

    try {
      const productServiceUrl = `${config.productServiceUrl}/${product_id}`;
      const productResponse = await axiosClient.get(productServiceUrl);

      if (productResponse.status !== HTTP.OK) {
        return res.status(HTTP.NOT_FOUND).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }

      const updatedStock = await inventoryService.addStock(product_id, quantity, input_output);
      return res.status(HTTP.CREATED).json({
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        updatedStock
      });
    } catch (error) {
      console.error(ERROR_MESSAGES.ADD_STOCK, error);
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.ADD_STOCK, error });
    }
  }

  static async updateStock(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, input_output } = req.body;
    if (!product_id || quantity <= 0 || (input_output !== INPUT_OUTPUT.INPUT && input_output !== INPUT_OUTPUT.OUTPUT)) {
      return res.status(HTTP.BAD_REQUEST).json({ message: ERROR_MESSAGES.INVALID_DATA });
    }

    try {
      const productServiceUrl = `${config.productServiceUrl}/${product_id}`;
      const productResponse = await axiosClient.get(productServiceUrl);

      if (productResponse.status !== HTTP.OK) {
        return res.status(HTTP.NOT_FOUND).json({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
      }

      const updatedStock = await inventoryService.updateStock(product_id, quantity, input_output);
      return res.status(HTTP.OK).json({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        updatedStock
      });
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_STOCK, error);
      return res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.UPDATE_STOCK, error });
    }
  }
}

export default InventoryController;
