import express from 'express';
import colors from 'colors';
import router from './router';
import { connectDb } from './config/db';

// Instancia de express
const server = express();

// Middleware para leer datos de formularios
server.use(express.json());

// Configuración de rutas
server.use('/api/inventory', router);

// Iniciar conexión a la base de datos
connectDb().catch((err) => {
    console.error(colors.bgRed.white('Error al conectar la base de datos:'), err);
    process.exit(1); // Finaliza el proceso si la conexión falla
});

export default server;
