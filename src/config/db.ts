import { Sequelize } from 'sequelize-typescript';
import colors from 'colors';
import { config } from './env';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

// Validar la URL de la base de datos
if (!config.databaseUrl) {
    throw new Error(ERROR_MESSAGES.DB_URL_NOT_DEFINED);
}

export const db = new Sequelize(config.databaseUrl, {
    models: [`${__dirname}/../models`], // Adaptación para TypeScript/JavaScript en producción
    logging: false,
});

export async function connectDb(): Promise<void> {
    try {
        await db.authenticate();
        await db.sync(); // Sincroniza el esquema
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.DB_CONNECTION), error);
        throw error; // Lanza el error para que el servidor lo gestione
    }
}

export default db;
