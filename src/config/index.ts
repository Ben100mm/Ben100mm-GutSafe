/**
 * Configuration Index
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 *
 * Centralized configuration exports and initialization.
 */

// Export all configuration modules
// Import specific functions for internal use
import {
  getBuildConfig,
  detectBuildEnvironment,
  validateBuildConfig,
} from './build';
import { developmentConfig } from './environments/development';
import { productionConfig } from './environments/production';
import { stagingConfig } from './environments/staging';
import { testConfig } from './environments/test';
import { validateEnvironmentSecrets } from './secrets';
import { validateEnvironment } from './validation';

export * from './environment';
export * from './secrets';
export * from './build';
export * from './validation';

// Export environment-specific configurations
export { developmentConfig } from './environments/development';
export { stagingConfig } from './environments/staging';
export { productionConfig } from './environments/production';
export { testConfig } from './environments/test';

// Re-export commonly used items
export {
  config,
  currentConfig,
  isDevelopment,
  isProduction,
  isTest,
  isFeatureEnabled,
  getSecurityConfig,
  getApiConfig,
  shouldLog,
} from './environment';

export {
  secretManager,
  validateApiKey,
  validateJwtSecret,
  validateEncryptionKey,
  validateSessionKey,
  calculateSecretStrength,
  getSecretStrengthLevel,
} from './secrets';

export {
  getBuildConfig,
  currentBuildConfig,
  detectBuildEnvironment,
  isDevelopment as isDevBuild,
  isProduction as isProdBuild,
  isStaging as isStagingBuild,
  isTest as isTestBuild,
} from './build';

export {
  validateEnvironment,
  validateAndReport,
  quickValidate,
  formatValidationResult,
} from './validation';

// Configuration initialization
export const initializeConfiguration = () => {
  try {
    // Validate environment
    const validationResult = validateEnvironment();

    if (!validationResult.isValid) {
      console.error('❌ Configuration validation failed:');
      validationResult.errors.forEach((error) => {
        console.error(`  - ${error.field}: ${error.message}`);
      });
      throw new Error('Invalid configuration');
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      validationResult.warnings.forEach((warning) => {
        console.warn(`  - ${warning.field}: ${warning.message}`);
      });
    }

    console.log('✅ Configuration initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Configuration initialization failed:', error);
    return false;
  }
};

// Environment-specific configuration loader
export const loadEnvironmentConfig = (environment: string) => {
  switch (environment) {
    case 'development':
      return developmentConfig;
    case 'staging':
      return stagingConfig;
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      console.warn(
        `Unknown environment: ${environment}, using development config`
      );
      return developmentConfig;
  }
};

// Configuration health check
export const checkConfigurationHealth = () => {
  const health = {
    environment: process.env['NODE_ENV'] || 'development',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      environment: false,
      secrets: false,
      build: false,
      validation: false,
    },
    errors: [] as string[],
  };

  try {
    // Check environment
    health.checks.environment = true;
  } catch (error) {
    health.checks.environment = false;
    health.errors.push(
      `Environment check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  try {
    // Check secrets
    const secretsValid = validateEnvironmentSecrets(health.environment);
    health.checks.secrets = secretsValid;
    if (!secretsValid) {
      health.errors.push('Secret validation failed');
    }
  } catch (error) {
    health.checks.secrets = false;
    health.errors.push(
      `Secret check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  try {
    // Check build configuration
    const buildConfig = getBuildConfig(detectBuildEnvironment());
    health.checks.build = validateBuildConfig(buildConfig);
    if (!health.checks.build) {
      health.errors.push('Build configuration validation failed');
    }
  } catch (error) {
    health.checks.build = false;
    health.errors.push(
      `Build check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  try {
    // Check validation
    const validationResult = validateEnvironment();
    health.checks.validation = validationResult.isValid;
    if (!validationResult.isValid) {
      health.errors.push('Environment validation failed');
    }
  } catch (error) {
    health.checks.validation = false;
    health.errors.push(
      `Validation check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Overall health status
  const allChecksPassed = Object.values(health.checks).every(
    (check) => check === true
  );
  health.status = allChecksPassed ? 'healthy' : 'unhealthy';

  return health;
};

// Export default configuration
export default {
  initializeConfiguration,
  loadEnvironmentConfig,
  checkConfigurationHealth,
};
