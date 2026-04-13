import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config';

const PORT = config.app.port;

const server = app.listen(PORT, () => {
  console.log(`Korapay API server running on port ${PORT} [${config.app.env}]`);
  console.log(`Health check: ${config.app.url}/health`);
});

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
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

export default server;
