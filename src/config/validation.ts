/**
 * Environment Validation System
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 *
 * Comprehensive environment validation with detailed error reporting.
 */

import { z } from 'zod';

import { getBuildConfig, detectBuildEnvironment } from './build';
import { secretManager } from './secrets';

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  environment: string;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Environment validation schemas
const BaseEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z
    .string()
    .transform(Number)
    .refine((val) => val > 0 && val < 65536, {
      message: 'Port must be between 1 and 65535',
    }),
});

const ApiSchema = z.object({
  REACT_APP_API_BASE_URL: z.string().url('Invalid API base URL'),
  REACT_APP_API_KEY: z.string().min(1, 'API key is required'),
  REACT_APP_API_SECRET: z.string().min(1, 'API secret is required'),
});

const DatabaseSchema = z.object({
  REACT_APP_DATABASE_URL: z.string().optional(),
  REACT_APP_DB_ENCRYPTION_KEY: z
    .string()
    .min(32, 'Database encryption key must be at least 32 characters'),
});

const SecuritySchema = z.object({
  REACT_APP_JWT_SECRET: z
    .string()
    .min(32, 'JWT secret must be at least 32 characters'),
  REACT_APP_SESSION_KEY: z
    .string()
    .min(32, 'Session key must be at least 32 characters'),
  REACT_APP_BIOMETRIC_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_BIOMETRIC_TIMEOUT: z.string().transform(Number).optional(),
});

