import { config } from './config/env';
import colors from 'colors';
import server from './server';

// Usar las configuraciones cargadas y validadas
server.listen(config.port, () => {
    console.log(colors.cyan.bold(`REST API en el puerto ${config.port}`));
});
