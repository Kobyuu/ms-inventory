// Interfaces para el manejo de Stock
export interface StockAttributes {
  id?: number; 
  productId: number; 
  quantity: number;
  input_output: number;
  transaction_date: Date;
}

// Tipo para respuestas relacionadas con Stock
export type StockResponse = ApiResponse<StockAttributes | StockAttributes[]>;

// Interfaces para respuestas API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Interface para respuestas de error
export interface ErrorResponse {
  status: number;
  json: {
    message: string;
  };
}

// Interfaces para Productos
export interface IProduct {
  productId: number; 
  name: string;
  price: number;
  activate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para respuesta de Productos
export interface IProductResponse {
  data: IProduct;
  message?: string;
  error?: string;
  statusCode: number;
}

// Interfaces para Servicios
export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}

// Interface para operaciones de base de datos
export interface DatabaseService {
  transaction<T>(): Promise<T>;
}

// Configuración de Redis
export interface RedisConfig {
  host: string;
  port: number;
}