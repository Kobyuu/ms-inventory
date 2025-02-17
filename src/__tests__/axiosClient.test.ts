import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import axiosClient from '../config/axiosClient';
import { cacheService } from '../services/redisCacheService';

// Mockear el servicio de caché
jest.mock('../services/redisCacheService');

describe('axios-retry with cache', () => {
  let mock: MockAdapter;

  // Configura el mock de Axios antes de cada prueba
  beforeEach(() => {
    mock = new MockAdapter(axiosClient);
    jest.clearAllMocks();
  });

  // Limpia el mock después de cada prueba
  afterEach(() => {
    mock.reset();
  });

  // Prueba reintentos en errores de red
  it('should retry the request on network error', async () => {
    mock.onGet('/test').networkError();

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Verifica mensaje de error de red
        expect(error.message).toBe('Network Error');
        // Confirma múltiples intentos
        expect(mock.history.get.length).toBeGreaterThan(1);
      } else {
        throw error;
      }
    }
  });

  // Prueba reintentos en errores del servidor (5xx)
  it('should retry the request on 5xx error', async () => {
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

  // Prueba sin reintentos en errores del cliente (4xx)
  it('should not retry the request on 4xx error', async () => {
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

  // Prueba almacenamiento en caché de respuestas exitosas
  it('should store response in cache on successful request', async () => {
    const responseData = { data: 'test data' };
    mock.onGet('/test').reply(200, responseData);

    await axiosClient.get('/test');

    // Verifica que los datos se almacenaron en la caché
    expect(cacheService.setToCache).toHaveBeenCalledWith('cache:/test', responseData);
  });

  // Prueba recuperación de datos desde caché
  it('should return cached response if available', async () => {
    const cachedData = { data: 'cached data' };
    (cacheService.getFromCache as jest.Mock).mockResolvedValue(cachedData);

    const response = await axiosClient.get('/test');

    // Verifica que los datos se obtuvieron de la caché
    expect(cacheService.getFromCache).toHaveBeenCalledWith('cache:/test');
    expect(response.data).toEqual(cachedData);
  });

  // Prueba solicitud de red cuando no hay caché
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
