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
import { ScanHistory, FoodItem, GutProfile, SafeFood, SymptomLog, MedicationLog } from '../types';

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

// React Native storage implementation
class ReactNativeStorageService implements StorageServiceInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logger.error('React Native storage getItem failed', 'StorageService', { key, error });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logger.error('React Native storage setItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('React Native storage removeItem failed', 'StorageService', { key, error });
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('React Native storage clear failed', 'StorageService', { error });
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      logger.error('React Native storage getAllKeys failed', 'StorageService', { error });
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      logger.error('React Native storage multiGet failed', 'StorageService', { keys, error });
      return [];
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      logger.error('React Native storage multiSet failed', 'StorageService', { keyValuePairs, error });
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logger.error('React Native storage multiRemove failed', 'StorageService', { keys, error });
      throw error;
    }
  }
}

// Storage keys
const STORAGE_KEYS = {
  SCAN_HISTORY: 'gut_safe_scan_history',
  FOOD_CACHE: 'gut_safe_food_cache',
  GUT_PROFILE: 'gut_safe_gut_profile',
  SAFE_FOODS: 'gut_safe_safe_foods',
  SYMPTOM_LOGS: 'gut_safe_symptom_logs',
  MEDICATION_LOGS: 'gut_safe_medication_logs',
  USER_SETTINGS: 'gut_safe_user_settings',
  CACHE_METADATA: 'gut_safe_cache_metadata',
  OFFLINE_DATA: 'gut_safe_offline_data',
  SYNC_QUEUE: 'gut_safe_sync_queue',
} as const;

// Cache metadata interface
interface CacheMetadata {
  version: string;
  lastUpdated: number;
  size: number;
  items: Array<{
    key: string;
    size: number;
    lastAccessed: number;
    expiresAt?: number;
  }>;
}

/**
 * StorageService - Handles all data storage and caching operations
 * Consolidates local storage, caching, offline functionality, and data validation
 */
class StorageService {
  private static instance: StorageService;
  private storage: StorageServiceInterface;
  private cache: Map<string, any> = new Map();
  private cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
  private maxCacheSize = 1000;
  private syncQueue: Array<{ key: string; data: any; timestamp: number }> = [];

