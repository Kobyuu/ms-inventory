import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
dotenv.config();

// Validar la URL de la base de datos
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está definida en el archivo .env');
}

export const db = new Sequelize(process.env.DATABASE_URL, {
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
