export const ERROR_MESSAGES = {
    // Database errors
    DB_URL_NOT_DEFINED: 'La URL de la base de datos no está definida',
    DB_CONNECTION: 'Error al conectar la base de datos',
    DB_CONNECTION_LOST: 'Conexión a la base de datos perdida. Intentando reconectar...',
    DB_RECONNECTION_ERROR: 'Error al intentar reconectar',
    DB_CONNECTION_ERROR: 'Error al conectar con la base de datos',
    DB_MAX_RETRIES_EXCEEDED: 'Se agotaron los intentos de reconexión',
    DB_RECONNECTION_ATTEMPT: 'Reintentando conexión',

    // Redis errors
    REDIS_CONNECTION: 'Error en Redis',
    REDIS_URL_PARSE: 'Error parsing Redis URL:',

    // Product errors
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    PRODUCT_INACTIVE: 'El producto está desactivado',

    // Stock errors
    STOCK_NOT_FOUND: 'Stock no encontrado',
    INSUFFICIENT_STOCK: 'Cantidad insuficiente de stock para esta salida',
    FETCH_ALL_STOCKS: 'Error al obtener todos los datos del inventario',
    GET_STOCK_BY_PRODUCT_ID: 'Error al obtener stock',
    ADD_STOCK: 'Error al agregar stock',
    UPDATE_STOCK: 'Error al modificar stock',
    GET_ALL_STOCKS: 'Error al obtener todos los stocks',

    // Validation errors
    INPUT_OUTPUT: 'entrada/salida debe ser 1 (entrada) o 2 (salida)',
    QUANTITY: 'La cantidad debe ser mayor que 0',
    INVALID_DATA: 'Datos inválidos',
    ENV_VAR_NOT_DEFINED: 'La variable de entorno no está definida',

    // HTTP errors
    HTTP_REQUEST: 'Error en la solicitud HTTP',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.'
};

export const SUCCESS_MESSAGES = {
    DB_CONNECTION: 'Conexión a la base de datos establecida correctamente',
    DB_RECONNECTED: 'Reconectado a la base de datos con éxito',
    REDIS_CONNECTION: 'Conectado a Redis',
    STOCK_ADDED: 'Stock agregado exitosamente',
    STOCK_UPDATED: 'Stock actualizado exitosamente',
    STOCK_FETCHED: 'Stock obtenido exitosamente',
    ALL_STOCKS_FETCHED: 'Todos los stocks obtenidos exitosamente',
    OK: 'OK',
};

export const DYNAMIC_MESSAGES = {
    SERVER_START: (port: number) => `REST API en el puerto ${port}`,
    RETRY_ATTEMPT: (retryCount: number) => `Intento de reintento: ${retryCount}`
};