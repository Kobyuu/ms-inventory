import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import { productService } from '../services/productService';
import InventoryController from '../controllers/inventoryController';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT, HTTP } from '../config/constants';

jest.mock('../services/inventoryService');
jest.mock('../services/productService');

describe('InventoryController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllStocks', () => {
    it('should return all stocks', async () => {
      const mockResponse = { 
        data: [{ productId: 1, quantity: 10 }],
        message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED,
        statusCode: HTTP.OK
      };
      (inventoryService.getAllStocks as jest.Mock).mockResolvedValue(mockResponse);

      await InventoryController.getAllStocks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle errors', async () => {
      const mockResponse = {
        error: ERROR_MESSAGES.GET_ALL_STOCKS,
        statusCode: HTTP.INTERNAL_SERVER_ERROR
      };
      (inventoryService.getAllStocks as jest.Mock).mockResolvedValue(mockResponse);

      await InventoryController.getAllStocks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: mockResponse.error });
    });
  });

  describe('getStockByProductId', () => {
    it('should return stock by product id', async () => {
      const mockResponse = {
        data: { productId: 1, quantity: 10 },
        message: SUCCESS_MESSAGES.STOCK_FETCHED,
        statusCode: HTTP.OK
      };
      req.params = { productId: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(mockResponse);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should return 404 if stock not found', async () => {
      const mockResponse = {
        error: ERROR_MESSAGES.STOCK_NOT_FOUND,
        statusCode: HTTP.NOT_FOUND
      };
      req.params = { productId: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(mockResponse);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: mockResponse.error });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.params = { productId: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockRejectedValue(error);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID,
        error: error.message
      });
    });
  });

  describe('addStock', () => {
    it('should add stock successfully', async () => {
      const mockStock = { productId: 1, quantity: 10 };
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        data: { id: 1 }, 
        statusCode: HTTP.OK 
      });
      
      (inventoryService.addStock as jest.Mock).mockResolvedValue({
        data: mockStock,
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        statusCode: HTTP.CREATED
      });

      await InventoryController.addStock(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        data: mockStock
      });
    });

    it('should return 404 if product not found', async () => {
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
        statusCode: HTTP.NOT_FOUND 
      });

      await InventoryController.addStock(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ 
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND 
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      (productService.getProductById as jest.Mock).mockRejectedValue(error);

      await InventoryController.addStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.ADD_STOCK,
        error: error.message
      });
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      const mockStock = { productId: 1, quantity: 10 };
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.OK });
      (inventoryService.updateStock as jest.Mock).mockResolvedValue({
        data: mockStock,
        message: SUCCESS_MESSAGES.STOCK_UPDATED
      });

      await InventoryController.updateStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(inventoryService.updateStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.OUTPUT);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        data: mockStock
      });
    });

    it('should return 404 if product not found', async () => {
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.NOT_FOUND });

      await InventoryController.updateStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (productService.getProductById as jest.Mock).mockRejectedValue(error);

      await InventoryController.updateStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.UPDATE_STOCK,
        error: error.message
      });
    });
  });
});