  private constructor() {
    // Choose storage implementation based on platform
    this.storage = Platform.OS === 'web' 
      ? new WebStorageService() 
      : new ReactNativeStorageService();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize the storage service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadCacheMetadata();
      await this.cleanExpiredCache();
      logger.info('StorageService initialized', 'StorageService');
    } catch (error) {
      logger.error('Failed to initialize StorageService', 'StorageService', error);
      throw error;
    }
  }

  /**
   * Get item from storage
   */
  async getItem<T>(key: string, encrypted: boolean = false): Promise<T | null> {
    try {
      // Check cache first
      const cached = this.getCachedData(key);
      if (cached) return cached;

      // Get from storage
      const value = await this.storage.getItem(key);
      if (!value) return null;

      // Decrypt if needed
      const decryptedValue = encrypted ? await healthDataEncryption.decrypt(value) : value;
      const parsedValue = JSON.parse(decryptedValue);

      // Cache the result
      this.setCachedData(key, parsedValue);

      return parsedValue;
    } catch (error) {
      logger.error('Failed to get item', 'StorageService', { key, error });
      return null;
    }
  }

  /**
   * Set item in storage
   */
  async setItem<T>(key: string, value: T, encrypted: boolean = false): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      // Encrypt if needed
      const finalValue = encrypted 
        ? await healthDataEncryption.encrypt(serializedValue)
        : serializedValue;

      // Save to storage
      await this.storage.setItem(key, finalValue);

      // Update cache
      this.setCachedData(key, value);

      // Update cache metadata
      await this.updateCacheMetadata(key, serializedValue.length);

      logger.info('Item stored', 'StorageService', { key, encrypted });
    } catch (error) {
      logger.error('Failed to set item', 'StorageService', { key, error });
      throw error;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
      this.cache.delete(key);
      await this.updateCacheMetadata(key, 0, true);
      
      logger.info('Item removed', 'StorageService', { key });
    } catch (error) {
      logger.error('Failed to remove item', 'StorageService', { key, error });
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await this.storage.clear();
      this.cache.clear();
      this.syncQueue = [];
      
      logger.info('Storage cleared', 'StorageService');
    } catch (error) {
      logger.error('Failed to clear storage', 'StorageService', error);
      throw error;
    }
  }

  /**
   * Get multiple items
   */
  async multiGet<T>(keys: string[], encrypted: boolean = false): Promise<Record<string, T | null>> {
    try {
      const results: Record<string, T | null> = {};
      
      // Check cache first
      const uncachedKeys: string[] = [];
      keys.forEach(key => {
        const cached = this.getCachedData(key);
        if (cached) {
          results[key] = cached;
        } else {
          uncachedKeys.push(key);
        }
      });

      if (uncachedKeys.length === 0) return results;

      // Get uncached items from storage
      const storageResults = await this.storage.multiGet(uncachedKeys);
      
      for (let i = 0; i < uncachedKeys.length; i++) {
        const key = uncachedKeys[i];
        const value = storageResults[i][1];
        
        if (value) {
          try {
            const decryptedValue = encrypted ? await healthDataEncryption.decrypt(value) : value;
            const parsedValue = JSON.parse(decryptedValue);
            results[key] = parsedValue;
            this.setCachedData(key, parsedValue);
          } catch (parseError) {
            logger.error('Failed to parse stored value', 'StorageService', { key, parseError });
            results[key] = null;
          }
        } else {
          results[key] = null;
        }
      }

      return results;
    } catch (error) {
      logger.error('Failed to multi-get items', 'StorageService', { keys, error });
      return {};
    }
  }

  /**
   * Set multiple items
   */
  async multiSet<T>(items: Record<string, T>, encrypted: boolean = false): Promise<void> {
    try {
      const keyValuePairs: [string, string][] = [];
      
      for (const [key, value] of Object.entries(items)) {
        const serializedValue = JSON.stringify(value);
        const finalValue = encrypted 
          ? await healthDataEncryption.encrypt(serializedValue)
          : serializedValue;
        
        keyValuePairs.push([key, finalValue]);
        this.setCachedData(key, value);
      }

      await this.storage.multiSet(keyValuePairs);
      
      // Update cache metadata
      for (const [key, value] of Object.entries(items)) {
        await this.updateCacheMetadata(key, JSON.stringify(value).length);
      }

      logger.info('Multiple items stored', 'StorageService', { 
        count: keyValuePairs.length, 
        encrypted 
      });
    } catch (error) {
      logger.error('Failed to multi-set items', 'StorageService', { items, error });
      throw error;
    }
  }

  /**
   * Remove multiple items
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await this.storage.multiRemove(keys);
      
      keys.forEach(key => {
        this.cache.delete(key);
      });

      // Update cache metadata
      for (const key of keys) {
        await this.updateCacheMetadata(key, 0, true);
      }

      logger.info('Multiple items removed', 'StorageService', { keys });
    } catch (error) {
      logger.error('Failed to multi-remove items', 'StorageService', { keys, error });
      throw error;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await this.storage.getAllKeys();
    } catch (error) {
      logger.error('Failed to get all keys', 'StorageService', error);
      return [];
    }
  }

  /**
   * Get storage size
   */
  async getStorageSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await this.storage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      logger.error('Failed to get storage size', 'StorageService', error);
      return 0;
    }
  }

  /**
   * Add to sync queue
   */
  async addToSyncQueue(key: string, data: any): Promise<void> {
    try {
      this.syncQueue.push({
        key,
        data,
        timestamp: Date.now(),
      });
      
      await this.setItem(STORAGE_KEYS.SYNC_QUEUE, this.syncQueue);
      
      logger.info('Added to sync queue', 'StorageService', { key });
    } catch (error) {
      logger.error('Failed to add to sync queue', 'StorageService', { key, error });
    }
  }

  /**
   * Process sync queue
   */
  async processSyncQueue(): Promise<void> {
    try {
      if (this.syncQueue.length === 0) return;

      // This would sync with server in a real implementation
      logger.info('Processing sync queue', 'StorageService', { 
        count: this.syncQueue.length 
      });

      // Clear processed items
      this.syncQueue = [];
      await this.setItem(STORAGE_KEYS.SYNC_QUEUE, this.syncQueue);
    } catch (error) {
      logger.error('Failed to process sync queue', 'StorageService', error);
    }
  }

  /**
   * Cache management
   */
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      cached.lastAccessed = Date.now();
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    // Check cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldestCacheEntry();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    });
  }

  private evictOldestCacheEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Cache metadata management
   */
  private async loadCacheMetadata(): Promise<void> {
    try {
      const metadata = await this.getItem<CacheMetadata>(STORAGE_KEYS.CACHE_METADATA);
      if (metadata) {
        // Restore cache from metadata
        for (const item of metadata.items) {
          if (item.expiresAt && Date.now() < item.expiresAt) {
            const data = await this.getItem(item.key);
            if (data) {
              this.cache.set(item.key, {
                data,
                timestamp: item.lastAccessed,
                lastAccessed: item.lastAccessed,
              });
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load cache metadata', 'StorageService', error);
    }
  }

  private async updateCacheMetadata(key: string, size: number, remove: boolean = false): Promise<void> {
    try {
      const metadata = await this.getItem<CacheMetadata>(STORAGE_KEYS.CACHE_METADATA) || {
        version: '1.0.0',
        lastUpdated: Date.now(),
        size: 0,
        items: [],
      };

      if (remove) {
        metadata.items = metadata.items.filter(item => item.key !== key);
      } else {
        const existingIndex = metadata.items.findIndex(item => item.key === key);
        const item = {
          key,
          size,
          lastAccessed: Date.now(),
          expiresAt: Date.now() + this.cacheExpiry,
        };

        if (existingIndex >= 0) {
          metadata.items[existingIndex] = item;
        } else {
          metadata.items.push(item);
        }
      }

      metadata.lastUpdated = Date.now();
      metadata.size = metadata.items.reduce((sum, item) => sum + item.size, 0);

      await this.setItem(STORAGE_KEYS.CACHE_METADATA, metadata);
    } catch (error) {
      logger.error('Failed to update cache metadata', 'StorageService', { key, error });
    }
  }

  /**
   * Clean expired cache
   */
  private async cleanExpiredCache(): Promise<void> {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.cacheExpiry) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => this.cache.delete(key));

      if (expiredKeys.length > 0) {
        logger.info('Cleaned expired cache entries', 'StorageService', { 
          count: expiredKeys.length 
        });
      }
    } catch (error) {
      logger.error('Failed to clean expired cache', 'StorageService', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.cache.clear();
    this.syncQueue = [];
    logger.info('StorageService cleaned up', 'StorageService');
  }
}

export default StorageService;