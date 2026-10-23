"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./lib/prisma");
const app = (0, app_1.createApp)();
async function startServer() {
    try {
        // Verify database connection
        await prisma_1.prisma.$connect();
        console.log('✅ Connected to PostgreSQL database successfully.');
        const server = app.listen(env_1.config.port, () => {
            console.log(`🚀 StockFlow iPDS Backend running on port ${env_1.config.port} (${env_1.config.nodeEnv})`);
            console.log(`📡 Health check available at: http://localhost:${env_1.config.port}/api/health`);
        });
        const shutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
            server.close(async () => {
                await prisma_1.prisma.$disconnect();
                console.log('🔒 Database connection closed. Exiting process.');
                process.exit(0);
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }
    catch (err) {
        console.error('❌ Failed to start StockFlow server:', err);
        process.exit(1);
    }
}
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
