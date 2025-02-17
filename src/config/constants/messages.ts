export const ERROR_MESSAGES = {
    // Errores de base de datos
    DB_URL_NOT_DEFINED: 'La URL de la base de datos no está definida',
    DB_CONNECTION: 'Error al conectar la base de datos',
    DB_CONNECTION_LOST: 'Conexión a la base de datos perdida. Intentando reconectar...',
    DB_RECONNECTION_ERROR: 'Error al intentar reconectar',
    DB_CONNECTION_ERROR: 'Error al conectar con la base de datos',
    DB_MAX_RETRIES_EXCEEDED: 'Se agotaron los intentos de reconexión',
    DB_RECONNECTION_ATTEMPT: 'Reintentando conexión',

    // Errores de Redis
    REDIS_CONNECTION: 'Error en Redis',
    REDIS_URL_PARSE: 'Error al analizar URL de Redis:',

    // Errores relacionados con productos
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    PRODUCT_INACTIVE: 'El producto está desactivado',

    // Errores de gestión de stock
    STOCK_NOT_FOUND: 'Stock no encontrado',
    INSUFFICIENT_STOCK: 'Cantidad insuficiente de stock para esta salida',
    FETCH_ALL_STOCKS: 'Error al obtener todos los datos del inventario',
    GET_STOCK_BY_PRODUCT_ID: 'Error al obtener stock',
    ADD_STOCK: 'Error al agregar stock',
    UPDATE_STOCK: 'Error al modificar stock',
    GET_ALL_STOCKS: 'Error al obtener todos los stocks',

    // Errores de validación
    INPUT_OUTPUT: 'entrada/salida debe ser 1 (entrada) o 2 (salida)',
    QUANTITY: 'La cantidad debe ser mayor que 0',
    INVALID_DATA: 'Datos inválidos',
    ENV_VAR_NOT_DEFINED: 'La variable de entorno no está definida',

    // Errores HTTP
    HTTP_REQUEST: 'Error en la solicitud HTTP',
    RATE_LIMIT_EXCEEDED: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.'
};

// Mensajes de éxito para diferentes operaciones
export const SUCCESS_MESSAGES = {
    // Mensajes de conexión a base de datos
    DB_CONNECTION: 'Conexión a la base de datos establecida correctamente',
    DB_RECONNECTED: 'Reconectado a la base de datos con éxito',

    // Mensajes de conexión a Redis
    REDIS_CONNECTION: 'Conectado a Redis',

    // Mensajes de operaciones de stock
    STOCK_ADDED: 'Stock agregado exitosamente',
    STOCK_UPDATED: 'Stock actualizado exitosamente',
    STOCK_FETCHED: 'Stock obtenido exitosamente',
    ALL_STOCKS_FETCHED: 'Todos los stocks obtenidos exitosamente',

    // Mensajes genéricos
    OK: 'OK',
};

// Mensajes dinámicos que requieren parámetros
export const DYNAMIC_MESSAGES = {
    // Mensajes de servidor
    SERVER_START: (port: number) => `REST API en el puerto ${port}`,
    
    // Mensajes de reintentos
    RETRY_ATTEMPT: (retryCount: number) => `Intento de reintento: ${retryCount}`
};