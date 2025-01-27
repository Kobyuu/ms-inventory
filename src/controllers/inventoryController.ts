import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import { config } from '../config/env';
import axios from 'axios';

class InventoryController {
  static async getAllStocks(req: Request, res: Response): Promise<Response> {
    try {
      const stocks = await inventoryService.getAllStocks();
      return res.status(200).json(stocks);
    } catch (error) {
      console.error('Error al obtener datos del inventario:', error);
      return res.status(500).json({ message: 'Error al obtener datos del inventario', error });
    }
  }

  static async getStockByProductId(req: Request, res: Response): Promise<Response> {
    const { product_id } = req.params;
    try {
      const stock = await inventoryService.getStockByProductId(Number(product_id));
      if (!stock) {
        return res.status(404).json({ message: 'Stock no encontrado' });
      }
      return res.status(200).json(stock);
    } catch (error) {
      console.error('Error al obtener stock:', error);
      return res.status(500).json({ message: 'Error al obtener stock', error });
    }
  }

  static async addStock(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, input_output } = req.body;
    if (!product_id || quantity <= 0 || input_output !== 1) {
      return res.status(400).json({
        message: 'La ID del producto debe ser dada, la cantidad debe ser mayor a 0, y entrada/salida debe ser 1 para agregar stock',
      });
    }

    try {
      const productServiceUrl = `${config.productServiceUrl}/${product_id}`;
      const productResponse = await axios.get(productServiceUrl);

      if (productResponse.status !== 200) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const updatedStock = await inventoryService.addStock(product_id, quantity, input_output);
      return res.status(201).json(updatedStock);
    } catch (error) {
      console.error('Error al agregar stock:', error);
      return res.status(500).json({ message: 'Error al agregar stock', error });
    }
  }

  static async updateStock(req: Request, res: Response): Promise<Response> {
    const { product_id, quantity, input_output } = req.body;
    if (!product_id || quantity <= 0 || (input_output !== 1 && input_output !== 2)) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    try {
      const productServiceUrl = `${config.productServiceUrl}/${product_id}`;
      const productResponse = await axios.get(productServiceUrl);

      if (productResponse.status !== 200) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const updatedStock = await inventoryService.updateStock(product_id, quantity, input_output);
      return res.status(200).json(updatedStock);
    } catch (error) {
      console.error('Error al modificar stock:', error);
      return res.status(500).json({ message: 'Error al modificar stock', error });
    }
  }

  static async revertPurchase(req: Request, res: Response): Promise<Response> {
    const { product_id } = req.params;
    const { quantity } = req.body;

    if (!product_id || quantity <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    try {
      const result = await inventoryService.revertPurchase(Number(product_id), quantity);
      return res.status(200).json({
        message: 'Stock revertido exitosamente',
        ...result,
      });
    } catch (error) {
      console.error('Error al revertir compra y actualizar stock:', error);
      return res.status(500).json({ message: 'Error al revertir compra y actualizar stock', error });
    }
  }
}

export default InventoryController;
