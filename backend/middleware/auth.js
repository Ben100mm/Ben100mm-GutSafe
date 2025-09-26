/**
 * Authentication Middleware
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { logger } = require('../utils/logger');
const { databaseConnection } = require('../database/connection');

/**
 * JWT Authentication Middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization header provided',
        requestId: req.id,
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
        requestId: req.id,
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.auth.jwt.secret);
    
    // Check if user exists and is active
    const user = await databaseConnection.queryOne(
      'SELECT id, email, first_name, last_name, is_active, email_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
        requestId: req.id,
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account is deactivated',
        requestId: req.id,
      });
    }

    // Check if session is still valid (optional - for additional security)
    const session = await databaseConnection.queryOne(
      'SELECT id FROM user_sessions WHERE user_id = $1 AND is_active = true AND expires_at > NOW()',
      [user.id]
    );

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session expired',
        requestId: req.id,
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      emailVerified: user.email_verified,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        requestId: req.id,
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
        requestId: req.id,
      });
    }

    logger.error('Authentication middleware error', 'Auth', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
      requestId: req.id,
    });
  }
};

/**
 * Optional Authentication Middleware
 * Allows requests to proceed even if no token is provided
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, config.auth.jwt.secret);
    
    const user = await databaseConnection.queryOne(
      'SELECT id, email, first_name, last_name, is_active, email_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        emailVerified: user.email_verified,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just set user to null and continue
    req.user = null;
    next();
  }
};

/**
 * Admin Authentication Middleware
 * Requires user to have admin role
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
    });

    // Check if user has admin role
    const userProfile = await databaseConnection.queryOne(
      'SELECT settings FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );

    const isAdmin = userProfile?.settings?.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
        requestId: req.id,
      });
    }

    next();
  } catch (error) {
    logger.error('Admin authentication middleware error', 'Auth', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Admin authentication failed',
      requestId: req.id,
    });
  }
};

/**
 * Email Verification Middleware
 * Requires user to have verified email
 */
const emailVerificationMiddleware = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await authMiddleware(req, res, (err) => {
      if (err) return next(err);
    });

    if (!req.user.emailVerified) {
      return res.status(403).json({
        error: 'Email Verification Required',
        message: 'Please verify your email address to access this resource',
        requestId: req.id,
      });
    }

    next();
  } catch (error) {
    logger.error('Email verification middleware error', 'Auth', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Email verification check failed',
      requestId: req.id,
    });
  }
};

/**
 * Rate Limiting Middleware for Login Attempts
 */
const loginRateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login_attempts:${ip}`;
  
  // This would typically use Redis for distributed rate limiting
  // For now, we'll implement a simple in-memory solution
  if (!global.loginAttempts) {
    global.loginAttempts = new Map();
  }

  const attempts = global.loginAttempts.get(key) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };
  
  if (Date.now() > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = Date.now() + 15 * 60 * 1000;
  }

  if (attempts.count >= config.security.maxLoginAttempts) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((attempts.resetTime - Date.now()) / 1000),
      requestId: req.id,
    });
  }

  req.loginAttempts = attempts;
  next();
};

/**
 * API Key Authentication Middleware
 */
const apiKeyAuthMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'API key required',
        requestId: req.id,
      });
    }

    // Hash the API key for comparison
    const crypto = require('crypto');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const apiKeyRecord = await databaseConnection.queryOne(
      'SELECT ak.*, u.email FROM api_keys ak LEFT JOIN users u ON ak.user_id = u.id WHERE ak.key_hash = $1 AND ak.is_active = true AND (ak.expires_at IS NULL OR ak.expires_at > NOW())',
      [keyHash]
    );

    if (!apiKeyRecord) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API key',
        requestId: req.id,
      });
    }

    // Update last used timestamp
    await databaseConnection.execute(
      'UPDATE api_keys SET last_used = NOW() WHERE id = $1',
      [apiKeyRecord.id]
    );

    req.apiKey = {
      id: apiKeyRecord.id,
      userId: apiKeyRecord.user_id,
      name: apiKeyRecord.name,
      permissions: apiKeyRecord.permissions || [],
    };

    next();
  } catch (error) {
    logger.error('API key authentication middleware error', 'Auth', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'API key authentication failed',
      requestId: req.id,
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminAuthMiddleware,
  emailVerificationMiddleware,
  loginRateLimitMiddleware,
  apiKeyAuthMiddleware,
};
