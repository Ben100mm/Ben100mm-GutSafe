import { InteractionManager, Dimensions } from 'react-native';

/**
 * PerformanceOptimizer - Comprehensive performance optimization utilities
 * Provides lazy loading, memoization, and performance monitoring
 */
class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceMetrics: Map<string, number> = new Map();
  private isMonitoring: boolean = false;

  private constructor() {}

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Lazy load component after interaction
   */
  static lazyLoadComponent<T>(
    importFn: () => Promise<{ default: React.ComponentType<T> }>,
    fallback?: React.ComponentType
  ): React.ComponentType<T> {
    return React.lazy(importFn);
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): T {
    let timeout: NodeJS.Timeout | null = null;
    
    return ((...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    }) as T;
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean = false;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  /**
   * Memoize expensive calculations
   */
  static memoize<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  /**
   * Run after interactions complete
   */
  static runAfterInteractions(callback: () => void): void {
    InteractionManager.runAfterInteractions(callback);
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.performanceMetrics.clear();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Measure performance of a function
   */
  measurePerformance<T>(
    name: string,
    fn: () => T
  ): T {
    if (!this.isMonitoring) {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    this.performanceMetrics.set(name, duration);
    
    return result;
  }

  /**
   * Measure async performance
   */
  async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (!this.isMonitoring) {
      return fn();
    }

    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    this.performanceMetrics.set(name, duration);
    
    return result;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): Map<string, number> {
    return new Map(this.performanceMetrics);
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    totalFunctions: number;
    averageTime: number;
    slowestFunction: string;
    fastestFunction: string;
    recommendations: string[];
  } {
    const metrics = Array.from(this.performanceMetrics.entries());
    
    if (metrics.length === 0) {
      return {
        totalFunctions: 0,
        averageTime: 0,
        slowestFunction: '',
        fastestFunction: '',
        recommendations: []
      };
    }

    const times = metrics.map(([_, time]) => time);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    const sortedMetrics = metrics.sort((a, b) => b[1] - a[1]);
    const slowestFunction = sortedMetrics[0][0];
    const fastestFunction = sortedMetrics[sortedMetrics.length - 1][0];
    
    const recommendations: string[] = [];
    
    if (averageTime > 100) {
      recommendations.push('Consider optimizing functions - average time is high');
    }
    
    const slowFunctions = metrics.filter(([_, time]) => time > 200);
    if (slowFunctions.length > 0) {
      recommendations.push(`Optimize slow functions: ${slowFunctions.map(([name]) => name).join(', ')}`);
    }
    
    return {
      totalFunctions: metrics.length,
      averageTime: Math.round(averageTime * 100) / 100,
      slowestFunction,
      fastestFunction,
      recommendations
    };
  }

  /**
   * Optimize image loading
   */
  static optimizeImageLoading(
    uri: string,
    width?: number,
    height?: number
  ): string {
    const { width: screenWidth } = Dimensions.get('window');
    const targetWidth = width || screenWidth;
    const targetHeight = height || Math.round(targetWidth * 0.75);
    
    // Add query parameters for image optimization
    const url = new URL(uri);
    url.searchParams.set('w', targetWidth.toString());
    url.searchParams.set('h', targetHeight.toString());
    url.searchParams.set('q', '80'); // Quality
    url.searchParams.set('f', 'webp'); // Format
    
    return url.toString();
  }

  /**
   * Preload critical resources
   */
  static async preloadResources(resources: string[]): Promise<void> {
    const preloadPromises = resources.map(resource => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload ${resource}`));
        img.src = resource;
      });
    });
    
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Optimize list rendering
   */
  static getOptimizedListProps(
    itemCount: number,
    itemHeight: number,
    screenHeight: number = Dimensions.get('window').height
  ): {
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    windowSize: number;
    removeClippedSubviews: boolean;
    getItemLayout?: (data: any, index: number) => { length: number; offset: number; index: number };
  } {
    const visibleItems = Math.ceil(screenHeight / itemHeight);
    
    return {
      initialNumToRender: Math.min(visibleItems, 10),
      maxToRenderPerBatch: Math.min(visibleItems * 2, 20),
      windowSize: 5,
      removeClippedSubviews: true,
      getItemLayout: (data: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),
    };
  }

  /**
   * Optimize bundle size
   */
  static getBundleOptimizationTips(): string[] {
    return [
      'Use dynamic imports for large components',
      'Implement code splitting for different app sections',
      'Remove unused dependencies',
      'Use tree shaking for better dead code elimination',
      'Optimize images and assets',
      'Use React.memo for expensive components',
      'Implement lazy loading for screens',
      'Use FlatList instead of ScrollView for large lists',
      'Avoid inline functions in render methods',
      'Use useCallback and useMemo hooks appropriately'
    ];
  }

  /**
   * Check if device is low-end
   */
  static isLowEndDevice(): boolean {
    const { width, height } = Dimensions.get('window');
    const totalPixels = width * height;
    
    // Consider device low-end if screen resolution is low
    return totalPixels < 1000000; // Less than 1MP
  }

  /**
   * Get optimized settings for device
   */
  static getOptimizedSettings(): {
    enableAnimations: boolean;
    enableHaptics: boolean;
    enableBlur: boolean;
    imageQuality: number;
    maxListItems: number;
  } {
    const isLowEnd = this.isLowEndDevice();
    
    return {
      enableAnimations: !isLowEnd,
      enableHaptics: !isLowEnd,
      enableBlur: !isLowEnd,
      imageQuality: isLowEnd ? 60 : 80,
      maxListItems: isLowEnd ? 50 : 100
    };
  }

  /**
   * Monitor memory usage
   */
  static getMemoryUsage(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  }

  /**
   * Check if memory usage is high
   */
  static isMemoryUsageHigh(): boolean {
    const memory = this.getMemoryUsage();
    const usagePercentage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    return usagePercentage > 0.8; // 80% threshold
  }

  /**
   * Clear performance metrics
   */
  clearMetrics(): void {
    this.performanceMetrics.clear();
  }

  /**
   * Export performance data
   */
  exportPerformanceData(): string {
    const report = this.getPerformanceReport();
    const metrics = Array.from(this.performanceMetrics.entries());
    
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      report,
      metrics: metrics.map(([name, time]) => ({ name, time })),
      memory: PerformanceOptimizer.getMemoryUsage()
    }, null, 2);
  }
}

export default PerformanceOptimizer;
