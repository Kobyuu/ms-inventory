# Microservicio de Inventario

Microservicio de gestión de inventario implementado con Node.js, TypeScript, Express, Sequelize y Redis.

## Descripción

Microservicio para gestionar el inventario de productos con características avanzadas como Redis caching y reintentos automáticos HTTP.

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
# Configuración General
PORT=4002
NODE_ENV=development

# Configuración de Base de Datos
DB_POOL_MAX=5
DB_POOL_MIN=1
DB_POOL_IDLE=600000
DB_POOL_ACQUIRE=30000
DIALECT=postgres
MODELS_PATH=/../models/**/*.ts
LOGGING=false

# Entorno Docker
DATABASE_URL=postgres://postgres:1234@postgres:5432/ms-inventory
# Pruebas locales
# DATABASE_URL=postgres://postgres:1234@localhost:5432/ms-inventory

# URL del Servicio de Productos
# Entorno Docker
PRODUCT_SERVICE_URL=http://ms-catalog_app:4001/api/product
# Pruebas locales
# PRODUCT_SERVICE_URL=http://localhost:5001/api/product

# Configuración de Redis
# Entorno Docker
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
# Pruebas locales
# REDIS_URL=redis://localhost:8379
# REDIS_HOST=localhost

# Configuración de Caché y Reintentos
CACHE_EXPIRY=3600
RETRY_DELAY=1000
RETRY_ATTEMPTS=3
REDIS_RETRY_DELAY=2000
REDIS_PORT=6379

# Timeouts de Servicios
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
