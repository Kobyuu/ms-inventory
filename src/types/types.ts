// Stock interfaces
export interface StockAttributes {
  id?: number; 
  productId: number; 
  quantity: number;
  input_output: number;
  transaction_date: Date;
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

// Error Response interface
export interface ErrorResponse {
  status: number;
  json: {
    message: string;
  };
}

// Product interfaces
export interface IProduct {
  productId: number; 
  name: string;
  price: number;
  activate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductResponse {
  data: IProduct;
  message?: string;
  error?: string;
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

export interface RedisConfig {
  host: string;
  port: number;
}