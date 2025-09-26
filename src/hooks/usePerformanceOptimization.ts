/**
 * @fileoverview usePerformanceOptimization.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { InteractionManager, Platform } from 'react-native';

interface PerformanceConfig {
  enableVirtualization?: boolean;
  enableMemoization?: boolean;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enableCaching?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
}

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
}

export const usePerformanceOptimization = (config: PerformanceConfig = {}) => {
  const {
    enableVirtualization = true,
    enableMemoization = true,
    enableLazyLoading = true,
    enableImageOptimization = true,
    enableCaching = true,
    debounceDelay = 300,
    throttleDelay = 100,
  } = config;

  const metricsRef = useRef<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  });

  const startTimeRef = useRef<number>(0);

  // Track render performance
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      metricsRef.current.renderTime = endTime - startTimeRef.current;
    };
  });

  // Debounce function
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = debounceDelay
  ): T => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }, [debounceDelay]);

  // Throttle function
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = throttleDelay
  ): T => {
    let lastCall = 0;
    
    return ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    }) as T;
  }, [throttleDelay]);

  // Run after interactions
  const runAfterInteractions = useCallback((callback: () => void) => {
    InteractionManager.runAfterInteractions(callback);
  }, []);

  // Memoized values
  const memoizedConfig = useMemo(() => ({
    enableVirtualization,
    enableMemoization,
    enableLazyLoading,
    enableImageOptimization,
    enableCaching,
  }), [
    enableVirtualization,
    enableMemoization,
    enableLazyLoading,
    enableImageOptimization,
    enableCaching,
  ]);

  // Performance monitoring
  const trackPerformance = useCallback((componentName: string, operation: string, duration: number) => {
    if (__DEV__) {
      console.log(`[Performance] ${componentName}.${operation}: ${duration.toFixed(2)}ms`);
    }
  }, []);

  // Memory usage tracking (web only)
  const getMemoryUsage = useCallback(() => {
    if (Platform.OS === 'web' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  // Component optimization helpers
  const optimizeComponent = useCallback((componentName: string) => {
    return {
      shouldUpdate: (prevProps: any, nextProps: any) => {
        // Shallow comparison for props
        const prevKeys = Object.keys(prevProps);
        const nextKeys = Object.keys(nextProps);
        
        if (prevKeys.length !== nextKeys.length) return true;
        
        return prevKeys.some(key => prevProps[key] !== nextProps[key]);
      },
      trackRender: () => {
        trackPerformance(componentName, 'render', performance.now() - startTimeRef.current);
      },
    };
  }, [trackPerformance]);

  // Lazy loading helper
  const createLazyComponent = useCallback(<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ComponentType
  ) => {
    if (!enableLazyLoading) {
      return importFn().then(module => module.default);
    }
    
    return React.lazy(importFn);
  }, [enableLazyLoading]);

  // Image optimization helper
  const optimizeImage = useCallback((uri: string, width?: number, height?: number, quality: number = 80) => {
    if (!enableImageOptimization) return uri;
    
    if (Platform.OS === 'web') {
      try {
        const url = new URL(uri);
        if (width) url.searchParams.set('w', width.toString());
        if (height) url.searchParams.set('h', height.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('f', 'auto');
        return url.toString();
      } catch {
        return uri;
      }
    }
    
    return uri;
  }, [enableImageOptimization]);

  // Cache helper
  const createCache = useCallback((key: string, ttl: number = 300000) => {
    if (!enableCaching) return null;
    
    const cache = new Map();
    const timestamps = new Map();
    
    return {
      get: (cacheKey: string) => {
        const timestamp = timestamps.get(cacheKey);
        if (timestamp && Date.now() - timestamp < ttl) {
          return cache.get(cacheKey);
        }
        cache.delete(cacheKey);
        timestamps.delete(cacheKey);
        return null;
      },
      set: (cacheKey: string, value: any) => {
        cache.set(cacheKey, value);
        timestamps.set(cacheKey, Date.now());
      },
      clear: () => {
        cache.clear();
        timestamps.clear();
      },
    };
  }, [enableCaching]);

  // Virtualization helper
  const createVirtualList = useCallback((items: any[], itemHeight: number, containerHeight: number) => {
    if (!enableVirtualization) return { visibleItems: items, startIndex: 0, endIndex: items.length };
    
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    const startIndex = 0; // Would be calculated based on scroll position
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
    };
  }, [enableVirtualization]);

  return {
    // Functions
    debounce,
    throttle,
    runAfterInteractions,
    trackPerformance,
    getMemoryUsage,
    optimizeComponent,
    createLazyComponent,
    optimizeImage,
    createCache,
    createVirtualList,
    
    // Config
    config: memoizedConfig,
    
    // Metrics
    metrics: metricsRef.current,
  };
};

export default usePerformanceOptimization;
