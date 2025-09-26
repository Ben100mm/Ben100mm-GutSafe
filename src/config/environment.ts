/**
 * Environment Configuration
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Centralized environment configuration with validation and type safety.
 */

import { z } from 'zod';

// Environment schema for validation
const EnvironmentSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(9001),
  
  // API Configuration
  REACT_APP_API_BASE_URL: z.string().url(),
  REACT_APP_API_KEY: z.string().min(1),
  REACT_APP_API_SECRET: z.string().min(1),
  
  // Database
  REACT_APP_DATABASE_URL: z.string().optional(),
  REACT_APP_DB_ENCRYPTION_KEY: z.string().min(32),
  
  // Authentication & Security
  REACT_APP_JWT_SECRET: z.string().min(32),
  REACT_APP_SESSION_KEY: z.string().min(32),
  REACT_APP_BIOMETRIC_ENABLED: z.string().transform(val => val === 'true').default(false),
  REACT_APP_BIOMETRIC_TIMEOUT: z.string().transform(Number).default(300000),
  
  // Feature Flags
  REACT_APP_ENABLE_OFFLINE_MODE: z.string().transform(val => val === 'true').default(true),
  REACT_APP_ENABLE_CLOUD_SYNC: z.string().transform(val => val === 'true').default(false),
  REACT_APP_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default(false),
  REACT_APP_ENABLE_CRASH_REPORTING: z.string().transform(val => val === 'true').default(false),
  REACT_APP_ENABLE_DEBUG_MODE: z.string().transform(val => val === 'true').default(false),
  
  // Development
  REACT_APP_DEBUG_MODE: z.string().transform(val => val === 'true').default(false),
  REACT_APP_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  REACT_APP_ENABLE_LOGGING: z.string().transform(val => val === 'true').default(true),
  
  // Security
  REACT_APP_ENCRYPTION_ALGORITHM: z.string().default('AES-256-GCM'),
  REACT_APP_KEY_DERIVATION_ITERATIONS: z.string().transform(Number).default(100000),
  REACT_APP_SESSION_TIMEOUT: z.string().transform(Number).default(3600000),
  REACT_APP_REFRESH_TOKEN_TIMEOUT: z.string().transform(Number).default(604800000),
  REACT_APP_RATE_LIMIT_REQUESTS: z.string().transform(Number).default(100),
  REACT_APP_RATE_LIMIT_WINDOW: z.string().transform(Number).default(60000),
  
  // Privacy
  REACT_APP_DATA_RETENTION_DAYS: z.string().transform(Number).default(365),
  REACT_APP_ANONYMOUS_ANALYTICS: z.string().transform(val => val === 'true').default(true),
  REACT_APP_COLLECT_USAGE_DATA: z.string().transform(val => val === 'true').default(false),
  REACT_APP_COLLECT_CRASH_DATA: z.string().transform(val => val === 'true').default(false),
  REACT_APP_COLLECT_PERFORMANCE_DATA: z.string().transform(val => val === 'true').default(false),
  
  // Compliance
  REACT_APP_GDPR_COMPLIANCE: z.string().transform(val => val === 'true').default(true),
  REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED: z.string().transform(val => val === 'true').default(true),
  REACT_APP_HIPAA_COMPLIANCE: z.string().transform(val => val === 'true').default(false),
  REACT_APP_PHI_ENCRYPTION_REQUIRED: z.string().transform(val => val === 'true').default(false),
  
  // Legal
  REACT_APP_TERMS_VERSION: z.string().default('1.0.0'),
  REACT_APP_PRIVACY_VERSION: z.string().default('1.0.0'),
  REACT_APP_LEGAL_EMAIL: z.string().email().optional(),
  REACT_APP_PRIVACY_EMAIL: z.string().email().optional(),
  REACT_APP_SUPPORT_EMAIL: z.string().email().optional(),
  
  // Optional services
  REACT_APP_ANALYTICS_ID: z.string().optional(),
  REACT_APP_CRASH_REPORTING_URL: z.string().url().optional(),
  REACT_APP_FCM_SERVER_KEY: z.string().optional(),
  REACT_APP_AI_SERVICE_URL: z.string().url().optional(),
  REACT_APP_AI_API_KEY: z.string().optional(),
  REACT_APP_ML_MODEL_URL: z.string().url().optional(),
  REACT_APP_ML_API_KEY: z.string().optional(),
  REACT_APP_MONITORING_URL: z.string().url().optional(),
  REACT_APP_MONITORING_KEY: z.string().optional(),
  REACT_APP_MONITORING_ENABLED: z.string().transform(val => val === 'true').default(false),
  REACT_APP_PERFORMANCE_SAMPLE_RATE: z.string().transform(Number).default(0.1),
  REACT_APP_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default(false),
  REACT_APP_PUSH_NOTIFICATIONS_ENABLED: z.string().transform(val => val === 'true').default(true),
});

// Environment type
export type Environment = z.infer<typeof EnvironmentSchema>;

