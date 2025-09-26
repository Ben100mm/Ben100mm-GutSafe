/**
 * @fileoverview useMobileOptimizations.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform, AppState, Dimensions } from 'react-native';
import { mobileOptimizer } from '../utils/mobileOptimizations';

interface MobileOptimizationState {
  isLowPowerMode: boolean;
  isMemoryConstrained: boolean;
  isNetworkSlow: boolean;
  screenSize: 'small' | 'medium' | 'large';
  pixelRatio: number;
}

export const useMobileOptimizations = () => {
  const [optimizationState, setOptimizationState] = useState<MobileOptimizationState>({
    isLowPowerMode: false,
    isMemoryConstrained: false,
    isNetworkSlow: false,
    screenSize: 'medium',
    pixelRatio: 1,
  });

  const [appState, setAppState] = useState(AppState.currentState);

  // Detect device capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const { width, height } = Dimensions.get('window');
      const pixelRatio = Platform.OS === 'web' ? 1 : require('react-native').PixelRatio.get();
      
      const screenSize = Math.sqrt(width * width + height * height) / pixelRatio;
      
      setOptimizationState(prev => ({
        ...prev,
        screenSize: screenSize < 4.5 ? 'small' : screenSize > 6 ? 'large' : 'medium',
        pixelRatio,
        isMemoryConstrained: Platform.OS === 'android' && screenSize < 5,
      }));
    };

    detectCapabilities();

    const subscription = Dimensions.addEventListener('change', detectCapabilities);
    return () => subscription?.remove();
  }, []);

  // Monitor app state for battery optimizations
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      setAppState(nextAppState);
      
      if (nextAppState === 'background') {
        // Enable battery optimizations when app goes to background
        mobileOptimizer.enableBatteryOptimizations();
      } else if (nextAppState === 'active') {
        // Disable battery optimizations when app becomes active
        mobileOptimizer.disableBatteryOptimizations();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Optimized image size calculator
  const getOptimizedImageSize = useCallback((width: number, height: number) => {
    return mobileOptimizer.getOptimizedImageSize(width, height);
  }, []);

  // Optimized animation config
  const getAnimationConfig = useCallback(() => {
    return mobileOptimizer.getOptimizedAnimationConfig();
  }, []);

  // Optimized list config
  const getListConfig = useCallback(() => {
    return mobileOptimizer.getOptimizedListConfig();
  }, []);

  // Optimized image quality
  const getImageQuality = useCallback(() => {
    return mobileOptimizer.getOptimizedImageQuality();
  }, []);

  // Optimized cache size
  const getCacheSize = useCallback(() => {
    return mobileOptimizer.getOptimizedCacheSize();
  }, []);

  // Optimized network config
  const getNetworkConfig = useCallback(() => {
    return mobileOptimizer.getOptimizedNetworkConfig();
  }, []);

  // Font size optimization
  const getOptimizedFontSize = useCallback((baseSize: number) => {
    return mobileOptimizer.getOptimizedFontSize(baseSize);
  }, []);

  // Spacing optimization
  const getOptimizedSpacing = useCallback((baseSpacing: number) => {
    return mobileOptimizer.getOptimizedSpacing(baseSpacing);
  }, []);

  // Memory management
  const clearMemoryCache = useCallback(() => {
    mobileOptimizer.clearMemoryCache();
  }, []);

  const getMemoryUsage = useCallback(() => {
    return mobileOptimizer.getMemoryUsage();
  }, []);

  // Platform-specific utilities
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  const shouldUseNativeDriver = mobileOptimizer.shouldUseNativeDriver();

  // Memoized optimized styles
  const optimizedStyles = useMemo(() => {
    const baseFontSize = 16;
    const baseSpacing = 16;

    return {
      fontSize: {
        small: getOptimizedFontSize(baseFontSize * 0.875),
        medium: getOptimizedFontSize(baseFontSize),
        large: getOptimizedFontSize(baseFontSize * 1.125),
        xlarge: getOptimizedFontSize(baseFontSize * 1.25),
      },
      spacing: {
        xs: getOptimizedSpacing(baseSpacing * 0.25),
        sm: getOptimizedSpacing(baseSpacing * 0.5),
        md: getOptimizedSpacing(baseSpacing),
        lg: getOptimizedSpacing(baseSpacing * 1.5),
        xl: getOptimizedSpacing(baseSpacing * 2),
      },
      animation: getAnimationConfig(),
      list: getListConfig(),
    };
  }, [getOptimizedFontSize, getOptimizedSpacing, getAnimationConfig, getListConfig]);

  // Performance monitoring
  const trackPerformance = useCallback((componentName: string, operation: string, duration: number) => {
    if (__DEV__) {
      console.log(`[Mobile Performance] ${componentName}.${operation}: ${duration.toFixed(2)}ms`);
      
      // Log memory usage if available
      const memoryUsage = getMemoryUsage();
      if (memoryUsage) {
        console.log(`[Memory] Used: ${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB, Available: ${(memoryUsage.available / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }, [getMemoryUsage]);

  // Adaptive loading strategy
  const getLoadingStrategy = useCallback(() => {
    if (optimizationState.isLowPowerMode || optimizationState.isMemoryConstrained) {
      return {
        lazy: true,
        batchSize: 5,
        delay: 100,
        priority: 'low',
      };
    }

    if (optimizationState.screenSize === 'small') {
      return {
        lazy: true,
        batchSize: 8,
        delay: 50,
        priority: 'medium',
      };
    }

    return {
      lazy: false,
      batchSize: 15,
      delay: 0,
      priority: 'high',
    };
  }, [optimizationState]);

  // Network-aware optimizations
  const getNetworkOptimizations = useCallback(() => {
    const networkConfig = getNetworkConfig();
    
    return {
      timeout: networkConfig.timeout,
      retryAttempts: networkConfig.retryAttempts,
      retryDelay: networkConfig.retryDelay,
      enableCompression: true,
      enableCaching: true,
      prefetchThreshold: optimizationState.isNetworkSlow ? 0.8 : 0.5,
    };
  }, [getNetworkConfig, optimizationState.isNetworkSlow]);

  return {
    // State
    optimizationState,
    appState,
    
    // Platform info
    isWeb,
    isMobile,
    shouldUseNativeDriver,
    
    // Optimization functions
    getOptimizedImageSize,
    getAnimationConfig,
    getListConfig,
    getImageQuality,
    getCacheSize,
    getNetworkConfig,
    getOptimizedFontSize,
    getOptimizedSpacing,
    
    // Memory management
    clearMemoryCache,
    getMemoryUsage,
    
    // Performance monitoring
    trackPerformance,
    
    // Adaptive strategies
    getLoadingStrategy,
    getNetworkOptimizations,
    
    // Pre-computed styles
    optimizedStyles,
    
    // Configuration
    config: mobileOptimizer.getConfig(),
    updateConfig: mobileOptimizer.updateConfig.bind(mobileOptimizer),
  };
};

export default useMobileOptimizations;
