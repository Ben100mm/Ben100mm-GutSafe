/**
 * Build Configuration System
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Environment-specific build configurations and optimizations.
 */

import { Environment } from './environment';

// Build environment types
export type BuildEnvironment = 'development' | 'staging' | 'production' | 'test';

// Build configuration interface
export interface BuildConfig {
  environment: BuildEnvironment;
  optimization: {
    minify: boolean;
    compress: boolean;
    treeShaking: boolean;
    codeSplitting: boolean;
    sourceMaps: boolean;
  };
  features: {
    hotReload: boolean;
    devTools: boolean;
    profiling: boolean;
    debugging: boolean;
  };
  security: {
    contentSecurityPolicy: boolean;
    xssProtection: boolean;
    frameOptions: boolean;
    hsts: boolean;
  };
  performance: {
    bundleAnalysis: boolean;
    compression: boolean;
    caching: boolean;
    lazyLoading: boolean;
  };
  monitoring: {
    errorTracking: boolean;
    performanceMonitoring: boolean;
    analytics: boolean;
    logging: boolean;
  };
}

// Environment-specific build configurations
export const buildConfigs: Record<BuildEnvironment, BuildConfig> = {
  development: {
    environment: 'development',
    optimization: {
      minify: false,
      compress: false,
      treeShaking: false,
      codeSplitting: false,
      sourceMaps: true,
    },
    features: {
      hotReload: true,
      devTools: true,
      profiling: true,
      debugging: true,
    },
    security: {
      contentSecurityPolicy: false,
      xssProtection: false,
      frameOptions: false,
      hsts: false,
    },
    performance: {
      bundleAnalysis: false,
      compression: false,
      caching: false,
      lazyLoading: false,
    },
    monitoring: {
      errorTracking: false,
      performanceMonitoring: false,
      analytics: false,
      logging: true,
    },
  },
  
  staging: {
    environment: 'staging',
    optimization: {
      minify: true,
      compress: true,
      treeShaking: true,
      codeSplitting: true,
      sourceMaps: true,
    },
    features: {
      hotReload: false,
      devTools: true,
      profiling: true,
      debugging: true,
    },
    security: {
      contentSecurityPolicy: true,
      xssProtection: true,
      frameOptions: true,
      hsts: false,
    },
    performance: {
      bundleAnalysis: true,
      compression: true,
      caching: true,
      lazyLoading: true,
    },
    monitoring: {
      errorTracking: true,
      performanceMonitoring: true,
      analytics: true,
      logging: true,
    },
  },
  
  production: {
    environment: 'production',
    optimization: {
      minify: true,
      compress: true,
      treeShaking: true,
      codeSplitting: true,
      sourceMaps: false,
    },
    features: {
      hotReload: false,
      devTools: false,
      profiling: false,
      debugging: false,
    },
    security: {
      contentSecurityPolicy: true,
      xssProtection: true,
      frameOptions: true,
      hsts: true,
    },
    performance: {
      bundleAnalysis: false,
      compression: true,
      caching: true,
      lazyLoading: true,
    },
    monitoring: {
      errorTracking: true,
      performanceMonitoring: true,
      analytics: true,
      logging: false,
    },
  },
  
  test: {
    environment: 'test',
    optimization: {
      minify: false,
      compress: false,
      treeShaking: false,
      codeSplitting: false,
      sourceMaps: true,
    },
    features: {
      hotReload: false,
      devTools: false,
      profiling: false,
      debugging: true,
    },
    security: {
      contentSecurityPolicy: false,
      xssProtection: false,
      frameOptions: false,
      hsts: false,
    },
    performance: {
      bundleAnalysis: false,
      compression: false,
      caching: false,
      lazyLoading: false,
    },
    monitoring: {
      errorTracking: false,
      performanceMonitoring: false,
      analytics: false,
      logging: false,
    },
  },
};

// Get build configuration for current environment
export const getBuildConfig = (environment: BuildEnvironment = 'development'): BuildConfig => {
  return buildConfigs[environment];
};

// Build optimization settings
export const getOptimizationSettings = (config: BuildConfig) => {
  return {
    // Webpack optimization
    minimize: config.optimization.minify,
    splitChunks: config.optimization.codeSplitting ? {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    } : false,
    
    // Source maps
    devtool: config.optimization.sourceMaps ? 'source-map' : false,
    
    // Tree shaking
    usedExports: config.optimization.treeShaking,
    sideEffects: config.optimization.treeShaking,
  };
};

