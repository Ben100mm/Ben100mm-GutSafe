/**
 * Staging Environment Configuration
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 */

import { Environment } from '../environment';

export const stagingConfig: Partial<Environment> = {
  // Application
  NODE_ENV: 'production',
  PORT: 9001,
  
  // API Configuration
  REACT_APP_API_BASE_URL: 'https://staging-api.gutsafe.com',
  REACT_APP_API_KEY: 'staging_api_key_12345',
  REACT_APP_API_SECRET: 'staging_api_secret_67890',
  
  // Database
  REACT_APP_DATABASE_URL: 'postgresql://staging_user:staging_pass@staging-db.gutsafe.com:5432/gutsafe_staging',
  REACT_APP_DB_ENCRYPTION_KEY: 'staging_encryption_key_32_chars_long_123',
  
  // Authentication & Security
  REACT_APP_JWT_SECRET: 'staging_jwt_secret_key_for_staging_only',
  REACT_APP_SESSION_KEY: 'staging_session_encryption_key_32_chars',
  REACT_APP_BIOMETRIC_ENABLED: true,
  REACT_APP_BIOMETRIC_TIMEOUT: 300000,
  
  // Feature Flags
  REACT_APP_ENABLE_OFFLINE_MODE: true,
  REACT_APP_ENABLE_CLOUD_SYNC: true,
  REACT_APP_ENABLE_ANALYTICS: true,
  REACT_APP_ENABLE_CRASH_REPORTING: true,
  REACT_APP_ENABLE_DEBUG_MODE: false,
  
  // Development
  REACT_APP_DEBUG_MODE: false,
  REACT_APP_LOG_LEVEL: 'info',
  REACT_APP_ENABLE_LOGGING: true,
  
  // Security
  REACT_APP_ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  REACT_APP_KEY_DERIVATION_ITERATIONS: 100000,
  REACT_APP_SESSION_TIMEOUT: 3600000, // 1 hour
  REACT_APP_REFRESH_TOKEN_TIMEOUT: 604800000, // 7 days
  REACT_APP_RATE_LIMIT_REQUESTS: 500,
  REACT_APP_RATE_LIMIT_WINDOW: 60000,
  
  // Privacy
  REACT_APP_DATA_RETENTION_DAYS: 90,
  REACT_APP_ANONYMOUS_ANALYTICS: true,
  REACT_APP_COLLECT_USAGE_DATA: true,
  REACT_APP_COLLECT_CRASH_DATA: true,
  REACT_APP_COLLECT_PERFORMANCE_DATA: true,
  
  // Compliance
  REACT_APP_GDPR_COMPLIANCE: true,
  REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED: true,
  REACT_APP_HIPAA_COMPLIANCE: false,
  REACT_APP_PHI_ENCRYPTION_REQUIRED: false,
  
  // Legal
  REACT_APP_TERMS_VERSION: '1.0.0',
  REACT_APP_PRIVACY_VERSION: '1.0.0',
  REACT_APP_LEGAL_EMAIL: 'legal@yourdomain.com',
  REACT_APP_PRIVACY_EMAIL: 'privacy@yourdomain.com',
  REACT_APP_SUPPORT_EMAIL: 'support@yourdomain.com',
  
  // Services
  REACT_APP_ANALYTICS_ID: 'staging_analytics_id_12345',
  REACT_APP_CRASH_REPORTING_URL: 'https://staging-crash.gutsafe.com',
  REACT_APP_FCM_SERVER_KEY: 'staging_fcm_server_key_12345',
  REACT_APP_AI_SERVICE_URL: 'https://staging-ai.gutsafe.com',
  REACT_APP_AI_API_KEY: 'staging_ai_api_key_12345',
  REACT_APP_ML_MODEL_URL: 'https://staging-ml.gutsafe.com',
  REACT_APP_ML_API_KEY: 'staging_ml_api_key_67890',
  REACT_APP_MONITORING_URL: 'https://staging-monitoring.gutsafe.com',
  REACT_APP_MONITORING_KEY: 'staging_monitoring_key_12345',
  REACT_APP_PERFORMANCE_SAMPLE_RATE: 0.5,
};
