import { config } from './config/env';
import colors from 'colors';
import server from './server';
import { dynamicMessages } from './config/messages';

// Usar las configuraciones cargadas y validadas
server.listen(config.port, () => {
    console.log(colors.cyan.bold(dynamicMessages.serverStart(config.port)));
});
