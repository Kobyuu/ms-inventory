import axios from 'axios';
import { config } from './env';

const axiosClient = axios.create({
  baseURL: config.productServiceUrl,
  timeout: 5000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la solicitud HTTP:', error);
    return Promise.reject(error);
  }
);

export default axiosClient;