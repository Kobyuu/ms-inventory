import axiosClient from '../config/axiosClient';
import { CONFIG } from '../config/constants/enviroment';
import { HTTP, ERROR_MESSAGES } from '../config/constants';

class ProductService {
  async getProductById(product_id: number) {
    try {
      const productResponse = await axiosClient.get(`${CONFIG.PRODUCT_SERVICE_URL}/${product_id}`);
      if (productResponse.status === HTTP.NOT_FOUND) {
        return { error: ERROR_MESSAGES.PRODUCT_NOT_FOUND, statusCode: HTTP.NOT_FOUND };
      }
      return { data: productResponse.data, statusCode: HTTP.OK };
    } catch (error: any) {
      console.error(ERROR_MESSAGES.HTTP_REQUEST, error);
      return { error: ERROR_MESSAGES.HTTP_REQUEST, statusCode: HTTP.INTERNAL_SERVER_ERROR };
    }
  }
}

export default new ProductService();