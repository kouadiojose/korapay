import knex from 'knex';
import { config } from './index';

const db = knex({
  client: 'pg',
  connection: config.db.url,
  pool: {
    min: 2,
    max: config.app.isProduction ? 20 : 10,
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
