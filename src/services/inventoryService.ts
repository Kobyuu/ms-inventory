import Stock from '../models/Inventory.model';
import db from '../config/db';
import redisClient from '../config/redis';
import { config } from '../config/env';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';

class InventoryService {
  async getAllStocks() {
    const cacheKey = 'allStocks';
    const cachedStocks = await redisClient.get(cacheKey);
    if (cachedStocks) {
      console.log(SUCCESS_MESSAGES.ALL_STOCKS_FETCHED);
      return JSON.parse(cachedStocks);
    }

    const stocks = await Stock.findAll();
    await redisClient.set(cacheKey, JSON.stringify(stocks), 'EX', config.cacheExpiry);
    console.log(SUCCESS_MESSAGES.ALL_STOCKS_FETCHED);
    return stocks;
  }

  async getStockByProductId(product_id: number) {
    const cacheKey = `stock:${product_id}`;
    const cachedStock = await redisClient.get(cacheKey);
    if (cachedStock) {
      console.log(SUCCESS_MESSAGES.STOCK_FETCHED);
      return JSON.parse(cachedStock);
    }

    const stock = await Stock.findOne({ where: { product_id } });
    if (stock) {
      await redisClient.set(cacheKey, JSON.stringify(stock), 'EX', config.cacheExpiry);
      console.log(SUCCESS_MESSAGES.STOCK_FETCHED);
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
      await redisClient.del(`stock:${product_id}`);
      await redisClient.del('allStocks');
      console.log(SUCCESS_MESSAGES.STOCK_ADDED);
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
      }

      const updatedStock = await stock.save({ transaction });
      await transaction.commit();
      await redisClient.del(`stock:${product_id}`);
      await redisClient.del('allStocks');
      console.log(SUCCESS_MESSAGES.STOCK_UPDATED);
      return updatedStock;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new InventoryService();