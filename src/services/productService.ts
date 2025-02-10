import axiosClient from '../config/axiosClient';
import { CONFIG } from '../config/constants/enviroment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';
import { cacheService } from './redisCacheService';

class ProductService {
  async getProductById(productId: number) {
    const cacheKey = `product:${productId}`;
    try {
      // Intentar obtener los datos desde la caché
      const cachedProduct = await cacheService.getFromCache(cacheKey);
      if (cachedProduct) {
        return { data: cachedProduct, statusCode: HTTP.OK };
      }

      // Obtener los datos desde el servicio de productos
      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE_URL}/${productId}`);
      // Verificar el status de la respuesta antes de procesar los datos
      if (!productResponse.data) {
        return { error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
      }

      // Almacenar los datos en la caché
      await cacheService.setToCache(cacheKey, productResponse.data);
      return { data: productResponse.data, statusCode: HTTP.OK };
    } catch (error: any) {
      // Si es un error 404, significa que el producto no existe
      if (error.response?.status === HTTP.NOT_FOUND) {
        return { error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
      }
      console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
      return { error: ERROR_MESSAGES.HTTP_REQUEST, statusCode: HTTP.INTERNAL_SERVER_ERROR };
    }
  }
}

export default new ProductService();