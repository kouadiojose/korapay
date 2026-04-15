import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config';
import db from './config/database';

const PORT = config.app.port;

async function start() {
  // Run database migrations before starting the server
  try {
    console.log('Running database migrations...');
    const [batchNo, migrations] = await db.migrate.latest();
    if (migrations.length > 0) {
      console.log(`Migration batch ${batchNo}: ${migrations.length} migrations applied`);
      migrations.forEach((m: string) => console.log(`  - ${m}`));
    } else {
      console.log('Database is up to date (no pending migrations)');
    }
  } catch (err) {
    console.error('Migration failed:', (err as Error).message);
    console.error('Server will start anyway - some features may not work');
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Korapay API server running on port ${PORT} [${config.app.env}]`);
    console.log(`Health check: ${config.app.url}/health`);
  });

  // Graceful shutdown
  function shutdown(signal: string): void {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
      db.destroy().then(() => {
        console.log('Database connections closed');
        process.exit(0);
      });
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}

start();
