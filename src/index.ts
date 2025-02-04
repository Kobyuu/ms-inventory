import 'reflect-metadata'
import { config } from './config/constants/enviroment';
import colors from 'colors';
import server from './server';
import { DYNAMIC_MESSAGES } from './config/constants';
import { connectDb } from './config/db';

async function startServer() {
  try {
    await connectDb();
    server.listen(config.port, () => {
      console.log(colors.cyan.bold(DYNAMIC_MESSAGES.SERVER_START(config.port)));
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(colors.bgRed.white(err.message));
    } else {
      console.error(colors.bgRed.white(String(err)));
    }
    process.exit(1); // Finaliza el proceso si la conexión falla
  }
}

// Iniciar el servidor
startServer();
