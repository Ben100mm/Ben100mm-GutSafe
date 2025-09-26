/**
 * @fileoverview encryption.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import * as CryptoJS from 'crypto-js';
import { logger } from './logger';

// Encryption configuration
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'gutsafe-health-data-key-2024'; // In production, this should be from secure storage
const ALGORITHM = 'AES';
const KEY_SIZE = 256;

// Sensitive data fields that should be encrypted
const SENSITIVE_FIELDS = [
  'name',
  'email',
  'symptoms',
  'medications',
  'personalNotes',
  'healthConditions',
  'dietaryRestrictions',
  'medicalHistory',
];

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  timestamp: number;
}

export interface DecryptionResult {
  decrypted: any;
  success: boolean;
  error?: string;
}

export class HealthDataEncryption {
  private static instance: HealthDataEncryption;
  private key: string;

  constructor() {
    this.key = this.generateKey();
  }

  static getInstance(): HealthDataEncryption {
    if (!HealthDataEncryption.instance) {
      HealthDataEncryption.instance = new HealthDataEncryption();
    }
    return HealthDataEncryption.instance;
  }

  // Generate encryption key
  private generateKey(): string {
    // In production, this should be generated securely and stored in keychain
    return CryptoJS.SHA256(ENCRYPTION_KEY).toString();
  }

  // Encrypt sensitive data
  encryptSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const encryptedData = { ...data };

    // Encrypt sensitive fields
    Object.keys(encryptedData).forEach(key => {
      if (SENSITIVE_FIELDS.includes(key) && encryptedData[key] !== null && encryptedData[key] !== undefined) {
        try {
          const encrypted = this.encrypt(encryptedData[key]);
          encryptedData[key] = {
            __encrypted: true,
            data: encrypted.encrypted,
            iv: encrypted.iv,
            timestamp: encrypted.timestamp,
          };
        } catch (error) {
          logger.error('Failed to encrypt sensitive field', 'HealthDataEncryption', { field: key, error });
          // Keep original data if encryption fails
        }
      }
    });

    return encryptedData;
  }

  // Decrypt sensitive data
  decryptSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const decryptedData = { ...data };

    // Decrypt sensitive fields
    Object.keys(decryptedData).forEach(key => {
      if (decryptedData[key] && typeof decryptedData[key] === 'object' && decryptedData[key].__encrypted) {
        try {
          const decrypted = this.decrypt(decryptedData[key].data, decryptedData[key].iv);
          decryptedData[key] = decrypted;
        } catch (error) {
          logger.error('Failed to decrypt sensitive field', 'HealthDataEncryption', { field: key, error });
          // Keep encrypted data if decryption fails
        }
      }
    });

    return decryptedData;
  }

  // Encrypt a single value
  encrypt(value: any): EncryptionResult {
    try {
      const jsonString = JSON.stringify(value);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return {
        encrypted: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex),
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Encryption failed', 'HealthDataEncryption', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt a single value
  decrypt(encryptedData: string, iv: string): any {
    try {
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      logger.error('Decryption failed', 'HealthDataEncryption', error);
      throw new Error('Decryption failed');
    }
  }

  // Encrypt entire object (for storage)
  encryptObject(obj: any): EncryptionResult {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      logger.error('Object encryption failed', 'HealthDataEncryption', error);
      throw new Error('Object encryption failed');
    }
  }

  // Decrypt entire object (from storage)
  decryptObject(encryptedData: string, iv: string): any {
    try {
      const decryptedString = this.decrypt(encryptedData, iv);
      return JSON.parse(decryptedString);
    } catch (error) {
      logger.error('Object decryption failed', 'HealthDataEncryption', error);
      throw new Error('Object decryption failed');
    }
  }

  // Check if data is encrypted
  isEncrypted(data: any): boolean {
    return data && typeof data === 'object' && data.__encrypted === true;
  }

  // Get encryption info
  getEncryptionInfo(data: any): { isEncrypted: boolean; timestamp?: number } {
    if (this.isEncrypted(data)) {
      return {
        isEncrypted: true,
        timestamp: data.timestamp,
      };
    }
    return { isEncrypted: false };
  }

  // Validate encryption integrity
  validateEncryption(data: any): boolean {
    if (!this.isEncrypted(data)) {
      return true; // Not encrypted, so valid
    }

    try {
      // Try to decrypt to validate
      this.decrypt(data.data, data.iv);
      return true;
    } catch (error) {
      logger.warn('Encryption validation failed', 'HealthDataEncryption', { error });
      return false;
    }
  }

  // Secure data cleanup
  secureCleanup(data: any): void {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (SENSITIVE_FIELDS.includes(key)) {
          // Overwrite with random data before deletion
          data[key] = CryptoJS.lib.WordArray.random(32).toString();
        }
      });
    }
  }

  // Generate secure random string
  generateSecureId(): string {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }

  // Hash sensitive data for comparison (one-way)
  hashSensitiveData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      return CryptoJS.SHA256(jsonString).toString();
    } catch (error) {
      logger.error('Hashing failed', 'HealthDataEncryption', error);
      throw new Error('Hashing failed');
    }
  }
}

// Export singleton instance
export const healthDataEncryption = HealthDataEncryption.getInstance();
export default healthDataEncryption;
