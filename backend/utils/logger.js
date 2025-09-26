/**
 * Logger Utility
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { config } = require('../config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
];

// Add file transports in production
if (config.app.environment === 'production') {
  // Error log file
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxSize: '20m',
      maxFiles: '14d',
    })
  );

  // Combined log file
  transports.push(
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxSize: '20m',
      maxFiles: '14d',
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.app.debug ? 'debug' : 'info',
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add custom methods for structured logging
logger.logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id,
  });
};

logger.logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

logger.logDatabaseQuery = (query, params, duration) => {
  if (config.database.logging) {
    logger.debug('Database Query', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: `${duration}ms`,
    });
  }
};

logger.logExternalApiCall = (service, endpoint, method, statusCode, duration) => {
  logger.info('External API Call', {
    service,
    endpoint,
    method,
    statusCode,
    duration: `${duration}ms`,
  });
};

logger.logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

logger.logBusinessEvent = (event, details = {}) => {
  logger.info('Business Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

logger.logPerformance = (operation, duration, details = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...details,
  });
};

logger.logUserAction = (userId, action, details = {}) => {
  logger.info('User Action', {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

logger.logSystemEvent = (event, details = {}) => {
  logger.info('System Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Create child logger with default context
logger.child = (defaultContext) => {
  return {
    error: (message, context = {}) => logger.error(message, { ...defaultContext, ...context }),
    warn: (message, context = {}) => logger.warn(message, { ...defaultContext, ...context }),
    info: (message, context = {}) => logger.info(message, { ...defaultContext, ...context }),
    http: (message, context = {}) => logger.http(message, { ...defaultContext, ...context }),
    debug: (message, context = {}) => logger.debug(message, { ...defaultContext, ...context }),
    logRequest: (req, res, responseTime) => logger.logRequest(req, res, responseTime),
    logError: (error, context = {}) => logger.logError(error, { ...defaultContext, ...context }),
    logDatabaseQuery: (query, params, duration) => logger.logDatabaseQuery(query, params, duration),
    logExternalApiCall: (service, endpoint, method, statusCode, duration) => 
      logger.logExternalApiCall(service, endpoint, method, statusCode, duration),
    logSecurityEvent: (event, details = {}) => logger.logSecurityEvent(event, { ...defaultContext, ...details }),
    logBusinessEvent: (event, details = {}) => logger.logBusinessEvent(event, { ...defaultContext, ...details }),
    logPerformance: (operation, duration, details = {}) => 
      logger.logPerformance(operation, duration, { ...defaultContext, ...details }),
    logUserAction: (userId, action, details = {}) => 
      logger.logUserAction(userId, action, { ...defaultContext, ...details }),
    logSystemEvent: (event, details = {}) => logger.logSystemEvent(event, { ...defaultContext, ...details }),
  };
};

module.exports = { logger };
