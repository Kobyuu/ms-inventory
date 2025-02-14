import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { CONFIG } from './constants/enviroment';
import { DatabaseService } from '../types/types';

dotenv.config();

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
    max: CONFIG.DB_POOL.MAX_CONNECTIONS,
    min: CONFIG.DB_POOL.MIN_CONNECTIONS,
    idle: CONFIG.DB_POOL.IDLE_TIME,
    acquire: CONFIG.DB_POOL.ACQUIRE_TIMEOUT,
  },
});

// Hook para intentar reconectar automáticamente si la conexión se pierde
sequelize.addHook('afterDisconnect', async () => {
console.log(ERROR_MESSAGES.DB_CONNECTION_LOST);
try {
  await sequelize.authenticate();
  console.log(SUCCESS_MESSAGES.DB_RECONNECTED);
} catch (err) {
  console.error(ERROR_MESSAGES.DB_RECONNECTION_ERROR, err);
}
});

export async function connectDb(): Promise<void> {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Sincroniza el esquema
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.DB_CONNECTION), error);
        throw error; // Lanza el error para que el servidor lo gestione
    }
}

class SequelizeDatabaseService implements DatabaseService {
  async transaction(): Promise<any> {
    return sequelize.transaction();
  }
}

export const dbService = new SequelizeDatabaseService();
export default sequelize;
