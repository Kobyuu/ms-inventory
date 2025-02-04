import Stock from '../models/Inventory.model';
import db from '../config/db';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { getFromCache, setToCache, logSuccessMessage, clearCache } from '../utils/utils';

class InventoryService {
  async getAllStocks() {
    const cacheKey = 'allStocks';
    const cachedStocks = await getFromCache(cacheKey);
    if (cachedStocks) {
      logSuccessMessage(SUCCESS_MESSAGES.ALL_STOCKS_FETCHED);
      return cachedStocks;
    }

    const stocks = await Stock.findAll();
    await setToCache(cacheKey, stocks);
    logSuccessMessage(SUCCESS_MESSAGES.ALL_STOCKS_FETCHED);
    return stocks;
  }

  async getStockByProductId(product_id: number) {
    const cacheKey = `stock:${product_id}`;
    const cachedStock = await getFromCache(cacheKey);
    if (cachedStock) {
      logSuccessMessage(SUCCESS_MESSAGES.STOCK_FETCHED);
      return cachedStock;
    }

    const stock = await Stock.findOne({ where: { product_id } });
    if (stock) {
      await setToCache(cacheKey, stock);
      logSuccessMessage(SUCCESS_MESSAGES.STOCK_FETCHED);
    }
    return stock;
  }

  async addStock(product_id: number, quantity: number, input_output: number) {
    const transaction = await db.transaction();
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
      await clearCache([`stock:${product_id}`, 'allStocks']);
      logSuccessMessage(SUCCESS_MESSAGES.STOCK_ADDED);
      return updatedStock;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateStock(product_id: number, quantity: number, input_output: number) {
    const transaction = await db.transaction();
    try {
      const stock = await Stock.findOne({ where: { product_id }, transaction });
      if (!stock) {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.STOCK_NOT_FOUND);
      }

      if (input_output === 1) {
        stock.quantity += quantity;
      } else if (input_output === 2) {
        if (stock.quantity < quantity) {
          await transaction.rollback();
          throw new Error(ERROR_MESSAGES.INSUFFICIENT_STOCK);
        }
        stock.quantity -= quantity;
      } else {
        await transaction.rollback();
        throw new Error(ERROR_MESSAGES.INVALID_DATA);
      }

      const updatedStock = await stock.save({ transaction });
      await transaction.commit();
      await clearCache([`stock:${product_id}`, 'allStocks']);
      logSuccessMessage(SUCCESS_MESSAGES.STOCK_UPDATED);
      return updatedStock;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new InventoryService();