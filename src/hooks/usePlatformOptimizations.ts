/**
 * @fileoverview usePlatformOptimizations.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform, Dimensions } from 'react-native';
import { platformOptimizer } from '../utils/platformOptimizations';

interface PlatformOptimizationState {
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isMobile: boolean;
  platformVersion: string | number;
  deviceCapabilities: {
    isLowEndDevice: boolean;
    hasHighDPI: boolean;
    hasGoodGPU: boolean;
    hasLimitedMemory: boolean;
  };
  screenDimensions: {
    width: number;
    height: number;
    scale: number;
  };
}

export const usePlatformOptimizations = () => {
  const [optimizationState, setOptimizationState] = useState<PlatformOptimizationState>({
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
    isMobile: Platform.OS === 'ios' || Platform.OS === 'android',
    platformVersion: Platform.Version,
    deviceCapabilities: platformOptimizer.getDeviceCapabilities(),
    screenDimensions: platformOptimizer.getScreenDimensions(),
  });

  // Monitor screen dimension changes
  useEffect(() => {
    const updateDimensions = () => {
      setOptimizationState(prev => ({
        ...prev,
        screenDimensions: platformOptimizer.getScreenDimensions(),
      }));
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  // Optimized animation config
  const getAnimationConfig = useCallback(() => {
    return platformOptimizer.getOptimizedAnimationConfig();
  }, []);

  // Optimized image config
  const getImageConfig = useCallback(() => {
    return platformOptimizer.getOptimizedImageConfig();
  }, []);

  // Optimized list config
  const getListConfig = useCallback(() => {
    return platformOptimizer.getOptimizedListConfig();
  }, []);

  // Optimized network config
  const getNetworkConfig = useCallback(() => {
    return platformOptimizer.getOptimizedNetworkConfig();
  }, []);

  // Optimized storage config
  const getStorageConfig = useCallback(() => {
    return platformOptimizer.getOptimizedStorageConfig();
  }, []);

  // Platform-specific style utilities
  const getPlatformStyles = useCallback(() => {
    return platformOptimizer.getPlatformSpecificStyles();
  }, []);

  // Feature detection
  const canUseBlurEffects = useCallback(() => {
    return platformOptimizer.shouldUseBlurEffects();
  }, []);

  const canUseHapticFeedback = useCallback(() => {
    return platformOptimizer.shouldUseHapticFeedback();
  }, []);

  const shouldUseNativeDriver = useCallback(() => {
    return platformOptimizer.shouldUseNativeDriver();
  }, []);

  // Memoized optimized styles
  const optimizedStyles = useMemo(() => {
    const platformStyles = getPlatformStyles();
    const deviceCapabilities = optimizationState.deviceCapabilities;
    
    return {
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: platformStyles.shadowOpacity,
        shadowRadius: platformStyles.shadowRadius,
        elevation: platformStyles.elevation,
      },
      card: {
        borderRadius: platformStyles.borderRadius,
        backgroundColor: '#fff',
        ...(optimizationState.isIOS ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        } : {
          elevation: 4,
        }),
      },
      button: {
        borderRadius: platformStyles.borderRadius,
        paddingHorizontal: deviceCapabilities.isLowEndDevice ? 12 : 16,
        paddingVertical: deviceCapabilities.isLowEndDevice ? 8 : 12,
      },
      input: {
        borderRadius: platformStyles.borderRadius,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
    };
  }, [getPlatformStyles, optimizationState.deviceCapabilities, optimizationState.isIOS]);

  // Adaptive loading strategy based on platform
  const getLoadingStrategy = useCallback(() => {
    const deviceCapabilities = optimizationState.deviceCapabilities;
    
    if (optimizationState.isWeb) {
      return {
        lazy: true,
        batchSize: 10,
        delay: 0,
        priority: 'high',
        enableServiceWorker: true,
        enableIndexedDB: true,
      };
    }

    if (optimizationState.isIOS) {
      return {
        lazy: !deviceCapabilities.hasGoodGPU,
        batchSize: deviceCapabilities.isLowEndDevice ? 5 : 15,
        delay: deviceCapabilities.isLowEndDevice ? 100 : 0,
        priority: deviceCapabilities.hasGoodGPU ? 'high' : 'medium',
        enableCoreAnimation: true,
        enableMetalPerformance: deviceCapabilities.hasGoodGPU,
      };
    }

    if (optimizationState.isAndroid) {
      return {
        lazy: true,
        batchSize: deviceCapabilities.isLowEndDevice ? 3 : 10,
        delay: deviceCapabilities.isLowEndDevice ? 200 : 50,
        priority: deviceCapabilities.hasGoodGPU ? 'medium' : 'low',
        enableHardwareAcceleration: !deviceCapabilities.hasLimitedMemory,
        enableRenderScript: !deviceCapabilities.isLowEndDevice,
      };
    }

    return {
      lazy: true,
      batchSize: 8,
      delay: 50,
      priority: 'medium',
    };
  }, [optimizationState]);

  // Platform-specific navigation config
  const getNavigationConfig = useCallback(() => {
    if (optimizationState.isWeb) {
      return {
        gestureEnabled: false,
        headerShown: true,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#fff' },
      };
    }

    if (optimizationState.isIOS) {
      return {
        gestureEnabled: true,
        headerShown: true,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#fff' },
        presentation: 'card',
      };
    }

    if (optimizationState.isAndroid) {
      return {
        gestureEnabled: false,
        headerShown: true,
        animationEnabled: !optimizationState.deviceCapabilities.isLowEndDevice,
        cardStyle: { backgroundColor: '#fff' },
        presentation: 'modal',
      };
    }

    return {
      gestureEnabled: true,
      headerShown: true,
      animationEnabled: true,
      cardStyle: { backgroundColor: '#fff' },
    };
  }, [optimizationState]);

  // Performance monitoring
  const trackPerformance = useCallback((componentName: string, operation: string, duration: number) => {
    if (__DEV__) {
      const platform = optimizationState.isWeb ? 'Web' : 
                      optimizationState.isIOS ? 'iOS' : 
                      optimizationState.isAndroid ? 'Android' : 'Unknown';
      
      console.log(`[${platform} Performance] ${componentName}.${operation}: ${duration.toFixed(2)}ms`);
      
      if (optimizationState.deviceCapabilities.isLowEndDevice) {
        console.warn(`[Performance Warning] ${componentName} took ${duration.toFixed(2)}ms on low-end device`);
      }
    }
  }, [optimizationState]);

  // Platform-specific utilities
  const platformUtils = useMemo(() => ({
    isIOS: optimizationState.isIOS,
    isAndroid: optimizationState.isAndroid,
    isWeb: optimizationState.isWeb,
    isMobile: optimizationState.isMobile,
    platformVersion: optimizationState.platformVersion,
    deviceCapabilities: optimizationState.deviceCapabilities,
    screenDimensions: optimizationState.screenDimensions,
  }), [optimizationState]);

  return {
    // State
    ...platformUtils,
    
    // Configuration functions
    getAnimationConfig,
    getImageConfig,
    getListConfig,
    getNetworkConfig,
    getStorageConfig,
    getPlatformStyles,
    
    // Feature detection
    canUseBlurEffects,
    canUseHapticFeedback,
    shouldUseNativeDriver,
    
    // Adaptive strategies
    getLoadingStrategy,
    getNavigationConfig,
    
    // Performance monitoring
    trackPerformance,
    
    // Pre-computed styles
    optimizedStyles,
    
    // Configuration
    config: platformOptimizer.getConfig(),
    updateConfig: platformOptimizer.updateConfig.bind(platformOptimizer),
  };
};

export default usePlatformOptimizations;
