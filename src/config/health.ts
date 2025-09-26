/**
 * Configuration Health Monitoring System
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 *
 * Comprehensive health monitoring for configuration and system status.
 */

import { getBuildConfig, detectBuildEnvironment } from './build';
import { config } from './environment';
import {
  secretManager,
  validateApiKey,
  validateJwtSecret,
  validateEncryptionKey,
} from './secrets';

// Health check result types
export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  duration?: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  environment: string;
  version: string;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

// Health check categories
export type HealthCheckCategory =
  | 'configuration'
  | 'secrets'
  | 'database'
  | 'api'
  | 'security'
  | 'monitoring'
  | 'performance'
  | 'dependencies';

// Health check interface
export interface HealthCheck {
  name: string;
  category: HealthCheckCategory;
  check: () => Promise<HealthCheckResult> | HealthCheckResult;
  critical: boolean;
  timeout?: number;
}

// Configuration health checks
const configurationChecks: HealthCheck[] = [
  {
    name: 'Environment Variables',
    category: 'configuration',
    critical: true,
    check: () => {
      const startTime = Date.now();
      try {
        const requiredVars = [
          'NODE_ENV',
          'REACT_APP_API_BASE_URL',
          'REACT_APP_API_KEY',
          'REACT_APP_API_SECRET',
          'REACT_APP_JWT_SECRET',
          'REACT_APP_SESSION_KEY',
          'REACT_APP_DB_ENCRYPTION_KEY',
        ];

        const missing = requiredVars.filter((varName) => !process.env[varName]);

        if (missing.length > 0) {
          return {
            name: 'Environment Variables',
            status: 'unhealthy',
            message: `Missing required environment variables: ${missing.join(', ')}`,
            details: { missing },
            timestamp: new Date(),
            duration: Date.now() - startTime,
          };
        }

        return {
          name: 'Environment Variables',
          status: 'healthy',
          message: 'All required environment variables are present',
          details: { count: requiredVars.length },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'Environment Variables',
          status: 'unhealthy',
          message: `Environment variable check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },

  {
    name: 'Configuration Validation',
    category: 'configuration',
    critical: true,
    check: () => {
      const startTime = Date.now();
      try {
        // Test configuration access
        const apiUrl = config.api.baseUrl;
        const isDebug = config.app.debug;

        return {
          name: 'Configuration Validation',
          status: 'healthy',
          message: 'Configuration is valid and accessible',
          details: { apiUrl, isDebug },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'Configuration Validation',
          status: 'unhealthy',
          message: `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },
];

// Secret health checks
const secretChecks: HealthCheck[] = [
  {
    name: 'API Key Validation',
    category: 'secrets',
    critical: true,
    check: () => {
      const startTime = Date.now();
      try {
        const apiKey = process.env['REACT_APP_API_KEY'];
        if (!apiKey) {
          return {
            name: 'API Key Validation',
            status: 'unhealthy',
            message: 'API key is missing',
            timestamp: new Date(),
            duration: Date.now() - startTime,
          };
        }

        const isValid = validateApiKey(apiKey);
        const strength = secretManager.calculateSecretStrength
          ? secretManager.calculateSecretStrength(apiKey)
          : 0;

        return {
          name: 'API Key Validation',
          status: isValid ? 'healthy' : 'unhealthy',
          message: isValid
            ? 'API key is valid'
            : 'API key does not meet security requirements',
          details: { strength, length: apiKey.length },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'API Key Validation',
          status: 'unhealthy',
          message: `API key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },

  {
    name: 'JWT Secret Validation',
    category: 'secrets',
    critical: true,
    check: () => {
      const startTime = Date.now();
      try {
        const jwtSecret = process.env['REACT_APP_JWT_SECRET'];
        if (!jwtSecret) {
          return {
            name: 'JWT Secret Validation',
            status: 'unhealthy',
            message: 'JWT secret is missing',
            timestamp: new Date(),
            duration: Date.now() - startTime,
          };
        }

        const isValid = validateJwtSecret(jwtSecret);
        const strength = secretManager.calculateSecretStrength
          ? secretManager.calculateSecretStrength(jwtSecret)
          : 0;

        return {
          name: 'JWT Secret Validation',
          status: isValid ? 'healthy' : 'unhealthy',
          message: isValid
            ? 'JWT secret is valid'
            : 'JWT secret does not meet security requirements',
          details: { strength, length: jwtSecret.length },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'JWT Secret Validation',
          status: 'unhealthy',
          message: `JWT secret validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },

  {
    name: 'Database Encryption Key Validation',
    category: 'secrets',
    critical: true,
    check: () => {
      const startTime = Date.now();
      try {
        const dbKey = process.env['REACT_APP_DB_ENCRYPTION_KEY'];
        if (!dbKey) {
          return {
            name: 'Database Encryption Key Validation',
            status: 'unhealthy',
            message: 'Database encryption key is missing',
            timestamp: new Date(),
            duration: Date.now() - startTime,
          };
        }

        const isValid = validateEncryptionKey(dbKey);
        const strength = secretManager.calculateSecretStrength
          ? secretManager.calculateSecretStrength(dbKey)
          : 0;

        return {
          name: 'Database Encryption Key Validation',
          status: isValid ? 'healthy' : 'unhealthy',
          message: isValid
            ? 'Database encryption key is valid'
            : 'Database encryption key does not meet security requirements',
          details: { strength, length: dbKey.length },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'Database Encryption Key Validation',
          status: 'unhealthy',
          message: `Database encryption key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },
];

// API health checks
const apiChecks: HealthCheck[] = [
  {
    name: 'API Configuration',
    category: 'api',
    critical: true,
    check: () => {
      const startTime = Date.now();
      try {
        const apiUrl = config.api.baseUrl;
        const hasApiKey = !!config.api.key;
        const hasApiSecret = !!config.api.secret;

        if (!apiUrl || !hasApiKey || !hasApiSecret) {
          return {
            name: 'API Configuration',
            status: 'unhealthy',
            message: 'API configuration is incomplete',
            details: { apiUrl, hasApiKey, hasApiSecret },
            timestamp: new Date(),
            duration: Date.now() - startTime,
          };
        }

        return {
          name: 'API Configuration',
          status: 'healthy',
          message: 'API configuration is complete',
          details: { apiUrl, hasApiKey, hasApiSecret },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'API Configuration',
          status: 'unhealthy',
          message: `API configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },
];

// Security health checks
const securityChecks: HealthCheck[] = [
  {
    name: 'Security Headers',
    category: 'security',
    critical: false,
    check: () => {
      const startTime = Date.now();
      try {
        const buildConfig = getBuildConfig(detectBuildEnvironment());
        const hasSecurityHeaders = buildConfig.security.contentSecurityPolicy;

        return {
          name: 'Security Headers',
          status: hasSecurityHeaders ? 'healthy' : 'degraded',
          message: hasSecurityHeaders
            ? 'Security headers are configured'
            : 'Security headers are not configured',
          details: { contentSecurityPolicy: hasSecurityHeaders },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'Security Headers',
          status: 'unhealthy',
          message: `Security headers check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },
];

// Performance health checks
const performanceChecks: HealthCheck[] = [
  {
    name: 'Build Configuration',
    category: 'performance',
    critical: false,
    check: () => {
      const startTime = Date.now();
      try {
        const buildConfig = getBuildConfig(detectBuildEnvironment());
        const isOptimized =
          buildConfig.optimization.minify && buildConfig.optimization.compress;

        return {
          name: 'Build Configuration',
          status: isOptimized ? 'healthy' : 'degraded',
          message: isOptimized
            ? 'Build is optimized for performance'
            : 'Build is not fully optimized',
          details: {
            minify: buildConfig.optimization.minify,
            compress: buildConfig.optimization.compress,
            treeShaking: buildConfig.optimization.treeShaking,
          },
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      } catch (error) {
        return {
          name: 'Build Configuration',
          status: 'unhealthy',
          message: `Build configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        };
      }
    },
  },
];

// All health checks
const allHealthChecks: HealthCheck[] = [
  ...configurationChecks,
  ...secretChecks,
  ...apiChecks,
  ...securityChecks,
  ...performanceChecks,
];

// Run a single health check
export const runHealthCheck = async (
  check: HealthCheck
): Promise<HealthCheckResult> => {
  const startTime = Date.now();

  try {
    const result = await check.check();
    return {
      ...result,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name: check.name,
      status: 'unhealthy',
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    };
  }
};

// Run all health checks
export const runAllHealthChecks = async (): Promise<HealthStatus> => {
  const checks: HealthCheckResult[] = [];

  // Run all checks in parallel
  const checkPromises = allHealthChecks.map((check) => runHealthCheck(check));
  const results = await Promise.all(checkPromises);

  checks.push(...results);

  // Calculate summary
  const summary = {
    total: checks.length,
    healthy: checks.filter((c) => c.status === 'healthy').length,
    unhealthy: checks.filter((c) => c.status === 'unhealthy').length,
    degraded: checks.filter((c) => c.status === 'degraded').length,
  };

  // Determine overall status
  let overall: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  if (summary.unhealthy > 0) {
    overall = 'unhealthy';
  } else if (summary.degraded > 0) {
    overall = 'degraded';
  }

  return {
    overall,
    timestamp: new Date(),
    environment: process.env['NODE_ENV'] || 'development',
    version: '1.0.0',
    checks,
    summary,
  };
};

// Run health checks by category
export const runHealthChecksByCategory = async (
  category: HealthCheckCategory
): Promise<HealthCheckResult[]> => {
  const categoryChecks = allHealthChecks.filter(
    (check) => check.category === category
  );
  const checkPromises = categoryChecks.map((check) => runHealthCheck(check));
  return Promise.all(checkPromises);
};

// Format health status for display
export const formatHealthStatus = (status: HealthStatus): string => {
  let output = `\n🏥 Health Check Results\n`;
  output += `Environment: ${status.environment}\n`;
  output += `Version: ${status.version}\n`;
  output += `Timestamp: ${status.timestamp.toISOString()}\n`;
  output += `Overall Status: ${status.overall.toUpperCase()}\n`;
  output += `\n`;

  // Summary
  output += `📊 Summary:\n`;
  output += `  Total Checks: ${status.summary.total}\n`;
  output += `  Healthy: ${status.summary.healthy}\n`;
  output += `  Unhealthy: ${status.summary.unhealthy}\n`;
  output += `  Degraded: ${status.summary.degraded}\n`;
  output += `\n`;

  // Detailed results
  output += `🔍 Detailed Results:\n`;
  status.checks.forEach((check) => {
    const statusIcon =
      check.status === 'healthy'
        ? '✅'
        : check.status === 'degraded'
          ? '⚠️'
          : '❌';
    output += `  ${statusIcon} ${check.name}: ${check.message}\n`;
    if (check.details) {
      Object.entries(check.details).forEach(([key, value]) => {
        output += `    ${key}: ${value}\n`;
      });
    }
    if (check.duration) {
      output += `    Duration: ${check.duration}ms\n`;
    }
    output += `\n`;
  });

  return output;
};

// Health check endpoint for monitoring
export const getHealthEndpoint = async (_req: any, res: any) => {
  try {
    const healthStatus = await runAllHealthChecks();

    const statusCode =
      healthStatus.overall === 'healthy'
        ? 200
        : healthStatus.overall === 'degraded'
          ? 200
          : 503;

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      overall: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Export health check functions
export const healthChecks = {
  runAll: runAllHealthChecks,
  runByCategory: runHealthChecksByCategory,
  runSingle: runHealthCheck,
  format: formatHealthStatus,
  endpoint: getHealthEndpoint,
};
