import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import axiosClient from '../config/axiosClient';
import { config } from '../config/env';
import { errorMessages, successMessages } from '../config/messages';

class InventoryController {
  static async getAllStocks(req: Request, res: Response): Promise<Response> {
    try {
      const stocks = await inventoryService.getAllStocks();
      return res.status(200).json(stocks);
    } catch (error) {
      console.error(errorMessages.getAllStocks, error);
      return res.status(500).json({ message: errorMessages.getAllStocks, error });
    }
  }

  static async getStockByProductId(req: Request, res: Response): Promise<Response> {
    const { product_id } = req.params;
    try {
      const stock = await inventoryService.getStockByProductId(Number(product_id));
      if (!stock) {
        return res.status(404).json({ message: errorMessages.stockNotFound });
      }
      return res.status(200).json(stock);
    } catch (error) {
      console.error(errorMessages.getStockByProductId, error);
      return res.status(500).json({ message: errorMessages.getStockByProductId, error });
    }
  }

  static async addStock(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, input_output } = req.body;
    if (!product_id || quantity <= 0 || input_output !== 1) {
      return res.status(400).json({
        message: errorMessages.inputOutput,
      });
    }

    try {
      const productServiceUrl = `${config.productServiceUrl}/${product_id}`;
      const productResponse = await axiosClient.get(productServiceUrl);

      if (productResponse.status !== 200) {
        return res.status(404).json({ message: errorMessages.productNotFound });
      }

      const updatedStock = await inventoryService.addStock(product_id, quantity, input_output);
      return res.status(201).json({
        message: successMessages.stockAdded,
        updatedStock
      });
    } catch (error) {
      console.error(errorMessages.addStock, error);
      return res.status(500).json({ message: errorMessages.addStock, error });
    }
  }

  static async updateStock(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, input_output } = req.body;
    if (!product_id || quantity <= 0 || (input_output !== 1 && input_output !== 2)) {
      return res.status(400).json({ message: errorMessages.invalidData });
    }

    try {
      const productServiceUrl = `${config.productServiceUrl}/${product_id}`;
      const productResponse = await axiosClient.get(productServiceUrl);

      if (productResponse.status !== 200) {
        return res.status(404).json({ message: errorMessages.productNotFound });
      }

      const updatedStock = await inventoryService.updateStock(product_id, quantity, input_output);
      return res.status(200).json({
        message: successMessages.stockUpdated,
        updatedStock
      });
    } catch (error) {
      console.error(errorMessages.updateStock, error);
      return res.status(500).json({ message: errorMessages.updateStock, error });
    }
  }

  static async revertPurchase(req: Request, res: Response): Promise<Response> {
    const { product_id } = req.params;
    const { quantity } = req.body;

    if (!product_id || quantity <= 0) {
      return res.status(400).json({ message: errorMessages.quantity });
    }

    try {
      const result = await inventoryService.revertPurchase(Number(product_id), quantity);
      return res.status(200).json({
        message: successMessages.stockReverted,
        ...result,
      });
    } catch (error) {
      console.error(errorMessages.revertPurchase, error);
      return res.status(500).json({ message: errorMessages.revertPurchase, error });
    }
  }
}

export default InventoryController;
