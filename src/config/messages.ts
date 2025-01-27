export const errorMessages = {
    inputOutput: 'entrada/salida debe ser 1 (entrada) o 2 (salida)',
    quantity: 'La cantidad debe ser mayor que 0',
    getAllStocks: 'Error al obtener datos del inventario',
    getStockByProductId: 'Error al obtener stock',
    addStock: 'Error al agregar stock',
    updateStock: 'Error al modificar stock',
    revertPurchase: 'Error al revertir compra y actualizar stock',
    productNotFound: 'Producto no encontrado',
    stockNotFound: 'Stock no encontrado',
    insufficientStock: 'Cantidad insuficiente de stock para esta salida',
    invalidData: 'Datos inválidos',
    httpRequest: 'Error en la solicitud HTTP',
    dbConnection: 'Error al conectar la base de datos',
    dbUrlNotDefined: 'DATABASE_URL no está definida en el archivo .env',
    envVarNotDefined: 'La variable de entorno no está definida',
    redisConnection: 'Error en Redis',
    insufficientReductionRecords: 'No hay suficientes registros de reducción para revertir esta cantidad',
    rateLimitExceeded: 'Demasiadas solicitudes desde esta IP, por favor intente de nuevo más tarde.',
    serviceUnavailable: 'Servicio no disponible, por favor intente de nuevo más tarde.'
};

export const successMessages = {
    stockReverted: 'Stock revertido exitosamente',
    stockAdded: 'Stock agregado exitosamente',
    stockUpdated: 'Stock actualizado exitosamente',
    dbConnection: 'Conexión exitosa a la base de datos',
    redisConnection: 'Conectado a Redis',
    stockFetched: 'Stock obtenido exitosamente',
    allStocksFetched: 'Todos los stocks obtenidos exitosamente'
};

export const dynamicMessages = {
    serverStart: (port: number) => `REST API en el puerto ${port}`
};