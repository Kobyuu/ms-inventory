import { Sequelize } from 'sequelize-typescript';
import colors from 'colors';
import { config } from './env';
import { errorMessages, successMessages } from './messages';

// Validar la URL de la base de datos
if (!config.databaseUrl) {
    throw new Error(errorMessages.dbUrlNotDefined);
}

export const db = new Sequelize(config.databaseUrl, {
    models: [`${__dirname}/../models`], // Adaptación para TypeScript/JavaScript en producción
    logging: false,
});

export async function connectDb(): Promise<void> {
    try {
        await db.authenticate();
        await db.sync(); // Sincroniza el esquema
        console.log(colors.bgGreen.white(successMessages.dbConnection));
    } catch (error) {
        console.error(colors.bgRed.white(errorMessages.dbConnection), error);
        throw error; // Lanza el error para que el servidor lo gestione
    }
}

export default db;
