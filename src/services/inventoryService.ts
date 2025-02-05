import { StockResponse } from '../types/types';
import Stock from '../models/Inventory.model';
import { dbService } from '../config/db';
import { cacheService } from '../utils/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

class InventoryService {
  async getAllStocks(): Promise<StockResponse> {
    const cacheKey = 'allStocks';
    try {
      // Intentar obtener los datos desde la caché
      const cachedStocks = await cacheService.getFromCache(cacheKey);
      if (cachedStocks) {
        return { data: cachedStocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED };
      }

      // Obtener los datos desde la base de datos
      const stocks = await Stock.findAll();
      // Almacenar los datos en la caché
      await cacheService.setToCache(cacheKey, stocks);
      return { data: stocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED };
    } catch (error) {
      console.error(ERROR_MESSAGES.GET_ALL_STOCKS, error);
      return { error: ERROR_MESSAGES.GET_ALL_STOCKS, statusCode: 500 };
    }
  }

  async getStockByProductId(product_id: number): Promise<StockResponse> {
    const cacheKey = `stock:${product_id}`;
    try {
      // Intentar obtener los datos desde la caché
      const cachedStock = await cacheService.getFromCache(cacheKey);
      if (cachedStock) {
        return { data: cachedStock, message: SUCCESS_MESSAGES.STOCK_FETCHED };
      }

      // Obtener los datos desde la base de datos
      const stock = await Stock.findOne({ where: { product_id } });
      if (stock) {
        // Almacenar los datos en la caché
        await cacheService.setToCache(cacheKey, stock);
        return { data: stock, message: SUCCESS_MESSAGES.STOCK_FETCHED };
      }
      return { error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: 404 };
    } catch (error) {
      console.error(ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, error);
      return { error: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, statusCode: 500 };
    }
  }

  async addStock(product_id: number, quantity: number, input_output: number): Promise<StockResponse> {
    const transaction = await dbService.transaction();
    try {
      const existingStock = await Stock.findOne({
        where: { product_id, input_output: 1 },
        transaction,
      });

      let updatedStock;
      if (existingStock) {
        existingStock.quantity += quantity;
        updatedStock = await existingStock.save({ transaction });
      } else {
        updatedStock = await Stock.create(
          { product_id, quantity, input_output },
          { transaction }
        );
      }

      await transaction.commit();
      await cacheService.clearCache([`stock:${product_id}`, 'allStocks']);
      return { data: updatedStock, message: SUCCESS_MESSAGES.STOCK_ADDED };
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.ADD_STOCK, error);
      return { error: ERROR_MESSAGES.ADD_STOCK, statusCode: 500 };
    }
  }

  async updateStock(product_id: number, quantity: number, input_output: number): Promise<StockResponse> {
    const transaction = await dbService.transaction();
    try {
      const stock = await Stock.findOne({ where: { product_id }, transaction });
      if (!stock) {
        await transaction.rollback();
        return { error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: 404 };
      }

      if (input_output === 1) {
        stock.quantity += quantity;
      } else if (input_output === 2) {
        if (stock.quantity < quantity) {
          await transaction.rollback();
          return { error: ERROR_MESSAGES.INSUFFICIENT_STOCK, statusCode: 400 };
        }
        stock.quantity -= quantity;
      } else {
        await transaction.rollback();
        return { error: ERROR_MESSAGES.INVALID_DATA, statusCode: 400 };
      }

      const updatedStock = await stock.save({ transaction });
      await transaction.commit();
      await cacheService.clearCache([`stock:${product_id}`, 'allStocks']);
      return { data: updatedStock, message: SUCCESS_MESSAGES.STOCK_UPDATED };
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.UPDATE_STOCK, error);
      return { error: ERROR_MESSAGES.UPDATE_STOCK, statusCode: 500 };
    }
  }
}

export default new InventoryService();