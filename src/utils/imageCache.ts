/**
 * @fileoverview imageCache.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface CacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

interface ImageCacheConfig {
  maxSize: number; // in bytes
  maxAge: number; // in milliseconds
  maxEntries: number;
}

class ImageCache {
  private static instance: ImageCache;
  private cache: Map<string, CacheEntry> = new Map();
  private config: ImageCacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 1000,
  };

  private constructor() {
    this.loadCache();
  }

  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem('imageCache');
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(data);
        this.cleanup();
      }
    } catch (error) {
      console.warn('Failed to load image cache:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const data = Array.from(this.cache.entries());
      await AsyncStorage.setItem('imageCache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save image cache:', error);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.config.maxAge) {
        this.cache.delete(key);
      }
    });

    // Remove oldest entries if we exceed max entries
    if (this.cache.size > this.config.maxEntries) {
      const sortedEntries = entries
        .filter(([_, entry]) => now - entry.timestamp <= this.config.maxAge)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.config.maxEntries);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.saveCache();
  }

  public get(uri: string): string | null {
    const entry = this.cache.get(uri);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.config.maxAge) {
      this.cache.delete(uri);
      return null;
    }

    return entry.uri;
  }

  public set(uri: string, cachedUri: string, size: number = 0): void {
    const now = Date.now();
    
    // Check if we need to cleanup before adding
    if (this.cache.size >= this.config.maxEntries) {
      this.cleanup();
    }

    this.cache.set(uri, {
      uri: cachedUri,
      timestamp: now,
      size,
    });

    this.saveCache();
  }

  public clear(): void {
    this.cache.clear();
    this.saveCache();
  }

  public getStats(): {
    size: number;
    entries: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.cache.values());
    const timestamps = entries.map(entry => entry.timestamp);
    
    return {
      size: entries.reduce((sum, entry) => sum + entry.size, 0),
      entries: this.cache.size,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  public updateConfig(config: Partial<ImageCacheConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Web-specific image optimization
export const optimizeImageForWeb = (
  uri: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (Platform.OS !== 'web') return uri;

  try {
    const url = new URL(uri);
    
    // Add optimization parameters
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('f', 'auto'); // Auto format
    url.searchParams.set('dpr', 'auto'); // Auto device pixel ratio
    
    return url.toString();
  } catch (error) {
    console.warn('Failed to optimize image URL:', error);
    return uri;
  }
};

// Preload images for better performance
export const preloadImages = async (uris: string[]): Promise<void> => {
  if (Platform.OS === 'web') {
    const promises = uris.map(uri => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${uri}`));
        img.src = uri;
      });
    });
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }
};

export default ImageCache;
