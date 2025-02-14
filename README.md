# ms-inventory

Microservicio de gestión de inventario implementado con Node.js, TypeScript, Express, Sequelize y Redis.

## Descripción

Microservicio para gestionar el inventario de productos con características avanzadas como Circuit Breaker, Redis caching y reintentos automáticos HTTP.

## Instalación

1. Clona el repositorio:
    ```sh
    git clone https://github.com/Kobyuu/ms-inventory.git
    ```
2. Navega al directorio del proyecto:
    ```sh
    cd ms-inventory
    ```
3. Instala las dependencias:
    ```sh
    npm install
    ```

## Configuración

1. Crea un archivo [.env](http://_vscodecontentref_/3) en la raíz del proyecto con el siguiente contenido:
```env
# General Configuration
PORT=4002
NODE_ENV=development

# Database Configuration
DB_POOL_MAX=5
DB_POOL_MIN=1
DB_POOL_IDLE=600000
DB_POOL_ACQUIRE=30000

# Docker environment
DATABASE_URL=postgres://postgres:1234@postgres:5432/ms-inventory
# Local testing
# DATABASE_URL=postgres://postgres:1234@localhost:5432/ms-inventory

# Product Service URL
# Docker environment
PRODUCT_SERVICE_URL=http://ms-catalog_app:4001/api/product
# Local testing
# PRODUCT_SERVICE_URL=http://localhost:5001/api/product

# Redis Configuration
# Docker environment
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
# Local testing
# REDIS_URL=redis://localhost:8379
# REDIS_HOST=localhost

# Cache and Retry Settings
CACHE_EXPIRY=3600
RETRY_DELAY=1000
RETRY_ATTEMPTS=3
REDIS_RETRY_DELAY=2000
REDIS_PORT=6379

# Service Timeouts
PRODUCT_SERVICE_TIMEOUT=5000
```

## jest.config.js

```js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    }
};
```
## jest.setup.js

```js
jest.setTimeout(30000)
```

## Características

- **Redis Caching**: Optimización de rendimiento con RedisCacheService
- **Input Validation**: Validaciones robustas con validateInventory
- **Rate Limiting**: Protección contra sobrecarga con rateLimiter 
- **Database Transactions**: Operaciones ACID usando Sequelize
- **Automated Tests**: Cobertura completa con Jest
- **TypeScript**: Código completamente tipado
- **Circuit Breaker**: Manejo de fallos en servicios externos usando CircuitBreaker

## Uso

1. Inicia el servidor:
    ```sh
    npm run dev
    ```
2. El servidor estará disponible en `http://ms-inventory:4002`.

## Rutas de la API

- **GET** `/api/inventory/`: Obtener todos los registros de inventario.
- **GET** `/api/inventory/:productId`: Obtener stock por ID de producto.
- **POST** `/api/inventory/`: Agregar nuevo registro de inventario.
- **PUT** `/api/inventory/update`: Modificar la cantidad en el inventario.
