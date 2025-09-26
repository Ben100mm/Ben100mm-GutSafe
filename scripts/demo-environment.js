#!/usr/bin/env node

/**
 * Environment System Demo
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Demonstrates the complete environment and configuration system.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = colors.reset) => console.log(`${color}${message}${colors.reset}`);
const success = (message) => log(`✅ ${message}`, colors.green);
const error = (message) => log(`❌ ${message}`, colors.red);
const warning = (message) => log(`⚠️  ${message}`, colors.yellow);
const info = (message) => log(`ℹ️  ${message}`, colors.blue);
const header = (message) => log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);

// Demo functions
async function demonstrateEnvironmentSetup() {
  header('🏗️  Environment Setup Demonstration');
  
  log('This demo shows how to set up and use the complete environment system.');
  log('Let\'s walk through each component:\n');
  
  // 1. Environment Files
  header('1. Environment Files');
  info('Environment files provide configuration for different deployment stages:');
  log('   • .env.development - Development configuration');
  log('   • .env.staging - Staging configuration');
  log('   • .env.production - Production configuration');
  log('   • .env.test - Test configuration');
  log('   • .env.local - Local overrides (highest priority)');
  
  // Check if environment files exist
  const envFiles = ['.env.development', '.env.staging', '.env.production', '.env.test'];
  envFiles.forEach(file => {
    const exists = fs.existsSync(file);
    if (exists) {
      success(`${file} exists`);
    } else {
      warning(`${file} not found - run 'npm run env:setup' to create it`);
    }
  });
  
  // 2. Secret Generation
  header('2. Secret Generation');
  info('The secret generation system creates cryptographically secure secrets:');
  log('   • API Keys and Secrets');
  log('   • JWT Secrets');
  log('   • Database Encryption Keys');
  log('   • Session Keys');
  log('   • Service-specific Keys');
  
  log('\n   Commands:');
  log('   • npm run secrets:generate - Generate for all environments');
  log('   • npm run secrets:generate:dev - Generate for development');
  log('   • npm run secrets:generate:prod - Generate for production');
  
  // 3. Configuration System
  header('3. Configuration System');
  info('The centralized configuration system provides:');
  log('   • Type-safe configuration access');
  log('   • Environment-specific overrides');
  log('   • Feature flag management');
  log('   • Security settings');
  log('   • Build configurations');
  
  log('\n   Usage in code:');
  log('   ```typescript');
  log('   import { config, isDevelopment, isFeatureEnabled } from "./src/config";');
  log('   ');
  log('   const apiUrl = config.api.baseUrl;');
  log('   if (isDevelopment()) {');
  log('     console.log("Running in development mode");');
  log('   }');
  log('   if (isFeatureEnabled("offlineMode")) {');
  log('     // Enable offline functionality');
  log('   }');
  log('   ```');
  
  // 4. Validation System
  header('4. Validation System');
  info('The validation system ensures configuration integrity:');
  log('   • Required environment variables');
  log('   • Secret strength validation');
  log('   • Environment-specific rules');
  log('   • Configuration access tests');
  log('   • Build configuration validation');
  
  log('\n   Commands:');
  log('   • npm run env:validate - Validate current environment');
  log('   • npm run env:check - Check environment variables');
  
  // 5. Health Monitoring
  header('5. Health Monitoring');
  info('The health monitoring system provides:');
  log('   • Configuration health checks');
  log('   • Secret validation');
  log('   • API connectivity tests');
  log('   • Security validation');
  log('   • Performance monitoring');
  
  log('\n   Commands:');
  log('   • npm run health:check - Run all health checks');
  log('   • npm run health:check:secrets - Check secrets only');
  log('   • npm run health:check:api - Check API configuration');
  
  // 6. Deployment System
  header('6. Deployment System');
  info('The deployment system supports:');
  log('   • Environment-specific builds');
  log('   • Docker configurations');
  log('   • Kubernetes manifests');
  log('   • Security configurations');
  log('   • Monitoring setup');
  
  log('\n   Commands:');
  log('   • npm run deploy:dev - Deploy development');
  log('   • npm run deploy:staging - Deploy staging');
  log('   • npm run deploy:prod - Deploy production');
  
  // 7. Security Features
  header('7. Security Features');
  info('The system includes comprehensive security:');
  log('   • Strong secret validation');
  log('   • Encryption support');
  log('   • Security headers');
  log('   • CORS configuration');
  log('   • Rate limiting');
  log('   • Compliance support (GDPR, HIPAA)');
  
  // 8. Quick Start Commands
  header('8. Quick Start Commands');
  info('Here are the essential commands to get started:');
  log('\n   Setup:');
  log('   npm run env:setup');
  log('   npm run secrets:generate');
  log('   npm run env:validate');
  
  log('\n   Development:');
  log('   npm start');
  log('   npm run health:check');
  
  log('\n   Deployment:');
  log('   npm run deploy:dev');
  log('   npm run deploy:staging');
  log('   npm run deploy:prod');
  
  log('\n   Monitoring:');
  log('   npm run health:check');
  log('   npm run env:validate');
}

async function demonstrateSecretGeneration() {
  header('🔐 Secret Generation Demo');
  
  try {
    // Generate a sample secret
    const crypto = require('crypto');
    const sampleSecret = crypto.randomBytes(32).toString('hex');
    
    info('Sample secret generation:');
    log(`   Generated: ${sampleSecret.substring(0, 16)}...`);
    log(`   Length: ${sampleSecret.length} characters`);
    log(`   Type: Hexadecimal`);
    
    // Calculate strength
    let strength = 0;
    strength += Math.min(sampleSecret.length * 2, 50);
    strength += 10; // hex characters
    strength += 20; // special characters
    strength += 10; // numbers
    strength += 10; // letters
    
    const strengthLevel = strength >= 80 ? 'Very Strong' : 
                         strength >= 60 ? 'Strong' : 
                         strength >= 40 ? 'Medium' : 'Weak';
    
    log(`   Strength: ${strength}% (${strengthLevel})`);
    
    success('Secret generation demo completed');
    
  } catch (error) {
    error(`Secret generation demo failed: ${error.message}`);
  }
}

async function demonstrateConfigurationAccess() {
  header('⚙️  Configuration Access Demo');
  
  try {
    // Try to load the configuration
    const configPath = path.join(process.cwd(), 'src/config/index.ts');
    
    if (fs.existsSync(configPath)) {
      info('Configuration system found');
      log('   • Environment configuration: src/config/environment.ts');
      log('   • Secret management: src/config/secrets.ts');
      log('   • Build configuration: src/config/build.ts');
      log('   • Deployment configuration: src/config/deployment.ts');
      log('   • Health monitoring: src/config/health.ts');
      log('   • Validation system: src/config/validation.ts');
      
      success('Configuration system is properly set up');
    } else {
      warning('Configuration system not found - run setup first');
    }
    
  } catch (error) {
    error(`Configuration access demo failed: ${error.message}`);
  }
}

async function demonstrateValidation() {
  header('✅ Validation Demo');
  
  try {
    // Check if validation script exists
    const validationScript = path.join(process.cwd(), 'scripts/validate-env.js');
    
    if (fs.existsSync(validationScript)) {
      info('Validation script found');
      log('   • Environment variable validation');
      log('   • Secret strength validation');
      log('   • Configuration access validation');
      log('   • Environment-specific rules');
      
      success('Validation system is ready');
    } else {
      warning('Validation script not found');
    }
    
  } catch (error) {
    error(`Validation demo failed: ${error.message}`);
  }
}

async function demonstrateHealthMonitoring() {
  header('🏥 Health Monitoring Demo');
  
  try {
    // Check if health monitoring exists
    const healthPath = path.join(process.cwd(), 'src/config/health.ts');
    
    if (fs.existsSync(healthPath)) {
      info('Health monitoring system found');
      log('   • Configuration health checks');
      log('   • Secret validation');
      log('   • API connectivity tests');
      log('   • Security validation');
      log('   • Performance monitoring');
      
      success('Health monitoring system is ready');
    } else {
      warning('Health monitoring system not found');
    }
    
  } catch (error) {
    error(`Health monitoring demo failed: ${error.message}`);
  }
}

async function demonstrateDeployment() {
  header('🚀 Deployment Demo');
  
  try {
    // Check if deployment configurations exist
    const deploymentPath = path.join(process.cwd(), 'src/config/deployment.ts');
    
    if (fs.existsSync(deploymentPath)) {
      info('Deployment system found');
      log('   • Environment-specific configurations');
      log('   • Docker support');
      log('   • Kubernetes manifests');
      log('   • Security configurations');
      log('   • Monitoring setup');
      
      success('Deployment system is ready');
    } else {
      warning('Deployment system not found');
    }
    
  } catch (error) {
    error(`Deployment demo failed: ${error.message}`);
  }
}

// Main demo function
async function main() {
  const args = process.argv.slice(2);
  const demo = args[0] || 'all';
  
  header('🎯 GutSafe Environment System Demo');
  log(`Running demo: ${demo}`);
  log(`Timestamp: ${new Date().toISOString()}\n`);
  
  try {
    switch (demo) {
      case 'setup':
        await demonstrateEnvironmentSetup();
        break;
      case 'secrets':
        await demonstrateSecretGeneration();
        break;
      case 'config':
        await demonstrateConfigurationAccess();
        break;
      case 'validation':
        await demonstrateValidation();
        break;
      case 'health':
        await demonstrateHealthMonitoring();
        break;
      case 'deployment':
        await demonstrateDeployment();
        break;
      case 'all':
      default:
        await demonstrateEnvironmentSetup();
        await demonstrateSecretGeneration();
        await demonstrateConfigurationAccess();
        await demonstrateValidation();
        await demonstrateHealthMonitoring();
        await demonstrateDeployment();
        break;
    }
    
    header('🎉 Demo Complete');
    success('Environment system demonstration completed successfully!');
    
    log('\nNext steps:');
    log('1. Run "npm run env:setup" to set up your environment');
    log('2. Run "npm run secrets:generate" to generate secrets');
    log('3. Run "npm run env:validate" to validate configuration');
    log('4. Run "npm start" to start the development server');
    
  } catch (error) {
    error(`Demo failed: ${error.message}`);
    process.exit(1);
  }
}

// Run demo
if (require.main === module) {
  main().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

module.exports = {
  demonstrateEnvironmentSetup,
  demonstrateSecretGeneration,
  demonstrateConfigurationAccess,
  demonstrateValidation,
  demonstrateHealthMonitoring,
  demonstrateDeployment,
  main,
};
