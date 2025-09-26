/**
 * GutSafe Backend Server
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { config } = require('./config');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');
const { validateRequest } = require('./middleware/validation');
const { logger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/foods');
const scanRoutes = require('./routes/scans');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');

// Import database
const { databaseManager } = require('./database/connection');

class GutSafeServer {
  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.server.allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.server.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.app.environment !== 'test') {
      this.app.use(morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim(), 'HTTP'),
        },
      }));
    }

    // Request ID for tracing
    this.app.use((req, res, next) => {
      req.id = require('crypto').randomUUID();
      res.setHeader('X-Request-ID', req.id);
      next();
    });
  }

  setupRoutes() {
    // Health check (no auth required)
    this.app.use('/health', healthRoutes);

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', authMiddleware, userRoutes);
    this.app.use('/api/foods', authMiddleware, foodRoutes);
    this.app.use('/api/scans', authMiddleware, scanRoutes);
    this.app.use('/api/analytics', authMiddleware, analyticsRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'GutSafe API',
        version: config.app.version,
        environment: config.app.environment,
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        requestId: req.id,
      });
    });
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Connect to database
      await databaseManager.connect();
      logger.info('Database connected successfully', 'Server');

      // Start server
      this.server = this.app.listen(this.port, () => {
        logger.info(`GutSafe server running on port ${this.port}`, 'Server', {
          environment: config.app.environment,
          port: this.port,
        });
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      logger.error('Failed to start server', 'Server', error);
      process.exit(1);
    }
  }

  async shutdown() {
    logger.info('Shutting down server...', 'Server');
    
    if (this.server) {
      this.server.close(async () => {
        try {
          await databaseManager.disconnect();
          logger.info('Server shutdown complete', 'Server');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', 'Server', error);
          process.exit(1);
        }
      });
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new GutSafeServer();
  server.start().catch((error) => {
    logger.error('Failed to start server', 'Server', error);
    process.exit(1);
  });
}

module.exports = GutSafeServer;
