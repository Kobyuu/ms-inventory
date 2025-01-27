import { Sequelize } from 'sequelize-typescript';
import colors from 'colors';
import { config } from './env';

// Validar la URL de la base de datos
if (!config.databaseUrl) {
    throw new Error('DATABASE_URL no está definida en el archivo .env');
}

export const db = new Sequelize(config.databaseUrl, {
    models: [`${__dirname}/../models`], // Adaptación para TypeScript/JavaScript en producción
    logging: false,
});

/**
 * Conectar a la base de datos
 * @returns {Promise<void>}
 */
export async function connectDb(): Promise<void> {
    try {
        await db.authenticate();
        await db.sync(); // Sincroniza el esquema
        console.log(colors.bgGreen.white('Conexión exitosa a la base de datos'));
    } catch (error) {
        console.error(colors.bgRed.white('Error al conectar la base de datos:'), error);
        throw error; // Lanza el error para que el servidor lo gestione
    }
}

export default db;
