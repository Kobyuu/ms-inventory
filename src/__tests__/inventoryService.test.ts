import InventoryService from '../services/inventoryService';
import Stock from '../models/Inventory.model';
import { cacheService } from '../services/redisCacheService';
import { dbService } from '../config/db';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP, INPUT_OUTPUT } from '../config/constants';
import breaker from '../middleware/circuitBreaker';
import productService from '../services/productService';

// Crear mocks manualmente
jest.mock('../services/redisCacheService');
jest.mock('../config/db');
jest.mock('../middleware/circuitBreaker');
jest.mock('../services/productService');

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return all stocks from cache', async () => {
      const cachedStocks = [{ productId: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStocks);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual({ data: cachedStocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    it('should return all stocks from database if not in cache and set to cache', async () => {
      const stocks = [{ productId: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findAll').mockResolvedValue(stocks as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(Stock.findAll).toHaveBeenCalled();
      expect(cacheService.setToCache).toHaveBeenCalledWith('allStocks', stocks);
      expect(result).toEqual({ data: stocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    it('should handle errors gracefully', async () => {
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(new Error('Test error'));
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getAllStocks();

      expect(result).toEqual({ error: ERROR_MESSAGES.FETCH_ALL_STOCKS, statusCode: HTTP.INTERNAL_SERVER_ERROR });
    });
  });

  describe('getStockByProductId', () => {
    it('should return stock from cache', async () => {
      const cachedStock = { productId: 1, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStock);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(result).toEqual({ data: cachedStock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    it('should return stock from database if not in cache and set to cache', async () => {
      const stock = { productId: 1, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(Stock.findOne).toHaveBeenCalledWith({ where: { productId: 1 } });
      expect(cacheService.setToCache).toHaveBeenCalledWith('stock:1', stock);
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    it('should return 404 if stock is not found', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND });
    });

    it('should handle errors properly', async () => {
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(new Error('Test error'));
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, statusCode: HTTP.INTERNAL_SERVER_ERROR });
    });
  });

  describe('updateStock', () => {
    it('should update stock and clear cache', async () => {
      const stock = { productId: 1, quantity: 10, save: jest.fn().mockResolvedValue({ productId: 1, quantity: 20 }) };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(Stock.findOne).toHaveBeenCalledWith({ 
        where: { productId: 1, input_output: INPUT_OUTPUT.INPUT }, 
        transaction 
      });
      expect(stock.save).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ data: { productId: 1, quantity: 20 }, message: SUCCESS_MESSAGES.STOCK_UPDATED });
    });

    it('should return 404 if product does not exist', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.NOT_FOUND, 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
      });
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
        statusCode: HTTP.NOT_FOUND 
      });
    });

    it('should return 404 if stock does not exist', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND });
    });

    it('should return 400 if stock is insufficient for output', async () => {
      const stock = { productId: 1, quantity: 5, save: jest.fn() };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.OUTPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.INSUFFICIENT_STOCK, statusCode: HTTP.BAD_REQUEST });
    });

    it('should return 400 if input_output is invalid', async () => {
      const stock = { productId: 1, quantity: 10, save: jest.fn() };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.updateStock(1, 10, 3);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.INVALID_DATA, statusCode: HTTP.BAD_REQUEST });
    });

    it('should handle errors and rollback transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Test error'));
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.UPDATE_STOCK, statusCode: HTTP.INTERNAL_SERVER_ERROR });
    });
  });

  describe('addStock', () => {
    it('should add stock when product exists', async () => {
      const stock = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);
      jest.spyOn(Stock, 'create').mockResolvedValue(stock as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.addStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(Stock.findOne).toHaveBeenCalledWith({
        where: { productId: 1, input_output: INPUT_OUTPUT.INPUT },
        transaction
      });
      expect(Stock.create).toHaveBeenCalledWith(
        { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT },
        { transaction }
      );
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_ADDED });
    });

    it('should return 404 when product does not exist', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.NOT_FOUND, 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
      });
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.addStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
        statusCode: HTTP.NOT_FOUND 
      });
    });

    it('should update existing stock quantity', async () => {
      const existingStock = { 
        productId: 1, 
        quantity: 10, 
        input_output: INPUT_OUTPUT.INPUT,
        save: jest.fn().mockResolvedValue({ productId: 1, quantity: 20, input_output: INPUT_OUTPUT.INPUT })
      };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(existingStock as any);
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.addStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(existingStock.save).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ 
        data: { productId: 1, quantity: 20, input_output: INPUT_OUTPUT.INPUT }, 
        message: SUCCESS_MESSAGES.STOCK_ADDED 
      });
    });

    it('should handle errors and rollback transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Test error'));
      (breaker.fire as jest.Mock).mockImplementation((fn) => fn());

      const result = await InventoryService.addStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ 
        error: ERROR_MESSAGES.ADD_STOCK, 
        statusCode: HTTP.INTERNAL_SERVER_ERROR 
      });
    });
  });
});
