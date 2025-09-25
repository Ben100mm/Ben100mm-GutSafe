/**
 * @fileoverview OfflineService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import AsyncStorage from '../utils/AsyncStorage';
import { ScanHistory, FoodItem, GutProfile, SafeFood } from '../types';

/**
 * OfflineService - Handles offline data caching and basic offline functionality
 * Provides data persistence, cache management, and offline scanning capabilities
 */
class OfflineService {
  private static instance: OfflineService;
  private cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private maxCacheSize = 1000; // Maximum number of items to cache

  // Storage keys
  private readonly KEYS = {
    SCAN_HISTORY: 'gut_safe_scan_history',
    FOOD_CACHE: 'gut_safe_food_cache',
    GUT_PROFILE: 'gut_safe_gut_profile',
    SAFE_FOODS: 'gut_safe_safe_foods',
    CACHE_METADATA: 'gut_safe_cache_metadata',
    OFFLINE_SCANS: 'gut_safe_offline_scans',
  };

  private constructor() {}

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  /**
   * Initialize offline service and load cached data
   */
  async initialize(): Promise<void> {
    try {
      await this.cleanExpiredCache();
      console.log('OfflineService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OfflineService:', error);
    }
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    // In a real app, you would use NetInfo or similar
    return navigator.onLine;
  }

  /**
   * Cache scan history for offline access
   */
  async cacheScanHistory(scanHistory: ScanHistory[]): Promise<void> {
    try {
      const data = {
        scans: scanHistory,
        timestamp: Date.now(),
        version: '1.0.0',
      };
      await AsyncStorage.setItem(this.KEYS.SCAN_HISTORY, JSON.stringify(data));
      console.log(`Cached ${scanHistory.length} scan history items`);
    } catch (error) {
      console.error('Failed to cache scan history:', error);
    }
  }

  /**
   * Get cached scan history
   */
  async getCachedScanHistory(): Promise<ScanHistory[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SCAN_HISTORY);
      if (data) {
        const parsed = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return parsed.scans.map((scan: any) => ({
          ...scan,
          timestamp: new Date(scan.timestamp),
          analysis: {
            ...scan.analysis,
            lastUpdated: new Date(scan.analysis.lastUpdated),
          },
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get cached scan history:', error);
      return [];
    }
  }

  /**
   * Cache food item for offline access
   */
  async cacheFoodItem(foodItem: FoodItem): Promise<void> {
    try {
      const cacheData = await this.getCacheMetadata();
      const cacheKey = `food_${foodItem.id}`;
      
      const data = {
        ...foodItem,
        cachedAt: Date.now(),
        accessCount: 0,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      
      // Update cache metadata
      cacheData.foodItems[cacheKey] = {
        cachedAt: Date.now(),
        accessCount: 0,
        size: JSON.stringify(data).length,
      };

      await this.updateCacheMetadata(cacheData);
      await this.cleanupOldCache();
    } catch (error) {
      console.error('Failed to cache food item:', error);
    }
  }

  /**
   * Get cached food item
   */
  async getCachedFoodItem(foodId: string): Promise<FoodItem | null> {
    try {
      const cacheKey = `food_${foodId}`;
      const data = await AsyncStorage.getItem(cacheKey);
      
      if (data) {
        const foodItem = JSON.parse(data);
        
        // Update access count
        const cacheData = await this.getCacheMetadata();
        if (cacheData.foodItems[cacheKey]) {
          cacheData.foodItems[cacheKey].accessCount++;
          await this.updateCacheMetadata(cacheData);
        }
        
        return foodItem;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached food item:', error);
      return null;
    }
  }

  /**
   * Search cached food items
   */
  async searchCachedFoods(query: string): Promise<FoodItem[]> {
    try {
      const cacheData = await this.getCacheMetadata();
      const results: FoodItem[] = [];
      
      for (const [key] of Object.entries(cacheData.foodItems)) {
        if (key.startsWith('food_')) {
          const foodData = await AsyncStorage.getItem(key);
          if (foodData) {
            const foodItem = JSON.parse(foodData);
            const searchText = `${foodItem.name} ${foodItem.brand || ''} ${foodItem.category || ''}`.toLowerCase();
            
            if (searchText.includes(query.toLowerCase())) {
              results.push(foodItem);
            }
          }
        }
      }
      
      // Sort by access count (most accessed first)
      return results.sort((a, b) => {
        const aAccess = cacheData.foodItems[`food_${a.id}`]?.accessCount || 0;
        const bAccess = cacheData.foodItems[`food_${b.id}`]?.accessCount || 0;
        return bAccess - aAccess;
      });
    } catch (error) {
      console.error('Failed to search cached foods:', error);
      return [];
    }
  }

  /**
   * Cache gut profile for offline access
   */
  async cacheGutProfile(profile: GutProfile): Promise<void> {
    try {
      const data = {
        ...profile,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(this.KEYS.GUT_PROFILE, JSON.stringify(data));
      console.log('Gut profile cached successfully');
    } catch (error) {
      console.error('Failed to cache gut profile:', error);
    }
  }

  /**
   * Get cached gut profile
   */
  async getCachedGutProfile(): Promise<GutProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.GUT_PROFILE);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached gut profile:', error);
      return null;
    }
  }

  /**
   * Cache safe foods for offline access
   */
  async cacheSafeFoods(safeFoods: SafeFood[]): Promise<void> {
    try {
      const data = {
        foods: safeFoods,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.KEYS.SAFE_FOODS, JSON.stringify(data));
      console.log(`Cached ${safeFoods.length} safe foods`);
    } catch (error) {
      console.error('Failed to cache safe foods:', error);
    }
  }

  /**
   * Get cached safe foods
   */
  async getCachedSafeFoods(): Promise<SafeFood[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SAFE_FOODS);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.foods || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get cached safe foods:', error);
      return [];
    }
  }