// Security headers configuration
export const getSecurityHeaders = (config: BuildConfig) => {
  if (!config.security.contentSecurityPolicy) return {};
  
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': config.security.frameOptions ? 'DENY' : undefined,
    'X-XSS-Protection': config.security.xssProtection ? '1; mode=block' : undefined,
    'Strict-Transport-Security': config.security.hsts ? 'max-age=31536000; includeSubDomains' : undefined,
  };
};

// Performance optimization settings
export const getPerformanceSettings = (config: BuildConfig) => {
  return {
    // Bundle analysis
    analyzeBundle: config.performance.bundleAnalysis,
    
    // Compression
    gzip: config.performance.compression,
    brotli: config.performance.compression,
    
    // Caching
    cacheControl: config.performance.caching ? {
      'static/**/*': 'public, max-age=31536000, immutable',
      '**/*.js': 'public, max-age=31536000',
      '**/*.css': 'public, max-age=31536000',
      '**/*.html': 'public, max-age=3600',
    } : {},
    
    // Lazy loading
    lazyLoading: config.performance.lazyLoading,
  };
};

// Feature flags for build
export const getFeatureFlags = (config: BuildConfig) => {
  return {
    ENABLE_HOT_RELOAD: config.features.hotReload,
    ENABLE_DEV_TOOLS: config.features.devTools,
    ENABLE_PROFILING: config.features.profiling,
    ENABLE_DEBUGGING: config.features.debugging,
    ENABLE_ERROR_TRACKING: config.monitoring.errorTracking,
    ENABLE_PERFORMANCE_MONITORING: config.monitoring.performanceMonitoring,
    ENABLE_ANALYTICS: config.monitoring.analytics,
    ENABLE_LOGGING: config.monitoring.logging,
  };
};

// Build environment detection
export const detectBuildEnvironment = (): BuildEnvironment => {
  const nodeEnv = process.env.NODE_ENV as BuildEnvironment;
  
  if (nodeEnv && buildConfigs[nodeEnv]) {
    return nodeEnv;
  }
  
  // Fallback detection
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  
  return 'development';
};

// Build validation
export const validateBuildConfig = (config: BuildConfig): boolean => {
  // Validate required properties
  if (!config.environment || !buildConfigs[config.environment]) {
    console.error('Invalid build environment');
    return false;
  }
  
  // Validate optimization settings
  if (config.optimization.minify && !config.optimization.compress) {
    console.warn('Minification enabled but compression disabled');
  }
  
  // Validate security settings
  if (config.security.hsts && !config.security.contentSecurityPolicy) {
    console.warn('HSTS enabled but CSP disabled');
  }
  
  // Validate monitoring settings
  if (config.monitoring.analytics && !config.monitoring.errorTracking) {
    console.warn('Analytics enabled but error tracking disabled');
  }
  
  return true;
};

// Build script generation
export const generateBuildScripts = (config: BuildConfig) => {
  const scripts: Record<string, string> = {};
  
  // Base scripts
  scripts['build'] = `cross-env NODE_ENV=${config.environment} craco build`;
  scripts['start'] = `cross-env NODE_ENV=${config.environment} craco start`;
  
  // Environment-specific scripts
  if (config.optimization.bundleAnalysis) {
    scripts['build:analyze'] = `npm run build && npx webpack-bundle-analyzer build/static/js/*.js`;
  }
  
  if (config.performance.compression) {
    scripts['build:compress'] = `npm run build && npx gzip-cli build/static/**/*.{js,css,html}`;
  }
  
  if (config.monitoring.errorTracking) {
    scripts['build:monitor'] = `npm run build && npm run monitor:deploy`;
  }
  
  return scripts;
};

// Export current build configuration
export const currentBuildConfig = getBuildConfig(detectBuildEnvironment());

// Build configuration helpers
export const isDevelopment = () => currentBuildConfig.environment === 'development';
export const isProduction = () => currentBuildConfig.environment === 'production';
export const isStaging = () => currentBuildConfig.environment === 'staging';
export const isTest = () => currentBuildConfig.environment === 'test';

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof BuildConfig['features']) => {
  return currentBuildConfig.features[feature];
};

export const isMonitoringEnabled = (monitor: keyof BuildConfig['monitoring']) => {
  return currentBuildConfig.monitoring[monitor];
};

export const isOptimizationEnabled = (optimization: keyof BuildConfig['optimization']) => {
  return currentBuildConfig.optimization[optimization];
};
