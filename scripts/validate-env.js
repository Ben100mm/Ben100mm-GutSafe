#!/usr/bin/env node

/**
 * Enhanced Environment Validation Script
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Validates that all required environment variables are present and properly configured.
 * Uses the centralized configuration system for comprehensive validation.
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for different environments
const REQUIRED_VARS = {
  development: [
    'NODE_ENV',
    'PORT',
    'REACT_APP_API_BASE_URL',
    'REACT_APP_API_KEY',
    'REACT_APP_API_SECRET',
    'REACT_APP_JWT_SECRET',
    'REACT_APP_SESSION_KEY',
    'REACT_APP_DB_ENCRYPTION_KEY',
    'REACT_APP_DEBUG_MODE',
    'REACT_APP_LOG_LEVEL'
  ],
  production: [
    'NODE_ENV',
    'REACT_APP_API_BASE_URL',
    'REACT_APP_API_KEY',
    'REACT_APP_API_SECRET',
    'REACT_APP_DB_ENCRYPTION_KEY',
    'REACT_APP_JWT_SECRET',
    'REACT_APP_SESSION_KEY'
  ],
  staging: [
    'NODE_ENV',
    'REACT_APP_API_BASE_URL',
    'REACT_APP_API_KEY',
    'REACT_APP_API_SECRET',
    'REACT_APP_DB_ENCRYPTION_KEY',
    'REACT_APP_JWT_SECRET',
    'REACT_APP_SESSION_KEY'
  ],
  test: [
    'NODE_ENV',
    'REACT_APP_API_BASE_URL',
    'REACT_APP_API_KEY',
    'REACT_APP_API_SECRET',
    'REACT_APP_JWT_SECRET',
    'REACT_APP_SESSION_KEY',
    'REACT_APP_DB_ENCRYPTION_KEY'
  ]
};

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'REACT_APP_ENABLE_OFFLINE_MODE',
  'REACT_APP_ENABLE_ANALYTICS',
  'REACT_APP_ENABLE_CRASH_REPORTING',
  'REACT_APP_BIOMETRIC_ENABLED',
  'REACT_APP_ENCRYPTION_ALGORITHM',
  'REACT_APP_DATA_RETENTION_DAYS',
  'REACT_APP_GDPR_COMPLIANCE',
  'REACT_APP_TERMS_VERSION',
  'REACT_APP_PRIVACY_VERSION'
];

// Secret validation rules
const SECRET_RULES = {
  minLength: 32,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true,
};

function validateSecret(secret, minLength = SECRET_RULES.minLength) {
  if (!secret || secret.length < minLength) {
    return false;
  }
  
  if (SECRET_RULES.requireSpecialChars) {
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialChars.test(secret)) {
      return false;
    }
  }
  
  if (SECRET_RULES.requireNumbers) {
    const numbers = /\d/;
    if (!numbers.test(secret)) {
      return false;
    }
  }
  
  if (SECRET_RULES.requireUppercase) {
    const uppercase = /[A-Z]/;
    if (!uppercase.test(secret)) {
      return false;
    }
  }
  
  if (SECRET_RULES.requireLowercase) {
    const lowercase = /[a-z]/;
    if (!lowercase.test(secret)) {
      return false;
    }
  }
  
  return true;
}

function calculateSecretStrength(secret) {
  let strength = 0;
  
  // Length bonus
  strength += Math.min(secret.length * 2, 50);
  
  // Character variety bonus
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasNumbers = /\d/.test(secret);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);
  
  if (hasLower) strength += 10;
  if (hasUpper) strength += 10;
  if (hasNumbers) strength += 10;
  if (hasSpecial) strength += 20;
  
  // Entropy bonus
  const uniqueChars = new Set(secret).size;
  strength += Math.min(uniqueChars * 2, 30);
  
  return Math.min(strength, 100);
}

function getSecretStrengthLevel(strength) {
  if (strength >= 80) return 'Very Strong';
  if (strength >= 60) return 'Strong';
  if (strength >= 40) return 'Medium';
  if (strength >= 20) return 'Weak';
  return 'Very Weak';
}

function validateEnvironment() {
  const environment = process.env.NODE_ENV || 'development';
  const requiredVars = REQUIRED_VARS[environment] || REQUIRED_VARS.development;
  
  console.log(`🔍 Validating environment: ${environment}`);
  console.log('=' .repeat(50));
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables
  console.log('\n📋 Required Variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: Missing`);
      hasErrors = true;
    } else {
      // Mask sensitive values
      const displayValue = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASSWORD')
        ? '*'.repeat(Math.min(value.length, 8))
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
      
      // Validate secrets
      if (varName.includes('SECRET') || varName.includes('KEY')) {
        const isValid = validateSecret(value);
        const strength = calculateSecretStrength(value);
        const strengthLevel = getSecretStrengthLevel(strength);
        
        if (!isValid) {
          console.log(`   ❌ Secret validation failed: ${strengthLevel} (${strength}%)`);
          hasErrors = true;
        } else {
          console.log(`   ✅ Secret strength: ${strengthLevel} (${strength}%)`);
        }
      }
    }
  });
  
  // Check recommended variables
  console.log('\n💡 Recommended Variables:');
  RECOMMENDED_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚠️  ${varName}: Not set (optional)`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  });
  
  // Check for .env files
  console.log('\n📁 Environment Files:');
  const envFiles = ['.env.local', '.env.development', '.env.production', '.env.test'];
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.log(`⚠️  ${file}: Not found`);
    }
  });
  
  // Environment-specific validations
  console.log('\n🔧 Environment-Specific Validations:');
  validateEnvironmentSpecific(environment);
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  if (hasErrors) {
    console.log('❌ Validation failed: Missing required environment variables or invalid secrets');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Validation passed with warnings: Some recommended variables are missing');
    process.exit(0);
  } else {
    console.log('✅ Validation passed: All required variables are present and valid');
    process.exit(0);
  }
}

function validateEnvironmentSpecific(environment) {
  switch (environment) {
    case 'development':
      if (process.env.REACT_APP_DEBUG_MODE !== 'true') {
        console.log('⚠️  REACT_APP_DEBUG_MODE should be true in development');
      }
      break;
      
    case 'production':
      if (process.env.REACT_APP_DEBUG_MODE === 'true') {
        console.log('❌ REACT_APP_DEBUG_MODE should not be true in production');
      }
      if (process.env.REACT_APP_ENABLE_ANALYTICS !== 'true') {
        console.log('⚠️  REACT_APP_ENABLE_ANALYTICS should be true in production');
      }
      break;
      
    case 'test':
      if (process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
        console.log('⚠️  REACT_APP_ENABLE_ANALYTICS should be false in test environment');
      }
      break;
  }
}

// Run validation
if (require.main === module) {
  validateEnvironment();
}

module.exports = { 
  validateEnvironment, 
  validateSecret,
  calculateSecretStrength,
  getSecretStrengthLevel,
  REQUIRED_VARS, 
  RECOMMENDED_VARS 
};