// Environment validation function
export function validateEnvironment(): Environment {
  try {
    return EnvironmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

// Get validated environment
export const env = validateEnvironment();

// Environment-specific configurations
export const config = {
  // Application
  app: {
    name: 'GutSafe',
    version: '1.0.0',
    environment: env.NODE_ENV,
    port: env.PORT,
    debug: env.REACT_APP_DEBUG_MODE,
  },
  
  // API
  api: {
    baseUrl: env.REACT_APP_API_BASE_URL,
    key: env.REACT_APP_API_KEY,
    secret: env.REACT_APP_API_SECRET,
    timeout: 30000,
  },
  
  // Database
  database: {
    url: env.REACT_APP_DATABASE_URL,
    encryptionKey: env.REACT_APP_DB_ENCRYPTION_KEY,
  },
  
  // Security
  security: {
    jwtSecret: env.REACT_APP_JWT_SECRET,
    sessionKey: env.REACT_APP_SESSION_KEY,
    encryptionAlgorithm: env.REACT_APP_ENCRYPTION_ALGORITHM,
    keyDerivationIterations: env.REACT_APP_KEY_DERIVATION_ITERATIONS,
    sessionTimeout: env.REACT_APP_SESSION_TIMEOUT,
    refreshTokenTimeout: env.REACT_APP_REFRESH_TOKEN_TIMEOUT,
    rateLimit: {
      requests: env.REACT_APP_RATE_LIMIT_REQUESTS,
      window: env.REACT_APP_RATE_LIMIT_WINDOW,
    },
  },
  
  // Features
  features: {
    offlineMode: env.REACT_APP_ENABLE_OFFLINE_MODE,
    cloudSync: env.REACT_APP_ENABLE_CLOUD_SYNC,
    analytics: env.REACT_APP_ENABLE_ANALYTICS,
    crashReporting: env.REACT_APP_ENABLE_CRASH_REPORTING,
    biometric: env.REACT_APP_BIOMETRIC_ENABLED,
    biometricTimeout: env.REACT_APP_BIOMETRIC_TIMEOUT,
  },
  
  // Logging
  logging: {
    level: env.REACT_APP_LOG_LEVEL,
    enabled: env.REACT_APP_ENABLE_LOGGING,
  },
  
  // Privacy
  privacy: {
    dataRetentionDays: env.REACT_APP_DATA_RETENTION_DAYS,
    anonymousAnalytics: env.REACT_APP_ANONYMOUS_ANALYTICS,
    collectUsageData: env.REACT_APP_COLLECT_USAGE_DATA,
    collectCrashData: env.REACT_APP_COLLECT_CRASH_DATA,
    collectPerformanceData: env.REACT_APP_COLLECT_PERFORMANCE_DATA,
  },
  
  // Compliance
  compliance: {
    gdpr: env.REACT_APP_GDPR_COMPLIANCE,
    dataProcessingConsentRequired: env.REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED,
    hipaa: env.REACT_APP_HIPAA_COMPLIANCE,
    phiEncryptionRequired: env.REACT_APP_PHI_ENCRYPTION_REQUIRED,
  },
  
  // Legal
  legal: {
    termsVersion: env.REACT_APP_TERMS_VERSION,
    privacyVersion: env.REACT_APP_PRIVACY_VERSION,
    legalEmail: env.REACT_APP_LEGAL_EMAIL,
    privacyEmail: env.REACT_APP_PRIVACY_EMAIL,
    supportEmail: env.REACT_APP_SUPPORT_EMAIL,
  },
  
  // Services
  services: {
    analytics: {
      id: env.REACT_APP_ANALYTICS_ID,
      enabled: env.REACT_APP_ENABLE_ANALYTICS,
    },
    crashReporting: {
      url: env.REACT_APP_CRASH_REPORTING_URL,
      enabled: env.REACT_APP_ENABLE_CRASH_REPORTING,
    },
    pushNotifications: {
      fcmServerKey: env.REACT_APP_FCM_SERVER_KEY,
      enabled: env.REACT_APP_PUSH_NOTIFICATIONS_ENABLED,
    },
    ai: {
      serviceUrl: env.REACT_APP_AI_SERVICE_URL,
      apiKey: env.REACT_APP_AI_API_KEY,
    },
    ml: {
      modelUrl: env.REACT_APP_ML_MODEL_URL,
      apiKey: env.REACT_APP_ML_API_KEY,
    },
    monitoring: {
      url: env.REACT_APP_MONITORING_URL,
      key: env.REACT_APP_MONITORING_KEY,
      enabled: env.REACT_APP_MONITORING_ENABLED,
    },
    performance: {
      sampleRate: env.REACT_APP_PERFORMANCE_SAMPLE_RATE,
      enabled: env.REACT_APP_PERFORMANCE_MONITORING,
    },
  },
} as const;

// Environment-specific overrides
export const getEnvironmentConfig = (environment: string) => {
  const baseConfig = config;
  
  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        app: {
          ...baseConfig.app,
          debug: true,
        },
        logging: {
          ...baseConfig.logging,
          level: 'debug' as const,
        },
        security: {
          ...baseConfig.security,
          sessionTimeout: 1800000, // 30 minutes
          refreshTokenTimeout: 3600000, // 1 hour
        },
        privacy: {
          ...baseConfig.privacy,
          dataRetentionDays: 30,
        },
      };
      
    case 'test':
      return {
        ...baseConfig,
        app: {
          ...baseConfig.app,
          debug: true,
        },
        logging: {
          ...baseConfig.logging,
          level: 'error' as const,
        },
        features: {
          ...baseConfig.features,
          analytics: false,
          crashReporting: false,
        },
      };
      
    case 'production':
      return {
        ...baseConfig,
        app: {
          ...baseConfig.app,
          debug: false,
        },
        logging: {
          ...baseConfig.logging,
          level: 'info' as const,
        },
      };
      
    default:
      return baseConfig;
  }
};

// Export the current environment configuration
export const currentConfig = getEnvironmentConfig(env.NODE_ENV);

// Environment validation helper
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof typeof config.features) => {
  return config.features[feature];
};

// Security helpers
export const getSecurityConfig = () => config.security;
export const getApiConfig = () => config.api;

// Logging helpers
export const shouldLog = (level: string) => {
  const levels = ['error', 'warn', 'info', 'debug'];
  const currentLevel = levels.indexOf(config.logging.level);
  const requestedLevel = levels.indexOf(level);
  return requestedLevel <= currentLevel;
};
