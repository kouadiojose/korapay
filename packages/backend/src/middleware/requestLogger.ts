import morgan from 'morgan';
import { config } from '../config';

const format = config.app.isProduction ? 'combined' : 'dev';

export const requestLogger = morgan(format, {
  skip: (_req, _res) => config.app.isTest,
});
