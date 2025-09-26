/**
 * Error Handling Middleware
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { logger } = require('../utils/logger');
const { config } = require('../config');

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred', 'ErrorHandler', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Database connection failed';
    error = { message, statusCode: 503 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests';
    error = { message, statusCode: 429 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 413 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't leak error details in production
  const response = {
    error: getErrorName(statusCode),
    message: config.app.environment === 'production' && statusCode === 500 
      ? 'Internal Server Error' 
      : message,
    requestId: req.id,
  };

  // Include stack trace in development
  if (config.app.environment === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    requestId: req.id,
  });
};

/**
 * Async Error Handler Wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Get error name from status code
 */
const getErrorName = (statusCode) => {
  const errorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    413: 'Payload Too Large',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return errorNames[statusCode] || 'Error';
};

/**
 * Validation Error Handler
 */
const validationErrorHandler = (errors) => {
  const formattedErrors = errors.array().map(error => ({
    field: error.path,
    message: error.msg,
    value: error.value,
  }));

  return {
    error: 'Validation Error',
    message: 'Invalid input data',
    details: formattedErrors,
  };
};

/**
 * Database Error Handler
 */
const databaseErrorHandler = (err) => {
  let message = 'Database error occurred';
  let statusCode = 500;

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        message = 'Duplicate entry';
        statusCode = 409;
        break;
      case '23503': // Foreign key violation
        message = 'Referenced record not found';
        statusCode = 400;
        break;
      case '23502': // Not null violation
        message = 'Required field missing';
        statusCode = 400;
        break;
      case '23514': // Check violation
        message = 'Invalid data value';
        statusCode = 400;
        break;
      case '42P01': // Undefined table
        message = 'Database table not found';
        statusCode = 500;
        break;
      case '42703': // Undefined column
        message = 'Database column not found';
        statusCode = 500;
        break;
      default:
        message = err.message || 'Database error';
    }
  }

  return { message, statusCode };
};

/**
 * External API Error Handler
 */
const externalApiErrorHandler = (err) => {
  let message = 'External API error';
  let statusCode = 502;

  if (err.response) {
    statusCode = err.response.status;
    message = err.response.data?.message || err.message;
  } else if (err.request) {
    message = 'External API request failed';
    statusCode = 503;
  }

  return { message, statusCode };
};

/**
 * File Upload Error Handler
 */
const fileUploadErrorHandler = (err) => {
  let message = 'File upload error';
  let statusCode = 400;

  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      statusCode = 413;
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      statusCode = 400;
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      statusCode = 400;
      break;
    case 'LIMIT_PART_COUNT':
      message = 'Too many parts';
      statusCode = 400;
      break;
    case 'LIMIT_FIELD_KEY':
      message = 'Field name too long';
      statusCode = 400;
      break;
    case 'LIMIT_FIELD_VALUE':
      message = 'Field value too long';
      statusCode = 400;
      break;
    case 'LIMIT_FIELD_COUNT':
      message = 'Too many fields';
      statusCode = 400;
      break;
    default:
      message = err.message || 'File upload error';
  }

  return { message, statusCode };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorHandler,
  databaseErrorHandler,
  externalApiErrorHandler,
  fileUploadErrorHandler,
};
