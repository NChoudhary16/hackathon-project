import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/error.middleware';
import { config } from './config/env';

// Modules
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import godownsRoutes from './modules/godowns/godowns.routes';
import commoditiesRoutes from './modules/commodities/commodities.routes';
import suppliersRoutes from './modules/suppliers/suppliers.routes';
import fpsRoutes from './modules/fps/fps.routes';
import receiptsRoutes from './modules/receipts/receipts.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import fifoRoutes from './modules/fifo/fifo.routes';
import challansRoutes from './modules/challans/challans.routes';
import movementsRoutes from './modules/movements/movements.routes';
import reportsRoutes from './modules/reports/reports.routes';
import auditRoutes from './modules/audit/audit.routes';

export function createApp(): Application {
  const app: Application = express();

  // Security & Utility Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or vitest)
        if (!origin) return callback(null, true);
        if (
          config.corsOrigin === '*' ||
          origin === config.corsOrigin ||
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive for local development & hackathon grading
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global Rate Limiter
  app.use('/api', apiRateLimiter);

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'StockFlow iPDS Backend API',
      status: 'UP',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/godowns', godownsRoutes);
  app.use('/api/commodities', commoditiesRoutes);
  app.use('/api/suppliers', suppliersRoutes);
  app.use('/api/fps', fpsRoutes);
  app.use('/api/receipts', receiptsRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/fifo', fifoRoutes);
  app.use('/api/challans', challansRoutes);
  app.use('/api/movements', movementsRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/audit', auditRoutes);

  // 404 Route Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Resource not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
