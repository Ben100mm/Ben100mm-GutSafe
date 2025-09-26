/**
 * Enhanced Security Middleware
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { config } = require('../config');
const { logger } = require('../utils/logger');

/**
 * Security headers middleware
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: { policy: "require-corp" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

/**
 * CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.server.allowedOrigins;
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', 'Security', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Request-ID',
    'X-CSRF-Token',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
  ],
  maxAge: 86400, // 24 hours
};

/**
 * General rate limiting
 */
const generalRateLimit = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.maxRequests,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
  onLimitReached: (req, res, options) => {
    logger.warn('Rate limit reached', 'Security', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });
  },
});

/**
 * Strict rate limiting for sensitive endpoints
 */
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests to sensitive endpoint, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  onLimitReached: (req, res, options) => {
    logger.warn('Strict rate limit reached', 'Security', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });
  },
});

/**
 * Login rate limiting
 */
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return `login:${req.ip}`;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('Login rate limit reached', 'Security', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email,
    });
  },
});

/**
 * API rate limiting
 */
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 API calls per 15 minutes
  message: {
    error: 'Too Many Requests',
    message: 'API rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    return `api:${userId}:${req.ip}`;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('API rate limit reached', 'Security', {
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });
  },
});

/**
 * Scan rate limiting
 */
const scanRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 scans per minute
  message: {
    error: 'Too Many Requests',
    message: 'Scan rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    return `scan:${userId}`;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('Scan rate limit reached', 'Security', {
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
    });
  },
});

/**
 * Upload rate limiting
 */
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    error: 'Too Many Requests',
    message: 'Upload rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    return `upload:${userId}`;
  },
  onLimitReached: (req, res, options) => {
    logger.warn('Upload rate limit reached', 'Security', {
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
    });
  },
});

/**
 * Request ID middleware
 */
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || require('uuid').v4();
  res.set('X-Request-ID', req.id);
  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP request', 'Security', logData);
    } else {
      logger.info('HTTP request', 'Security', logData);
    }
  });

  next();
};

/**
 * Input sanitization middleware
 */
const inputSanitizer = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Basic sanitization - remove potentially dangerous characters
        sanitized[key] = value
          .replace(/[<>]/g, '') // Remove potential HTML tags
          .replace(/['"]/g, '') // Remove quotes
          .replace(/[;]/g, '') // Remove semicolons
          .replace(/[&]/g, '&amp;') // Escape ampersands
          .replace(/[\\]/g, '') // Remove backslashes
          .replace(/[/]/g, '') // Remove forward slashes
          .replace(/[()]/g, '') // Remove parentheses
          .replace(/[[\]]/g, '') // Remove brackets
          .replace(/[{}]/g, '') // Remove braces
          .replace(/[|]/g, '') // Remove pipes
          .replace(/[`]/g, '') // Remove backticks
          .replace(/[~]/g, '') // Remove tildes
          .replace(/[!]/g, '') // Remove exclamation marks
          .replace(/[@]/g, '') // Remove at symbols
          .replace(/[#]/g, '') // Remove hash symbols
          .replace(/[$]/g, '') // Remove dollar signs
          .replace(/[%]/g, '') // Remove percent signs
          .replace(/[\^]/g, '') // Remove carets
          .replace(/[+]/g, '') // Remove plus signs
          .replace(/[=]/g, '') // Remove equals signs
          .replace(/[?]/g, '') // Remove question marks
          .replace(/[,]/g, '') // Remove commas
          .replace(/[.]/g, '') // Remove periods
          .trim();
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  };

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * CSRF protection middleware
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API key authenticated requests
  if (req.apiKey) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid CSRF token',
      requestId: req.id,
    });
  }

  next();
};

/**
 * Security audit middleware
 */
const securityAudit = (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i,
  ];

  const checkSuspiciousContent = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          logger.warn('Suspicious content detected', 'Security', {
            requestId: req.id,
            ip: req.ip,
            pattern: pattern.source,
            path,
            content: obj.substring(0, 100),
          });
          return true;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (checkSuspiciousContent(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check request body and query parameters
  if (checkSuspiciousContent(req.body, 'body') || checkSuspiciousContent(req.query, 'query')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Suspicious content detected',
      requestId: req.id,
    });
  }

  next();
};

module.exports = {
  securityHeaders,
  corsOptions,
  generalRateLimit,
  strictRateLimit,
  loginRateLimit,
  apiRateLimit,
  scanRateLimit,
  uploadRateLimit,
  requestId,
  requestLogger,
  inputSanitizer,
  csrfProtection,
  securityAudit,
};
