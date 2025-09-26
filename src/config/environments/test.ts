/**
 * Test Environment Configuration
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 */

import { Environment } from '../environment';

export const testConfig: Partial<Environment> = {
  // Application
  NODE_ENV: 'test',
  PORT: 9001,
  
  // API Configuration
  REACT_APP_API_BASE_URL: 'http://localhost:3001/api',
  REACT_APP_API_KEY: 'test_api_key_12345',
  REACT_APP_API_SECRET: 'test_api_secret_67890',
  
  // Database
  REACT_APP_DATABASE_URL: 'sqlite://./data/gutsafe-test.db',
  REACT_APP_DB_ENCRYPTION_KEY: 'test_encryption_key_32_chars_long_123',
  
  // Authentication & Security
  REACT_APP_JWT_SECRET: 'test_jwt_secret_key_for_testing_only',
  REACT_APP_SESSION_KEY: 'test_session_encryption_key_32_chars',
  REACT_APP_BIOMETRIC_ENABLED: false,
  REACT_APP_BIOMETRIC_TIMEOUT: 300000,
  
  // Feature Flags (minimal for testing)
  REACT_APP_ENABLE_OFFLINE_MODE: true,
  REACT_APP_ENABLE_CLOUD_SYNC: false,
  REACT_APP_ENABLE_ANALYTICS: false,
  REACT_APP_ENABLE_CRASH_REPORTING: false,
  REACT_APP_ENABLE_DEBUG_MODE: true,
  
  // Development
  REACT_APP_DEBUG_MODE: true,
  REACT_APP_LOG_LEVEL: 'error',
  REACT_APP_ENABLE_LOGGING: false,
  
  // Security (relaxed for testing)
  REACT_APP_ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  REACT_APP_KEY_DERIVATION_ITERATIONS: 1000,
  REACT_APP_SESSION_TIMEOUT: 300000, // 5 minutes
  REACT_APP_REFRESH_TOKEN_TIMEOUT: 1800000, // 30 minutes
  REACT_APP_RATE_LIMIT_REQUESTS: 10000,
  REACT_APP_RATE_LIMIT_WINDOW: 60000,
  
  // Privacy (minimal for testing)
  REACT_APP_DATA_RETENTION_DAYS: 1,
  REACT_APP_ANONYMOUS_ANALYTICS: false,
  REACT_APP_COLLECT_USAGE_DATA: false,
  REACT_APP_COLLECT_CRASH_DATA: false,
  REACT_APP_COLLECT_PERFORMANCE_DATA: false,
  
  // Compliance
  REACT_APP_GDPR_COMPLIANCE: true,
  REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED: false,
  REACT_APP_HIPAA_COMPLIANCE: false,
  REACT_APP_PHI_ENCRYPTION_REQUIRED: false,
  
  // Legal
  REACT_APP_TERMS_VERSION: '1.0.0',
  REACT_APP_PRIVACY_VERSION: '1.0.0',
  REACT_APP_LEGAL_EMAIL: 'legal@yourdomain.com',
  REACT_APP_PRIVACY_EMAIL: 'privacy@yourdomain.com',
  REACT_APP_SUPPORT_EMAIL: 'support@yourdomain.com',
  
  // Services (disabled for testing)
  REACT_APP_ANALYTICS_ID: '',
  REACT_APP_CRASH_REPORTING_URL: '',
  REACT_APP_FCM_SERVER_KEY: '',
  REACT_APP_AI_SERVICE_URL: 'http://localhost:8001/ai',
  REACT_APP_AI_API_KEY: 'test_ai_api_key_12345',
  REACT_APP_ML_MODEL_URL: 'http://localhost:8001/ml',
  REACT_APP_ML_API_KEY: 'test_ml_api_key_67890',
  REACT_APP_MONITORING_URL: '',
  REACT_APP_MONITORING_KEY: '',
  REACT_APP_PERFORMANCE_SAMPLE_RATE: 0.0,
};
