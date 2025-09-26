/**
 * @fileoverview ErrorReportingService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { AppError } from '../types/comprehensive';
import type { ErrorContext } from '../utils/errorHandler';
import { ErrorSeverity, ErrorCategory } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { retryUtils } from '../utils/retryUtils';

// Error reporting configuration
interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize: number;
  flushInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
}

// Error report payload
interface ErrorReport {
  id: string;
  error: AppError;
  context: ErrorContext;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  stackTrace?: string;
  additionalData?: Record<string, unknown>;
}

// Error reporting statistics
interface ErrorReportingStats {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByService: Record<string, number>;
  lastReported: Date | null;
  lastFlush: Date | null;
  pendingReports: number;
}

/**
 * Error Reporting Service
 * Handles error reporting to external services with batching and retry logic
 */
class ErrorReportingService {
  private static instance: ErrorReportingService;
  private config: ErrorReportingConfig;
  private reportQueue: ErrorReport[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly stats: ErrorReportingStats;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      enabled: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000,
    };

    this.stats = {
      totalErrors: 0,
      errorsBySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0,
      },
      errorsByCategory: {
        [ErrorCategory.NETWORK]: 0,
        [ErrorCategory.VALIDATION]: 0,
        [ErrorCategory.DATABASE]: 0,
        [ErrorCategory.SERVICE]: 0,
        [ErrorCategory.AUTHENTICATION]: 0,
        [ErrorCategory.PERMISSION]: 0,
        [ErrorCategory.RATE_LIMIT]: 0,
        [ErrorCategory.TIMEOUT]: 0,
        [ErrorCategory.UNKNOWN]: 0,
      },
      errorsByService: {},
      lastReported: null,
      lastFlush: null,
      pendingReports: 0,
    };
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Initialize the error reporting service
   */
  async initialize(config?: Partial<ErrorReportingConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      if (this.config.enabled) {
        this.startFlushTimer();
        logger.info(
          'Error reporting service initialized',
          'ErrorReportingService',
          {
            enabled: this.config.enabled,
            batchSize: this.config.batchSize,
            flushInterval: this.config.flushInterval,
          }
        );
      }

      this.isInitialized = true;
    } catch (error) {
      logger.error(
        'Failed to initialize error reporting service',
        'ErrorReportingService',
        error
      );
      throw error;
    }
  }

  /**
   * Report an error
   */
  async reportError(
    error: AppError,
    context: ErrorContext,
    severity: ErrorSeverity,
    category: ErrorCategory,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    if (!this.isInitialized || !this.config.enabled) {
      return;
    }

    try {
      const report: ErrorReport = {
        id: this.generateReportId(),
        error,
        context,
        severity,
        category,
        timestamp: new Date(),
        userId: context.userId || 'anonymous',
        sessionId: context.sessionId || 'unknown',
        userAgent: context.userAgent || 'unknown',
        url: context.url || 'unknown',
        stackTrace: error.stack || 'No stack trace available',
        additionalData: {
          ...context.additionalData,
          ...additionalData,
        },
      };

      this.reportQueue.push(report);
      this.updateStats(report);

      logger.debug('Error queued for reporting', 'ErrorReportingService', {
        reportId: report.id,
        severity: report.severity,
        category: report.category,
        queueSize: this.reportQueue.length,
      });

      // Flush immediately if batch size is reached
      if (this.reportQueue.length >= this.config.batchSize) {
        await this.flushReports();
      }
    } catch (error) {
      logger.error(
        'Failed to queue error report',
        'ErrorReportingService',
        error
      );
    }
  }

  /**
   * Flush all pending reports
   */
  async flushReports(): Promise<void> {
    if (this.reportQueue.length === 0) {
      return;
    }

    const reports = [...this.reportQueue];
    this.reportQueue = [];

    try {
      await this.sendReports(reports);
      this.stats.lastFlush = new Date();
      this.stats.pendingReports = 0;

      logger.info(
        'Error reports flushed successfully',
        'ErrorReportingService',
        {
          reportCount: reports.length,
          lastFlush: this.stats.lastFlush,
        }
      );
    } catch (error) {
      // Re-queue reports on failure
      this.reportQueue.unshift(...reports);
      this.stats.pendingReports = this.reportQueue.length;

      logger.error('Failed to flush error reports', 'ErrorReportingService', {
        error,
        reQueuedCount: reports.length,
      });
    }
  }

  /**
   * Send reports to external service
   */
  private async sendReports(reports: ErrorReport[]): Promise<void> {
    if (!this.config.endpoint) {
      // In development or when no endpoint is configured, just log
      logger.debug(
        'Error reports would be sent to external service',
        'ErrorReportingService',
        {
          reportCount: reports.length,
          reports: reports.map((r) => ({
            id: r.id,
            severity: r.severity,
            category: r.category,
            errorCode: r.error.code,
          })),
        }
      );
      return;
    }

    const result = await retryUtils.retryApiCall(
      async () => {
        const response = await fetch(this.config.endpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
            'User-Agent': 'GutSafe-App/1.0.0',
          },
          body: JSON.stringify({
            reports,
            metadata: {
              appVersion: '1.0.0',
              platform: 'react-native',
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      {
        maxAttempts: this.config.maxRetries,
        baseDelay: this.config.retryDelay,
        maxDelay: this.config.retryDelay * 4,
        backoffMultiplier: 2,
        retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'RATE_LIMIT_ERROR'],
      },
      'ErrorReportingService.sendReports'
    );

    if (!result.success) {
      throw new Error(
        `Failed to send error reports: ${(result as any).error.message}`
      );
    }

    this.stats.lastReported = new Date();
  }

  /**
   * Get error reporting statistics
   */
  getStats(): ErrorReportingStats {
    return {
      ...this.stats,
      pendingReports: this.reportQueue.length,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.enabled && !this.flushTimer) {
      this.startFlushTimer();
    } else if (!this.config.enabled && this.flushTimer) {
      this.stopFlushTimer();
    }

    logger.info(
      'Error reporting configuration updated',
      'ErrorReportingService',
      {
        config: this.config,
      }
    );
  }

  /**
   * Enable/disable error reporting
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;

    if (enabled) {
      this.startFlushTimer();
    } else {
      this.stopFlushTimer();
    }

    logger.info('Error reporting enabled/disabled', 'ErrorReportingService', {
      enabled,
    });
  }

  /**
   * Clear all pending reports
   */
  clearReports(): void {
    this.reportQueue = [];
    this.stats.pendingReports = 0;
    logger.info('Error reports cleared', 'ErrorReportingService');
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushReports().catch((error) => {
        logger.error('Error in flush timer', 'ErrorReportingService', error);
      });
    }, this.config.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Update statistics
   */
  private updateStats(report: ErrorReport): void {
    this.stats.totalErrors++;
    this.stats.errorsBySeverity[report.severity]++;
    this.stats.errorsByCategory[report.category]++;

    const service = report.context.service || 'unknown';
    this.stats.errorsByService[service] =
      (this.stats.errorsByService[service] || 0) + 1;
    this.stats.pendingReports = this.reportQueue.length;
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopFlushTimer();
    this.flushReports().catch((error) => {
      logger.error(
        'Error during cleanup flush',
        'ErrorReportingService',
        error
      );
    });
    logger.info('Error reporting service cleaned up', 'ErrorReportingService');
  }
}

export const errorReportingService = ErrorReportingService.getInstance();
export default errorReportingService;
