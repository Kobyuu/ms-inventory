// Stock interfaces
export interface StockAttributes {
  productId: number;
  quantity: number;
  input_output: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StockResponse = ApiResponse<StockAttributes | StockAttributes[]>;

// Response interfaces
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Product interfaces
export interface IProduct {
  id: number;
  name: string;
  price: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductResponse {
  data: IProduct;
  message?: string;
  statusCode: number;
}

// Service interfaces
export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}

export interface DatabaseService {
  transaction<T>(): Promise<T>;
}