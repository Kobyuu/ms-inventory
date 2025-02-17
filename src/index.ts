import 'reflect-metadata'
import { CONFIG, DYNAMIC_MESSAGES } from './config/constants';
import colors from 'colors';
import server from './server';
import { connectDb } from './config/db';

// Función principal para iniciar el servidor y la conexión a la base de datos
async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDb();
    // Iniciar el servidor en el puerto configurado
    server.listen(CONFIG.PORT, () => {
      console.log(colors.cyan.bold(DYNAMIC_MESSAGES.SERVER_START(CONFIG.PORT)));
    });
  } catch (err) {
    // Manejo de errores con diferenciación por tipo
    if (err instanceof Error) {
      console.error(colors.bgRed.white(err.message));
    } else {
      console.error(colors.bgRed.white(String(err)));
    }
    process.exit(1);
  }
}

// Ejecutar el servidor
startServer();
