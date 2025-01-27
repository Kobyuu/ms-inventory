import axios from 'axios';
import { config } from './env';
import { errorMessages } from './messages';

const axiosClient = axios.create({
  baseURL: config.productServiceUrl,
  timeout: 5000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(errorMessages.httpRequest, error);
    return Promise.reject(error);
  }
);

export default axiosClient;