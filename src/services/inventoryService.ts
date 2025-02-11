import { StockResponse } from '../types/types';
import Stock from '../models/Inventory.model';
import { dbService } from '../config/db';
import { cacheService } from './redisCacheService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP, INPUT_OUTPUT } from '../config/constants';

class InventoryService {
  /**
   * Obtiene todos los stocks.
   */
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
      console.error(ERROR_MESSAGES.FETCH_ALL_STOCKS, error);
      return { error: ERROR_MESSAGES.FETCH_ALL_STOCKS, statusCode: HTTP.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Obtiene el stock de un producto específico.
   */
  async getStockByProductId(productId: number): Promise<StockResponse> {
    const cacheKey = `stock:${productId}`;
    try {
      // Intentar obtener los datos desde la caché
      const cachedStock = await cacheService.getFromCache(cacheKey);
      if (cachedStock) {
        return { data: cachedStock, message: SUCCESS_MESSAGES.STOCK_FETCHED };
      }
      // Obtener los datos desde la base de datos
      const stock = await Stock.findOne({ where: { productId } });
      if (stock) {
        // Almacenar los datos en la caché
        await cacheService.setToCache(cacheKey, stock);
        return { data: stock, message: SUCCESS_MESSAGES.STOCK_FETCHED };
      }
      return { error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
    } catch (error) {
      console.error(ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, error);
      return { error: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, statusCode: HTTP.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Agrega stock para un producto.
   * Se asume que el controlador ya verificó que el producto existe.
   */
  async addStock(productId: number, quantity: number, input_output: number): Promise<StockResponse> {
    const transaction = await dbService.transaction();
    try {
      // Buscar registro de stock existente para el producto y de tipo INPUT
      const existingStock = await Stock.findOne({
        where: { productId, input_output: INPUT_OUTPUT.INPUT },
        transaction,
      });

      let updatedStock;
      if (existingStock) {
        // Actualiza la cantidad existente
        existingStock.quantity += quantity;
        updatedStock = await existingStock.save({ transaction });
      } else {
        // Crea un nuevo registro de stock
        updatedStock = await Stock.create(
          { productId, quantity, input_output },
          { transaction }
        );
      }

      await transaction.commit();
      // Limpiar caché correspondiente
      await cacheService.clearCache([`stock:${productId}`, 'allStocks']);
      return { data: updatedStock, message: SUCCESS_MESSAGES.STOCK_ADDED };
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.ADD_STOCK, error);
      return { error: ERROR_MESSAGES.ADD_STOCK, statusCode: HTTP.INTERNAL_SERVER_ERROR };
    }
  }

  /**
   * Actualiza el stock para un producto.
   * Se asume que el controlador ya verificó que el producto existe.
   */
  async updateStock(productId: number, quantity: number, input_output: number): Promise<StockResponse> {
    const transaction = await dbService.transaction();
    try {
      // Buscar el registro de stock para el producto y de tipo INPUT
      const stock = await Stock.findOne({
        where: { productId, input_output: INPUT_OUTPUT.INPUT },
        transaction,
      });

      if (!stock) {
        await transaction.rollback();
        return { error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
      }

      // Actualizar la cantidad según el tipo de operación
      if (input_output === INPUT_OUTPUT.INPUT) {
        stock.quantity += quantity;
      } else if (input_output === INPUT_OUTPUT.OUTPUT) {
        if (stock.quantity < quantity) {
          await transaction.rollback();
          return { error: ERROR_MESSAGES.INSUFFICIENT_STOCK, statusCode: HTTP.BAD_REQUEST };
        }
        stock.quantity -= quantity;
      } else {
        await transaction.rollback();
        return { error: ERROR_MESSAGES.INVALID_DATA, statusCode: HTTP.BAD_REQUEST };
      }

      const updatedStock = await stock.save({ transaction });
      await transaction.commit();
      // Limpiar caché correspondiente
      await cacheService.clearCache([`stock:${productId}`, 'allStocks']);
      return { data: updatedStock, message: SUCCESS_MESSAGES.STOCK_UPDATED };
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.UPDATE_STOCK, error);
      return { error: ERROR_MESSAGES.UPDATE_STOCK, statusCode: HTTP.INTERNAL_SERVER_ERROR };
    }
  }
}

export default new InventoryService();
