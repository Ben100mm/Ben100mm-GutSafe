/**
 * Secret Management System
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Centralized secret management with encryption and validation.
 */

import CryptoJS from 'crypto-js';
import { config } from './environment';

// Secret types
export interface SecretConfig {
  key: string;
  encrypted: boolean;
  algorithm?: string;
  iterations?: number;
}

export interface SecretManager {
  encrypt(plaintext: string, key?: string): string;
  decrypt(ciphertext: string, key?: string): string;
  hash(plaintext: string, salt?: string): string;
  generateKey(length?: number): string;
  validateSecret(secret: string, minLength?: number): boolean;
  calculateSecretStrength(secret: string): number;
}

// Secret validation rules
const SECRET_VALIDATION_RULES = {
  minLength: 32,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true,
} as const;

// Secret manager implementation
class SecretManagerImpl implements SecretManager {
  private readonly defaultKey: string;
  private readonly iterations: number;

  constructor() {
    this.defaultKey = config.security.sessionKey;
    this.iterations = config.security.keyDerivationIterations;
  }

  /**
   * Encrypt a plaintext string using AES encryption
   */
  encrypt(plaintext: string, key?: string): string {
    try {
      const encryptionKey = key || this.defaultKey;
      const encrypted = CryptoJS.AES.encrypt(plaintext, encryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt secret');
    }
  }

  /**
   * Decrypt a ciphertext string using AES decryption
   */
  decrypt(ciphertext: string, key?: string): string {
    try {
      const decryptionKey = key || this.defaultKey;
      const decrypted = CryptoJS.AES.decrypt(ciphertext, decryptionKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt secret');
    }
  }

  /**
   * Hash a plaintext string using PBKDF2
   */
  hash(plaintext: string, salt?: string): string {
    try {
      const saltValue = salt || CryptoJS.lib.WordArray.random(32).toString();
      const hashed = CryptoJS.PBKDF2(plaintext, saltValue, {
        keySize: 256 / 32,
        iterations: this.iterations,
      });
      return `${saltValue}:${hashed.toString()}`;
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash secret');
    }
  }

  /**
   * Generate a cryptographically secure random key
   */
  generateKey(length: number = 32): string {
    try {
      return CryptoJS.lib.WordArray.random(length).toString();
    } catch (error) {
      console.error('Key generation failed:', error);
      throw new Error('Failed to generate secret key');
    }
  }

  /**
   * Validate a secret against security requirements
   */
  validateSecret(secret: string, minLength: number = SECRET_VALIDATION_RULES.minLength): boolean {
    if (!secret || secret.length < minLength) {
      return false;
    }

    if (SECRET_VALIDATION_RULES.requireSpecialChars) {
      const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      if (!specialChars.test(secret)) {
        return false;
      }
    }

    if (SECRET_VALIDATION_RULES.requireNumbers) {
      const numbers = /\d/;
      if (!numbers.test(secret)) {
        return false;
      }
    }

    if (SECRET_VALIDATION_RULES.requireUppercase) {
      const uppercase = /[A-Z]/;
      if (!uppercase.test(secret)) {
        return false;
      }
    }

    if (SECRET_VALIDATION_RULES.requireLowercase) {
      const lowercase = /[a-z]/;
      if (!lowercase.test(secret)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate the strength of a secret
   */
  calculateSecretStrength(secret: string): number {
    return calculateSecretStrength(secret);
  }
}

// Create secret manager instance
export const secretManager = new SecretManagerImpl();

// Secret configuration for different environments
export const secretConfigs: Record<string, SecretConfig> = {
  development: {
    key: 'dev_secret_key_32_chars_long_123',
    encrypted: false,
    algorithm: 'AES-256-GCM',
    iterations: 10000,
  },
  staging: {
    key: 'staging_secret_key_32_chars_long_123',
    encrypted: true,
    algorithm: 'AES-256-GCM',
    iterations: 100000,
  },
  production: {
    key: 'prod_secret_key_32_chars_long_123',
    encrypted: true,
    algorithm: 'AES-256-GCM',
    iterations: 100000,
  },
  test: {
    key: 'test_secret_key_32_chars_long_123',
    encrypted: false,
    algorithm: 'AES-256-GCM',
    iterations: 1000,
  },
};

// Secret validation functions
export const validateApiKey = (apiKey: string): boolean => {
  return secretManager.validateSecret(apiKey, 16);
};

export const validateJwtSecret = (jwtSecret: string): boolean => {
  return secretManager.validateSecret(jwtSecret, 32);
};

export const validateEncryptionKey = (encryptionKey: string): boolean => {
  return secretManager.validateSecret(encryptionKey, 32);
};

export const validateSessionKey = (sessionKey: string): boolean => {
  return secretManager.validateSecret(sessionKey, 32);
};

// Secret rotation utilities
export const rotateSecret = (_oldSecret: string, newSecret: string): boolean => {
  if (!secretManager.validateSecret(newSecret)) {
    return false;
  }
  
  // In a real implementation, you would:
  // 1. Encrypt data with new secret
  // 2. Verify encryption works
  // 3. Update configuration
  // 4. Remove old secret
  
  return true;
};

// Secret strength calculator
export const calculateSecretStrength = (secret: string): number => {
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
};

// Secret strength levels
export const getSecretStrengthLevel = (strength: number): string => {
  if (strength >= 80) return 'Very Strong';
  if (strength >= 60) return 'Strong';
  if (strength >= 40) return 'Medium';
  if (strength >= 20) return 'Weak';
  return 'Very Weak';
};

// Environment-specific secret validation
export const validateEnvironmentSecrets = (_environment: string): boolean => {
  const requiredSecrets = [
    'REACT_APP_API_KEY',
    'REACT_APP_API_SECRET',
    'REACT_APP_JWT_SECRET',
    'REACT_APP_SESSION_KEY',
    'REACT_APP_DB_ENCRYPTION_KEY',
  ];

  for (const secretName of requiredSecrets) {
    const secretValue = process.env[secretName];
    if (!secretValue) {
      console.error(`Missing required secret: ${secretName}`);
      return false;
    }

    if (!secretManager.validateSecret(secretValue)) {
      console.error(`Invalid secret format: ${secretName}`);
      return false;
    }
  }

  return true;
};

// Export secret manager and utilities
export default secretManager;
