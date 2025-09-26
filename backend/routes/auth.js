/**
 * Authentication Routes
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { config } = require('../config');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
} = require('../middleware/validation');
const { loginRateLimitMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateUserRegistration, asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await databaseConnection.queryOne(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'User with this email already exists',
      requestId: req.id,
    });
  }

  // Hash password
  const saltRounds = config.auth.bcrypt.saltRounds;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const userId = uuidv4();
  await databaseConnection.execute(
    `INSERT INTO users (id, email, password_hash, first_name, last_name, email_verification_token)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, email, passwordHash, firstName, lastName, emailVerificationToken]
  );

  // Create user profile
  await databaseConnection.execute(
    `INSERT INTO user_profiles (user_id, preferences, settings)
     VALUES ($1, $2, $3)`,
    [userId, '{}', '{}']
  );

  // Create gut profile
  await databaseConnection.execute(
    `INSERT INTO gut_profiles (user_id, conditions, preferences)
     VALUES ($1, $2, $3)`,
    [userId, '{}', '{}']
  );

  // TODO: Send verification email
  logger.logUserAction(userId, 'user_registered', { email });

  res.status(201).json({
    message: 'User registered successfully. Please check your email for verification.',
    userId,
    emailVerificationRequired: true,
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginRateLimitMiddleware, validateUserLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await databaseConnection.queryOne(
    'SELECT id, email, password_hash, first_name, last_name, is_active, email_verified, login_attempts, locked_until FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
      requestId: req.id,
    });
  }

  // Check if account is locked
  if (user.locked_until && user.locked_until > new Date()) {
    return res.status(423).json({
      error: 'Locked',
      message: 'Account is temporarily locked due to too many failed login attempts',
      requestId: req.id,
    });
  }

  // Check if account is active
  if (!user.is_active) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Account is deactivated',
      requestId: req.id,
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    // Increment login attempts
    const newAttempts = user.login_attempts + 1;
    const lockUntil = newAttempts >= config.security.maxLoginAttempts 
      ? new Date(Date.now() + config.security.lockoutDuration)
      : null;

    await databaseConnection.execute(
      'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
      [newAttempts, lockUntil, user.id]
    );

    logger.logSecurityEvent('failed_login_attempt', { 
      userId: user.id, 
      email, 
      attempts: newAttempts 
    });

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password',
      requestId: req.id,
    });
  }

  // Reset login attempts on successful login
  await databaseConnection.execute(
    'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate JWT tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    config.auth.jwt.secret,
    { expiresIn: config.auth.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    config.auth.jwt.secret,
    { expiresIn: config.auth.jwt.refreshExpiresIn }
  );

  // Create session
  const sessionId = uuidv4();
  const sessionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await databaseConnection.execute(
    `INSERT INTO user_sessions (id, user_id, token_hash, expires_at, device_info, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      sessionId,
      user.id,
      crypto.createHash('sha256').update(refreshToken).digest('hex'),
      sessionExpires,
      JSON.stringify({ userAgent: req.get('User-Agent') }),
      req.ip
    ]
  );

  logger.logUserAction(user.id, 'user_login', { email });

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: config.auth.jwt.expiresIn,
    },
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Refresh token is required',
      requestId: req.id,
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.auth.jwt.secret);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token type',
        requestId: req.id,
      });
    }

    // Check if session exists and is valid
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await databaseConnection.queryOne(
      'SELECT s.*, u.email, u.is_active FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token_hash = $1 AND s.is_active = true AND s.expires_at > NOW()',
      [tokenHash]
    );

    if (!session || !session.is_active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
        requestId: req.id,
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: session.user_id, email: session.email },
      config.auth.jwt.secret,
      { expiresIn: config.auth.jwt.expiresIn }
    );

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
      expiresIn: config.auth.jwt.expiresIn,
      requestId: req.id,
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
        requestId: req.id,
      });
    }

    throw error;
  }
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Invalidate refresh token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await databaseConnection.execute(
      'UPDATE user_sessions SET is_active = false WHERE token_hash = $1',
      [tokenHash]
    );
  }

  logger.logUserAction(req.user?.id, 'user_logout');

  res.json({
    message: 'Logout successful',
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', validateEmailVerification, asyncHandler(async (req, res) => {
  const { token } = req.body;

  // Find user with verification token
  const user = await databaseConnection.queryOne(
    'SELECT id, email_verified FROM users WHERE email_verification_token = $1',
    [token]
  );

  if (!user) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid verification token',
      requestId: req.id,
    });
  }

  if (user.email_verified) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email already verified',
      requestId: req.id,
    });
  }

  // Update user as verified
  await databaseConnection.execute(
    'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1',
    [user.id]
  );

  logger.logUserAction(user.id, 'email_verified');

  res.json({
    message: 'Email verified successfully',
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email is required',
      requestId: req.id,
    });
  }

  const user = await databaseConnection.queryOne(
    'SELECT id, email_verified FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User not found',
      requestId: req.id,
    });
  }

  if (user.email_verified) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email already verified',
      requestId: req.id,
    });
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  await databaseConnection.execute(
    'UPDATE users SET email_verification_token = $1 WHERE id = $2',
    [emailVerificationToken, user.id]
  );

  // TODO: Send verification email

  logger.logUserAction(user.id, 'verification_email_resent');

  res.json({
    message: 'Verification email sent',
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', validatePasswordResetRequest, asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await databaseConnection.queryOne(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      message: 'If an account with that email exists, a password reset link has been sent',
      requestId: req.id,
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await databaseConnection.execute(
    'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
    [resetToken, resetExpires, user.id]
  );

  // TODO: Send password reset email

  logger.logUserAction(user.id, 'password_reset_requested');

  res.json({
    message: 'If an account with that email exists, a password reset link has been sent',
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password', validatePasswordReset, asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Find user with valid reset token
  const user = await databaseConnection.queryOne(
    'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
    [token]
  );

  if (!user) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid or expired reset token',
      requestId: req.id,
    });
  }

  // Hash new password
  const saltRounds = config.auth.bcrypt.saltRounds;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Update password and clear reset token
  await databaseConnection.execute(
    'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
    [passwordHash, user.id]
  );

  // Invalidate all sessions
  await databaseConnection.execute(
    'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
    [user.id]
  );

  logger.logUserAction(user.id, 'password_reset_completed');

  res.json({
    message: 'Password reset successfully',
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', asyncHandler(async (req, res) => {
  const user = await databaseConnection.queryOne(
    'SELECT id, email, first_name, last_name, email_verified, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User not found',
      requestId: req.id,
    });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    },
    requestId: req.id,
  });
}));

module.exports = router;
