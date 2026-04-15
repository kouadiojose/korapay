import knex from 'knex';
import { config } from './index';

const connectionConfig = config.app.isProduction
  ? {
      connectionString: config.db.url,
      ssl: { rejectUnauthorized: false },
    }
  : config.db.url;

const db = knex({
  client: 'pg',
  connection: connectionConfig,
  pool: {
    min: 0,
    max: config.app.isProduction ? 20 : 10,
    acquireTimeoutMillis: 30000,
  },
  migrations: {
    directory: config.app.isProduction
      ? './dist/db/migrations'
      : './src/db/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: config.app.isProduction
      ? './dist/db/seeds'
      : './src/db/seeds',
    extension: 'ts',
  },
});

export default db;
