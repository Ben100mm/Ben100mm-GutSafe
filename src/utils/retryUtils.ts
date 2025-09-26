/**
 * @fileoverview retryUtils.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Result, NetworkError, ServiceError } from '../types/comprehensive';
import { errorHandler, RetryConfig } from './errorHandler';
import { logger } from './logger';

// Retry strategies
export enum RetryStrategy {
  EXPONENTIAL_BACKOFF = 'exponential_backoff',
  LINEAR = 'linear',
  FIXED = 'fixed',
}

// Retry condition function type
export type RetryCondition = (error: Error | NetworkError | ServiceError) => boolean;

// Default retry configurations for different scenarios
export const DEFAULT_RETRY_CONFIGS = {
  API_CALL: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMIT_ERROR'],
  },
  DATABASE_OPERATION: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    retryableErrors: ['DATABASE_ERROR', 'CONNECTION_ERROR'],
  },
  FILE_UPLOAD: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
  },
  CRITICAL_OPERATION: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    retryableErrors: ['NETWORK_ERROR', 'SERVICE_ERROR', 'DATABASE_ERROR'],
  },
} as const;

/**
 * Retry utility for API calls and other operations
 */
class RetryUtils {
  private static instance: RetryUtils;

  private constructor() {}

  public static getInstance(): RetryUtils {
    if (!RetryUtils.instance) {
      RetryUtils.instance = new RetryUtils();
    }
    return RetryUtils.instance;
  }

  /**
   * Retry an API call with exponential backoff
   */
  async retryApiCall<T>(
    apiCall: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<Result<T, NetworkError | ServiceError>> {
    const retryConfig = this.mergeConfigs(DEFAULT_RETRY_CONFIGS.API_CALL, config);
    return this.retryWithStrategy(apiCall, retryConfig, context);
  }

  /**
   * Retry a database operation
   */
  async retryDatabaseOperation<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<Result<T, ServiceError>> {
    const retryConfig = this.mergeConfigs(DEFAULT_RETRY_CONFIGS.DATABASE_OPERATION, config);
    return this.retryWithStrategy(operation, retryConfig, context);
  }

  /**
   * Retry a file upload operation
   */
  async retryFileUpload<T>(
    uploadOperation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<Result<T, NetworkError>> {
    const retryConfig = this.mergeConfigs(DEFAULT_RETRY_CONFIGS.FILE_UPLOAD, config);
    return this.retryWithStrategy(uploadOperation, retryConfig, context);
  }

  /**
   * Retry a critical operation with maximum attempts
   */
  async retryCriticalOperation<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<Result<T, ServiceError>> {
    const retryConfig = this.mergeConfigs(DEFAULT_RETRY_CONFIGS.CRITICAL_OPERATION, config);
    return this.retryWithStrategy(operation, retryConfig, context);
  }

  /**
   * Retry with custom strategy and condition
   */
  async retryWithCondition<T>(
    operation: () => Promise<T>,
    retryCondition: RetryCondition,
    config: Partial<RetryConfig> = {},
    context?: string
  ): Promise<Result<T, Error>> {
    const retryConfig = this.mergeConfigs(DEFAULT_RETRY_CONFIGS.API_CALL, config);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        lastError = error as Error;

        // Check if error meets retry condition
        if (!retryCondition(error as Error)) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay
        const delay = this.calculateDelay(attempt, retryConfig);
        
        logger.warn(`Retry attempt ${attempt}/${retryConfig.maxAttempts}`, context, {
          error: error instanceof Error ? error.message : 'Unknown error',
          delay,
          nextAttemptIn: delay,
        });

        await this.sleep(delay);
      }
    }

    // All retries failed
    const error = lastError || new Error('Operation failed after all retry attempts');
    return errorHandler.createErrorResult<T>(error, { operation: context });
  }

