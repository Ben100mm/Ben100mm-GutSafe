/**
 * @fileoverview cacheManager.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size: number;
}

interface CacheConfig {
  maxSize: number; // in bytes
  maxAge: number; // in milliseconds
  maxEntries: number;
  cleanupInterval: number; // in milliseconds
}

type CacheKey = string;
type CacheData = any;

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<CacheKey, CacheEntry<CacheData>> = new Map();
  private config: CacheConfig = {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 5000,
    cleanupInterval: 60 * 60 * 1000, // 1 hour
  };
  private cleanupTimer?: NodeJS.Timeout;

  private constructor() {
    this.loadCache();
    this.startCleanupTimer();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('appCache');
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(data);
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load cache:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const data = Array.from(this.cache.entries());
      await AsyncStorage.setItem('appCache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });

    // Remove oldest entries if we exceed max entries
    if (this.cache.size > this.config.maxEntries) {
      const sortedEntries = entries
        .filter(([_, entry]) => now <= entry.expiresAt)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.config.maxEntries);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.saveCache();
  }

  public set<T>(
    key: CacheKey,
    data: T,
    ttl?: number
  ): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.maxAge);
    const size = this.calculateSize(data);
    
    // Check if we need to cleanup before adding
    if (this.cache.size >= this.config.maxEntries) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      size,
    });

    this.saveCache();
  }

  public get<T>(key: CacheKey): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public has(key: CacheKey): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  public delete(key: CacheKey): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.saveCache();
    }
    return deleted;
  }

  public clear(): void {
    this.cache.clear();
    this.saveCache();
  }

  public clearExpired(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });

    this.saveCache();
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate
    } catch {
      return 1024; // Default size if calculation fails
    }
  }

  public getStats(): {
    size: number;
    entries: number;
    hitRate: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      size: entries.reduce((sum, entry) => sum + entry.size, 0),
      entries: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  public updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Restart cleanup timer if interval changed
    if (config.cleanupInterval) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  public destroy(): void {
    this.stopCleanupTimer();
    this.cache.clear();
  }
}

// Specialized caches for different data types
export class ApiCache {
  private cache: CacheManager;
  private prefix: string;

  constructor(prefix: string = 'api') {
    this.cache = CacheManager.getInstance();
    this.prefix = prefix;
  }

  private getKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${this.prefix}:${endpoint}:${paramString}`;
  }

  public set<T>(endpoint: string, data: T, ttl?: number, params?: Record<string, any>): void {
    const key = this.getKey(endpoint, params);
    this.cache.set(key, data, ttl);
  }

  public get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.getKey(endpoint, params);
    return this.cache.get<T>(key);
  }

  public has(endpoint: string, params?: Record<string, any>): boolean {
    const key = this.getKey(endpoint, params);
    return this.cache.has(key);
  }

  public delete(endpoint: string, params?: Record<string, any>): boolean {
    const key = this.getKey(endpoint, params);
    return this.cache.delete(key);
  }

  public clear(): void {
    // Clear all API cache entries
    const entries = Array.from((this.cache as any).cache.entries());
    entries.forEach(([key]) => {
      if (key.startsWith(this.prefix)) {
        this.cache.delete(key);
      }
    });
  }
}

export class UserDataCache {
  private cache: CacheManager;
  private prefix: string;

  constructor(prefix: string = 'user') {
    this.cache = CacheManager.getInstance();
    this.prefix = prefix;
  }

  private getKey(userId: string, dataType: string): string {
    return `${this.prefix}:${userId}:${dataType}`;
  }

  public set<T>(userId: string, dataType: string, data: T, ttl?: number): void {
    const key = this.getKey(userId, dataType);
    this.cache.set(key, data, ttl);
  }

  public get<T>(userId: string, dataType: string): T | null {
    const key = this.getKey(userId, dataType);
    return this.cache.get<T>(key);
  }

  public has(userId: string, dataType: string): boolean {
    const key = this.getKey(userId, dataType);
    return this.cache.has(key);
  }

  public delete(userId: string, dataType: string): boolean {
    const key = this.getKey(userId, dataType);
    return this.cache.delete(key);
  }

  public clearUser(userId: string): void {
    const entries = Array.from((this.cache as any).cache.entries());
    entries.forEach(([key]) => {
      if (key.startsWith(`${this.prefix}:${userId}:`)) {
        this.cache.delete(key);
      }
    });
  }
}

// Export singleton instances
export const apiCache = new ApiCache();
export const userDataCache = new UserDataCache();
export const cacheManager = CacheManager.getInstance();

export default CacheManager;
