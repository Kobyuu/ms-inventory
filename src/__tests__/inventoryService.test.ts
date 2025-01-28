import inventoryService from '../services/inventoryService';
import Stock from '../models/Inventory.model';
import redisClient from '../config/redis';
import db from '../config/db';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants/messages';

jest.mock('../models/Inventory.model');
jest.mock('../config/redis');
jest.mock('../config/db');

describe('InventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should fetch all stocks from cache if available', async () => {
      const cachedStocks = JSON.stringify([{ product_id: 1, quantity: 10 }]);
      (redisClient.get as jest.Mock).mockResolvedValue(cachedStocks);

      const result = await inventoryService.getAllStocks();

      expect(redisClient.get).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual(JSON.parse(cachedStocks));
    });

    it('should fetch all stocks from database if not in cache', async () => {
      const stocks = [{ product_id: 1, quantity: 10 }];
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (Stock.findAll as jest.Mock).mockResolvedValue(stocks);

      const result = await inventoryService.getAllStocks();

      expect(redisClient.get).toHaveBeenCalledWith('allStocks');
      expect(Stock.findAll).toHaveBeenCalled();
      expect(redisClient.set).toHaveBeenCalledWith('allStocks', JSON.stringify(stocks), 'EX', expect.any(Number));
      expect(result).toEqual(stocks);
    });
  });

  describe('getStockByProductId', () => {
    it('should fetch stock by product ID from cache if available', async () => {
      const cachedStock = JSON.stringify({ product_id: 1, quantity: 10 });
      (redisClient.get as jest.Mock).mockResolvedValue(cachedStock);

      const result = await inventoryService.getStockByProductId(1);

      expect(redisClient.get).toHaveBeenCalledWith('stock:1');
      expect(result).toEqual(JSON.parse(cachedStock));
    });

    it('should fetch stock by product ID from database if not in cache', async () => {
      const stock = { product_id: 1, quantity: 10 };
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      (Stock.findOne as jest.Mock).mockResolvedValue(stock);

      const result = await inventoryService.getStockByProductId(1);

      expect(redisClient.get).toHaveBeenCalledWith('stock:1');
      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 } });
      expect(redisClient.set).toHaveBeenCalledWith('stock:1', JSON.stringify(stock), 'EX', expect.any(Number));
      expect(result).toEqual(stock);
    });
  });

  describe('addStock', () => {
    it('should add stock and update cache', async () => {
      const stock = { product_id: 1, quantity: 10, save: jest.fn().mockResolvedValue({ product_id: 1, quantity: 20 }) };
      (Stock.findOne as jest.Mock).mockResolvedValue(stock);
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(transaction);

      const result = await inventoryService.addStock(1, 10, 1);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1, input_output: 1 }, transaction });
      expect(stock.save).toHaveBeenCalledWith({ transaction });
      expect(transaction.commit).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith('stock:1');
      expect(redisClient.del).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual({ product_id: 1, quantity: 20 });
    });

    it('should create new stock if not existing and update cache', async () => {
      const stock = { product_id: 1, quantity: 10 };
      (Stock.findOne as jest.Mock).mockResolvedValue(null);
      (Stock.create as jest.Mock).mockResolvedValue(stock);
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(transaction);

      const result = await inventoryService.addStock(1, 10, 1);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1, input_output: 1 }, transaction });
      expect(Stock.create).toHaveBeenCalledWith({ product_id: 1, quantity: 10, input_output: 1 }, { transaction });
      expect(transaction.commit).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith('stock:1');
      expect(redisClient.del).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual(stock);
    });
  });

  describe('updateStock', () => {
    it('should update stock and update cache', async () => {
      const stock = { product_id: 1, quantity: 20, save: jest.fn().mockResolvedValue({ product_id: 1, quantity: 10 }) };
      (Stock.findOne as jest.Mock).mockResolvedValue(stock);
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(transaction);

      const result = await inventoryService.updateStock(1, 10, 2);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 }, transaction });
      expect(stock.save).toHaveBeenCalledWith({ transaction });
      expect(transaction.commit).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalledWith('stock:1');
      expect(redisClient.del).toHaveBeenCalledWith('allStocks');
      expect(result).toEqual({ product_id: 1, quantity: 10 });
    });

    it('should throw error if stock not found', async () => {
      (Stock.findOne as jest.Mock).mockResolvedValue(null);
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(transaction);

      await expect(inventoryService.updateStock(1, 10, 2)).rejects.toThrow(ERROR_MESSAGES.STOCK_NOT_FOUND);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 }, transaction });
      expect(transaction.rollback).toHaveBeenCalled();
    });

    it('should throw error if insufficient stock for output', async () => {
      const stock = { product_id: 1, quantity: 5, save: jest.fn() };
      (Stock.findOne as jest.Mock).mockResolvedValue(stock);
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(transaction);

      await expect(inventoryService.updateStock(1, 10, 2)).rejects.toThrow(ERROR_MESSAGES.INSUFFICIENT_STOCK);

      expect(Stock.findOne).toHaveBeenCalledWith({ where: { product_id: 1 }, transaction });
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });
});