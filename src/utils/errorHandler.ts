/**
 * @fileoverview errorHandler.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { errorReportingService } from '../services/ErrorReportingService';
import type { AppError, Result } from '../types/comprehensive';

import { logger } from './logger';

// Error Categories
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  SERVICE = 'SERVICE',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Retry Configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  backoffMultiplier: number; // Exponential backoff multiplier
  retryableErrors: string[]; // Error codes that should be retried
}

// Error Context
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  service?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, unknown>;
}

// User-Friendly Error Messages
export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  canRetry: boolean;
  severity: ErrorSeverity;
  category: ErrorCategory;
}

/**
 * Centralized Error Handler
 * Provides consistent error handling, logging, and user-friendly error messages
 */
class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly retryConfigs: Map<string, RetryConfig> = new Map();
  private errorReportingEnabled: boolean = true;

  private constructor() {
    this.setupDefaultRetryConfigs();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and process an error
   */
  handleError(
    error: Error | AppError,
    context: Partial<ErrorContext> = {},
    service?: string
  ): AppError {
    const processedError = this.processError(error, context, service);
    this.logError(processedError, context);
    this.reportError(processedError, context);
    return processedError;
  }

  /**
   * Create a Result with error handling
   */
  createErrorResult<T>(
    error: Error | AppError,
    context: Partial<ErrorContext> = {},
    service?: string
  ): Result<T, AppError> {
    const processedError = this.handleError(error, context, service);
    return { success: false, error: processedError };
  }

  /**
   * Wrap an async function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: Partial<ErrorContext> = {},
    service?: string
  ): Promise<Result<T, AppError>> {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      return this.createErrorResult<T>(
        error as AppError | Error,
        context,
        service
      );
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    retryConfig: RetryConfig,
    context: Partial<ErrorContext> = {},
    service?: string
  ): Promise<Result<T, AppError>> {
    let lastError: Error | AppError | null = null;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await fn();
        return { success: true, data: result };
      } catch (error) {
        lastError = error as AppError | Error;

        // Check if error is retryable
        if (
          !this.isRetryableError(
            error as AppError | Error,
            retryConfig.retryableErrors
          )
        ) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateRetryDelay(attempt, retryConfig);
        logger.warn(
          `Retry attempt ${attempt}/${retryConfig.maxAttempts}`,
          service,
          {
            error: error instanceof Error ? error.message : 'Unknown error',
            delay,
            context,
          }
        );

        await this.sleep(delay);
      }
    }

    // All retries failed
    return this.createErrorResult<T>(lastError!, context, service);
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyError(error: AppError): UserFriendlyError {
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error, category);

    switch (category) {
      case ErrorCategory.NETWORK:
        return this.getNetworkErrorMessage(error, severity);
      case ErrorCategory.VALIDATION:
        return this.getValidationErrorMessage(error, severity);
      case ErrorCategory.DATABASE:
        return this.getDatabaseErrorMessage(error, severity);
      case ErrorCategory.SERVICE:
        return this.getServiceErrorMessage(error, severity);
      case ErrorCategory.AUTHENTICATION:
        return this.getAuthenticationErrorMessage(error, severity);
      case ErrorCategory.PERMISSION:
        return this.getPermissionErrorMessage(error, severity);
      case ErrorCategory.RATE_LIMIT:
        return this.getRateLimitErrorMessage(error, severity);
      case ErrorCategory.TIMEOUT:
        return this.getTimeoutErrorMessage(error, severity);
      default:
        return this.getGenericErrorMessage(error, severity);
    }
  }

  /**
   * Set retry configuration for a service
   */
  setRetryConfig(service: string, config: RetryConfig): void {
    this.retryConfigs.set(service, config);
  }

  /**
   * Enable/disable error reporting
   */
  setErrorReportingEnabled(enabled: boolean): void {
    this.errorReportingEnabled = enabled;
  }

  /**
   * Process and normalize an error
   */
  private processError(
    error: Error | AppError,
    context: Partial<ErrorContext>,
    _service?: string
  ): AppError {
    if (this.isAppError(error)) {
      return {
        ...error,
        timestamp: error.timestamp || new Date(),
        details: {
          ...error.details,
          ...context,
        },
      };
    }

    // Convert regular Error to AppError
    return {
      code: this.extractErrorCode(error),
      message: error.message,
      timestamp: new Date(),
      stack: error.stack || '',
      details: {
        ...context,
        originalError: error.name,
      },
    };
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: AppError, context: Partial<ErrorContext>): void {
    const severity = this.determineSeverity(error, this.categorizeError(error));

    const logData = {
      code: error.code,
      message: error.message,
      stack: error.stack,
      context,
      details: error.details,
    };

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(
          `CRITICAL ERROR: ${error.message}`,
          context.service || 'ErrorHandler',
          logData
        );
        break;
      case ErrorSeverity.HIGH:
        logger.error(
          `HIGH SEVERITY: ${error.message}`,
          context.service || 'ErrorHandler',
          logData
        );
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(
          `MEDIUM SEVERITY: ${error.message}`,
          context.service || 'ErrorHandler',
          logData
        );
        break;
      case ErrorSeverity.LOW:
        logger.info(
          `LOW SEVERITY: ${error.message}`,
          context.service || 'ErrorHandler',
          logData
        );
        break;
    }
  }

  /**
   * Report error to external service (if enabled)
   */
  private async reportError(
    error: AppError,
    context: Partial<ErrorContext>
  ): Promise<void> {
    if (!this.errorReportingEnabled) {
      return;
    }

    try {
      const category = this.categorizeError(error);
      const severity = this.determineSeverity(error, category);

      await errorReportingService.reportError(
        error,
        {
          ...context,
          timestamp: new Date(),
        } as ErrorContext,
        severity,
        category,
        error.details
      );

      logger.debug('Error reported to external service', 'ErrorHandler', {
        error: error.code,
        context: context.service,
        severity,
        category,
      });
    } catch (reportingError) {
      logger.error(
        'Failed to report error to external service',
        'ErrorHandler',
        {
          originalError: error.code,
          reportingError,
        }
      );
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(
    error: Error | AppError,
    retryableErrors: string[]
  ): boolean {
    const errorCode = this.isAppError(error)
      ? error.code
      : this.extractErrorCode(error);
    return retryableErrors.includes(errorCode);
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const delay =
      config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Categorize error based on code and message
   */
  private categorizeError(error: AppError): ErrorCategory {
    const code = error.code.toLowerCase();

    if (
      code.includes('network') ||
      code.includes('timeout') ||
      code.includes('connection')
    ) {
      return ErrorCategory.NETWORK;
    }
    if (code.includes('validation') || code.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (
      code.includes('database') ||
      code.includes('query') ||
      code.includes('sql')
    ) {
      return ErrorCategory.DATABASE;
    }
    if (
      code.includes('auth') ||
      code.includes('login') ||
      code.includes('token')
    ) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (
      code.includes('permission') ||
      code.includes('forbidden') ||
      code.includes('unauthorized')
    ) {
      return ErrorCategory.PERMISSION;
    }
    if (
      code.includes('rate') ||
      code.includes('limit') ||
      code.includes('throttle')
    ) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (code.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }
    if (code.includes('service')) {
      return ErrorCategory.SERVICE;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    error: AppError,
    category: ErrorCategory
  ): ErrorSeverity {
    // Critical errors that require immediate attention
    if (
      category === ErrorCategory.DATABASE ||
      error.code.includes('CRITICAL') ||
      error.message.includes('fatal')
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors that affect core functionality
    if (
      category === ErrorCategory.AUTHENTICATION ||
      category === ErrorCategory.PERMISSION ||
      error.code.includes('AUTH') ||
      error.code.includes('PERMISSION')
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors that affect user experience
    if (
      category === ErrorCategory.NETWORK ||
      category === ErrorCategory.SERVICE ||
      error.code.includes('NETWORK') ||
      error.code.includes('SERVICE')
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors that are minor issues
    return ErrorSeverity.LOW;
  }

  /**
   * Check if error is an AppError
   */
  private isAppError(error: Error | AppError): error is AppError {
    return 'code' in error && 'timestamp' in error;
  }

  /**
   * Extract error code from Error
   */
  private extractErrorCode(error: Error): string {
    // Try to extract code from error name or message
    if (error.name && error.name !== 'Error') {
      return error.name.toUpperCase();
    }

    // Check for common error patterns
    if (error.message.includes('Network')) {
      return 'NETWORK_ERROR';
    }
    if (error.message.includes('Validation')) {
      return 'VALIDATION_ERROR';
    }
    if (error.message.includes('Database')) {
      return 'DATABASE_ERROR';
    }
    if (error.message.includes('Timeout')) {
      return 'TIMEOUT_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Setup default retry configurations
   */
  private setupDefaultRetryConfigs(): void {
    // Network operations
    this.setRetryConfig('network', {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'CONNECTION_ERROR'],
    });

    // API calls
    this.setRetryConfig('api', {
      maxAttempts: 3,
      baseDelay: 500,
      maxDelay: 5000,
      backoffMultiplier: 2,
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMIT_ERROR'],
    });

    // Database operations
    this.setRetryConfig('database', {
      maxAttempts: 2,
      baseDelay: 2000,
      maxDelay: 8000,
      backoffMultiplier: 2,
      retryableErrors: ['DATABASE_ERROR', 'CONNECTION_ERROR'],
    });
  }

  // User-friendly error message generators
  private getNetworkErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Connection Problem',
      message:
        'Unable to connect to the server. Please check your internet connection and try again.',
      action: 'Check Connection',
      canRetry: true,
      severity,
      category: ErrorCategory.NETWORK,
    };
  }

  private getValidationErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Invalid Input',
      message:
        'Please check your input and try again. Make sure all required fields are filled correctly.',
      action: 'Fix Input',
      canRetry: false,
      severity,
      category: ErrorCategory.VALIDATION,
    };
  }

  private getDatabaseErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Data Error',
      message:
        'There was a problem saving your data. Please try again in a moment.',
      action: 'Retry',
      canRetry: true,
      severity,
      category: ErrorCategory.DATABASE,
    };
  }

  private getServiceErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Service Unavailable',
      message:
        'The service is temporarily unavailable. Please try again later.',
      action: 'Try Again',
      canRetry: true,
      severity,
      category: ErrorCategory.SERVICE,
    };
  }

  private getAuthenticationErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Authentication Required',
      message: 'Please sign in to continue using the app.',
      action: 'Sign In',
      canRetry: false,
      severity,
      category: ErrorCategory.AUTHENTICATION,
    };
  }

  private getPermissionErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Access Denied',
      message: "You don't have permission to perform this action.",
      action: 'Contact Support',
      canRetry: false,
      severity,
      category: ErrorCategory.PERMISSION,
    };
  }

  private getRateLimitErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Too Many Requests',
      message:
        "You're making requests too quickly. Please wait a moment and try again.",
      action: 'Wait and Retry',
      canRetry: true,
      severity,
      category: ErrorCategory.RATE_LIMIT,
    };
  }

  private getTimeoutErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Request Timeout',
      message: 'The request is taking too long. Please try again.',
      action: 'Retry',
      canRetry: true,
      severity,
      category: ErrorCategory.TIMEOUT,
    };
  }

  private getGenericErrorMessage(
    _error: AppError,
    severity: ErrorSeverity
  ): UserFriendlyError {
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      action: 'Try Again',
      canRetry: true,
      severity,
      category: ErrorCategory.UNKNOWN,
    };
  }
}

export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;
