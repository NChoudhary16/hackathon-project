import { createApp } from './app';
import { config } from './config/env';
import { prisma } from './lib/prisma';

const app = createApp();

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully.');

    const server = app.listen(config.port, () => {
      console.log(`🚀 StockFlow iPDS Backend running on port ${config.port} (${config.nodeEnv})`);
      console.log(`📡 Health check available at: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔒 Database connection closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Failed to start StockFlow server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
