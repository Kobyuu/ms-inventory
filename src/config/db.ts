import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONFIG } from './constants';
import { DatabaseService } from '../types/types';

// Carga variables de entorno
dotenv.config();

// Verifica URL de base de datos
console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.DB_URL_NOT_DEFINED);
}

// Crear una instancia de Sequelize con la URL de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    models: [__dirname + '/../models/**/*.ts'],
    logging: false,
    pool: {
        max: CONFIG.DATABASE.POOL.MAX_CONNECTIONS,      // Máximo de conexiones simultáneas
        min: CONFIG.DATABASE.POOL.MIN_CONNECTIONS,      // Mínimo de conexiones mantenidas
        idle: CONFIG.DATABASE.POOL.IDLE_TIME,           // Tiempo máximo de inactividad
        acquire: CONFIG.DATABASE.POOL.ACQUIRE_TIMEOUT   // Tiempo máximo para obtener conexión
    }
});

// Hook para reconexión automática tras pérdida de conexión
sequelize.addHook('afterDisconnect', async () => {
    console.log('Conexión a la base de datos perdida. Intentando reconectar...');
    try {
        await sequelize.authenticate();
        console.log('Reconectado a la base de datos con éxito.');
    } catch (err) {
        console.error('Error al intentar reconectar:', err);
    }
});

// Función para establecer conexión inicial con la base de datos
export async function connectDb(): Promise<void> {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Sincroniza modelos con la base de datos
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.DB_CONNECTION), error);
        throw error; // Propaga el error para manejo superior
    }
}

// Implementación del servicio de base de datos para transacciones
class SequelizeDatabaseService implements DatabaseService {
    // Inicia una nueva transacción de base de datos
    async transaction(): Promise<any> {
        return sequelize.transaction();
    }
}

// Exporta instancias para uso en la aplicación
export const dbService = new SequelizeDatabaseService();
export default sequelize;
