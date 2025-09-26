/**
 * @fileoverview platformOptimizations.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, Dimensions, PixelRatio } from 'react-native';

interface PlatformConfig {
  ios: {
    enableHapticFeedback: boolean;
    enableNativeAnimations: boolean;
    enableBlurEffects: boolean;
    enableMetalPerformance: boolean;
    enableCoreAnimation: boolean;
  };
  android: {
    enableHapticFeedback: boolean;
    enableNativeAnimations: boolean;
    enableBlurEffects: boolean;
    enableHardwareAcceleration: boolean;
    enableRenderScript: boolean;
  };
  web: {
    enableWebGL: boolean;
    enableWebWorkers: boolean;
    enableServiceWorkers: boolean;
    enableIndexedDB: boolean;
    enableWebAssembly: boolean;
  };
}

class PlatformOptimizer {
  private static instance: PlatformOptimizer;
  private config: PlatformConfig = {
    ios: {
      enableHapticFeedback: true,
      enableNativeAnimations: true,
      enableBlurEffects: true,
      enableMetalPerformance: true,
      enableCoreAnimation: true,
    },
    android: {
      enableHapticFeedback: true,
      enableNativeAnimations: true,
      enableBlurEffects: false, // Disabled by default on Android for performance
      enableHardwareAcceleration: true,
      enableRenderScript: true,
    },
    web: {
      enableWebGL: true,
      enableWebWorkers: true,
      enableServiceWorkers: true,
      enableIndexedDB: true,
      enableWebAssembly: false, // Disabled by default
    },
  };

  private deviceCapabilities: {
    isLowEndDevice: boolean;
    hasHighDPI: boolean;
    hasGoodGPU: boolean;
    hasLimitedMemory: boolean;
  } = {
    isLowEndDevice: false,
    hasHighDPI: false,
    hasGoodGPU: false,
    hasLimitedMemory: false,
  };

  private constructor() {
    this.detectDeviceCapabilities();
  }

  public static getInstance(): PlatformOptimizer {
    if (!PlatformOptimizer.instance) {
      PlatformOptimizer.instance = new PlatformOptimizer();
    }
    return PlatformOptimizer.instance;
  }

  private detectDeviceCapabilities(): void {
    if (Platform.OS === 'web') {
      this.detectWebCapabilities();
      return;
    }

    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    const screenSize = Math.sqrt(width * width + height * height) / pixelRatio;

    // Detect device capabilities
    this.deviceCapabilities = {
      isLowEndDevice: screenSize < 4.5 || pixelRatio < 2,
      hasHighDPI: pixelRatio >= 3,
      hasGoodGPU: screenSize > 5.5 && pixelRatio >= 2,
      hasLimitedMemory: Platform.OS === 'android' && screenSize < 5,
    };

    // Adjust config based on device capabilities
    this.adjustConfigForDevice();
  }

  private detectWebCapabilities(): void {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    this.deviceCapabilities = {
      isLowEndDevice: !gl || navigator.hardwareConcurrency < 4,
      hasHighDPI: window.devicePixelRatio >= 2,
      hasGoodGPU: !!gl && navigator.hardwareConcurrency >= 8,
      hasLimitedMemory: navigator.deviceMemory ? navigator.deviceMemory < 4 : false,
    };

    // Adjust web config based on capabilities
    if (this.deviceCapabilities.isLowEndDevice) {
      this.config.web.enableWebGL = false;
      this.config.web.enableWebWorkers = false;
      this.config.web.enableWebAssembly = false;
    }
  }

  private adjustConfigForDevice(): void {
    if (this.deviceCapabilities.isLowEndDevice) {
      if (Platform.OS === 'ios') {
        this.config.ios.enableBlurEffects = false;
        this.config.ios.enableMetalPerformance = false;
      } else if (Platform.OS === 'android') {
        this.config.android.enableBlurEffects = false;
        this.config.android.enableRenderScript = false;
      }
    }

    if (this.deviceCapabilities.hasLimitedMemory) {
      if (Platform.OS === 'android') {
        this.config.android.enableHardwareAcceleration = false;
      }
    }
  }

  public getOptimizedAnimationConfig(): {
    useNativeDriver: boolean;
    duration: number;
    easing: string;
  } {
    const baseConfig = {
      useNativeDriver: true,
      duration: 300,
      easing: 'ease-in-out',
    };

    if (Platform.OS === 'web') {
      return {
        ...baseConfig,
        useNativeDriver: false,
        duration: 250, // Faster on web
      };
    }

    if (Platform.OS === 'ios') {
      return {
        ...baseConfig,
        useNativeDriver: this.config.ios.enableNativeAnimations,
        duration: this.config.ios.enableCoreAnimation ? 300 : 200,
      };
    }

    if (Platform.OS === 'android') {
      return {
        ...baseConfig,
        useNativeDriver: this.config.android.enableNativeAnimations,
        duration: this.config.android.enableHardwareAcceleration ? 300 : 200,
      };
    }

    return baseConfig;
  }

  public getOptimizedImageConfig(): {
    quality: number;
    format: 'jpeg' | 'png' | 'webp';
    enableProgressive: boolean;
    enableLazyLoading: boolean;
  } {
    const baseConfig = {
      quality: 80,
      format: 'jpeg' as const,
      enableProgressive: true,
      enableLazyLoading: true,
    };

    if (Platform.OS === 'web') {
      return {
        ...baseConfig,
        format: 'webp',
        quality: this.deviceCapabilities.hasGoodGPU ? 85 : 75,
      };
    }

    if (Platform.OS === 'ios') {
      return {
        ...baseConfig,
        quality: this.deviceCapabilities.hasHighDPI ? 90 : 80,
        format: 'jpeg',
      };
    }

    if (Platform.OS === 'android') {
      return {
        ...baseConfig,
        quality: this.deviceCapabilities.isLowEndDevice ? 70 : 80,
        format: 'jpeg',
      };
    }

    return baseConfig;
  }

  public getOptimizedListConfig(): {
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    windowSize: number;
    removeClippedSubviews: boolean;
    enableVirtualization: boolean;
  } {
    const baseConfig = {
      initialNumToRender: 10,
      maxToRenderPerBatch: 5,
      windowSize: 10,
      removeClippedSubviews: true,
      enableVirtualization: true,
    };

    if (this.deviceCapabilities.isLowEndDevice) {
      return {
        ...baseConfig,
        initialNumToRender: 5,
        maxToRenderPerBatch: 3,
        windowSize: 5,
      };
    }

    if (this.deviceCapabilities.hasGoodGPU) {
      return {
        ...baseConfig,
        initialNumToRender: 15,
        maxToRenderPerBatch: 8,
        windowSize: 15,
      };
    }

    return baseConfig;
  }

  public getOptimizedNetworkConfig(): {
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    enableCompression: boolean;
    enableCaching: boolean;
  } {
    const baseConfig = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCompression: true,
      enableCaching: true,
    };

    if (Platform.OS === 'web') {
      return {
        ...baseConfig,
        timeout: 15000,
        retryAttempts: 2,
        enableCompression: true,
      };
    }

    if (this.deviceCapabilities.isLowEndDevice) {
      return {
        ...baseConfig,
        timeout: 20000,
        retryAttempts: 2,
        retryDelay: 2000,
      };
    }

    return baseConfig;
  }

  public getOptimizedStorageConfig(): {
    maxCacheSize: number;
    enableCompression: boolean;
    enableEncryption: boolean;
    cleanupInterval: number;
  } {
    const baseConfig = {
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      enableCompression: true,
      enableEncryption: true,
      cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
    };

    if (this.deviceCapabilities.hasLimitedMemory) {
      return {
        ...baseConfig,
        maxCacheSize: 25 * 1024 * 1024, // 25MB
        cleanupInterval: 12 * 60 * 60 * 1000, // 12 hours
      };
    }

    if (this.deviceCapabilities.hasGoodGPU) {
      return {
        ...baseConfig,
        maxCacheSize: 200 * 1024 * 1024, // 200MB
      };
    }

    return baseConfig;
  }

  public shouldUseBlurEffects(): boolean {
    if (Platform.OS === 'web') {
      return this.config.web.enableWebGL && !this.deviceCapabilities.isLowEndDevice;
    }

    if (Platform.OS === 'ios') {
      return this.config.ios.enableBlurEffects && !this.deviceCapabilities.isLowEndDevice;
    }

    if (Platform.OS === 'android') {
      return this.config.android.enableBlurEffects && !this.deviceCapabilities.isLowEndDevice;
    }

    return false;
  }

  public shouldUseHapticFeedback(): boolean {
    if (Platform.OS === 'web') {
      return 'vibrate' in navigator;
    }

    if (Platform.OS === 'ios') {
      return this.config.ios.enableHapticFeedback;
    }

    if (Platform.OS === 'android') {
      return this.config.android.enableHapticFeedback;
    }

    return false;
  }

  public shouldUseNativeDriver(): boolean {
    if (Platform.OS === 'web') {
      return false;
    }

    if (Platform.OS === 'ios') {
      return this.config.ios.enableNativeAnimations;
    }

    if (Platform.OS === 'android') {
      return this.config.android.enableNativeAnimations;
    }

    return true;
  }

  public getPlatformSpecificStyles(): {
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
    borderRadius: number;
  } {
    if (Platform.OS === 'web') {
      return {
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderRadius: 8,
      };
    }

    if (Platform.OS === 'ios') {
      return {
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 0,
        borderRadius: 12,
      };
    }

    if (Platform.OS === 'android') {
      return {
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        borderRadius: 8,
      };
    }

    return {
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderRadius: 8,
    };
  }

  public getDeviceCapabilities() {
    return { ...this.deviceCapabilities };
  }

  public updateConfig(newConfig: Partial<PlatformConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): PlatformConfig {
    return { ...this.config };
  }

  // Platform-specific utility methods
  public isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  public isAndroid(): boolean {
    return Platform.OS === 'android';
  }

  public isWeb(): boolean {
    return Platform.OS === 'web';
  }

  public isMobile(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  public getPlatformVersion(): string | number {
    return Platform.Version;
  }

  public getScreenDimensions(): { width: number; height: number; scale: number } {
    const { width, height } = Dimensions.get('window');
    const scale = PixelRatio.get();
    return { width, height, scale };
  }
}

export const platformOptimizer = PlatformOptimizer.getInstance();

// Utility functions
export const getOptimizedAnimationConfig = () => platformOptimizer.getOptimizedAnimationConfig();
export const getOptimizedImageConfig = () => platformOptimizer.getOptimizedImageConfig();
export const getOptimizedListConfig = () => platformOptimizer.getOptimizedListConfig();
export const getOptimizedNetworkConfig = () => platformOptimizer.getOptimizedNetworkConfig();
export const getOptimizedStorageConfig = () => platformOptimizer.getOptimizedStorageConfig();
export const shouldUseBlurEffects = () => platformOptimizer.shouldUseBlurEffects();
export const shouldUseHapticFeedback = () => platformOptimizer.shouldUseHapticFeedback();
export const shouldUseNativeDriver = () => platformOptimizer.shouldUseNativeDriver();
export const getPlatformSpecificStyles = () => platformOptimizer.getPlatformSpecificStyles();
export const getDeviceCapabilities = () => platformOptimizer.getDeviceCapabilities();

export default PlatformOptimizer;
