import { config } from './config/env';
import colors from 'colors';
import server from './server';
import { DYNAMIC_MESSAGES } from './config/constants';

// Usar las configuraciones cargadas y validadas
server.listen(config.port, () => {
    console.log(colors.cyan.bold(DYNAMIC_MESSAGES.SERVER_START(config.port)));
});
