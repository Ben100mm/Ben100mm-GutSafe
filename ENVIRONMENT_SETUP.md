# Environment & Configuration Setup Guide

## Overview

This guide covers the comprehensive environment and configuration setup for the GutSafe application, including environment variables, secret management, build configurations, and validation.

## Table of Contents

1. [Environment Files](#environment-files)
2. [Configuration System](#configuration-system)
3. [Secret Management](#secret-management)
4. [Build Environments](#build-environments)
5. [Environment Validation](#environment-validation)
6. [Getting Started](#getting-started)
7. [Troubleshooting](#troubleshooting)

## Environment Files

### Environment File Hierarchy

The application supports multiple environment files with the following priority (highest to lowest):

1. `.env.local` - Local development overrides
2. `.env.development` - Development environment
3. `.env.staging` - Staging environment
4. `.env.production` - Production environment
5. `.env.test` - Test environment

### Required Environment Variables

#### Core Application
```bash
NODE_ENV=development|production|test
PORT=9001
```

#### API Configuration
```bash
REACT_APP_API_BASE_URL=https://api.gutsafe.com
REACT_APP_API_KEY=your_api_key_here
REACT_APP_API_SECRET=your_api_secret_here
```

#### Database
```bash
REACT_APP_DATABASE_URL=postgresql://user:pass@host:port/db
REACT_APP_DB_ENCRYPTION_KEY=your_32_character_encryption_key
```

#### Security
```bash
REACT_APP_JWT_SECRET=your_jwt_secret_32_chars_min
REACT_APP_SESSION_KEY=your_session_key_32_chars_min
REACT_APP_BIOMETRIC_ENABLED=true
REACT_APP_BIOMETRIC_TIMEOUT=300000
```

#### Feature Flags
```bash
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_CLOUD_SYNC=false
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CRASH_REPORTING=false
REACT_APP_ENABLE_DEBUG_MODE=false
```

#### Logging
```bash
REACT_APP_DEBUG_MODE=false
REACT_APP_LOG_LEVEL=info
REACT_APP_ENABLE_LOGGING=true
```

#### Security Settings
```bash
REACT_APP_ENCRYPTION_ALGORITHM=AES-256-GCM
REACT_APP_KEY_DERIVATION_ITERATIONS=100000
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_REFRESH_TOKEN_TIMEOUT=604800000
REACT_APP_RATE_LIMIT_REQUESTS=100
REACT_APP_RATE_LIMIT_WINDOW=60000
```

#### Privacy & Compliance
```bash
REACT_APP_DATA_RETENTION_DAYS=365
REACT_APP_ANONYMOUS_ANALYTICS=true
REACT_APP_COLLECT_USAGE_DATA=false
REACT_APP_COLLECT_CRASH_DATA=false
REACT_APP_COLLECT_PERFORMANCE_DATA=false
REACT_APP_GDPR_COMPLIANCE=true
REACT_APP_DATA_PROCESSING_CONSENT_REQUIRED=true
REACT_APP_HIPAA_COMPLIANCE=false
REACT_APP_PHI_ENCRYPTION_REQUIRED=false
```

#### Legal
```bash
REACT_APP_TERMS_VERSION=1.0.0
REACT_APP_PRIVACY_VERSION=1.0.0
REACT_APP_LEGAL_EMAIL=legal@yourdomain.com
REACT_APP_PRIVACY_EMAIL=privacy@yourdomain.com
REACT_APP_SUPPORT_EMAIL=support@yourdomain.com
```

## Configuration System

### Centralized Configuration

The application uses a centralized configuration system located in `src/config/`:

- `environment.ts` - Main environment configuration with validation
- `secrets.ts` - Secret management and encryption
- `build.ts` - Build configuration for different environments
- `validation.ts` - Comprehensive environment validation
- `environments/` - Environment-specific configurations

### Using Configuration

```typescript
import { config, isDevelopment, isFeatureEnabled } from './src/config';

// Access configuration
const apiUrl = config.api.baseUrl;
const isDebug = config.app.debug;

// Environment checks
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Feature flags
if (isFeatureEnabled('offlineMode')) {
  // Enable offline functionality
}
```

## Secret Management

### Secret Requirements

All secrets must meet the following requirements:

- **Minimum length**: 32 characters
- **Character variety**: Must include uppercase, lowercase, numbers, and special characters
- **Uniqueness**: Must be unique per environment
- **Rotation**: Should be rotated regularly

### Secret Validation

```typescript
import { secretManager, validateApiKey } from './src/config/secrets';

// Validate a secret
const isValid = secretManager.validateSecret(secret);

// Validate specific secret types
const apiKeyValid = validateApiKey(apiKey);
const jwtSecretValid = validateJwtSecret(jwtSecret);

// Calculate secret strength
const strength = calculateSecretStrength(secret);
const level = getSecretStrengthLevel(strength);
```

### Secret Generation

```typescript
import { secretManager } from './src/config/secrets';

// Generate a new secret
const newSecret = secretManager.generateKey(32);

// Encrypt/decrypt secrets
const encrypted = secretManager.encrypt(plaintext);
const decrypted = secretManager.decrypt(encrypted);
```

## Build Environments

### Environment-Specific Builds

The application supports four build environments:

#### Development
- **Optimization**: Minimal (faster builds)
- **Source Maps**: Enabled
- **Hot Reload**: Enabled
- **Debug Tools**: Enabled
- **Security**: Relaxed

#### Staging
- **Optimization**: Moderate
- **Source Maps**: Enabled
- **Hot Reload**: Disabled
- **Debug Tools**: Enabled
- **Security**: Moderate

#### Production
- **Optimization**: Maximum
- **Source Maps**: Disabled
- **Hot Reload**: Disabled
- **Debug Tools**: Disabled
- **Security**: Strict

#### Test
- **Optimization**: Minimal
- **Source Maps**: Enabled
- **Hot Reload**: Disabled
- **Debug Tools**: Disabled
- **Security**: Relaxed

### Build Scripts

```bash
# Development
npm run start
npm run build:dev

# Staging
npm run start:prod  # with staging config
npm run build

# Production
npm run build
npm run web:serve

# Test
npm run test
npm run test:coverage
```

## Environment Validation

### Validation Script

Run the environment validation script:

```bash
npm run env:validate
```

This will:
- Check all required environment variables
- Validate secret strength and format
- Verify environment-specific settings
- Report any errors or warnings

### Programmatic Validation

```typescript
import { validateEnvironment, validateAndReport } from './src/config/validation';

// Quick validation
const isValid = validateEnvironment();

// Detailed validation with reporting
const result = validateAndReport();
console.log(result.isValid); // boolean
console.log(result.errors); // ValidationError[]
console.log(result.warnings); // ValidationWarning[]
```

### Validation Rules

#### Required Variables
- All core application variables
- All API configuration variables
- All security variables
- All database variables

#### Secret Validation
- Minimum 32 characters
- Must include uppercase, lowercase, numbers, special characters
- Must be unique per environment

#### Environment-Specific Rules
- **Development**: Debug mode should be enabled
- **Production**: Debug mode should be disabled, analytics enabled
- **Test**: Analytics should be disabled

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Files

```bash
# Copy the template
cp env.template .env.local

# Edit with your values
nano .env.local
```

### 3. Generate Secrets

```bash
# Use the secret manager to generate strong secrets
node -e "
const { secretManager } = require('./src/config/secrets');
console.log('API Key:', secretManager.generateKey(32));
console.log('JWT Secret:', secretManager.generateKey(32));
console.log('Session Key:', secretManager.generateKey(32));
console.log('DB Encryption Key:', secretManager.generateKey(32));
"
```

### 4. Validate Configuration

```bash
npm run env:validate
```

### 5. Start Development

```bash
npm start
```

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables

**Error**: `Missing required environment variables`

**Solution**: 
- Check that all required variables are set
- Verify environment file naming and location
- Run `npm run env:validate` for detailed validation

#### 2. Invalid Secrets

**Error**: `Secret does not meet security requirements`

**Solution**:
- Ensure secrets are at least 32 characters
- Include uppercase, lowercase, numbers, and special characters
- Use the secret manager to generate strong secrets

#### 3. Environment File Not Loading

**Error**: `Environment variables not found`

**Solution**:
- Check file naming (`.env.local`, `.env.development`, etc.)
- Verify file location (project root)
- Check file permissions
- Restart the development server

#### 4. Build Failures

**Error**: `Build configuration validation failed`

**Solution**:
- Check environment-specific build settings
- Verify all required variables are present
- Run `npm run env:validate` before building

### Debug Commands

```bash
# Check environment variables
npm run env:check

# Validate configuration
npm run env:validate

# Check build configuration
npm run type-check

# Run tests
npm run test
```

### Getting Help

1. **Check the logs**: Look for specific error messages
2. **Validate environment**: Run `npm run env:validate`
3. **Check configuration**: Verify all required variables are set
4. **Review documentation**: Check this guide and code comments
5. **Test in isolation**: Try running individual components

## Security Best Practices

### Secret Management

1. **Never commit secrets**: Use `.gitignore` to exclude `.env*` files
2. **Use strong secrets**: Generate secrets with the secret manager
3. **Rotate regularly**: Change secrets periodically
4. **Environment-specific**: Use different secrets for each environment
5. **Secure storage**: Use secure secret management in production

### Environment Security

1. **Validate input**: Always validate environment variables
2. **Use HTTPS**: Ensure API URLs use HTTPS in production
3. **Enable security headers**: Use CSP, HSTS, and other security headers
4. **Monitor access**: Log and monitor configuration access
5. **Regular audits**: Periodically review and update configurations

## Compliance

### GDPR Compliance

- Set `REACT_APP_GDPR_COMPLIANCE=true`
- Enable data processing consent
- Configure data retention policies
- Use anonymous analytics

### HIPAA Compliance

- Set `REACT_APP_HIPAA_COMPLIANCE=true`
- Enable PHI encryption
- Use secure communication
- Implement audit logging

### Data Privacy

- Configure data retention periods
- Use anonymous analytics
- Disable unnecessary data collection
- Implement consent management
