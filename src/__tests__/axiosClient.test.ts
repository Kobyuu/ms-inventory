import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import axiosClient from '../config/axiosClient';
import { cacheService } from '../services/redisCacheService';

jest.mock('../services/redisCacheService');

describe('axios-retry with cache', () => {
  let mock: MockAdapter;

  // Antes de cada prueba, inicializa un mock para interceptar las solicitudes HTTP
  beforeEach(() => {
    mock = new MockAdapter(axiosClient);
    jest.clearAllMocks();
  });

  // Después de cada prueba, resetea el mock para evitar interferencias entre pruebas
  afterEach(() => {
    mock.reset();
  });

  it('should retry the request on network error', async () => {
    // Simula un error de red en la petición GET a '/test'
    mock.onGet('/test').networkError();

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica que el error lanzado es un "Network Error"
        expect(error.message).toBe('Network Error');
        // Comprueba que se intentó hacer la solicitud más de una vez (reintentos)
        expect(mock.history.get.length).toBeGreaterThan(1);
      } else {
        throw error;
      }
    }
  });

  it('should retry the request on 5xx error', async () => {
    // Simula una respuesta con error 500 (Internal Server Error)
    mock.onGet('/test').reply(500);

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica que el error recibido es por un estado 500
        expect(error.message).toBe('Request failed with status code 500');
        // Asegura que la solicitud fue reintentada varias veces
        expect(mock.history.get.length).toBeGreaterThan(1);
      } else {
        throw error;
      }
    }
  });

  it('should not retry the request on 4xx error', async () => {
    // Simula una respuesta con error 400 (Bad Request)
    mock.onGet('/test').reply(400);

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica que el error recibido es por un estado 400
        expect(error.message).toBe('Request failed with status code 400');
        // Asegura que la solicitud NO fue reintentada (solo se hizo una vez)
        expect(mock.history.get.length).toBe(1);
      } else {
        throw error;
      }
    }
  });

  it('should store response in cache on successful request', async () => {
    const responseData = { data: 'test data' };
    mock.onGet('/test').reply(200, responseData);

    await axiosClient.get('/test');

    // Verifica que los datos se almacenaron en la caché
    expect(cacheService.setToCache).toHaveBeenCalledWith('cache:/test', responseData);
  });

  it('should return cached response if available', async () => {
    const cachedData = { data: 'cached data' };
    (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedData);

    const response = await axiosClient.get('/test');

    // Verifica que los datos se obtuvieron de la caché
    expect(cacheService.getFromCache).toHaveBeenCalledWith('cache:/test');
    expect(response.data).toEqual(cachedData);
  });

  it('should make network request if cache is empty', async () => {
    const responseData = { data: 'test data' };
    (cacheService.getFromCache as jest.Mock).mockResolvedValue(null);
    mock.onGet('/test').reply(200, responseData);

    const response = await axiosClient.get('/test');

    // Verifica que se hizo la solicitud de red y se almacenaron los datos en la caché
    expect(cacheService.getFromCache).toHaveBeenCalledWith('cache:/test');
    expect(response.data).toEqual(responseData);
    expect(cacheService.setToCache).toHaveBeenCalledWith('cache:/test', responseData);
  });
});
