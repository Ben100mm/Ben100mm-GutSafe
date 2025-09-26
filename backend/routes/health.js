/**
 * Health Check Routes
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { config } = require('../config');

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: config.app.version,
    environment: config.app.environment,
    requestId: req.id,
  });
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with dependencies
 * @access  Public
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const healthChecks = {
    server: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: config.app.version,
      environment: config.app.environment,
    },
    database: await checkDatabaseHealth(),
    external: await checkExternalServicesHealth(),
  };

  const overallStatus = Object.values(healthChecks).every(check => 
    check.status === 'healthy'
  ) ? 'healthy' : 'unhealthy';

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks: healthChecks,
    requestId: req.id,
  });
}));

/**
 * @route   GET /health/ready
 * @desc    Readiness check for Kubernetes
 * @access  Public
 */
router.get('/ready', asyncHandler(async (req, res) => {
  try {
    // Check if database is accessible
    await databaseConnection.query('SELECT 1');
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    logger.error('Readiness check failed', 'Health', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message,
      requestId: req.id,
    });
  }
}));

/**
 * @route   GET /health/live
 * @desc    Liveness check for Kubernetes
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requestId: req.id,
  });
});

/**
 * @route   GET /health/metrics
 * @desc    Application metrics
 * @access  Public
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    version: config.app.version,
    environment: config.app.environment,
    database: await getDatabaseMetrics(),
    requests: getRequestMetrics(),
  };

  res.json({
    metrics,
    requestId: req.id,
  });
});

/**
 * Check database health
 */
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await databaseConnection.query('SELECT 1');
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      type: config.database.type,
    };
  } catch (error) {
    logger.error('Database health check failed', 'Health', error);
    return {
      status: 'unhealthy',
      error: error.message,
      type: config.database.type,
    };
  }
}

/**
 * Check external services health
 */
async function checkExternalServicesHealth() {
  const services = {};

  // Check OpenFoodFacts API
  try {
    const response = await fetch(`${config.external.openFoodFacts.baseUrl}/product/test.json`, {
      signal: AbortSignal.timeout(5000),
    });
    services.openFoodFacts = {
      status: response.ok ? 'healthy' : 'unhealthy',
      statusCode: response.status,
    };
  } catch (error) {
    services.openFoodFacts = {
      status: 'unhealthy',
      error: error.message,
    };
  }

  // Check USDA API (if API key is configured)
  if (config.external.usda.apiKey) {
    try {
      const response = await fetch(
        `${config.external.usda.baseUrl}/foods/search?query=test&api_key=${config.external.usda.apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      services.usda = {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
      };
    } catch (error) {
      services.usda = {
        status: 'unhealthy',
        error: error.message,
      };
    }
  } else {
    services.usda = {
      status: 'not_configured',
      message: 'API key not provided',
    };
  }

  // Check Spoonacular API (if API key is configured)
  if (config.external.spoonacular.apiKey) {
    try {
      const response = await fetch(
        `${config.external.spoonacular.baseUrl}/food/products/search?query=test&apiKey=${config.external.spoonacular.apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      services.spoonacular = {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
      };
    } catch (error) {
      services.spoonacular = {
        status: 'unhealthy',
        error: error.message,
      };
    }
  } else {
    services.spoonacular = {
      status: 'not_configured',
      message: 'API key not provided',
    };
  }

  return services;
}

/**
 * Get database metrics
 */
async function getDatabaseMetrics() {
  try {
    const [
      userCount,
      foodCount,
      scanCount,
      symptomCount
    ] = await Promise.all([
      databaseConnection.queryOne('SELECT COUNT(*) as count FROM users'),
      databaseConnection.queryOne('SELECT COUNT(*) as count FROM food_items'),
      databaseConnection.queryOne('SELECT COUNT(*) as count FROM scan_history'),
      databaseConnection.queryOne('SELECT COUNT(*) as count FROM gut_symptoms'),
    ]);

    return {
      users: parseInt(userCount.count),
      foods: parseInt(foodCount.count),
      scans: parseInt(scanCount.count),
      symptoms: parseInt(symptomCount.count),
    };
  } catch (error) {
    logger.error('Failed to get database metrics', 'Health', error);
    return {
      error: error.message,
    };
  }
}

/**
 * Get request metrics (simplified)
 */
function getRequestMetrics() {
  // In production, you'd want to use a proper metrics library like prom-client
  return {
    totalRequests: global.requestCount || 0,
    activeConnections: global.activeConnections || 0,
  };
}

module.exports = router;
