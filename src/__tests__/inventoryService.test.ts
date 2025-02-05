import InventoryService from '../services/inventoryService';
import Stock from '../models/Inventory.model';
import { cacheService } from '../utils/utils';
import { dbService } from '../config/db';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

// Crear mocks manualmente
jest.mock('../utils/utils');
jest.mock('../config/db');

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return all stocks from cache', async () => {
      const cachedStocks = [{ product_id: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStocks);

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual({ data: cachedStocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    it('should return all stocks from database if not in cache', async () => {
      const stocks = [{ product_id: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findAll').mockResolvedValue(stocks as any);

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(Stock.findAll).toHaveBeenCalled();
      expect(cacheService.setToCache).toHaveBeenCalledWith('allStocks', stocks);
      expect(result).toEqual({ data: stocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(error);

      const result = await InventoryService.getAllStocks();

      expect(result).toEqual({ error: ERROR_MESSAGES.GET_ALL_STOCKS, statusCode: 500 });
    });
  });

  describe('getStockByProductId', () => {
    it('should return stock from cache', async () => {
      const cachedStock = { product_id: 1, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStock);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(result).toEqual({ data: cachedStock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    it('should return stock from database if not in cache', async () => {
      const stock = { product_id: 1, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 } });
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    it('should return 404 if stock not found', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 } });
      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: 404 });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(error);

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, statusCode: 500 });
    });
  });

  describe('addStock', () => {
    it('should add stock and clear cache', async () => {
      const stock = { product_id: 1, quantity: 10 };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);
      jest.spyOn(Stock, 'create').mockResolvedValue(stock as any);

      const result = await InventoryService.addStock(1, 10, 1);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 } });
      expect(Stock.create).toHaveBeenCalledWith({ product_id: 1, quantity: 10, input_output: 1 }, { transaction });
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['allStocks', 'stock:1']);
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_ADDED });
    });

    it('should handle errors and rollback transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.addStock(1, 10, 1);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.ADD_STOCK, statusCode: 500 });
    });
  });

  describe('updateStock', () => {
    it('should update stock and clear cache', async () => {
      const stock = { product_id: 1, quantity: 10, save: jest.fn().mockResolvedValue({ product_id: 1, quantity: 10 }) };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, 1);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 } });
      expect(stock.save).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['allStocks', 'stock:1']);
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_UPDATED });
    });

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