/**
 * Production Environment Configuration
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 */

import { Environment } from '../environment';

export const productionConfig: Partial<Environment> = {
  // Application
  NODE_ENV: 'production',
  PORT: '9001',
  
  // API Configuration
  REACT_APP_API_BASE_URL: 'https://api.gutsafe.com',
  REACT_APP_API_KEY: 'prod_api_key_12345',
  REACT_APP_API_SECRET: 'prod_api_secret_67890',
  
  // Database
  REACT_APP_DATABASE_URL: 'postgresql://prod_user:prod_pass@prod-db.gutsafe.com:5432/gutsafe_prod',
  REACT_APP_DB_ENCRYPTION_KEY: 'prod_encryption_key_32_chars_long_123',
  
  // Authentication & Security
  REACT_APP_JWT_SECRET: 'prod_jwt_secret_key_for_production_only',
  REACT_APP_SESSION_KEY: 'prod_session_encryption_key_32_chars',
  REACT_APP_BIOMETRIC_ENABLED: 'true',
  REACT_APP_BIOMETRIC_TIMEOUT: '300000',
  
  // Feature Flags
  REACT_APP_ENABLE_OFFLINE_MODE: 'true',
  REACT_APP_ENABLE_CLOUD_SYNC: 'true',
  REACT_APP_ENABLE_ANALYTICS: 'true',
  REACT_APP_ENABLE_CRASH_REPORTING: 'true',
  REACT_APP_ENABLE_DEBUG_MODE: 'false',
  
  // Development
  REACT_APP_DEBUG_MODE: 'false',
  REACT_APP_LOG_LEVEL: 'warn',
  REACT_APP_ENABLE_LOGGING: 'true',
  
  // Security (strict for production)
  REACT_APP_ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  REACT_APP_KEY_DERIVATION_ITERATIONS: '100000',
  REACT_APP_SESSION_TIMEOUT: '3600000', // 1 hour
  REACT_APP_REFRESH_TOKEN_TIMEOUT: '604800000', // 7 days
  REACT_APP_RATE_LIMIT_REQUESTS: '100',
  REACT_APP_RATE_LIMIT_WINDOW: '60000',
  
  // Privacy (strict for production)
  REACT_APP_DATA_RETENTION_DAYS: '365',
  REACT_APP_ANONYMOUS_ANALYTICS: 'true',
  REACT_APP_COLLECT_USAGE_DATA: 'true',
  REACT_APP_COLLECT_CRASH_DATA: 'true',
  REACT_APP_COLLECT_PERFORMANCE_DATA: 'true',
  
  // Compliance (strict for production)
  REACT_APP_GDPR_COMPLIANCE: 'true',
  REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED: 'true',
  REACT_APP_HIPAA_COMPLIANCE: 'true',
  REACT_APP_PHI_ENCRYPTION_REQUIRED: 'true',
  
  // Legal
  REACT_APP_TERMS_VERSION: '1.0.0',
  REACT_APP_PRIVACY_VERSION: '1.0.0',
  REACT_APP_LEGAL_EMAIL: 'legal@yourdomain.com',
  REACT_APP_PRIVACY_EMAIL: 'privacy@yourdomain.com',
  REACT_APP_SUPPORT_EMAIL: 'support@yourdomain.com',
  
  // Services (enabled for production)
  REACT_APP_ANALYTICS_ID: 'prod_analytics_id_12345',
  REACT_APP_CRASH_REPORTING_URL: 'https://crash.gutsafe.com',
  REACT_APP_FCM_SERVER_KEY: 'prod_fcm_server_key_12345',
  REACT_APP_AI_SERVICE_URL: 'https://ai.gutsafe.com',
  REACT_APP_AI_API_KEY: 'prod_ai_api_key_12345',
  REACT_APP_ML_MODEL_URL: 'https://ml.gutsafe.com',
  REACT_APP_ML_API_KEY: 'prod_ml_api_key_67890',
  REACT_APP_MONITORING_URL: 'https://monitoring.gutsafe.com',
  REACT_APP_MONITORING_KEY: 'prod_monitoring_key_12345',
  REACT_APP_PERFORMANCE_SAMPLE_RATE: '0.1',
};
