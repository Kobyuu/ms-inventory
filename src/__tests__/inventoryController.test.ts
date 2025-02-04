import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import InventoryController from '../controllers/inventoryController';
import axiosClient from '../config/axiosClient';
import { config } from '../config/constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT, HTTP } from '../config/constants';

jest.mock('../services/inventoryService');
jest.mock('../config/axiosClient');

describe('InventoryController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return all stocks', async () => {
      const stocks = [{ product_id: 1, quantity: 10 }];
      (inventoryService.getAllStocks as jest.Mock).mockResolvedValue(stocks);

      await InventoryController.getAllStocks(req as Request, res as Response);

      expect(inventoryService.getAllStocks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(stocks);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      (inventoryService.getAllStocks as jest.Mock).mockRejectedValue(error);

      await InventoryController.getAllStocks(req as Request, res as Response);

      expect(inventoryService.getAllStocks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.GET_ALL_STOCKS, error });
    });
  });

  describe('getStockByProductId', () => {
    it('should return stock by product ID', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.params = { product_id: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(stock);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(stock);
    });

    it('should return 404 if stock not found', async () => {
      req.params = { product_id: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(null);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.STOCK_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.params = { product_id: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockRejectedValue(error);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, error });
    });
  });

  describe('addStock', () => {
    it('should add stock', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.OK });
      (inventoryService.addStock as jest.Mock).mockResolvedValue(stock);

      await InventoryController.addStock(req as Request, res as Response);

      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(inventoryService.addStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.INPUT);
      expect(res.status).toHaveBeenCalledWith(HTTP.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: SUCCESS_MESSAGES.STOCK_ADDED, updatedStock: stock });
    });

    it('should return 400 for invalid input', async () => {
      req.body = { product_id: 1, quantity: 0, input_output: INPUT_OUTPUT.INPUT };

      await InventoryController.addStock(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.INPUT_OUTPUT });
    });

    it('should return 404 if product not found', async () => {
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.NOT_FOUND });

      await InventoryController.addStock(req as Request, res as Response);

      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      (axiosClient.get as jest.Mock).mockRejectedValue(error);

      await InventoryController.addStock(req as Request, res as Response);

      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.ADD_STOCK, error });
    });
  });

  describe('updateStock', () => {
    it('should update stock', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.OK });
      (inventoryService.updateStock as jest.Mock).mockResolvedValue(stock);

      await InventoryController.updateStock(req as Request, res as Response);

      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(inventoryService.updateStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.OUTPUT);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({ message: SUCCESS_MESSAGES.STOCK_UPDATED, updatedStock: stock });
    });

    it('should return 400 for invalid input', async () => {
      req.body = { product_id: 1, quantity: 0, input_output: INPUT_OUTPUT.OUTPUT };

      await InventoryController.updateStock(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.INVALID_DATA });
    });

    it('should return 404 if product not found', async () => {
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.NOT_FOUND });

      await InventoryController.updateStock(req as Request, res as Response);

      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (axiosClient.get as jest.Mock).mockRejectedValue(error);

      await InventoryController.updateStock(req as Request, res as Response);

      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.UPDATE_STOCK, error });
    });
  });
});