import InventoryService from '../services/inventoryService'; // Importa el servicio de inventario
import Stock from '../models/Inventory.model'; // Importa el modelo de inventario
import { cacheService } from '../utils/utils'; // Importa el servicio de caché
import { dbService } from '../config/db'; // Importa el servicio de base de datos
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants'; // Importa mensajes de error y éxito

// Mockea manualmente los módulos para evitar interacciones reales con caché y base de datos
jest.mock('../utils/utils');
jest.mock('../config/db');

describe('InventoryService', () => {
  // Limpia todos los mocks antes de cada prueba para evitar datos residuales
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    // Verifica que los stocks se devuelven desde la caché si están disponibles
    it('should return all stocks from cache', async () => {
      const cachedStocks = [{ product_id: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStocks);

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual({ data: cachedStocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    // Verifica que si los datos no están en la caché, se obtienen de la BD y se almacenan en caché
    it('should return all stocks from database if not in cache and set to cache', async () => {
      const stocks = [{ product_id: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findAll').mockResolvedValue(stocks as any);

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(Stock.findAll).toHaveBeenCalled();
      expect(cacheService.setToCache).toHaveBeenCalledWith('allStocks', stocks);
      expect(result).toEqual({ data: stocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    // Verifica que el servicio maneja los errores correctamente
    it('should handle errors gracefully', async () => {
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.getAllStocks();

      expect(result).toEqual({ error: ERROR_MESSAGES.GET_ALL_STOCKS, statusCode: 500 });
    });
  });

  describe('getStockByProductId', () => {
    // Verifica que se obtiene el stock desde la caché si está disponible
    it('should return stock from cache', async () => {
      const cachedStock = { product_id: 1, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStock);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(result).toEqual({ data: cachedStock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    // Verifica que si el stock no está en caché, se obtiene de la BD y se almacena en caché
    it('should return stock from database if not in cache and set to cache', async () => {
      const stock = { product_id: 1, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 } });
      expect(cacheService.setToCache).toHaveBeenCalledWith('stock:1', stock);
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    // Verifica que si el stock no existe, devuelve un error 404
    it('should return 404 if stock is not found', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: 404 });
    });

    // Verifica que se manejan errores correctamente
    it('should handle errors properly', async () => {
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, statusCode: 500 });
    });
  });

  describe('updateStock', () => {
    // Verifica que se actualiza el stock correctamente y se limpia la caché
    it('should update stock and clear cache', async () => {
      const stock = { product_id: 1, quantity: 10, save: jest.fn().mockResolvedValue({ product_id: 1, quantity: 20 }) };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, 1);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 }, transaction });
      expect(stock.save).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ data: { product_id: 1, quantity: 20 }, message: SUCCESS_MESSAGES.STOCK_UPDATED });
    });

    // Verifica que si el stock no existe, devuelve un error 404
    it('should return 404 if stock does not exist', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);

      const result = await InventoryService.updateStock(1, 10, 1);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: 404 });
    });

    // Verifica que si el stock es insuficiente para la salida, devuelve un error 400
    it('should return 400 if stock is insufficient for output', async () => {
      const stock = { product_id: 1, quantity: 5, save: jest.fn() };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, 2);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.INSUFFICIENT_STOCK, statusCode: 400 });
    });

    // Verifica que si el `input_output` es inválido, devuelve un error 400
    it('should return 400 if input_output is invalid', async () => {
      const stock = { product_id: 1, quantity: 10, save: jest.fn() };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, 3);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.INVALID_DATA, statusCode: 400 });
    });

    // Verifica que los errores se manejan correctamente y se revierte la transacción
    it('should handle errors and rollback transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.updateStock(1, 10, 1);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.UPDATE_STOCK, statusCode: 500 });
    });
  });
});
