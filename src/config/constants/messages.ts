export const ERROR_MESSAGES = {
    INPUT_OUTPUT: 'entrada/salida debe ser 1 (entrada) o 2 (salida)',
    QUANTITY: 'La cantidad debe ser mayor que 0',
    GET_ALL_STOCKS: 'Error al obtener datos del inventario',
    GET_STOCK_BY_PRODUCT_ID: 'Error al obtener stock',
    ADD_STOCK: 'Error al agregar stock',
    UPDATE_STOCK: 'Error al modificar stock',
    REVERT_PURCHASE: 'Error al revertir compra y actualizar stock',
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    STOCK_NOT_FOUND: 'Stock no encontrado',
    INSUFFICIENT_STOCK: 'Cantidad insuficiente de stock para esta salida',
    INVALID_DATA: 'Datos inválidos',
    HTTP_REQUEST: 'Error en la solicitud HTTP',
    DB_CONNECTION: 'Error al conectar la base de datos',
    DB_URL_NOT_DEFINED: 'DATABASE_URL no está definida en el archivo .env',
    ENV_VAR_NOT_DEFINED: 'La variable de entorno no está definida',
    REDIS_CONNECTION: 'Error en Redis',
    INSUFFICIENT_REDUCTION_RECORDS: 'No hay suficientes registros de reducción para revertir esta cantidad',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.',
    SERVICE_UNAVAILABLE: 'Servicio no disponible, por favor intente de nuevo más tarde.'
};

export const SUCCESS_MESSAGES = {
    STOCK_REVERTED: 'Stock revertido exitosamente',
    STOCK_ADDED: 'Stock agregado exitosamente',
    STOCK_UPDATED: 'Stock actualizado exitosamente',
    DB_CONNECTION: 'Conexión exitosa a la base de datos',
    REDIS_CONNECTION: 'Conectado a Redis',
    STOCK_FETCHED: 'Stock obtenido exitosamente',
    ALL_STOCKS_FETCHED: 'Todos los stocks obtenidos exitosamente'
};

export const DYNAMIC_MESSAGES = {
    SERVER_START: (port: number) => `REST API en el puerto ${port}`
};