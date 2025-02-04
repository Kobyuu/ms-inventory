// Interfaz que define los atributos del modelo Stock
export interface StockAttributes {
  product_id: number;
  quantity: number;
  input_output: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz que define la respuesta de la API
export interface StockResponse {
  data?: StockAttributes | StockAttributes[];
  message?: string;
  error?: string;
  statusCode?: number;
}

// Interfaz para el servicio de caché
export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}

// Interfaz para el servicio de base de datos
export interface DatabaseService {
  transaction(): Promise<any>;
}