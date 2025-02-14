import InventoryService from '../services/inventoryService';
import Stock from '../models/Inventory.model';
import { cacheService } from '../services/redisCacheService';
import { dbService } from '../config/db';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP, INPUT_OUTPUT } from '../config/constants';
import productService from '../services/productService';

// Crear mocks manualmente
jest.mock('../services/redisCacheService');
jest.mock('../config/db');
jest.mock('../services/productService');

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return all stocks from cache', async () => {
      const cachedStocks = [{
        productId: 1,
        quantity: 10,
        input_output: INPUT_OUTPUT.INPUT,
        transaction_date: new Date()
      }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStocks);

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual({ data: cachedStocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    it('should return all stocks from database if not in cache and set to cache', async () => {
      const stocks = [{ productId: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findAll').mockResolvedValue(stocks as any);

      const result = await InventoryService.getAllStocks();

      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(Stock.findAll).toHaveBeenCalled();
      expect(cacheService.setToCache).toHaveBeenCalledWith('allStocks', stocks);
      expect(result).toEqual({ data: stocks, message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED });
    });

    it('should handle errors gracefully', async () => {
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.getAllStocks();

      expect(result).toEqual({ error: ERROR_MESSAGES.FETCH_ALL_STOCKS, statusCode: HTTP.INTERNAL_SERVER_ERROR });
    });
  });

  describe('getStockByProductId', () => {
    it('should return stock from cache', async () => {
      const cachedStock = {
        productId: 1,
        quantity: 10,
        input_output: INPUT_OUTPUT.INPUT,
        transaction_date: new Date()
      };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStock);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(result).toEqual({ data: cachedStock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    it('should return stock from database if not in cache and set to cache', async () => {
      const stock = { 
        productId: 1, 
        quantity: 10,
        input_output: INPUT_OUTPUT.INPUT,
        transaction_date: new Date()
      };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.getStockByProductId(1);

      expect(cacheService.getFromCache).toHaveBeenCalledWith('stock:1');
      expect(Stock.findOne).toHaveBeenCalledWith({ where: { productId: 1 } });
      expect(cacheService.setToCache).toHaveBeenCalledWith('stock:1', stock);
      expect(result).toEqual({ data: stock, message: SUCCESS_MESSAGES.STOCK_FETCHED });
    });

    it('should return 404 if stock is not found', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND });
    });

    it('should handle errors properly', async () => {
      (cacheService.getFromCache as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.getStockByProductId(1);

      expect(result).toEqual({ error: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, statusCode: HTTP.INTERNAL_SERVER_ERROR });
    });
  });

  describe('updateStock', () => {
    it('should update stock and clear cache', async () => {
      const mockDate = new Date('2025-02-12T04:34:43.669Z'); // Use fixed date
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const stock = { 
        productId: 1, 
        quantity: 10,
        input_output: INPUT_OUTPUT.INPUT,
        transaction_date: mockDate,
        save: jest.fn().mockResolvedValue({ 
          productId: 1, 
          quantity: 20,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate
        }) 
      };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(Stock.findOne).toHaveBeenCalledWith({ 
        where: { productId: 1, input_output: INPUT_OUTPUT.INPUT }, 
        transaction,
        lock: true
      });
      expect(stock.save).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ 
        data: { 
          productId: 1, 
          quantity: 20, 
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate 
        }, 
        message: SUCCESS_MESSAGES.STOCK_UPDATED 
      });

      // Restore Date mock
      jest.spyOn(global, 'Date').mockRestore();
    });

    it('should return 404 if product does not exist', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.NOT_FOUND, 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
      });

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
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.STOCK_NOT_FOUND, statusCode: HTTP.NOT_FOUND });
    });

    it('should return 400 if stock is insufficient for output', async () => {
      const stock = { productId: 1, quantity: 5, save: jest.fn() };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.OUTPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.INSUFFICIENT_STOCK, statusCode: HTTP.BAD_REQUEST });
    });

    it('should return 400 if input_output is invalid', async () => {
      const stock = { productId: 1, quantity: 10, save: jest.fn() };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(stock as any);

      const result = await InventoryService.updateStock(1, 10, 3);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.INVALID_DATA, statusCode: HTTP.BAD_REQUEST });
    });

    it('should handle errors and rollback transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.updateStock(1, 10, INPUT_OUTPUT.INPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ error: ERROR_MESSAGES.UPDATE_STOCK, statusCode: HTTP.INTERNAL_SERVER_ERROR });
    });
  });

  describe('addStock', () => {
    it('should add stock when product exists', async () => {
      const mockDate = new Date('2025-02-12T04:34:43.669Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const stock = {
        productId: 1,
        quantity: 10,
        input_output: INPUT_OUTPUT.INPUT,
        transaction_date: mockDate,
        save: jest.fn().mockResolvedValue({
          productId: 1,
          quantity: 10,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate
        })
      };

      const transaction = { 
        commit: jest.fn().mockResolvedValue(undefined), 
        rollback: jest.fn() 
      };

      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(null);
      jest.spyOn(Stock, 'create').mockResolvedValue({
        ...stock,
        save: jest.fn().mockResolvedValue(stock)
      } as any);

      const result = await InventoryService.addStock(1, 10);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(Stock.findOne).toHaveBeenCalledWith({
        where: { productId: 1 },
        transaction
      });
      expect(Stock.create).toHaveBeenCalledWith(
        {
          productId: 1,
          quantity: 10,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate
        },
        { transaction }
      );
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ 
        data: expect.objectContaining({
          productId: 1,
          quantity: 10,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate
        }), 
        message: SUCCESS_MESSAGES.STOCK_ADDED 
      });

      jest.spyOn(global, 'Date').mockRestore();
    });

    it('should reject invalid input_output value', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });

      // Explicitly test with OUTPUT value
      const result = await InventoryService.addStock(1, 10, INPUT_OUTPUT.OUTPUT);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ 
        error: ERROR_MESSAGES.INVALID_DATA, 
        statusCode: HTTP.BAD_REQUEST 
      });
    });

    it('should update existing stock quantity', async () => {
      const mockDate = new Date('2025-02-12T04:32:51.157Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const existingStock = { 
        productId: 1, 
        quantity: 10, 
        input_output: INPUT_OUTPUT.INPUT,
        transaction_date: mockDate,
        save: jest.fn().mockResolvedValue({ 
          productId: 1, 
          quantity: 20, 
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate
        })
      };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });
      jest.spyOn(Stock, 'findOne').mockResolvedValue(existingStock as any);

      const result = await InventoryService.addStock(1, 10);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(Stock.findOne).toHaveBeenCalledWith({
        where: { productId: 1 }, // Remove input_output from query
        transaction
      });
      expect(existingStock.save).toHaveBeenCalled();
      expect(transaction.commit).toHaveBeenCalled();
      expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
      expect(result).toEqual({ 
        data: { 
          productId: 1, 
          quantity: 20, 
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: mockDate 
        }, 
        message: SUCCESS_MESSAGES.STOCK_ADDED 
      });

      jest.spyOn(global, 'Date').mockRestore();
    });

    it('should return 404 when product does not exist', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.NOT_FOUND, 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
      });

      const result = await InventoryService.addStock(1, 10);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
        statusCode: HTTP.NOT_FOUND 
      });
    });

    it('should handle errors and rollback transaction', async () => {
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (dbService.transaction as jest.Mock).mockResolvedValue(transaction);
      (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Test error'));

      const result = await InventoryService.addStock(1, 10);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(result).toEqual({ 
        error: ERROR_MESSAGES.ADD_STOCK, 
        statusCode: HTTP.INTERNAL_SERVER_ERROR 
      });
    });
  });

  describe('Private Methods', () => {
    describe('validateProduct', () => {
      it('should validate product exists', async () => {
        const transaction = { rollback: jest.fn() };
        (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK, data: { active: true } });

        const result = await (InventoryService as any).validateProduct(1, transaction);

        expect(productService.getProductById).toHaveBeenCalledWith(1);
        expect(result).toEqual({ statusCode: HTTP.OK });
      });

      it('should handle non-existent product', async () => {
        const transaction = { rollback: jest.fn() };
        (productService.getProductById as jest.Mock).mockResolvedValue({ 
          statusCode: HTTP.NOT_FOUND 
        });

        const result = await (InventoryService as any).validateProduct(1, transaction);

        expect(transaction.rollback).toHaveBeenCalled();
        expect(result).toEqual({ 
          error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
          statusCode: HTTP.NOT_FOUND 
        });
      });

      it('should handle inactive product', async () => {
        const transaction = { rollback: jest.fn() };
        (productService.getProductById as jest.Mock).mockResolvedValue({ 
          statusCode: HTTP.OK,
          data: { active: false }
        });

        const result = await (InventoryService as any).validateProduct(1, transaction);

        expect(transaction.rollback).toHaveBeenCalled();
        expect(result).toEqual({ 
          error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, 
          statusCode: HTTP.NOT_FOUND 
        });
      });
    });

    describe('handleStockUpdate', () => {
      it('should handle input stock update', async () => {
        const stock = { quantity: 10 };
        
        const result = await (InventoryService as any).handleStockUpdate(
          stock,
          5,
          INPUT_OUTPUT.INPUT
        );

        expect(stock.quantity).toBe(15);
        expect(result).toEqual({ data: stock });
      });

      it('should handle valid output stock update', async () => {
        const stock = { quantity: 10 };
        
        const result = await (InventoryService as any).handleStockUpdate(
          stock,
          5,
          INPUT_OUTPUT.OUTPUT
        );

        expect(stock.quantity).toBe(5);
        expect(result).toEqual({ data: stock });
      });

      it('should prevent insufficient stock output', async () => {
        const stock = { quantity: 5 };
        
        const result = await (InventoryService as any).handleStockUpdate(
          stock,
          10,
          INPUT_OUTPUT.OUTPUT
        );

        expect(result).toEqual({ 
          error: ERROR_MESSAGES.INSUFFICIENT_STOCK, 
          statusCode: HTTP.BAD_REQUEST 
        });
      });

      it('should handle invalid input_output type', async () => {
        const stock = { quantity: 10 };
        
        const result = await (InventoryService as any).handleStockUpdate(
          stock,
          5,
          3
        );

        expect(result).toEqual({ 
          error: ERROR_MESSAGES.INVALID_DATA, 
          statusCode: HTTP.BAD_REQUEST 
        });
      });
    });

    describe('saveAndCommit', () => {
      it('should save, commit and clear cache', async () => {
        const mockStock = {
          save: jest.fn().mockResolvedValue({ id: 1, quantity: 10 })
        };
        const transaction = { commit: jest.fn() };
        
        const result = await (InventoryService as any).saveAndCommit(
          mockStock,
          transaction,
          1,
          'Success message'
        );

        expect(mockStock.save).toHaveBeenCalledWith({ transaction });
        expect(transaction.commit).toHaveBeenCalled();
        expect(cacheService.clearCache).toHaveBeenCalledWith(['stock:1', 'allStocks']);
        expect(result).toEqual({ 
          data: { id: 1, quantity: 10 }, 
          message: 'Success message' 
        });
      });
    });
  });
});
