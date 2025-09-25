/**
 * @fileoverview performanceOptimization.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { logger } from './logger';

// Debounce hook for performance optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Memoized callback hook
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

// Memoized value hook with custom equality function
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  equalityFn?: (a: T, b: T) => boolean
): T => {
  const ref = useRef<T>();
  const prevDeps = useRef<React.DependencyList>();

  const currentDeps = deps ?? [];
  if (
    !ref.current ||
    !areEqual(prevDeps.current ?? [], currentDeps) ||
    (equalityFn && !equalityFn(ref.current, factory()))
  ) {
    ref.current = factory();
    prevDeps.current = currentDeps;
  }

  return ref.current;
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (renderTime > 16) { // More than one frame (16ms)
      logger.warn('Slow render detected', 'PerformanceMonitor', {
        component: componentName,
        renderTime,
        renderCount: renderCount.current,
      });
    }
    
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
  };
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
};

// Image optimization hook
export const useImageOptimization = (uri: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}) => {
  const [optimizedUri, setOptimizedUri] = useState(uri);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uri) return;

    setLoading(true);
    setError(null);

    // Simulate image optimization
    const optimizeImage = async () => {
      try {
        // In a real app, you would use a service like Cloudinary or similar
        const optimized = `${uri}?w=${options?.width || 400}&h=${options?.height || 300}&q=${options?.quality || 80}`;
        setOptimizedUri(optimized);
      } catch (err) {
        setError('Failed to optimize image');
        logger.error('Image optimization failed', 'ImageOptimization', err);
      } finally {
        setLoading(false);
      }
    };

    optimizeImage();
  }, [uri, options]);

  return { optimizedUri, loading, error };
};

// Data processing optimization
export const useDataProcessing = <T, R>(
  data: T[],
  processor: (item: T) => R,
  options?: {
    batchSize?: number;
    delay?: number;
  }
) => {
  const [processedData, setProcessedData] = useState<R[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processData = useCallback(async () => {
    if (!data.length) return;

    setIsProcessing(true);
    setProgress(0);

    const batchSize = options?.batchSize || 10;
    const delay = options?.delay || 0;
    const results: R[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResults = batch.map(processor);
      results.push(...batchResults);

      setProgress((i + batchSize) / data.length);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setProcessedData(results);
    setIsProcessing(false);
  }, [data, processor, options]);

  useEffect(() => {
    processData();
  }, [processData]);

  return { processedData, isProcessing, progress };
};

// Memory optimization utilities
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        logger.error('Cleanup function failed', 'MemoryOptimization', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
};

// Helper functions
const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

// Performance metrics collection
export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMaxMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return Math.max(...values);
  }

  getMinMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return Math.min(...values);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  getAllMetrics(): Record<string, { average: number; max: number; min: number; count: number }> {
    const result: Record<string, { average: number; max: number; min: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      result[name] = {
        average: this.getAverageMetric(name),
        max: this.getMaxMetric(name),
        min: this.getMinMetric(name),
        count: values.length,
      };
    });

    return result;
  }
}

export const performanceMetrics = PerformanceMetrics.getInstance();

// Export all hooks and utilities
const performanceOptimization = {
  useDebounce,
  useThrottle,
  useMemoizedCallback,
  useMemoizedValue,
  usePerformanceMonitor,
  useVirtualScrolling,
  useImageOptimization,
  useDataProcessing,
  useMemoryOptimization,
  PerformanceMetrics,
  performanceMetrics,
};

export default performanceOptimization;
