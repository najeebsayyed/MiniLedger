import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { loansRouter } from './modules/loans/loans.routes.js';
import { summaryRouter } from './modules/summary/summary.routes.js';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  const allowedOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['*'];

  app.use(
    cors({
      origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
      credentials: true,
    })
  );

  // Request ID
  app.use(requestIdMiddleware);

  // Body parser with size limit (supports base64 profile pictures and attachments)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Health endpoint
  app.get(['/healthz', '/health'], (req, res) => {
    res.status(200).json({ data: { status: 'ok', service: 'miniledger-api' } });
  });

  // API v1 routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/loans', loansRouter);
  app.use('/api/v1/summary', summaryRouter);

  // 404 Handler
  app.use(notFound);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
