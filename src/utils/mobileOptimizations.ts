/**
 * @fileoverview mobileOptimizations.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, Dimensions, PixelRatio } from 'react-native';

interface MobileOptimizationConfig {
  enableReducedMotion: boolean;
  enableLowPowerMode: boolean;
  enableMemoryOptimization: boolean;
  enableBatteryOptimization: boolean;
  enableNetworkOptimization: boolean;
}

class MobileOptimizer {
  private static instance: MobileOptimizer;
  private config: MobileOptimizationConfig = {
    enableReducedMotion: false,
    enableLowPowerMode: false,
    enableMemoryOptimization: true,
    enableBatteryOptimization: true,
    enableNetworkOptimization: true,
  };

  private constructor() {
    this.detectDeviceCapabilities();
  }

  public static getInstance(): MobileOptimizer {
    if (!MobileOptimizer.instance) {
      MobileOptimizer.instance = new MobileOptimizer();
    }
    return MobileOptimizer.instance;
  }

  private detectDeviceCapabilities(): void {
    if (Platform.OS === 'web') return;

    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    const screenSize = Math.sqrt(width * width + height * height) / pixelRatio;

    // Detect low-end devices
    const isLowEndDevice = screenSize < 4.5 || pixelRatio < 2;

    // Detect memory constraints
    const isMemoryConstrained = Platform.OS === 'android' && screenSize < 5;

    // Auto-adjust settings based on device capabilities
    if (isLowEndDevice) {
      this.config.enableReducedMotion = true;
      this.config.enableLowPowerMode = true;
      this.config.enableMemoryOptimization = true;
    }

    if (isMemoryConstrained) {
      this.config.enableMemoryOptimization = true;
      this.config.enableBatteryOptimization = true;
    }
  }

  public getOptimizedImageSize(originalWidth: number, originalHeight: number): { width: number; height: number } {
    if (Platform.OS === 'web') {
      return { width: originalWidth, height: originalHeight };
    }

    const { width: screenWidth } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    
    // Optimize for mobile screens
    const maxWidth = screenWidth * 0.9;
    const maxHeight = screenWidth * 0.6; // 16:9 aspect ratio

    let optimizedWidth = originalWidth;
    let optimizedHeight = originalHeight;

    // Scale down if too large
    if (originalWidth > maxWidth) {
      const scale = maxWidth / originalWidth;
      optimizedWidth = maxWidth;
      optimizedHeight = originalHeight * scale;
    }

    if (optimizedHeight > maxHeight) {
      const scale = maxHeight / optimizedHeight;
      optimizedHeight = maxHeight;
      optimizedWidth = optimizedWidth * scale;
    }

    // Round to nearest pixel
    optimizedWidth = Math.round(optimizedWidth);
    optimizedHeight = Math.round(optimizedHeight);

    return { width: optimizedWidth, height: optimizedHeight };
  }

  public getOptimizedAnimationConfig(): {
    duration: number;
    useNativeDriver: boolean;
    delay: number;
  } {
    const baseConfig = {
      duration: 300,
      useNativeDriver: true,
      delay: 0,
    };

    if (this.config.enableReducedMotion) {
      return {
        ...baseConfig,
        duration: 150, // Faster animations
        delay: 0,
      };
    }

    if (this.config.enableLowPowerMode) {
      return {
        ...baseConfig,
        duration: 200,
        delay: 0,
      };
    }

    return baseConfig;
  }

  public getOptimizedListConfig(): {
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    windowSize: number;
    removeClippedSubviews: boolean;
    getItemLayout?: (data: any, index: number) => { length: number; offset: number; index: number };
  } {
    const baseConfig = {
      initialNumToRender: 10,
      maxToRenderPerBatch: 5,
      windowSize: 10,
      removeClippedSubviews: true,
    };

    if (this.config.enableMemoryOptimization) {
      return {
        ...baseConfig,
        initialNumToRender: 5,
        maxToRenderPerBatch: 3,
        windowSize: 5,
      };
    }

    return baseConfig;
  }

  public getOptimizedImageQuality(): number {
    if (Platform.OS === 'web') return 80;

    const { width } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();

    // Lower quality for smaller screens to save memory
    if (width < 400) return 60;
    if (width < 600) return 70;
    if (pixelRatio < 2) return 65;

    return 80;
  }

  public getOptimizedCacheSize(): number {
    if (Platform.OS === 'web') return 100 * 1024 * 1024; // 100MB

    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    const screenSize = Math.sqrt(width * width + height * height) / pixelRatio;

    // Adjust cache size based on device capabilities
    if (screenSize < 4.5) return 25 * 1024 * 1024; // 25MB
    if (screenSize < 5.5) return 50 * 1024 * 1024; // 50MB
    return 100 * 1024 * 1024; // 100MB
  }

  public getOptimizedNetworkConfig(): {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  } {
    const baseConfig = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
    };

    if (this.config.enableNetworkOptimization) {
      return {
        ...baseConfig,
        timeout: 15000, // Longer timeout for mobile networks
        retryAttempts: 2, // Fewer retries to save battery
        retryDelay: 2000, // Longer delay between retries
      };
    }

    return baseConfig;
  }

  public shouldUseNativeDriver(): boolean {
    return Platform.OS !== 'web';
  }

  public getOptimizedFontSize(baseSize: number): number {
    if (Platform.OS === 'web') return baseSize;

    const { width } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();

    // Scale font size based on screen size
    if (width < 400) return baseSize * 0.9;
    if (width > 600) return baseSize * 1.1;
    if (pixelRatio > 3) return baseSize * 1.05;

    return baseSize;
  }

  public getOptimizedSpacing(baseSpacing: number): number {
    if (Platform.OS === 'web') return baseSpacing;

    const { width } = Dimensions.get('window');

    // Adjust spacing for different screen sizes
    if (width < 400) return baseSpacing * 0.8;
    if (width > 600) return baseSpacing * 1.2;

    return baseSpacing;
  }

  public updateConfig(newConfig: Partial<MobileOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): MobileOptimizationConfig {
    return { ...this.config };
  }

  // Memory management utilities
  public clearMemoryCache(): void {
    if (Platform.OS === 'web') {
      // Clear browser cache
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }
  }

  public getMemoryUsage(): { used: number; total: number; available: number } | null {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
      };
    }
    return null;
  }

  // Battery optimization
  public enableBatteryOptimizations(): void {
    this.config.enableBatteryOptimization = true;
    this.config.enableLowPowerMode = true;
    this.config.enableReducedMotion = true;
  }

  public disableBatteryOptimizations(): void {
    this.config.enableBatteryOptimization = false;
    this.config.enableLowPowerMode = false;
    this.config.enableReducedMotion = false;
  }
}

export const mobileOptimizer = MobileOptimizer.getInstance();

// Utility functions for easy access
export const getOptimizedImageSize = (width: number, height: number) => 
  mobileOptimizer.getOptimizedImageSize(width, height);

export const getOptimizedAnimationConfig = () => 
  mobileOptimizer.getOptimizedAnimationConfig();

export const getOptimizedListConfig = () => 
  mobileOptimizer.getOptimizedListConfig();

export const getOptimizedImageQuality = () => 
  mobileOptimizer.getOptimizedImageQuality();

export const getOptimizedCacheSize = () => 
  mobileOptimizer.getOptimizedCacheSize();

export const getOptimizedNetworkConfig = () => 
  mobileOptimizer.getOptimizedNetworkConfig();

export const shouldUseNativeDriver = () => 
  mobileOptimizer.shouldUseNativeDriver();

export const getOptimizedFontSize = (baseSize: number) => 
  mobileOptimizer.getOptimizedFontSize(baseSize);

export const getOptimizedSpacing = (baseSpacing: number) => 
  mobileOptimizer.getOptimizedSpacing(baseSpacing);

export default MobileOptimizer;
