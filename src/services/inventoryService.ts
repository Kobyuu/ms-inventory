import { StockResponse } from '../types/types';
import Stock from '../models/Inventory.model';
import { dbService } from '../config/db';
import { cacheService } from './redisCacheService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP, INPUT_OUTPUT } from '../config/constants';
import productService from './productService';

class InventoryService {
  // Obtiene todos los registros de stock del inventario
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

  // Obtiene el stock de un producto específico por su ID
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

  // Agrega nueva cantidad al stock de un producto
  async addStock(
    productId: number, 
    quantity: number, 
    input_output: number = INPUT_OUTPUT.INPUT
  ): Promise<StockResponse> {
    const transaction = await dbService.transaction();
    try {
      // Validate input_output type
      if (input_output !== INPUT_OUTPUT.INPUT) {
        await transaction.rollback();
        return { 
          error: ERROR_MESSAGES.INVALID_DATA, 
          statusCode: HTTP.BAD_REQUEST 
        };
      }

      const validationResult = await this.validateProduct(productId, transaction);
      if (validationResult.error) {
        return validationResult;
      }

      const existingStock = await this.findExistingStock(productId, transaction);
      if (existingStock) {
        existingStock.quantity += quantity;
        return await this.saveAndCommit(
          existingStock, 
          transaction, 
          productId, 
          SUCCESS_MESSAGES.STOCK_ADDED
        );
      }

      const newStock = await Stock.create(
        {
          productId,
          quantity,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: new Date()
        },
        { transaction }
      );

      return await this.saveAndCommit(
        newStock, 
        transaction, 
        productId, 
        SUCCESS_MESSAGES.STOCK_ADDED
      );
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.ADD_STOCK, error);
      return { 
        error: ERROR_MESSAGES.ADD_STOCK, 
        statusCode: HTTP.INTERNAL_SERVER_ERROR 
      };
    }
  }

  // Actualiza la cantidad en stock de un producto
  async updateStock(
    productId: number, 
    quantity: number, 
    input_output: number
  ): Promise<StockResponse> {
    const transaction = await dbService.transaction();
    try {
      const validationResult = await this.validateProduct(productId, transaction);
      if (validationResult.error) {
        return validationResult;
      }

      const stock = await this.findExistingStock(productId, transaction, INPUT_OUTPUT.INPUT);
      if (!stock) {
        await transaction.rollback();
        return { 
          error: ERROR_MESSAGES.STOCK_NOT_FOUND, 
          statusCode: HTTP.NOT_FOUND 
        };
      }

      const updateResult = await this.handleStockUpdate(stock, quantity, input_output);
      if (updateResult.error) {
        await transaction.rollback();
        return updateResult;
      }

      return await this.saveAndCommit(stock, transaction, productId, SUCCESS_MESSAGES.STOCK_UPDATED);
    } catch (error) {
      await transaction.rollback();
      console.error(ERROR_MESSAGES.UPDATE_STOCK, error);
      return { 
        error: ERROR_MESSAGES.UPDATE_STOCK, 
        statusCode: HTTP.INTERNAL_SERVER_ERROR 
      };
    }
  }

  // Valida la existencia y estado del producto en el catálogo antes de operar
  private async validateProduct(productId: number, transaction: any): Promise<StockResponse> {
    const productResponse = await productService.getProductById(productId);
    
    if (!productResponse || !productResponse.data) {
        await transaction.rollback();
        return {
            error: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
            statusCode: HTTP.NOT_FOUND
        };
    }

    // Verifica que el producto esté activo y disponible
    if (productResponse.statusCode !== HTTP.OK) {
        await transaction.rollback();
        return {
            error: productResponse.error || ERROR_MESSAGES.PRODUCT_NOT_FOUND,
            statusCode: productResponse.statusCode || HTTP.NOT_FOUND
        };
    }

    return { statusCode: HTTP.OK };
  }

  // Busca stock existente con opción de bloqueo para concurrencia
  private async findExistingStock(productId: number, transaction: any, inputOutputFilter?: number): Promise<Stock | null> {
    const queryOptions = {
      where: { 
        productId,
        ...(inputOutputFilter && { input_output: inputOutputFilter })
      },
      transaction,
      ...(inputOutputFilter && { lock: true }) // Bloqueo para operaciones concurrentes
    };
    return await Stock.findOne(queryOptions);
  }

  // Maneja la lógica de actualización del stock con validaciones de cantidad
  private async handleStockUpdate(stock: any, quantity: number, input_output: number): Promise<StockResponse> {
    // Validación de cantidad positiva
    if (quantity <= 0) {
      return {
        error: ERROR_MESSAGES.QUANTITY,
        statusCode: HTTP.BAD_REQUEST
      };
    }
  
    if (input_output === INPUT_OUTPUT.INPUT) {
      // Previene desbordamiento en entrada de stock
      if (stock.quantity + quantity > Number.MAX_SAFE_INTEGER) {
        return {
          error: ERROR_MESSAGES.INVALID_DATA,
          statusCode: HTTP.BAD_REQUEST
        };
      }
      stock.quantity += quantity;
    } else if (input_output === INPUT_OUTPUT.OUTPUT) {
      // Verifica stock suficiente para salida
      if (stock.quantity < quantity) {
        return {
          error: ERROR_MESSAGES.INSUFFICIENT_STOCK,
          statusCode: HTTP.BAD_REQUEST
        };
      }
      stock.quantity -= quantity;
    } else {
      return {
        error: ERROR_MESSAGES.INVALID_DATA,
        statusCode: HTTP.BAD_REQUEST
      };
    }
  
    return { data: stock };
  }
  
  // Guarda cambios, confirma transacción y actualiza caché
  private async saveAndCommit(stock: any, transaction: any, productId: number, message: string): Promise<StockResponse> {
    const savedStock = await stock.save({ transaction });
    await transaction.commit();
    await this.clearStockCache(productId); // Invalida caché para mantener consistencia
    return { data: savedStock, message };
  }

  // Limpia la caché relacionada con el stock
  private async clearStockCache(productId: number): Promise<void> {
    await cacheService.clearCache([`stock:${productId}`, 'allStocks']);
  }
}

export default new InventoryService();