  /**
   * Retry with specific strategy
   */
  private async retryWithStrategy<T>(
    operation: () => Promise<T>,
    config: RetryConfig & { strategy: RetryStrategy },
    context?: string
  ): Promise<Result<T, Error>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryableError(error as Error, config.retryableErrors)) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay based on strategy
        const delay = this.calculateDelayWithStrategy(attempt, config);
        
        logger.warn(`Retry attempt ${attempt}/${config.maxAttempts}`, context, {
          error: error instanceof Error ? error.message : 'Unknown error',
          strategy: config.strategy,
          delay,
          nextAttemptIn: delay,
        });

        await this.sleep(delay);
      }
    }

    // All retries failed
    const error = lastError || new Error('Operation failed after all retry attempts');
    return errorHandler.createErrorResult<T>(error, { operation: context });
  }

  /**
   * Calculate delay based on strategy
   */
  private calculateDelayWithStrategy(attempt: number, config: RetryConfig & { strategy: RetryStrategy }): number {
    switch (config.strategy) {
      case RetryStrategy.EXPONENTIAL_BACKOFF:
        return this.calculateExponentialBackoff(attempt, config);
      case RetryStrategy.LINEAR:
        return this.calculateLinearDelay(attempt, config);
      case RetryStrategy.FIXED:
        return config.baseDelay;
      default:
        return this.calculateExponentialBackoff(attempt, config);
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateExponentialBackoff(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Calculate linear delay
   */
  private calculateLinearDelay(attempt: number, config: RetryConfig): number {
    const delay = config.baseDelay * attempt;
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Calculate delay (backward compatibility)
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    return this.calculateExponentialBackoff(attempt, config);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const errorCode = this.extractErrorCode(error);
    return retryableErrors.includes(errorCode);
  }

  /**
   * Extract error code from error
   */
  private extractErrorCode(error: Error): string {
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    
    // Try to extract from error name or message
    if (error.name && error.name !== 'Error') {
      return error.name.toUpperCase();
    }
    
    // Check for common error patterns
    if (error.message.includes('Network')) return 'NETWORK_ERROR';
    if (error.message.includes('Timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('Rate limit')) return 'RATE_LIMIT_ERROR';
    if (error.message.includes('Connection')) return 'CONNECTION_ERROR';
    if (error.message.includes('Database')) return 'DATABASE_ERROR';
    if (error.message.includes('Service')) return 'SERVICE_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Merge retry configurations
   */
  private mergeConfigs(defaultConfig: RetryConfig, customConfig: Partial<RetryConfig>): RetryConfig {
    return {
      ...defaultConfig,
      ...customConfig,
      retryableErrors: customConfig.retryableErrors || defaultConfig.retryableErrors,
    };
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retry condition for HTTP status codes
   */
  static createHttpStatusRetryCondition(statusCodes: number[]): RetryCondition {
    return (error: Error | NetworkError | ServiceError) => {
      if ('status' in error && typeof error.status === 'number') {
        return statusCodes.includes(error.status);
      }
      return false;
    };
  }

  /**
   * Create a retry condition for error codes
   */
  static createErrorCodeRetryCondition(errorCodes: string[]): RetryCondition {
    return (error: Error | NetworkError | ServiceError) => {
      const errorCode = 'code' in error ? error.code : error.name;
      return errorCodes.includes(errorCode);
    };
  }

  /**
   * Create a retry condition for network errors
   */
  static createNetworkRetryCondition(): RetryCondition {
    return (error: Error | NetworkError | ServiceError) => {
      const errorCode = 'code' in error ? error.code : error.name;
      return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'CONNECTION_ERROR'].includes(errorCode);
    };
  }

  /**
   * Create a retry condition for temporary errors
   */
  static createTemporaryErrorRetryCondition(): RetryCondition {
    return (error: Error | NetworkError | ServiceError) => {
      const errorCode = 'code' in error ? error.code : error.name;
      const message = error.message.toLowerCase();
      
      return [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'RATE_LIMIT_ERROR',
        'SERVICE_ERROR',
        'DATABASE_ERROR',
      ].includes(errorCode) || 
      message.includes('temporary') ||
      message.includes('unavailable') ||
      message.includes('timeout');
    };
  }
}

export const retryUtils = RetryUtils.getInstance();
export default retryUtils;