const FeatureFlagsSchema = z.object({
  REACT_APP_ENABLE_OFFLINE_MODE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_ENABLE_CLOUD_SYNC: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_ENABLE_CRASH_REPORTING: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_ENABLE_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

const LoggingSchema = z.object({
  REACT_APP_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  REACT_APP_ENABLE_LOGGING: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

const SecuritySettingsSchema = z.object({
  REACT_APP_ENCRYPTION_ALGORITHM: z.string().optional(),
  REACT_APP_KEY_DERIVATION_ITERATIONS: z.string().transform(Number).optional(),
  REACT_APP_SESSION_TIMEOUT: z.string().transform(Number).optional(),
  REACT_APP_REFRESH_TOKEN_TIMEOUT: z.string().transform(Number).optional(),
  REACT_APP_RATE_LIMIT_REQUESTS: z.string().transform(Number).optional(),
  REACT_APP_RATE_LIMIT_WINDOW: z.string().transform(Number).optional(),
});

const PrivacySchema = z.object({
  REACT_APP_DATA_RETENTION_DAYS: z.string().transform(Number).optional(),
  REACT_APP_ANONYMOUS_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_COLLECT_USAGE_DATA: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_COLLECT_CRASH_DATA: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_COLLECT_PERFORMANCE_DATA: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

const ComplianceSchema = z.object({
  REACT_APP_GDPR_COMPLIANCE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_HIPAA_COMPLIANCE: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  REACT_APP_PHI_ENCRYPTION_REQUIRED: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

const LegalSchema = z.object({
  REACT_APP_TERMS_VERSION: z.string().optional(),
  REACT_APP_PRIVACY_VERSION: z.string().optional(),
  REACT_APP_LEGAL_EMAIL: z.string().email().optional(),
  REACT_APP_PRIVACY_EMAIL: z.string().email().optional(),
  REACT_APP_SUPPORT_EMAIL: z.string().email().optional(),
});

// Complete environment schema (commented out as it's not used)
// const EnvironmentSchema = BaseEnvironmentSchema
//   .merge(ApiSchema)
//   .merge(DatabaseSchema)
//   .merge(SecuritySchema)
//   .merge(FeatureFlagsSchema)
//   .merge(LoggingSchema)
//   .merge(SecuritySettingsSchema)
//   .merge(PrivacySchema)
//   .merge(ComplianceSchema)
//   .merge(LegalSchema);

// Validation functions
export const validateEnvironment = (): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const environment = process.env['NODE_ENV'] || 'development';

  try {
    // Validate base environment
    const baseResult = BaseEnvironmentSchema.safeParse(process.env);
    if (!baseResult.success) {
      baseResult.error.issues.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          severity: 'error',
        });
      });
    }

    // Validate API configuration
    const apiResult = ApiSchema.safeParse(process.env);
    if (!apiResult.success) {
      apiResult.error.issues.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          severity: 'error',
          suggestion: 'Check your API configuration in environment variables',
        });
      });
    }

    // Validate database configuration
    const dbResult = DatabaseSchema.safeParse(process.env);
    if (!dbResult.success) {
      dbResult.error.issues.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          severity: 'error',
          suggestion:
            'Ensure database encryption key is at least 32 characters long',
        });
      });
    }

    // Validate security configuration
    const securityResult = SecuritySchema.safeParse(process.env);
    if (!securityResult.success) {
      securityResult.error.issues.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          severity: 'error',
          suggestion: 'Generate strong secrets using the secret manager',
        });
      });
    }

    // Validate feature flags
    const featuresResult = FeatureFlagsSchema.safeParse(process.env);
    if (!featuresResult.success) {
      featuresResult.error.issues.forEach((error) => {
        warnings.push({
          field: error.path.join('.'),
          message: error.message,
          suggestion: 'Feature flags should be boolean values',
        });
      });
    }

    // Validate logging configuration
    const loggingResult = LoggingSchema.safeParse(process.env);
    if (!loggingResult.success) {
      loggingResult.error.issues.forEach((error) => {
        warnings.push({
          field: error.path.join('.'),
          message: error.message,
          suggestion: 'Logging configuration should be properly set',
        });
      });
    }

    // Validate security settings
    const securitySettingsResult = SecuritySettingsSchema.safeParse(
      process.env
    );
    if (!securitySettingsResult.success) {
      securitySettingsResult.error.issues.forEach((error) => {
        warnings.push({
          field: error.path.join('.'),
          message: error.message,
          suggestion: 'Security settings should be properly configured',
        });
      });
    }

    // Validate privacy settings
    const privacyResult = PrivacySchema.safeParse(process.env);
    if (!privacyResult.success) {
      privacyResult.error.issues.forEach((error) => {
        warnings.push({
          field: error.path.join('.'),
          message: error.message,
          suggestion: 'Privacy settings should be properly configured',
        });
      });
    }

    // Validate compliance settings
    const complianceResult = ComplianceSchema.safeParse(process.env);
    if (!complianceResult.success) {
      complianceResult.error.issues.forEach((error) => {
        warnings.push({
          field: error.path.join('.'),
          message: error.message,
          suggestion: 'Compliance settings should be properly configured',
        });
      });
    }

    // Validate legal settings
    const legalResult = LegalSchema.safeParse(process.env);
    if (!legalResult.success) {
      legalResult.error.issues.forEach((error) => {
        warnings.push({
          field: error.path.join('.'),
          message: error.message,
          suggestion: 'Legal settings should be properly configured',
        });
      });
    }

    // Additional validations
    validateSecrets(errors);
    validateBuildConfiguration(errors, warnings);
    validateEnvironmentSpecific(errors, warnings, environment);
  } catch (error) {
    errors.push({
      field: 'validation',
      message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    environment,
    timestamp: new Date(),
  };
};

// Secret validation
const validateSecrets = (errors: ValidationError[]) => {
  const requiredSecrets = [
    'REACT_APP_API_KEY',
    'REACT_APP_API_SECRET',
    'REACT_APP_JWT_SECRET',
    'REACT_APP_SESSION_KEY',
    'REACT_APP_DB_ENCRYPTION_KEY',
  ];

  for (const secretName of requiredSecrets) {
    const secretValue = process.env[secretName];
    if (!secretValue) {
      errors.push({
        field: secretName,
        message: 'Required secret is missing',
        severity: 'error',
        suggestion: 'Set this secret in your environment variables',
      });
      continue;
    }

    if (!secretManager.validateSecret(secretValue)) {
      errors.push({
        field: secretName,
        message: 'Secret does not meet security requirements',
        severity: 'error',
        suggestion: 'Generate a stronger secret using the secret manager',
      });
    }
  }
};

// Build configuration validation
const validateBuildConfiguration = (
  errors: ValidationError[],
  warnings: ValidationWarning[]
) => {
  try {
    const buildConfig = getBuildConfig(detectBuildEnvironment());

    if (buildConfig.optimization.minify && !buildConfig.optimization.compress) {
      warnings.push({
        field: 'build.optimization',
        message: 'Minification enabled but compression disabled',
        suggestion: 'Enable compression for better performance',
      });
    }

    if (
      buildConfig.security.hsts &&
      !buildConfig.security.contentSecurityPolicy
    ) {
      warnings.push({
        field: 'build.security',
        message: 'HSTS enabled but CSP disabled',
        suggestion: 'Enable CSP for better security',
      });
    }

    if (
      buildConfig.monitoring.analytics &&
      !buildConfig.monitoring.errorTracking
    ) {
      warnings.push({
        field: 'build.monitoring',
        message: 'Analytics enabled but error tracking disabled',
        suggestion: 'Enable error tracking for better monitoring',
      });
    }
  } catch (error) {
    errors.push({
      field: 'build.configuration',
      message: `Build configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error',
    });
  }
};

// Environment-specific validation
const validateEnvironmentSpecific = (
  errors: ValidationError[],
  warnings: ValidationWarning[],
  environment: string
) => {
  switch (environment) {
    case 'development':
      // Development-specific validations
      if (process.env['REACT_APP_DEBUG_MODE'] !== 'true') {
        warnings.push({
          field: 'REACT_APP_DEBUG_MODE',
          message: 'Debug mode should be enabled in development',
          suggestion: 'Set REACT_APP_DEBUG_MODE=true for development',
        });
      }
      break;

    case 'production':
      // Production-specific validations
      if (process.env['REACT_APP_DEBUG_MODE'] === 'true') {
        errors.push({
          field: 'REACT_APP_DEBUG_MODE',
          message: 'Debug mode should not be enabled in production',
          severity: 'error',
          suggestion: 'Set REACT_APP_DEBUG_MODE=false for production',
        });
      }

      if (process.env['REACT_APP_ENABLE_ANALYTICS'] !== 'true') {
        warnings.push({
          field: 'REACT_APP_ENABLE_ANALYTICS',
          message: 'Analytics should be enabled in production',
          suggestion: 'Set REACT_APP_ENABLE_ANALYTICS=true for production',
        });
      }
      break;

    case 'test':
      // Test-specific validations
      if (process.env['REACT_APP_ENABLE_ANALYTICS'] === 'true') {
        warnings.push({
          field: 'REACT_APP_ENABLE_ANALYTICS',
          message: 'Analytics should be disabled in test environment',
          suggestion: 'Set REACT_APP_ENABLE_ANALYTICS=false for testing',
        });
      }
      break;
  }
};

// Validation result formatting
export const formatValidationResult = (result: ValidationResult): string => {
  let output = `\n🔍 Environment Validation Results\n`;
  output += `Environment: ${result.environment}\n`;
  output += `Timestamp: ${result.timestamp.toISOString()}\n`;
  output += `Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
  output += `\n`;

  if (result.errors.length > 0) {
    output += `❌ Errors (${result.errors.length}):\n`;
    result.errors.forEach((error) => {
      output += `  - ${error.field}: ${error.message}\n`;
      if (error.suggestion) {
        output += `    💡 Suggestion: ${error.suggestion}\n`;
      }
    });
    output += `\n`;
  }

  if (result.warnings.length > 0) {
    output += `⚠️  Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach((warning) => {
      output += `  - ${warning.field}: ${warning.message}\n`;
      if (warning.suggestion) {
        output += `    💡 Suggestion: ${warning.suggestion}\n`;
      }
    });
    output += `\n`;
  }

  if (result.isValid && result.warnings.length === 0) {
    output += `✅ All validations passed!\n`;
  }

  return output;
};

// Export validation functions
export const validateAndReport = (): ValidationResult => {
  const result = validateEnvironment();
  console.log(formatValidationResult(result));
  return result;
};

// Quick validation for CI/CD
export const quickValidate = (): boolean => {
  const result = validateEnvironment();
  return result.isValid;
};
