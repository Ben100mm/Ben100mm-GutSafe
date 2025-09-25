/**
 * @fileoverview StorageService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { healthDataEncryption } from '../utils/encryption';

// Storage service interface
interface StorageServiceInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<[string, string | null][]>;
  multiSet(keyValuePairs: [string, string][]): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

// Web storage implementation
class WebStorageService implements StorageServiceInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.error('Web storage getItem failed', 'StorageService', { key, error });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.error('Web storage setItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Web storage removeItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Web storage clear failed', 'StorageService', { error });
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error('Web storage getAllKeys failed', 'StorageService', { error });
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (error) {
      logger.error('Web storage multiGet failed', 'StorageService', { keys, error });
      return [];
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      logger.error('Web storage multiSet failed', 'StorageService', { keyValuePairs, error });
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      logger.error('Web storage multiRemove failed', 'StorageService', { keys, error });
      throw error;
    }
  }
}

// Native storage implementation
class NativeStorageService implements StorageServiceInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logger.error('Native storage getItem failed', 'StorageService', { key, error });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logger.error('Native storage setItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Native storage removeItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Native storage clear failed', 'StorageService', { error });
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return [...(await AsyncStorage.getAllKeys())];
    } catch (error) {
      logger.error('Native storage getAllKeys failed', 'StorageService', { error });
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return [...(await AsyncStorage.multiGet(keys))];
    } catch (error) {
      logger.error('Native storage multiGet failed', 'StorageService', { keys, error });
      return [];
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      logger.error('Native storage multiSet failed', 'StorageService', { keyValuePairs, error });
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logger.error('Native storage multiRemove failed', 'StorageService', { keys, error });
      throw error;
    }
  }
}

// Main storage service
export class StorageService {
  private static instance: StorageService;
  private storage: StorageServiceInterface;
  private encryptionEnabled: boolean = true;

  private constructor() {
    this.storage = Platform.OS === 'web' 
      ? new WebStorageService() 
      : new NativeStorageService();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Enable/disable encryption
  setEncryptionEnabled(enabled: boolean): void {
    this.encryptionEnabled = enabled;
    logger.info('Encryption setting changed', 'StorageService', { enabled });
  }

  // Get item with optional decryption
  async getItem(key: string, encrypted: boolean = false): Promise<string | null> {
    try {
      const value = await this.storage.getItem(key);
      if (!value) return null;

      if (encrypted && this.encryptionEnabled) {
        try {
          const parsed = JSON.parse(value);
          if (parsed.__encrypted) {
            return healthDataEncryption.decrypt(parsed.data, parsed.iv);
          }
        } catch (error) {
          logger.warn('Failed to decrypt data, returning raw value', 'StorageService', { key, error });
        }
      }

      return value;
    } catch (error) {
      logger.error('Storage getItem failed', 'StorageService', { key, encrypted, error });
      return null;
    }
  }

  // Set item with optional encryption
  async setItem(key: string, value: string, encrypt: boolean = false): Promise<void> {
    try {
      let finalValue = value;

      if (encrypt && this.encryptionEnabled) {
        const encrypted = healthDataEncryption.encrypt(value);
        finalValue = JSON.stringify({
          __encrypted: true,
          data: encrypted.encrypted,
          iv: encrypted.iv,
          timestamp: encrypted.timestamp,
        });
      }

      await this.storage.setItem(key, finalValue);
      logger.debug('Storage setItem successful', 'StorageService', { key, encrypted: encrypt });
    } catch (error) {
      logger.error('Storage setItem failed', 'StorageService', { key, encrypted: encrypt, error });
      throw error;
    }
  }

  // Remove item
  async removeItem(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
      logger.debug('Storage removeItem successful', 'StorageService', { key });
    } catch (error) {
      logger.error('Storage removeItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  // Clear all storage
  async clear(): Promise<void> {
    try {
      await this.storage.clear();
      logger.info('Storage cleared', 'StorageService');
    } catch (error) {
      logger.error('Storage clear failed', 'StorageService', { error });
      throw error;
    }
  }

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    try {
      return await this.storage.getAllKeys();
    } catch (error) {
      logger.error('Storage getAllKeys failed', 'StorageService', { error });
      return [];
    }
  }

  // Multi-get with optional decryption
  async multiGet(keys: string[], encrypted: boolean = false): Promise<[string, string | null][]> {
    try {
      const results = await this.storage.multiGet(keys);
      
      if (!encrypted || !this.encryptionEnabled) {
        return results;
      }

      const decryptedResults: [string, string | null][] = [];
      for (const [key, value] of results) {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.__encrypted) {
              const decrypted = healthDataEncryption.decrypt(parsed.data, parsed.iv);
              decryptedResults.push([key, decrypted]);
            } else {
              decryptedResults.push([key, value]);
            }
          } catch (error) {
            logger.warn('Failed to decrypt data in multiGet', 'StorageService', { key, error });
            decryptedResults.push([key, value]);
          }
        } else {
          decryptedResults.push([key, null]);
        }
      }

      return decryptedResults;
    } catch (error) {
      logger.error('Storage multiGet failed', 'StorageService', { keys, encrypted, error });
      return [];
    }
  }

  // Multi-set with optional encryption
  async multiSet(keyValuePairs: [string, string][], encrypt: boolean = false): Promise<void> {
    try {
      const processedPairs: [string, string][] = [];

      for (const [key, value] of keyValuePairs) {
        let finalValue = value;

        if (encrypt && this.encryptionEnabled) {
          const encrypted = healthDataEncryption.encrypt(value);
          finalValue = JSON.stringify({
            __encrypted: true,
            data: encrypted.encrypted,
            iv: encrypted.iv,
            timestamp: encrypted.timestamp,
          });
        }

        processedPairs.push([key, finalValue]);
      }

      await this.storage.multiSet(processedPairs);
      logger.debug('Storage multiSet successful', 'StorageService', { count: processedPairs.length, encrypted: encrypt });
    } catch (error) {
      logger.error('Storage multiSet failed', 'StorageService', { keyValuePairs, encrypted: encrypt, error });
      throw error;
    }
  }

  // Multi-remove
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await this.storage.multiRemove(keys);
      logger.debug('Storage multiRemove successful', 'StorageService', { keys });
    } catch (error) {
      logger.error('Storage multiRemove failed', 'StorageService', { keys, error });
      throw error;
    }
  }

  // Get storage info
  async getStorageInfo(): Promise<{
    platform: string;
    encryptionEnabled: boolean;
    keyCount: number;
    totalSize: number;
  }> {
    try {
      const keys = await this.getAllKeys();
      const totalSize = await this.calculateStorageSize(keys);
      
      return {
        platform: Platform.OS,
        encryptionEnabled: this.encryptionEnabled,
        keyCount: keys.length,
        totalSize,
      };
    } catch (error) {
      logger.error('Failed to get storage info', 'StorageService', { error });
      return {
        platform: Platform.OS,
        encryptionEnabled: this.encryptionEnabled,
        keyCount: 0,
        totalSize: 0,
      };
    }
  }

  // Calculate storage size
  private async calculateStorageSize(keys: string[]): Promise<number> {
    try {
      let totalSize = 0;
      const results = await this.multiGet(keys);
      
      for (const [, value] of results) {
        if (value) {
          totalSize += value.length * 2; // Approximate size in bytes
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.error('Failed to calculate storage size', 'StorageService', { error });
      return 0;
    }
  }

  // Migrate data from old storage format
  async migrateData(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const migrationKeys = keys.filter(key => key.startsWith('gutsafe_'));
      
      if (migrationKeys.length === 0) {
        logger.info('No data migration needed', 'StorageService');
        return;
      }

      logger.info('Starting data migration', 'StorageService', { keyCount: migrationKeys.length });
      
      // Migrate each key
      for (const key of migrationKeys) {
        try {
          const value = await this.getItem(key);
          if (value) {
            // Re-save with new format
            await this.setItem(key, value, true); // Encrypt during migration
            logger.debug('Migrated key', 'StorageService', { key });
          }
        } catch (error) {
          logger.error('Failed to migrate key', 'StorageService', { key, error });
        }
      }

      logger.info('Data migration completed', 'StorageService');
    } catch (error) {
      logger.error('Data migration failed', 'StorageService', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
export default storageService;
