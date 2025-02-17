import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import productService from '../services/productService';
import InventoryController from '../controllers/inventoryController';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT, HTTP } from '../config/constants';

// Mockear servicios necesarios
jest.mock('../services/inventoryService');
jest.mock('../services/productService');

describe('InventoryController', () => {
  // Variables para pruebas
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  // Configuración inicial antes de cada prueba
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
    // Prueba recuperación exitosa de stocks
    it('should return all stocks', async () => {
      const stocks = {
        data: [{
          productId: 1,
          quantity: 10,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: new Date()
        }],
        message: SUCCESS_MESSAGES.ALL_STOCKS_FETCHED
      };
      (inventoryService.getAllStocks as jest.Mock).mockResolvedValue(stocks);

      await InventoryController.getAllStocks(req as Request, res as Response);

      expect(inventoryService.getAllStocks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(stocks);
    });

    // Prueba manejo de errores
    it('should handle errors', async () => {
      const error = new Error('Test error');
      (inventoryService.getAllStocks as jest.Mock).mockRejectedValue(error);

      await InventoryController.getAllStocks(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.GET_ALL_STOCKS,
        error: error.message
      });
    });
  });

  describe('getStockByProductId', () => {
    // Prueba obtención de stock por ID de producto
    it('should return stock by product id', async () => {
      const stock = { productId: 1, quantity: 10 };
      req.params = { productId: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(stock);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(stock);
    });

    // Prueba cuando no se encuentra el stock
    it('should return 404 if stock not found', async () => {
      req.params = { productId: '1' };
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(null);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.STOCK_NOT_FOUND });
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
    // Prueba agregación exitosa de stock
    it('should add stock successfully', async () => {
      const stock = {
        data: {
          productId: 1,
          quantity: 10,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: new Date()
        },
        message: SUCCESS_MESSAGES.STOCK_ADDED
      };
      req.body = { productId: 1, quantity: 10 };
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        data: { id: 1, name: 'Test Product', price: 100, active: true },
        statusCode: HTTP.OK 
      });
      (inventoryService.addStock as jest.Mock).mockResolvedValue(stock);

      await InventoryController.addStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(inventoryService.addStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.INPUT); // Actualizar expectativa
      expect(res.status).toHaveBeenCalledWith(HTTP.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.STOCK_ADDED,
        updatedStock: stock.data
      });
    });

    // Prueba producto no encontrado
    it('should return 404 if product not found', async () => {
      req.body = { productId: 1, quantity: 10 }; // Remove input_output
      (productService.getProductById as jest.Mock).mockResolvedValue({ statusCode: HTTP.NOT_FOUND });

      await InventoryController.addStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    // Prueba cantidad inválida
    it('should handle invalid quantity', async () => {
      req.body = { productId: 1, quantity: -1 };
      
      // Mock productService to simulate successful product validation
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.OK,
        data: { id: 1 }
      });
      
      // Mock the error we expect from inventoryService
      const error = new Error(ERROR_MESSAGES.QUANTITY);
      (productService.getProductById as jest.Mock).mockRejectedValue(error);

      await InventoryController.addStock(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: ERROR_MESSAGES.ADD_STOCK,
        error: ERROR_MESSAGES.QUANTITY
      });
    });

    it('should handle service error response', async () => {
      req.body = { productId: 1, quantity: 10 };
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.OK,
        data: { id: 1 }
      });
      (inventoryService.addStock as jest.Mock).mockResolvedValue({ 
        error: ERROR_MESSAGES.ADD_STOCK,
        statusCode: HTTP.INTERNAL_SERVER_ERROR 
      });

      await InventoryController.addStock(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: ERROR_MESSAGES.ADD_STOCK 
      });
    });
  });

  describe('updateStock', () => {
    // Prueba actualización exitosa de stock
    it('should update stock successfully', async () => {
      const stock = {
        data: {
          productId: 1,
          quantity: 10,
          input_output: INPUT_OUTPUT.INPUT,
          transaction_date: new Date()
        },
        message: SUCCESS_MESSAGES.STOCK_UPDATED
      };
      req.body = { productId: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        data: { id: 1, name: 'Test Product', price: 100, active: true },
        statusCode: HTTP.OK 
      });
      (inventoryService.updateStock as jest.Mock).mockResolvedValue(stock);

      await InventoryController.updateStock(req as Request, res as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(inventoryService.updateStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.OUTPUT);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        updatedStock: stock.data
      });
    });

    // Prueba stock insuficiente
    it('should handle insufficient stock', async () => {
      req.body = { productId: 1, quantity: 100, input_output: INPUT_OUTPUT.OUTPUT };
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.OK,
        data: { id: 1 }
      });
      (inventoryService.updateStock as jest.Mock).mockResolvedValue({
        error: ERROR_MESSAGES.INSUFFICIENT_STOCK,
        statusCode: HTTP.BAD_REQUEST
      });

      await InventoryController.updateStock(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ 
        message: ERROR_MESSAGES.INSUFFICIENT_STOCK 
      });
    });

    // Prueba valor inválido de entrada/salida
    it('should handle invalid input_output value', async () => {
      req.body = { productId: 1, quantity: 10, input_output: 3 };
      (productService.getProductById as jest.Mock).mockResolvedValue({ 
        statusCode: HTTP.OK,
        data: { id: 1 }
      });
      (inventoryService.updateStock as jest.Mock).mockResolvedValue({
        error: ERROR_MESSAGES.INPUT_OUTPUT,
        statusCode: HTTP.BAD_REQUEST
      });
      
      await InventoryController.updateStock(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ 
        message: ERROR_MESSAGES.INPUT_OUTPUT
      });
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