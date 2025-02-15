import inventoryService from '../services/inventoryService';
import { cacheService } from '../services/redisCacheService';
import { dbService } from '../config/db';
import Stock from '../models/Inventory.model';
import productService from '../services/productService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, HTTP, INPUT_OUTPUT } from '../config/constants';

// Mock Sequelize and dbService
jest.mock('../config/db', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
  };
  
  return {
    __esModule: true,
    dbService: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    },
    default: {
      transaction: jest.fn().mockResolvedValue(mockTransaction),
      addHook: jest.fn(),
      authenticate: jest.fn(),
    },
  };
});

// Mock dependencies
jest.mock('../services/redisCacheService');
jest.mock('../models/Inventory.model');
jest.mock('../services/productService');

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return cached stocks if available', async () => {
      const cachedStocks = [{ id: 1, productId: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStocks);

      const result = await inventoryService.getAllStocks();

      expect(result).toEqual({
        data: cachedStocks,
        message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED
      });
      expect(cacheService.getFromCache).toHaveBeenCalledWith('allStocks');
      expect(Stock.findAll).not.toHaveBeenCalled();
    });

    it('should fetch and cache stocks if not in cache', async () => {
      const stocks = [{ id: 1, productId: 1, quantity: 10 }];
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      (Stock.findAll as jest.Mock).mockResolvedValue(stocks);

      const result = await inventoryService.getAllStocks();

      expect(result).toEqual({
        data: stocks,
        message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED
      });
      expect(cacheService.setToCache).toHaveBeenCalledWith('allStocks', stocks);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Stock.findAll as jest.Mock).mockRejectedValue(error);
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);

      const result = await inventoryService.getAllStocks();

      expect(result).toEqual({
        error: ERROR_MESSAGES.FETCH_ALL_STOCKS,
        statusCode: HTTP.INTERNAL_SERVER_ERROR
      });
    });
  });

  describe('getStockByProductId', () => {
    const productId = 1;

    it('should return cached stock if available', async () => {
      const cachedStock = { id: 1, productId, quantity: 10 };
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedStock);

      const result = await inventoryService.getStockByProductId(productId);

      expect(result).toEqual({
        data: cachedStock,
        message: SUCCESS_MESSAGES.STOCK_FETCHED
      });
      expect(cacheService.getFromCache).toHaveBeenCalledWith(`stock:${productId}`);
      expect(Stock.findOne).not.toHaveBeenCalled();
    });

    it('should return not found if stock does not exist', async () => {
      (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
      (Stock.findOne as jest.Mock).mockResolvedValue(null);

      const result = await inventoryService.getStockByProductId(productId);

      expect(result).toEqual({
        error: ERROR_MESSAGES.STOCK_NOT_FOUND,
        statusCode: HTTP.NOT_FOUND
      });
    });
  });

  describe('addStock', () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
    const productId = 1;
    const quantity = 10;

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
      // Set up dbService transaction mock
      (dbService.transaction as jest.Mock).mockResolvedValue(mockTransaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({
        data: { id: productId },
        statusCode: HTTP.OK
      });
    });

    it('should add new stock if none exists', async () => {
      const newStock = { productId, quantity, save: jest.fn() };
      (Stock.findOne as jest.Mock).mockResolvedValue(null);
      (Stock.create as jest.Mock).mockResolvedValue(newStock);
      newStock.save.mockResolvedValue(newStock);

      const result = await inventoryService.addStock(productId, quantity);

      expect(result).toEqual({
        data: newStock,
        message: SUCCESS_MESSAGES.STOCK_ADDED
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should update existing stock', async () => {
      const mockSave = jest.fn().mockResolvedValue({ productId, quantity: 15 });
      const existingStock = { 
        productId, 
        quantity: 5,
        save: mockSave
      } as unknown as Stock;

      (Stock.findOne as jest.Mock).mockResolvedValue(existingStock);

      const result = await inventoryService.addStock(productId, quantity);

      expect(mockSave).toHaveBeenCalled();
      if (result.data && !Array.isArray(result.data)) {
        expect(result.data.quantity).toBe(15);
      } else {
        fail('Expected result.data to be a single stock object');
      }
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
    const productId = 1;
    const quantity = 5;

    beforeEach(() => {
      (dbService.transaction as jest.Mock).mockResolvedValue(mockTransaction);
      (productService.getProductById as jest.Mock).mockResolvedValue({
        data: { id: productId },
        statusCode: HTTP.OK
      });
    });

    it('should handle output when sufficient stock exists', async () => {
      const mockSave = jest.fn().mockResolvedValue({ productId, quantity: 5 });
      const existingStock = {
        productId,
        quantity: 10,
        save: mockSave
      } as unknown as Stock;

      (Stock.findOne as jest.Mock).mockResolvedValue(existingStock);

      const result = await inventoryService.updateStock(productId, quantity, INPUT_OUTPUT.OUTPUT);

      expect(mockSave).toHaveBeenCalled();
      if (result.data && !Array.isArray(result.data)) {
        expect(result.data.quantity).toBe(5);
      } else {
        fail('Expected result.data to be a single stock object');
      }
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should reject output when insufficient stock exists', async () => {
      const existingStock = {
        productId,
        quantity: 3,
        save: jest.fn()
      };
      (Stock.findOne as jest.Mock).mockResolvedValue(existingStock);

      const result = await inventoryService.updateStock(productId, quantity, INPUT_OUTPUT.OUTPUT);

      expect(result).toEqual({
        error: ERROR_MESSAGES.INSUFFICIENT_STOCK,
        statusCode: HTTP.BAD_REQUEST
      });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should handle invalid input_output value', async () => {
      const existingStock = {
        productId,
        quantity: 10,
        save: jest.fn()
      };
      (Stock.findOne as jest.Mock).mockResolvedValue(existingStock);

      const result = await inventoryService.updateStock(productId, quantity, 3);

      expect(result).toEqual({
        error: ERROR_MESSAGES.INVALID_DATA,
        statusCode: HTTP.BAD_REQUEST
      });
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});