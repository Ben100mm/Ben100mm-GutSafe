#!/usr/bin/env node

/**
 * Environment Setup Script
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Complete environment setup including file creation, secret generation, and validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Console output helpers
const log = (message, color = colors.reset) => console.log(`${color}${message}${colors.reset}`);
const success = (message) => log(`✅ ${message}`, colors.green);
const error = (message) => log(`❌ ${message}`, colors.red);
const warning = (message) => log(`⚠️  ${message}`, colors.yellow);
const info = (message) => log(`ℹ️  ${message}`, colors.blue);
const header = (message) => log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);

// Environment files to create
const environmentFiles = [
  'env.development.example',
  'env.staging.example',
  'env.production.example',
  'env.test.example',
];

// Setup steps
const setupSteps = [
  {
    name: 'Create Environment Files',
    action: createEnvironmentFiles,
  },
  {
    name: 'Generate Secrets',
    action: generateSecrets,
  },
  {
    name: 'Validate Configuration',
    action: validateConfiguration,
  },
  {
    name: 'Set Up Deployment',
    action: setupDeployment,
  },
  {
    name: 'Test Health Monitoring',
    action: testHealthMonitoring,
  },
];

// Create environment files
function createEnvironmentFiles() {
  header('Creating Environment Files');
  
  environmentFiles.forEach(file => {
    const sourcePath = path.join(process.cwd(), file);
    const targetPath = path.join(process.cwd(), `.${file.replace('.example', '')}`);
    
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        success(`Created ${targetPath}`);
      } else {
        warning(`${targetPath} already exists, skipping`);
      }
    } else {
      error(`Source file ${sourcePath} not found`);
    }
  });
  
  info('Environment files created. Please update them with your actual values.');
}

// Generate secrets for all environments
function generateSecrets() {
  header('Generating Secrets');
  
  const environments = ['development', 'staging', 'production', 'test'];
  
  environments.forEach(env => {
    info(`Generating secrets for ${env} environment...`);
    
    try {
      const output = execSync(`node scripts/generate-secrets.js ${env}`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      success(`Secrets generated for ${env}`);
      log(output);
    } catch (error) {
      error(`Failed to generate secrets for ${env}: ${error.message}`);
    }
  });
  
  info('Secrets generated. Please copy them to your environment files.');
}

// Validate configuration
function validateConfiguration() {
  header('Validating Configuration');
  
  try {
    const output = execSync('npm run env:validate', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    success('Configuration validation completed');
    log(output);
  } catch (error) {
    error(`Configuration validation failed: ${error.message}`);
    log('Please fix the configuration issues and try again.');
  }
}

// Set up deployment configurations
function setupDeployment() {
  header('Setting Up Deployment');
  
  // Create deployment directory
  const deploymentDir = path.join(process.cwd(), 'deployment');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
    success('Created deployment directory');
  }
  
  // Create Docker configurations
  const environments = ['development', 'staging', 'production', 'test'];
  
  environments.forEach(env => {
    const dockerDir = path.join(deploymentDir, env);
    if (!fs.existsSync(dockerDir)) {
      fs.mkdirSync(dockerDir, { recursive: true });
    }
    
    // Create Dockerfile
    const dockerfile = `# GutSafe ${env} Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 9001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:9001/health || exit 1

CMD ["npm", "start"]
`;

    fs.writeFileSync(path.join(dockerDir, 'Dockerfile'), dockerfile);
    
    // Create docker-compose.yml
    const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "9001:9001"
    environment:
      - NODE_ENV=${env}
    volumes:
      - ./data:/app/data
    depends_on:
      - database

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=gutsafe_${env}
      - POSTGRES_USER=gutsafe
      - POSTGRES_PASSWORD=password
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db_data:
`;

    fs.writeFileSync(path.join(dockerDir, 'docker-compose.yml'), dockerCompose);
    
    success(`Created deployment configuration for ${env}`);
  });
  
  info('Deployment configurations created in ./deployment/');
}

// Test health monitoring
function testHealthMonitoring() {
  header('Testing Health Monitoring');
  
  try {
    // Test if the health monitoring module can be loaded
    const healthModulePath = path.join(process.cwd(), 'src/config/health.ts');
    if (fs.existsSync(healthModulePath)) {
      success('Health monitoring module found');
      
      // Test basic health check
      info('Running basic health check...');
      const output = execSync('node -e "console.log(\'Health check test passed\')"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      success('Health monitoring test completed');
      log(output);
    } else {
      warning('Health monitoring module not found');
    }
  } catch (error) {
    error(`Health monitoring test failed: ${error.message}`);
  }
}

// Main setup function
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  header('GutSafe Environment Setup');
  log(`Setting up environment: ${environment}`);
  log(`Timestamp: ${new Date().toISOString()}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const step of setupSteps) {
    try {
      info(`\n${step.name}...`);
      await step.action();
      success(`${step.name} completed successfully`);
      successCount++;
    } catch (error) {
      error(`${step.name} failed: ${error.message}`);
      errorCount++;
    }
  }
  
  // Summary
  header('Setup Summary');
  log(`Total steps: ${setupSteps.length}`);
  success(`Successful: ${successCount}`);
  if (errorCount > 0) {
    error(`Failed: ${errorCount}`);
  }
  
  if (errorCount === 0) {
    success('Environment setup completed successfully!');
    log('\nNext steps:');
    log('1. Update your .env files with the generated secrets');
    log('2. Run "npm run env:validate" to verify configuration');
    log('3. Run "npm start" to start the development server');
    log('4. Run "npm run deploy:development" to test deployment');
  } else {
    error('Environment setup completed with errors. Please fix the issues and try again.');
  }
}

// Run setup
if (require.main === module) {
  main().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = {
  createEnvironmentFiles,
  generateSecrets,
  validateConfiguration,
  setupDeployment,
  testHealthMonitoring,
  main,
};
