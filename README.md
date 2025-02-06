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
# Configuración general
PORT=4002

# Configuración de la base de datos
DATABASE_URL=postgres://postgres:password@localhost:5432/ms-inventory

# URL del servicio de productos
PRODUCT_SERVICE_URL=http://localhost/api/products  
# Cuando se testea con docker en lugar de localhost debe ir ms-catalog

# Configuración de Redis
REDIS_URL=redis://localhost:6379
# Cuando se testea con docker en lugar de localhost debe ir redis

# Expiración de la caché en segundos
CACHE_EXPIRY=3600

#Retry delay
RETRY_DELAY=1000

#Retry attempts
RETRY_ATTEMPTS=3
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

- **Circuit Breaker**: Manejo de fallos en servicios externos usando [`CircuitBreaker`](src/middleware/circuitBreaker.ts)
- **Redis Caching**: Optimización de rendimiento con [`RedisCacheService`](src/utils/utils.ts)
- **Input Validation**: Validaciones robustas con [`validateInventory`](src/middleware/validateInventory.ts)
- **Rate Limiting**: Protección contra sobrecarga con [`rateLimiter`](src/middleware/rateLimiter.ts)
- **Database Transactions**: Operaciones ACID usando Sequelize
- **Automated Tests**: Cobertura completa con Jest
- **TypeScript**: Código completamente tipado

## Uso

1. Inicia el servidor:
    ```sh
    npm run dev
    ```
2. El servidor estará disponible en `http://localhost:4002`.

## Rutas de la API

- **GET** `/api/inventory/`: Obtener todos los registros de inventario.
- **GET** `/api/inventory/:productId`: Obtener stock por ID de producto.
- **POST** `/api/inventory/`: Agregar nuevo registro de inventario.
- **PUT** `/api/inventory/update`: Modificar la cantidad en el inventario.
