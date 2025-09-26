/**
 * Backend Configuration
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const config = {
  app: {
    name: 'GutSafe',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
  },

  server: {
    port: parseInt(process.env.PORT) || 3001,
    host: process.env.HOST || '0.0.0.0',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:9001',
      'https://gutsafe.app',
    ],
    rateLimit: {
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    },
    cors: {
      credentials: true,
      origin: true,
    },
  },

  database: {
    type: process.env.DB_TYPE || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gutsafe',
    username: process.env.DB_USER || 'gutsafe',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT) || 60000,
      createTimeoutMillis: parseInt(process.env.DB_POOL_CREATE_TIMEOUT) || 30000,
      destroyTimeoutMillis: parseInt(process.env.DB_POOL_DESTROY_TIMEOUT) || 5000,
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 600000,
    },
    logging: process.env.DB_LOGGING === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },

  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    },
    session: {
      secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
      maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  external: {
    openFoodFacts: {
      baseUrl: process.env.OPENFOODFACTS_BASE_URL || 'https://world.openfoodfacts.org/api/v0',
      timeout: parseInt(process.env.OPENFOODFACTS_TIMEOUT) || 10000,
    },
    usda: {
      baseUrl: process.env.USDA_BASE_URL || 'https://api.nal.usda.gov/fdc/v1',
      apiKey: process.env.USDA_API_KEY || '',
      timeout: parseInt(process.env.USDA_TIMEOUT) || 10000,
    },
    spoonacular: {
      baseUrl: process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com',
      apiKey: process.env.SPOONACULAR_API_KEY || '',
      timeout: parseInt(process.env.SPOONACULAR_TIMEOUT) || 10000,
    },
    googleVision: {
      baseUrl: process.env.GOOGLE_VISION_BASE_URL || 'https://vision.googleapis.com/v1',
      apiKey: process.env.GOOGLE_VISION_API_KEY || '',
      timeout: parseInt(process.env.GOOGLE_VISION_TIMEOUT) || 15000,
    },
  },

  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    local: {
      uploadPath: process.env.UPLOAD_PATH || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ],
    },
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0,
    ttl: parseInt(process.env.REDIS_TTL) || 3600, // 1 hour
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@gutsafe.app',
    templates: {
      welcome: 'welcome',
      passwordReset: 'password-reset',
      emailVerification: 'email-verification',
    },
  },

  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.NODE_ENV || 'development',
    },
    prometheus: {
      enabled: process.env.PROMETHEUS_ENABLED === 'true',
      port: parseInt(process.env.PROMETHEUS_PORT) || 9090,
    },
  },

  features: {
    registration: process.env.FEATURE_REGISTRATION !== 'false',
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
    passwordReset: process.env.FEATURE_PASSWORD_RESET !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',
    notifications: process.env.FEATURE_NOTIFICATIONS !== 'false',
    dataExport: process.env.FEATURE_DATA_EXPORT !== 'false',
  },

  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15 * 60 * 1000, // 15 minutes
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000,
    enabled: process.env.CACHE_ENABLED !== 'false',
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'SESSION_SECRET',
];

if (config.app.environment === 'production') {
  requiredEnvVars.push('DB_PASSWORD', 'SENTRY_DSN');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

module.exports = { config };
