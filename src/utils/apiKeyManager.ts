/**
 * @fileoverview apiKeyManager.ts - Secure API Key Management
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';
import { securityUtils } from './securityUtils';

// API Key configuration interface
export interface ApiKeyConfig {
  name: string;
  key: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  required: boolean;
  encrypted: boolean;
  lastRotated?: Date;
  expiresAt?: Date;
}

// API Key validation result
export interface ApiKeyValidation {
  isValid: boolean;
  key: string;
  environment: string;
  errors: string[];
}

// API Key manager class
export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKeys: Map<string, ApiKeyConfig> = new Map();
  private encryptedKeys: Map<string, string> = new Map();

  private constructor() {
    this.initializeApiKeys();
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  private initializeApiKeys(): void {
    // Define all API keys used in the application
    const keyDefinitions: ApiKeyConfig[] = [
      {
        name: 'USDA_API_KEY',
        key: 'REACT_APP_USDA_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: false,
      },
      {
        name: 'SPOONACULAR_API_KEY',
        key: 'REACT_APP_SPOONACULAR_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: false,
      },
      {
        name: 'GOOGLE_VISION_API_KEY',
        key: 'REACT_APP_GOOGLE_VISION_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: false,
      },
      {
        name: 'OPENFOODFACTS_API_KEY',
        key: 'REACT_APP_OPENFOODFACTS_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: false,
      },
      {
        name: 'AI_API_KEY',
        key: 'REACT_APP_AI_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: true,
      },
      {
        name: 'ML_API_KEY',
        key: 'REACT_APP_ML_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: true,
      },
      {
        name: 'ANALYTICS_API_KEY',
        key: 'REACT_APP_ANALYTICS_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: false,
      },
      {
        name: 'MONITORING_API_KEY',
        key: 'REACT_APP_MONITORING_API_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: false,
        encrypted: true,
      },
      {
        name: 'ENCRYPTION_KEY',
        key: 'REACT_APP_ENCRYPTION_KEY',
        environment: process.env.NODE_ENV as any || 'development',
        required: true,
        encrypted: false,
      },
      {
        name: 'JWT_SECRET',
        key: 'REACT_APP_JWT_SECRET',
        environment: process.env.NODE_ENV as any || 'development',
        required: true,
        encrypted: false,
      },
      {
        name: 'SESSION_SECRET',
        key: 'REACT_APP_SESSION_SECRET',
        environment: process.env.NODE_ENV as any || 'development',
        required: true,
        encrypted: false,
      },
    ];

    // Initialize API keys
    keyDefinitions.forEach(config => {
      this.apiKeys.set(config.name, config);
    });

    logger.info('API Key Manager initialized', 'ApiKeyManager', {
      totalKeys: this.apiKeys.size,
      environment: process.env.NODE_ENV,
    });
  }

  // Get API key securely
  async getApiKey(keyName: string): Promise<string | null> {
    try {
      const config = this.apiKeys.get(keyName);
      if (!config) {
        logger.warn('API key not found', 'ApiKeyManager', { keyName });
        return null;
      }

      // Check if key is expired
      if (config.expiresAt && config.expiresAt < new Date()) {
        logger.warn('API key expired', 'ApiKeyManager', { keyName, expiresAt: config.expiresAt });
        return null;
      }

      // Get key from environment
      const envKey = process.env[config.key];
      if (!envKey) {
        if (config.required) {
          logger.error('Required API key missing', 'ApiKeyManager', { keyName, envKey: config.key });
          throw new Error(`Required API key ${keyName} is missing`);
        }
        logger.warn('Optional API key missing', 'ApiKeyManager', { keyName, envKey: config.key });
        return null;
      }

      // Decrypt if necessary
      if (config.encrypted) {
        try {
          const decryptedKey = await securityUtils.decryptData(envKey);
          return decryptedKey;
        } catch (error) {
          logger.error('Failed to decrypt API key', 'ApiKeyManager', { keyName, error });
          return null;
        }
      }

      return envKey;
    } catch (error) {
      logger.error('Error getting API key', 'ApiKeyManager', { keyName, error });
      return null;
    }
  }

  // Validate API key
  validateApiKey(keyName: string): ApiKeyValidation {
    const config = this.apiKeys.get(keyName);
    const errors: string[] = [];

    if (!config) {
      return {
        isValid: false,
        key: keyName,
        environment: process.env.NODE_ENV || 'unknown',
        errors: ['API key configuration not found'],
      };
    }

    const envKey = process.env[config.key];
    
    if (!envKey) {
      if (config.required) {
        errors.push('Required API key is missing');
      }
    } else {
      // Validate key format based on type
      const validation = this.validateKeyFormat(keyName, envKey);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    // Check expiration
    if (config.expiresAt && config.expiresAt < new Date()) {
      errors.push('API key has expired');
    }

    return {
      isValid: errors.length === 0,
      key: keyName,
      environment: config.environment,
      errors,
    };
  }

  // Validate key format based on type
  private validateKeyFormat(keyName: string, key: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (keyName) {
      case 'ENCRYPTION_KEY':
        if (key.length < 32) {
          errors.push('Encryption key must be at least 32 characters long');
        }
        break;

      case 'JWT_SECRET':
      case 'SESSION_SECRET':
        if (key.length < 32) {
          errors.push('Secret must be at least 32 characters long');
        }
        break;

      case 'USDA_API_KEY':
        if (key.length < 10) {
          errors.push('USDA API key appears to be invalid');
        }
        break;

      case 'SPOONACULAR_API_KEY':
        if (key.length < 20) {
          errors.push('Spoonacular API key appears to be invalid');
        }
        break;

      case 'GOOGLE_VISION_API_KEY':
        if (!key.startsWith('AIza') || key.length < 30) {
          errors.push('Google Vision API key appears to be invalid');
        }
        break;

      case 'AI_API_KEY':
      case 'ML_API_KEY':
        if (key.length < 20) {
          errors.push('AI/ML API key appears to be invalid');
        }
        break;

      default:
        if (key.length < 8) {
          errors.push('API key appears to be too short');
        }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get all API key statuses
  getAllApiKeyStatuses(): ApiKeyValidation[] {
    const statuses: ApiKeyValidation[] = [];
    
    this.apiKeys.forEach((config, keyName) => {
      statuses.push(this.validateApiKey(keyName));
    });

    return statuses;
  }

  // Check if all required API keys are present
  checkRequiredKeys(): { allPresent: boolean; missing: string[] } {
    const missing: string[] = [];
    
    this.apiKeys.forEach((config, keyName) => {
      if (config.required) {
        const envKey = process.env[config.key];
        if (!envKey) {
          missing.push(keyName);
        }
      }
    });

    return {
      allPresent: missing.length === 0,
      missing,
    };
  }

  // Rotate API key (for development/testing)
  async rotateApiKey(keyName: string, newKey: string): Promise<boolean> {
    try {
      const config = this.apiKeys.get(keyName);
      if (!config) {
        logger.warn('Cannot rotate unknown API key', 'ApiKeyManager', { keyName });
        return false;
      }

      // Validate new key
      const validation = this.validateKeyFormat(keyName, newKey);
      if (!validation.isValid) {
        logger.error('Invalid new API key format', 'ApiKeyManager', { keyName, errors: validation.errors });
        return false;
      }

      // Encrypt if necessary
      let processedKey = newKey;
      if (config.encrypted) {
        try {
          processedKey = await securityUtils.encryptData(newKey);
        } catch (error) {
          logger.error('Failed to encrypt new API key', 'ApiKeyManager', { keyName, error });
          return false;
        }
      }

      // Update environment variable (in development only)
      if (process.env.NODE_ENV === 'development') {
        process.env[config.key] = processedKey;
        config.lastRotated = new Date();
        logger.info('API key rotated', 'ApiKeyManager', { keyName });
        return true;
      } else {
        logger.warn('API key rotation not allowed in production', 'ApiKeyManager', { keyName });
        return false;
      }
    } catch (error) {
      logger.error('Error rotating API key', 'ApiKeyManager', { keyName, error });
      return false;
    }
  }

  // Get API key configuration
  getApiKeyConfig(keyName: string): ApiKeyConfig | null {
    return this.apiKeys.get(keyName) || null;
  }

  // List all API keys (without values)
  listApiKeys(): Array<{ name: string; required: boolean; encrypted: boolean; present: boolean }> {
    const keys: Array<{ name: string; required: boolean; encrypted: boolean; present: boolean }> = [];
    
    this.apiKeys.forEach((config, keyName) => {
      keys.push({
        name: keyName,
        required: config.required,
        encrypted: config.encrypted,
        present: !!process.env[config.key],
      });
    });

    return keys;
  }

  // Security audit for API keys
  performSecurityAudit(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check required keys
    const requiredCheck = this.checkRequiredKeys();
    if (!requiredCheck.allPresent) {
      issues.push(`Missing required API keys: ${requiredCheck.missing.join(', ')}`);
      score -= 30;
    }

    // Check key strength
    const statuses = this.getAllApiKeyStatuses();
    const weakKeys = statuses.filter(status => !status.isValid);
    if (weakKeys.length > 0) {
      issues.push(`Weak or invalid API keys: ${weakKeys.map(k => k.key).join(', ')}`);
      score -= 20;
    }

    // Check for hardcoded keys in development
    if (process.env.NODE_ENV === 'development') {
      const hardcodedKeys = statuses.filter(status => 
        status.key.includes('dev_') || status.key.includes('test_')
      );
      if (hardcodedKeys.length > 0) {
        issues.push('Hardcoded API keys detected in development');
        score -= 10;
      }
    }

    // Generate recommendations
    if (score < 80) {
      recommendations.push('Review and strengthen API key configuration');
    }
    if (score < 70) {
      recommendations.push('Implement proper API key rotation');
    }
    if (score < 60) {
      recommendations.push('Add API key monitoring and alerting');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}

// Export singleton instance
export const apiKeyManager = ApiKeyManager.getInstance();
export default apiKeyManager;
