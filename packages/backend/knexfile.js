require('dotenv').config();

const config = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://korapay:password@localhost:5432/korapay_dev',
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './dist/db/migrations',
    },
    seeds: {
      directory: './dist/db/seeds',
    },
    pool: {
      min: 2,
      max: 20,
    },
  },
};

module.exports = config;
