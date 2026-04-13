import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

import authRoutes from './modules/auth/auth.routes';
import merchantRoutes from './modules/merchants/merchant.routes';
import walletRoutes from './modules/wallets/wallet.routes';
import paymentRoutes from './modules/payments/payment.routes';
import transferRoutes from './modules/transfers/transfer.routes';
import payoutRoutes from './modules/payouts/payout.routes';
import webhookRoutes from './modules/webhooks/webhook.routes';
import kycRoutes from './modules/kyc/kyc.routes';
import settlementRoutes from './modules/settlements/settlement.routes';
import checkoutRoutes from './modules/checkout/checkout.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.app.isProduction
      ? config.app.frontendUrl
      : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      service: 'korapay-api',
      environment: config.app.env,
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/merchants', merchantRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1', paymentRoutes); // charges + transactions + callbacks
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/payouts', payoutRoutes);
app.use('/api/v1/merchants/webhooks', webhookRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/settlements', settlementRoutes);
app.use('/api/v1', checkoutRoutes); // checkout routes
app.use('/api/v1/admin', adminRoutes);

// 404 handler for unmatched routes
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// Global error handler
app.use(errorHandler);

export default app;