  /**
   * Store offline scan for later sync
   */
  async storeOfflineScan(scan: ScanHistory): Promise<void> {
    try {
      const offlineScans = await this.getOfflineScans();
      offlineScans.push(scan);
      
      await AsyncStorage.setItem(this.KEYS.OFFLINE_SCANS, JSON.stringify(offlineScans));
      console.log('Offline scan stored for later sync');
    } catch (error) {
      console.error('Failed to store offline scan:', error);
    }
  }

  /**
   * Get offline scans waiting for sync
   */
  async getOfflineScans(): Promise<ScanHistory[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.OFFLINE_SCANS);
      if (data) {
        const scans = JSON.parse(data);
        return scans.map((scan: any) => ({
          ...scan,
          timestamp: new Date(scan.timestamp),
          analysis: {
            ...scan.analysis,
            lastUpdated: new Date(scan.analysis.lastUpdated),
          },
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get offline scans:', error);
      return [];
    }
  }

  /**
   * Mark offline scans as synced
   */
  async markOfflineScansAsSynced(scanIds: string[]): Promise<void> {
    try {
      const offlineScans = await this.getOfflineScans();
      const updatedScans = offlineScans.map(scan => 
        scanIds.includes(scan.id) ? { ...scan, synced: true } : scan
      );
      
      await AsyncStorage.setItem(this.KEYS.OFFLINE_SCANS, JSON.stringify(updatedScans));
      console.log(`Marked ${scanIds.length} offline scans as synced`);
    } catch (error) {
      console.error('Failed to mark offline scans as synced:', error);
    }
  }

  /**
   * Get cache metadata
   */
  private async getCacheMetadata(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CACHE_METADATA);
      if (data) {
        return JSON.parse(data);
      }
      return {
        foodItems: {},
        lastCleanup: Date.now(),
        totalSize: 0,
      };
    } catch (error) {
      console.error('Failed to get cache metadata:', error);
      return {
        foodItems: {},
        lastCleanup: Date.now(),
        totalSize: 0,
      };
    }
  }

  /**
   * Update cache metadata
   */
  private async updateCacheMetadata(metadata: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.CACHE_METADATA, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update cache metadata:', error);
    }
  }

  /**
   * Clean expired cache entries
   */
  private async cleanExpiredCache(): Promise<void> {
    try {
      const cacheData = await this.getCacheMetadata();
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, metadata] of Object.entries(cacheData.foodItems)) {
        if (now - (metadata as any).cachedAt > this.cacheExpiry) {
          expiredKeys.push(key);
        }
      }

      // Remove expired entries
      for (const key of expiredKeys) {
        await AsyncStorage.removeItem(key);
        delete cacheData.foodItems[key];
      }

      if (expiredKeys.length > 0) {
        await this.updateCacheMetadata(cacheData);
        console.log(`Cleaned ${expiredKeys.length} expired cache entries`);
      }
    } catch (error) {
      console.error('Failed to clean expired cache:', error);
    }
  }

  /**
   * Cleanup old cache entries when cache is full
   */
  private async cleanupOldCache(): Promise<void> {
    try {
      const cacheData = await this.getCacheMetadata();
      const foodItemCount = Object.keys(cacheData.foodItems).length;

      if (foodItemCount > this.maxCacheSize) {
        // Sort by access count and remove least accessed items
        const sortedItems = Object.entries(cacheData.foodItems)
          .sort(([, a], [, b]) => (a as any).accessCount - (b as any).accessCount);

        const itemsToRemove = sortedItems.slice(0, foodItemCount - this.maxCacheSize);
        
        for (const [key] of itemsToRemove) {
          await AsyncStorage.removeItem(key);
          delete cacheData.foodItems[key];
        }

        await this.updateCacheMetadata(cacheData);
        console.log(`Cleaned up ${itemsToRemove.length} old cache entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup old cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    foodItemCount: number;
    totalSize: number;
    lastCleanup: number;
    offlineScanCount: number;
  }> {
    try {
      const cacheData = await this.getCacheMetadata();
      const offlineScans = await this.getOfflineScans();
      
      return {
        foodItemCount: Object.keys(cacheData.foodItems).length,
        totalSize: cacheData.totalSize || 0,
        lastCleanup: cacheData.lastCleanup || 0,
        offlineScanCount: offlineScans.length,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        foodItemCount: 0,
        totalSize: 0,
        lastCleanup: 0,
        offlineScanCount: 0,
      };
    }
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const gutSafeKeys = keys.filter((key: string) => key.startsWith('gut_safe_'));
      
      await AsyncStorage.multiRemove(gutSafeKeys);
      console.log('All cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Sync offline data when online
   */
  async syncOfflineData(): Promise<{
    success: boolean;
    syncedScans: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      syncedScans: 0,
      errors: [] as string[],
    };

    try {
      if (!this.isOnline()) {
        throw new Error('Device is offline');
      }

      const offlineScans = await this.getOfflineScans();
      const unsyncedScans = offlineScans; // All offline scans need to be synced

      for (const scan of unsyncedScans) {
        try {
          // In a real app, you would sync with your backend here
          // For now, we'll just mark them as synced
          await this.markOfflineScansAsSynced([scan.id]);
          result.syncedScans++;
        } catch (error) {
          result.errors.push(`Failed to sync scan ${scan.id}: ${error}`);
        }
      }

      console.log(`Synced ${result.syncedScans} offline scans`);
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
      console.error('Failed to sync offline data:', error);
    }

    return result;
  }
}

export default OfflineService;
