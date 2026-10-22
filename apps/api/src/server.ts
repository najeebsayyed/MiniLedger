import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/client.js';

const app = createApp();

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`\n🚀 MiniLedger API running on http://0.0.0.0:${env.PORT}`);
  console.log(`📡 Local dev: http://localhost:${env.PORT}/api/v1`);
  console.log(`⚙️  Environment: ${env.NODE_ENV}`);
  console.log(`🔒 Mock OTP mode: ${env.OTP_MODE}\n`);
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('📦 Database connections closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database teardown:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
