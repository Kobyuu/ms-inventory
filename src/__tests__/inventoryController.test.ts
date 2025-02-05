import { Request, Response } from 'express';
import inventoryService from '../services/inventoryService';
import InventoryController from '../controllers/inventoryController';
import axiosClient from '../config/axiosClient';
import { config } from '../config/constants/enviroment';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, INPUT_OUTPUT, HTTP } from '../config/constants';

// Mockeamos los servicios y el cliente axios para las pruebas
jest.mock('../services/inventoryService');
jest.mock('../config/axiosClient');

describe('InventoryController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  // Antes de cada prueba, inicializamos las variables req, res y next
  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(), // Mockeamos la función status para que retorne 'this' y poder encadenar llamadas
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks(); // Limpiamos todos los mocks antes de cada prueba
  });

  // Pruebas para el método getAllStocks
  describe('getAllStocks', () => {
    it('should return all stocks', async () => {
      const stocks = [{ product_id: 1, quantity: 10 }];
      // Mockeamos la función getAllStocks del servicio para que retorne una lista de stocks
      (inventoryService.getAllStocks as jest.Mock).mockResolvedValue(stocks);

      await InventoryController.getAllStocks(req as Request, res as Response);

      // Verificamos que se haya llamado al servicio y que la respuesta sea correcta
      expect(inventoryService.getAllStocks).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(stocks);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      // Mockeamos la función getAllStocks para que lance un error
      (inventoryService.getAllStocks as jest.Mock).mockRejectedValue(error);

      await InventoryController.getAllStocks(req as Request, res as Response);

      // Verificamos que se maneje el error correctamente
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.GET_ALL_STOCKS,
        error: error.message
      });
    });
  });

  // Pruebas para el método getStockByProductId
  describe('getStockByProductId', () => {
    it('should return stock by product ID', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.params = { product_id: '1' };
      // Mockeamos la función getStockByProductId para que retorne un stock específico
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(stock);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      // Verificamos que se haya llamado al servicio con el ID correcto y que la respuesta sea correcta
      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith(stock);
    });

    it('should return 404 if stock not found', async () => {
      req.params = { product_id: '1' };
      // Mockeamos la función getStockByProductId para que retorne null (stock no encontrado)
      (inventoryService.getStockByProductId as jest.Mock).mockResolvedValue(null);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      // Verificamos que se maneje el caso de stock no encontrado correctamente
      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.STOCK_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.params = { product_id: '1' };
      // Mockeamos la función getStockByProductId para que lance un error
      (inventoryService.getStockByProductId as jest.Mock).mockRejectedValue(error);

      await InventoryController.getStockByProductId(req as Request, res as Response);

      // Verificamos que se maneje el error correctamente
      expect(inventoryService.getStockByProductId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ 
        message: ERROR_MESSAGES.GET_STOCK_BY_PRODUCT_ID, 
        error: error.message 
      });
    });
  });

  // Pruebas para el método addStock
  describe('addStock', () => {
    it('should add stock', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      // Mockeamos la llamada a axiosClient.get para simular que el producto existe
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.OK });
      // Mockeamos la función addStock del servicio para que retorne el stock agregado
      (inventoryService.addStock as jest.Mock).mockResolvedValue(stock);

      await InventoryController.addStock(req as Request, res as Response);

      // Verificamos que se haya llamado a axiosClient.get y al servicio addStock con los parámetros correctos
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(inventoryService.addStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.INPUT);
      expect(res.status).toHaveBeenCalledWith(HTTP.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: SUCCESS_MESSAGES.STOCK_ADDED, updatedStock: stock });
    });

    it('should return 400 for invalid input', async () => {
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };

      await InventoryController.addStock(req as Request, res as Response);

      // Verificamos que se maneje el caso de entrada inválida correctamente
      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.INPUT_OUTPUT });
    });

    it('should return 404 if product not found', async () => {
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      // Mockeamos la llamada a axiosClient.get para simular que el producto no existe
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.NOT_FOUND });

      await InventoryController.addStock(req as Request, res as Response);

      // Verificamos que se maneje el caso de producto no encontrado correctamente
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.INPUT };
      // Mockeamos la llamada a axiosClient.get para que lance un error
      (axiosClient.get as jest.Mock).mockRejectedValue(error);

      await InventoryController.addStock(req as Request, res as Response);

      // Verificamos que se maneje el error correctamente
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.ADD_STOCK, error: error.message });
    });
  });

  // Pruebas para el método updateStock
  describe('updateStock', () => {
    it('should update stock', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      // Mockeamos la llamada a axiosClient.get para simular que el producto existe
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.OK });
      // Mockeamos la función updateStock del servicio para que retorne el stock actualizado
      (inventoryService.updateStock as jest.Mock).mockResolvedValue(stock);

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se haya llamado a axiosClient.get y al servicio updateStock con los parámetros correctos
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(inventoryService.updateStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.OUTPUT);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({ message: SUCCESS_MESSAGES.STOCK_UPDATED, updatedStock: stock });
    });

    it('should return 400 for invalid input', async () => {
      req.body = { product_id: 1, quantity: 0, input_output: INPUT_OUTPUT.OUTPUT };

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se maneje el caso de entrada inválida correctamente
      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.INVALID_DATA });
    });

    it('should return 404 if product not found', async () => {
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      // Mockeamos la llamada a axiosClient.get para simular que el producto no existe
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.NOT_FOUND });

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se maneje el caso de producto no encontrado correctamente
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      // Mockeamos la llamada a axiosClient.get para que lance un error
      (axiosClient.get as jest.Mock).mockRejectedValue(error);

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se maneje el error correctamente
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.UPDATE_STOCK, error: error.message });
    });
  });

  // Pruebas para el método deleteProduct
  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      req.params = { product_id: '1' };
      // Mockeamos la función deleteProduct del servicio para que retorne éxito
      (inventoryService.deleteProduct as jest.Mock).mockResolvedValue({
        message: SUCCESS_MESSAGES.PRODUCT_DELETED
      });

      await InventoryController.deleteProduct(req as Request, res as Response);

      // Verificamos que se haya llamado al servicio con el ID correcto y que la respuesta sea correcta
      expect(inventoryService.deleteProduct).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({ message: SUCCESS_MESSAGES.PRODUCT_DELETED });
    });

    it('should return 404 if product not found', async () => {
      req.params = { product_id: '1' };
      // Mockeamos la función deleteProduct del servicio para que retorne error de producto no encontrado
      (inventoryService.deleteProduct as jest.Mock).mockResolvedValue({
        error: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
        statusCode: HTTP.NOT_FOUND
      });

      await InventoryController.deleteProduct(req as Request, res as Response);

      // Verificamos que se maneje el caso de producto no encontrado correctamente
      expect(inventoryService.deleteProduct).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.params = { product_id: '1' };
      // Mockeamos la función deleteProduct del servicio para que lance un error
      (inventoryService.deleteProduct as jest.Mock).mockRejectedValue(error);

      await InventoryController.deleteProduct(req as Request, res as Response);

      // Verificamos que se maneje el error correctamente
      expect(inventoryService.deleteProduct).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.DELETE_PRODUCT });
    });
  });

  // Pruebas adicionales para el método updateStock
  describe('InventoryController.updateStock', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it('should return 400 for invalid input', async () => {
      req.body = { product_id: 1, quantity: 0, input_output: INPUT_OUTPUT.OUTPUT };

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se maneje el caso de entrada inválida correctamente
      expect(res.status).toHaveBeenCalledWith(HTTP.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.INVALID_DATA });
    });

    it('should return 404 if product not found', async () => {
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      // Mockeamos la llamada a axiosClient.get para simular que el producto no existe
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.NOT_FOUND });

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se maneje el caso de producto no encontrado correctamente
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      // Mockeamos la llamada a axiosClient.get para que lance un error
      (axiosClient.get as jest.Mock).mockRejectedValue(error);

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que se maneje el error correctamente
      expect(axiosClient.get).toHaveBeenCalledWith(`${config.productServiceUrl}/1`);
      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        message: ERROR_MESSAGES.UPDATE_STOCK,
        error: error.message
      });
    });

    it('should update stock successfully', async () => {
      const stock = { product_id: 1, quantity: 10 };
      req.body = { product_id: 1, quantity: 10, input_output: INPUT_OUTPUT.OUTPUT };
      // Mockeamos la llamada a axiosClient.get para simular que el producto existe
      (axiosClient.get as jest.Mock).mockResolvedValue({ status: HTTP.OK });
      // Mockeamos la función updateStock del servicio para que retorne el stock actualizado
      (inventoryService.updateStock as jest.Mock).mockResolvedValue({
        data: stock,
        message: SUCCESS_MESSAGES.STOCK_UPDATED
      });

      await InventoryController.updateStock(req as Request, res as Response);

      // Verificamos que la respuesta sea correcta y que se haya llamado al servicio con los parámetros correctos
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: SUCCESS_MESSAGES.STOCK_UPDATED,
        updatedStock: {
          data: stock,
          message: SUCCESS_MESSAGES.STOCK_UPDATED
        }
      });
      expect(inventoryService.updateStock).toHaveBeenCalledWith(1, 10, INPUT_OUTPUT.OUTPUT);
    });
  });
});