/**
 * @fileoverview encryptionUtils.ts - Enhanced Encryption Utilities
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';

// Encryption configuration
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  iterations: number;
  saltLength: number;
  ivLength: number;
  tagLength: number;
}

// Encryption result
export interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
  tag?: string;
  algorithm: string;
}

// Decryption result
export interface DecryptionResult {
  decrypted: string;
  success: boolean;
  error?: string;
}

// Encryption utilities class
export class EncryptionUtils {
  private static instance: EncryptionUtils;
  private config: EncryptionConfig;
  private keyCache: Map<string, CryptoKey> = new Map();

  private constructor() {
    this.config = {
      algorithm: 'AES-GCM',
      keyLength: 32, // 256 bits
      iterations: 100000,
      saltLength: 16,
      ivLength: 12,
      tagLength: 16,
    };
  }

  static getInstance(): EncryptionUtils {
    if (!EncryptionUtils.instance) {
      EncryptionUtils.instance = new EncryptionUtils();
    }
    return EncryptionUtils.instance;
  }

  // Configure encryption settings
  configure(config: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Encryption configured', 'EncryptionUtils', this.config);
  }

  // Generate encryption key from password
  private async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.config.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.config.algorithm, length: this.config.keyLength * 8 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Generate random bytes
  private generateRandomBytes(length: number): Uint8Array {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return array;
    } else {
      // Fallback for environments without crypto support
      const array = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  }

  // Convert Uint8Array to base64
  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
  }

  // Convert base64 to Uint8Array
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Encrypt data
  async encrypt(data: string, password?: string): Promise<EncryptionResult> {
    try {
      const encryptionPassword = password || this.getDefaultPassword();
      const salt = this.generateRandomBytes(this.config.saltLength);
      const iv = this.generateRandomBytes(this.config.ivLength);
      
      const key = await this.generateKey(encryptionPassword, salt);
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        key,
        new TextEncoder().encode(data)
      );

      const encryptedArray = new Uint8Array(encrypted);
      
      return {
        encrypted: this.uint8ArrayToBase64(encryptedArray),
        iv: this.uint8ArrayToBase64(iv),
        salt: this.uint8ArrayToBase64(salt),
        algorithm: this.config.algorithm,
      };
    } catch (error) {
      logger.error('Encryption failed', 'EncryptionUtils', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt data
  async decrypt(encryptionResult: EncryptionResult, password?: string): Promise<DecryptionResult> {
    try {
      const encryptionPassword = password || this.getDefaultPassword();
      const salt = this.base64ToUint8Array(encryptionResult.salt);
      const iv = this.base64ToUint8Array(encryptionResult.iv);
      const encrypted = this.base64ToUint8Array(encryptionResult.encrypted);
      
      const key = await this.generateKey(encryptionPassword, salt);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        key,
        encrypted
      );

      const decryptedString = new TextDecoder().decode(decrypted);
      
      return {
        decrypted: decryptedString,
        success: true,
      };
    } catch (error) {
      logger.error('Decryption failed', 'EncryptionUtils', error);
      return {
        decrypted: '',
        success: false,
        error: 'Decryption failed',
      };
    }
  }

  // Encrypt sensitive data (with additional security)
  async encryptSensitive(data: string, password?: string): Promise<EncryptionResult> {
    try {
      // Add timestamp and random data for additional security
      const timestamp = Date.now().toString();
      const randomData = this.generateRandomBytes(16);
      const enhancedData = JSON.stringify({
        data,
        timestamp,
        random: this.uint8ArrayToBase64(randomData),
      });

      return await this.encrypt(enhancedData, password);
    } catch (error) {
      logger.error('Sensitive encryption failed', 'EncryptionUtils', error);
      throw new Error('Sensitive encryption failed');
    }
  }

  // Decrypt sensitive data
  async decryptSensitive(encryptionResult: EncryptionResult, password?: string): Promise<DecryptionResult> {
    try {
      const result = await this.decrypt(encryptionResult, password);
      
      if (!result.success) {
        return result;
      }

      const parsed = JSON.parse(result.decrypted);
      
      // Verify timestamp (optional security check)
      const timestamp = parseInt(parsed.timestamp);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - timestamp > maxAge) {
        logger.warn('Decrypted data is too old', 'EncryptionUtils', {
          timestamp,
          age: now - timestamp,
        });
      }

      return {
        decrypted: parsed.data,
        success: true,
      };
    } catch (error) {
      logger.error('Sensitive decryption failed', 'EncryptionUtils', error);
      return {
        decrypted: '',
        success: false,
        error: 'Sensitive decryption failed',
      };
    }
  }

  // Hash data (one-way)
  async hash(data: string, algorithm: string = 'SHA-256'): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      return this.uint8ArrayToBase64(hashArray);
    } catch (error) {
      logger.error('Hashing failed', 'EncryptionUtils', error);
      throw new Error('Hashing failed');
    }
  }

  // Generate secure random string
  generateSecureString(length: number = 32): string {
    const array = this.generateRandomBytes(length);
    return this.uint8ArrayToBase64(array);
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    const array = this.generateRandomBytes(length);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Verify data integrity
  async verifyIntegrity(data: string, hash: string, algorithm: string = 'SHA-256'): Promise<boolean> {
    try {
      const computedHash = await this.hash(data, algorithm);
      return computedHash === hash;
    } catch (error) {
      logger.error('Integrity verification failed', 'EncryptionUtils', error);
      return false;
    }
  }

  // Encrypt file data
  async encryptFile(fileData: ArrayBuffer, password?: string): Promise<EncryptionResult> {
    try {
      const dataString = this.uint8ArrayToBase64(new Uint8Array(fileData));
      return await this.encrypt(dataString, password);
    } catch (error) {
      logger.error('File encryption failed', 'EncryptionUtils', error);
      throw new Error('File encryption failed');
    }
  }

  // Decrypt file data
  async decryptFile(encryptionResult: EncryptionResult, password?: string): Promise<ArrayBuffer> {
    try {
      const result = await this.decrypt(encryptionResult, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Decryption failed');
      }

      const uint8Array = this.base64ToUint8Array(result.decrypted);
      return uint8Array.buffer;
    } catch (error) {
      logger.error('File decryption failed', 'EncryptionUtils', error);
      throw new Error('File decryption failed');
    }
  }

  // Get default password from environment
  private getDefaultPassword(): string {
    const password = process.env.REACT_APP_ENCRYPTION_KEY;
    if (!password || password.length < 32) {
      throw new Error('Encryption key not properly configured');
    }
    return password;
  }

  // Clear key cache
  clearKeyCache(): void {
    this.keyCache.clear();
    logger.info('Key cache cleared', 'EncryptionUtils');
  }

  // Get encryption statistics
  getStats(): {
    algorithm: string;
    keyLength: number;
    iterations: number;
    cachedKeys: number;
  } {
    return {
      algorithm: this.config.algorithm,
      keyLength: this.config.keyLength,
      iterations: this.config.iterations,
      cachedKeys: this.keyCache.size,
    };
  }

  // Test encryption/decryption
  async testEncryption(password?: string): Promise<boolean> {
    try {
      const testData = 'This is a test message for encryption verification';
      const encrypted = await this.encrypt(testData, password);
      const decrypted = await this.decrypt(encrypted, password);
      
      return decrypted.success && decrypted.decrypted === testData;
    } catch (error) {
      logger.error('Encryption test failed', 'EncryptionUtils', error);
      return false;
    }
  }
}

// Export singleton instance
export const encryptionUtils = EncryptionUtils.getInstance();
export default encryptionUtils;
