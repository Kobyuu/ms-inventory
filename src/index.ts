import { config } from './config/enviroment';
import colors from 'colors';
import server from './server';
import { DYNAMIC_MESSAGES } from './config/constants';
import { connectDb } from './config/db';

// Iniciar conexión a la base de datos y luego iniciar el servidor
connectDb()
  .then(() => {
    server.listen(config.port, () => {
      console.log(colors.cyan.bold(DYNAMIC_MESSAGES.SERVER_START(config.port)));
    });
  })
  .catch((err) => {
    console.error(colors.bgRed.white(err.message));
    process.exit(1); // Finaliza el proceso si la conexión falla
  });
