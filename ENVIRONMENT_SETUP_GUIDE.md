# Complete Environment Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the complete environment and configuration system for the GutSafe application.

## Quick Start

### 1. Run the Complete Setup

```bash
# Run the automated setup script
npm run env:setup

# Or run for a specific environment
npm run env:setup development
```

### 2. Generate Secrets

```bash
# Generate secrets for all environments
npm run secrets:generate

# Or generate for specific environments
npm run secrets:generate:dev
npm run secrets:generate:staging
npm run secrets:generate:prod
npm run secrets:generate:test
```

### 3. Validate Configuration

```bash
# Validate the current environment
npm run env:validate

# Check environment variables
npm run env:check
```

### 4. Test Health Monitoring

```bash
# Run health checks
npm run health:check
```

## Manual Setup

### Step 1: Create Environment Files

Copy the example environment files to create your actual environment files:

```bash
# Copy environment files
cp env.development.example .env.development
cp env.staging.example .env.staging
cp env.production.example .env.production
cp env.test.example .env.test

# Create local override file
cp env.development.example .env.local
```

### Step 2: Generate Strong Secrets

Use the secret generation script to create cryptographically secure secrets:

```bash
# Generate secrets for development
node scripts/generate-secrets.js development

# This will create a file called secrets.development.generated
# Copy the secrets from this file to your .env.development file
```

### Step 3: Update Environment Files

Edit your environment files with the generated secrets and your actual configuration:

```bash
# Edit development environment
nano .env.development

# Edit production environment
nano .env.production
```

### Step 4: Validate Configuration

Run the validation script to ensure everything is configured correctly:

```bash
npm run env:validate
```

## Environment-Specific Setup

### Development Environment

```bash
# Set up development environment
npm run env:setup development

# Generate development secrets
npm run secrets:generate:dev

# Start development server
npm start
```

### Staging Environment

```bash
# Set up staging environment
npm run env:setup staging

# Generate staging secrets
npm run secrets:generate:staging

# Build for staging
npm run deploy:staging
```

### Production Environment

```bash
# Set up production environment
npm run env:setup production

# Generate production secrets
npm run secrets:generate:prod

# Build for production
npm run deploy:prod
```

### Test Environment

```bash
# Set up test environment
npm run env:setup test

# Generate test secrets
npm run secrets:generate:test

# Run tests
npm test
```

## Secret Management

### Generating Secrets

The secret generation script creates strong, cryptographically secure secrets:

```bash
# Generate secrets for all environments
node scripts/generate-secrets.js

# Generate for specific environment
node scripts/generate-secrets.js production
```

### Secret Requirements

All secrets must meet these requirements:

- **Minimum length**: 32 characters
- **Character variety**: Uppercase, lowercase, numbers, special characters
- **Uniqueness**: Different for each environment
- **Strength**: Minimum 60% strength score

### Secret Types

The system generates these types of secrets:

- **API Key**: For API authentication
- **API Secret**: For API secret authentication
- **JWT Secret**: For JWT token signing
- **Session Key**: For session encryption
- **Database Encryption Key**: For database encryption
- **FCM Server Key**: For push notifications
- **AI API Key**: For AI services
- **ML API Key**: For machine learning services
- **Monitoring Key**: For monitoring services

## Configuration Validation

### Running Validation

```bash
# Validate current environment
npm run env:validate

# Check specific environment
NODE_ENV=production npm run env:validate
```

### Validation Checks

The validation system checks:

1. **Required Environment Variables**: All necessary variables are present
2. **Secret Strength**: All secrets meet security requirements
3. **Environment-Specific Rules**: Different rules for each environment
4. **Configuration Access**: Configuration can be loaded and accessed
5. **Build Configuration**: Build settings are valid
6. **Security Settings**: Security configurations are proper

### Fixing Validation Errors

Common validation errors and solutions:

#### Missing Environment Variables
```bash
# Error: Missing required environment variables
# Solution: Check that all required variables are set in your .env file
```

#### Invalid Secrets
```bash
# Error: Secret does not meet security requirements
# Solution: Generate new secrets using the secret generation script
```

#### Configuration Access Errors
```bash
# Error: Configuration validation failed
# Solution: Check that the configuration files are properly formatted
```

## Health Monitoring

### Running Health Checks

```bash
# Run all health checks
npm run health:check

# Run specific health check categories
node -e "
const { healthChecks } = require('./src/config/health');
healthChecks.runByCategory('secrets').then(checks => 
  console.log(checks.map(c => \`\${c.name}: \${c.status}\`))
);
"
```

### Health Check Categories

- **Configuration**: Environment variables and configuration access
- **Secrets**: Secret validation and strength
- **API**: API configuration and connectivity
- **Security**: Security headers and settings
- **Performance**: Build optimization and performance
- **Database**: Database connectivity and configuration
- **Monitoring**: Monitoring and analytics setup

### Health Check Results

Health checks return one of three statuses:

- **Healthy**: ✅ Everything is working correctly
- **Degraded**: ⚠️ Some issues but not critical
- **Unhealthy**: ❌ Critical issues that need attention

## Deployment

### Development Deployment

```bash
# Build and serve development version
npm run deploy:dev

# Or use the full development setup
npm run env:setup development
npm run deploy:dev
```

### Staging Deployment

```bash
# Build and serve staging version
npm run deploy:staging

# Or use the full staging setup
npm run env:setup staging
npm run deploy:staging
```

### Production Deployment

```bash
# Build and serve production version
npm run deploy:prod

# Or use the full production setup
npm run env:setup production
npm run deploy:prod
```

### Docker Deployment

```bash
# Build Docker image for development
cd deployment/development
docker build -t gutsafe-dev .

# Run with Docker Compose
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### 1. Environment Files Not Found
```bash
# Error: Environment files not found
# Solution: Run the setup script to create environment files
npm run env:setup
```

#### 2. Secret Generation Failed
```bash
# Error: Secret generation failed
# Solution: Check Node.js version and crypto module availability
node --version
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 3. Validation Errors
```bash
# Error: Validation failed
# Solution: Check the validation output and fix the issues
npm run env:validate
```

#### 4. Health Check Failures
```bash
# Error: Health check failed
# Solution: Run individual health checks to identify the issue
npm run health:check
```

### Debug Commands

```bash
# Check environment variables
npm run env:check

# Validate configuration
npm run env:validate

# Run health checks
npm run health:check

# Check build configuration
npm run type-check

# Run tests
npm test
```

### Getting Help

1. **Check the logs**: Look for specific error messages
2. **Validate environment**: Run `npm run env:validate`
3. **Check health status**: Run `npm run health:check`
4. **Review configuration**: Check your environment files
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

## Next Steps

After completing the environment setup:

1. **Test the application**: Run `npm start` to test the development server
2. **Run tests**: Execute `npm test` to ensure everything works
3. **Deploy to staging**: Use `npm run deploy:staging` to test deployment
4. **Monitor health**: Use `npm run health:check` to monitor system health
5. **Set up CI/CD**: Configure continuous integration and deployment

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the validation output
3. Check the health monitoring results
4. Consult the configuration documentation
5. Contact the development team

The environment setup system is designed to be robust and self-diagnosing. Most issues can be resolved by running the validation and health check commands.
