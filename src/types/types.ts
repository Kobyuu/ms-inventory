// Stock related interfaces
export interface StockAttributes {
  product_id: number;
  quantity: number;
  input_output: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Response interfaces
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export type StockResponse = ApiResponse<StockAttributes | StockAttributes[]>;

// Service interfaces
export interface CacheService {
  getFromCache(key: string): Promise<any>;
  setToCache(key: string, data: any): Promise<void>;
  clearCache(keys: string[]): Promise<void>;
}

export interface DatabaseService {
  transaction<T>(): Promise<T>;
}

// Circuit Breaker interface
export interface CircuitBreakerService {
  isOpen(): boolean;
  fire<T>(command: string): Promise<T>;
  onStateChange(callback: (state: string) => void): void;
}