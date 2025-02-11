import { breakers } from '../middleware/circuitBreaker';
import { StockResponse } from '../types/types';
import Stock from '../models/Inventory.model';
import { dbService } from '../config/db';
import { cacheService } from './redisCacheService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP, INPUT_OUTPUT } from '../config/constants';
import productService from './productService';

class InventoryService {
  async getAllStocks(): Promise<StockResponse> {
    return breakers.getAllStocks.fire(async () => {
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
    });
  }

  async getStockByProductId(productId: number): Promise<StockResponse> {
    return breakers.getStockByProductId.fire(async () => {
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
    });
  }

  async addStock(productId: number, quantity: number, input_output: number): Promise<StockResponse> {
    return breakers.addStock.fire(async () => {
      // Iniciamos la transacción
      const transaction = await dbService.transaction();
      try {
        // NOTA: Se eliminó la verificación del producto porque ya se hizo en el controlador.
        // Si deseas mantenerla, asegúrate de que no duplique la llamada al servicio de productos.

        // Buscar stock existente para ese producto y que sea de entrada
        const existingStock = await Stock.findOne({
          where: { productId, input_output: INPUT_OUTPUT.INPUT },
          transaction,
        });

        let updatedStock;
        if (existingStock) {
          // Actualizamos la cantidad
          existingStock.quantity += quantity;
          updatedStock = await existingStock.save({ transaction });
        } else {
          // Creamos un nuevo registro de stock
          updatedStock = await Stock.create(
            { productId, quantity, input_output },
            { transaction }
          );
        }

        // Confirmamos la transacción
        await transaction.commit();
        // Limpiamos las cachés correspondientes
        await cacheService.clearCache([`stock:${productId}`, 'allStocks']);

        return { data: updatedStock, message: SUCCESS_MESSAGES.STOCK_ADDED };
      } catch (error) {
        // Si ocurre cualquier error, revertimos la transacción
        await transaction.rollback();
        console.error(ERROR_MESSAGES.ADD_STOCK, error);
        // Lanza el error para que el breaker lo capture y active el fallback (o bien propágalo al controlador)
        throw error;
      }
    });
  }

  async updateStock(productId: number, quantity: number, input_output: number): Promise<StockResponse> {
    return breakers.updateStock.fire(async () => {
      // Iniciamos la transacción
      const transaction = await dbService.transaction();
      try {
        // NOTA: Se omite la verificación del producto, ya que el controlador se encargó de ello.
        // Buscamos el registro de stock para el producto (asumiendo que el stock a modificar es el de entrada).
        const stock = await Stock.findOne({
          where: { productId, input_output: INPUT_OUTPUT.INPUT },
          transaction,
        });
        
        if (!stock) {
          await transaction.rollback();
          return { error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
        }

        // Actualizamos la cantidad según el tipo de operación
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

        // Guardamos la actualización y confirmamos la transacción
        const updatedStock = await stock.save({ transaction });
        await transaction.commit();
        // Limpiamos las cachés afectadas
        await cacheService.clearCache([`stock:${productId}`, 'allStocks']);

        return { data: updatedStock, message: SUCCESS_MESSAGES.STOCK_UPDATED };
      } catch (error) {
        await transaction.rollback();
        console.error(ERROR_MESSAGES.UPDATE_STOCK, error);
        throw error; // Lanza el error para que el circuit breaker active el fallback o se propague al controlador
      }
    });
  }
}

export default new InventoryService();
