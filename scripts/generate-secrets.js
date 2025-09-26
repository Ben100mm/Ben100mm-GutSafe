#!/usr/bin/env node

/**
 * Secret Generation Script
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Generates strong, cryptographically secure secrets for all environments.
 */

const crypto = require('crypto');

// Secret generation configuration
const SECRET_CONFIG = {
  apiKey: { length: 32, description: 'API Key' },
  apiSecret: { length: 32, description: 'API Secret' },
  jwtSecret: { length: 64, description: 'JWT Secret' },
  sessionKey: { length: 32, description: 'Session Key' },
  dbEncryptionKey: { length: 32, description: 'Database Encryption Key' },
  fcmServerKey: { length: 24, description: 'FCM Server Key' },
  aiApiKey: { length: 32, description: 'AI API Key' },
  mlApiKey: { length: 32, description: 'ML API Key' },
  monitoringKey: { length: 32, description: 'Monitoring Key' },
};

// Character sets for different secret types
const CHARACTER_SETS = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  withSpecial: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  hex: '0123456789ABCDEF',
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
};

// Generate a cryptographically secure random string
function generateSecureString(length, charset = CHARACTER_SETS.withSpecial) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  
  return result;
}

// Generate a secret with specific requirements
function generateSecret(type, environment) {
  const config = SECRET_CONFIG[type];
  if (!config) {
    throw new Error(`Unknown secret type: ${type}`);
  }
  
  let charset = CHARACTER_SETS.withSpecial;
  
  // Use different character sets for different secret types
  if (type === 'fcmServerKey') {
    charset = CHARACTER_SETS.base64;
  } else if (type === 'dbEncryptionKey') {
    charset = CHARACTER_SETS.hex;
  }
  
  const secret = generateSecureString(config.length, charset);
  
  return {
    type,
    environment,
    secret,
    length: secret.length,
    strength: calculateSecretStrength(secret),
    description: config.description,
  };
}

// Calculate secret strength (0-100)
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

// Get strength level
function getSecretStrengthLevel(strength) {
  if (strength >= 80) return 'Very Strong';
  if (strength >= 60) return 'Strong';
  if (strength >= 40) return 'Medium';
  if (strength >= 20) return 'Weak';
  return 'Very Weak';
}

// Generate all secrets for an environment
function generateEnvironmentSecrets(environment) {
  const secrets = {};
  
  Object.keys(SECRET_CONFIG).forEach(type => {
    const secretData = generateSecret(type, environment);
    secrets[type] = secretData;
  });
  
  return secrets;
}

// Format secrets for environment file
function formatSecretsForEnv(secrets, environment) {
  let output = `# Generated secrets for ${environment} environment\n`;
  output += `# Generated on: ${new Date().toISOString()}\n\n`;
  
  Object.values(secrets).forEach(secretData => {
    const envVarName = `REACT_APP_${secretData.type.toUpperCase()}`;
    output += `# ${secretData.description} (${secretData.strength}% strength)\n`;
    output += `${envVarName}=${secretData.secret}\n\n`;
  });
  
  return output;
}

// Display secrets in a formatted table
function displaySecretsTable(secrets, environment) {
  console.log(`\n🔐 Generated Secrets for ${environment.toUpperCase()} Environment`);
  console.log('=' .repeat(80));
  console.log('Type'.padEnd(20) + 'Secret'.padEnd(40) + 'Strength'.padEnd(15) + 'Length');
  console.log('-'.repeat(80));
  
  Object.values(secrets).forEach(secretData => {
    const maskedSecret = secretData.secret.substring(0, 8) + '...';
    const strength = `${secretData.strength}% (${getSecretStrengthLevel(secretData.strength)})`;
    console.log(
      secretData.type.padEnd(20) +
      maskedSecret.padEnd(40) +
      strength.padEnd(15) +
      secretData.length.toString()
    );
  });
  
  console.log('-'.repeat(80));
  console.log(`Total secrets generated: ${Object.keys(secrets).length}`);
  console.log(`Average strength: ${Math.round(Object.values(secrets).reduce((sum, s) => sum + s.strength, 0) / Object.keys(secrets).length)}%`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  console.log('🔐 GutSafe Secret Generator');
  console.log('=' .repeat(50));
  console.log(`Environment: ${environment}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Generate secrets
    const secrets = generateEnvironmentSecrets(environment);
    
    // Display table
    displaySecretsTable(secrets, environment);
    
    // Generate environment file content
    const envContent = formatSecretsForEnv(secrets, environment);
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const filename = `secrets.${environment}.generated`;
    const filepath = path.join(process.cwd(), filename);
    
    fs.writeFileSync(filepath, envContent);
    console.log(`\n✅ Secrets saved to: ${filename}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Copy the secrets from ${filename} to your .env.${environment} file`);
    console.log(`2. Update your environment variables with the generated secrets`);
    console.log(`3. Run 'npm run env:validate' to verify the configuration`);
    console.log(`4. Delete the ${filename} file for security`);
    
  } catch (error) {
    console.error('❌ Error generating secrets:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateSecret,
  generateEnvironmentSecrets,
  calculateSecretStrength,
  getSecretStrengthLevel,
  formatSecretsForEnv,
};
