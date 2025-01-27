# ms-inventory

Microservicio de inventario para gestionar el stock de productos.

## Descripción

Este microservicio permite gestionar el inventario de productos, incluyendo la adición, actualización y reversión de stock.

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
    NODE_ENV=development

    # Configuración de la base de datos
    DATABASE_URL=postgres://usuario:contraseña@localhost:5432/ms-inventory

    # URL del servicio de productos
    PRODUCT_SERVICE_URL=http://localhost:4001/api/products

    # Configuración de Redis
    REDIS_URL=redis://localhost:6379

    # Expiración de la caché en segundos
    CACHE_EXPIRY=3600

    # Mensajes de error personalizados
    ERROR_INPUT_OUTPUT=entrada/salida debe ser 1 (entrada) o 2 (salida)
    ERROR_QUANTITY=La cantidad debe ser mayor que 0
    ```

## Uso

1. Inicia el servidor:
    ```sh
    npm run dev
    ```
2. El servidor estará disponible en `http://localhost:4002`.

## Rutas de la API

- **GET** `/api/inventory/`: Obtener todos los registros de inventario.
- **GET** `/api/inventory/:product_id`: Obtener stock por ID de producto.
- **POST** `/api/inventory/`: Agregar nuevo registro de inventario.
- **PUT** `/api/inventory/update`: Modificar la cantidad en el inventario.
- **PUT** `/api/inventory/revert/:product_id`: Revertir la compra y actualizar el stock.
