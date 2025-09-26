/**
 * @fileoverview ErrorBoundary.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { ReactNode } from 'react';
import { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { AppError } from '../types/comprehensive';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { ErrorBoundaryFallback } from './ErrorStates';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
  retryCount: number;
  lastErrorTime?: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
      lastErrorTime: Date.now(),
    };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const appError: AppError = {
      code: 'REACT_ERROR_BOUNDARY',
      message: error.message,
      timestamp: new Date(),
      ...(error.stack && { stack: error.stack }),
      details: {
        componentStack: errorInfo.componentStack,
        context: this.props.context,
        retryCount: this.state.retryCount,
      },
    };

    // Handle error with centralized error handler
    const processedError = errorHandler.handleError(appError, {
      operation: 'ErrorBoundary',
      ...(this.props.context && { service: this.props.context }),
    });

    // Get user-friendly error message
    const userFriendlyError = errorHandler.getUserFriendlyError(processedError);

    // Log error with appropriate level
    logger.error('Error caught by boundary', 'ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context,
      retryCount: this.state.retryCount,
      severity: userFriendlyError.severity,
      category: userFriendlyError.category,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error if enabled
    if (this.props.enableReporting !== false) {
      this.reportError(processedError, userFriendlyError);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = async () => {
    const { retryCount, lastErrorTime } = this.state;

    // Check if we've exceeded max retries
    if (retryCount >= this.maxRetries) {
      Alert.alert(
        'Maximum Retries Reached',
        "We've tried multiple times but the error persists. Please restart the app or contact support.",
        [
          { text: 'OK', style: 'default' },
          { text: 'Contact Support', onPress: this.handleContactSupport },
        ]
      );
      return;
    }

    // Check if enough time has passed since last error
    if (lastErrorTime && Date.now() - lastErrorTime < this.retryDelay) {
      const remainingTime = this.retryDelay - (Date.now() - lastErrorTime);
      Alert.alert(
        'Please Wait',
        `Please wait ${Math.ceil(remainingTime / 1000)} seconds before retrying.`
      );
      return;
    }

    // Increment retry count and reset error state
    this.setState((prevState) => ({
      hasError: false,
      retryCount: prevState.retryCount + 1,
    }));

    logger.info('Error boundary retry attempted', 'ErrorBoundary', {
      retryCount: retryCount + 1,
      maxRetries: this.maxRetries,
    });
  };

  handleContactSupport = () => {
    // In a real app, this would open support contact or email
    Alert.alert(
      'Contact Support',
      'Please email support@gutsafe.com with the error details.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      retryCount: 0,
    });
  };

  reportError = (error: AppError, userFriendlyError: any) => {
    // In a real app, this would send to error reporting service
    logger.debug('Error reported to external service', 'ErrorBoundary', {
      errorCode: error.code,
      severity: userFriendlyError.severity,
      category: userFriendlyError.category,
    });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <ErrorBoundaryFallback
          error={error!}
          onRetry={canRetry ? this.handleRetry : undefined}
          onReset={this.handleReset}
          onContactSupport={this.handleContactSupport}
        />
      );
    }

    return this.props.children;
  }

  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return Colors.safe;
      case ErrorSeverity.MEDIUM:
        return Colors.caution;
      case ErrorSeverity.HIGH:
        return Colors.avoid;
      case ErrorSeverity.CRITICAL:
        return '#dc2626'; // Red-600
      default:
        return Colors.light.textSecondary;
    }
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    gap: Spacing.md,
    width: '100%',
  },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    elevation: 4,
    maxWidth: 400,
    padding: Spacing.xl,
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: '100%',
  },
  errorDetails: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    width: '100%',
  },
  errorText: {
    color: Colors.light.text,
    fontFamily: 'monospace',
    fontSize: Typography.fontSize.caption,
    lineHeight: Typography.lineHeight.caption,
    marginBottom: Spacing.sm,
  },
  errorTitle: {
    color: Colors.avoid,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    lineHeight: Typography.lineHeight.caption,
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 48,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  message: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  resetButtonText: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
    lineHeight: Typography.lineHeight.button,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    minWidth: 120,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
    lineHeight: Typography.lineHeight.button,
    textAlign: 'center',
  },
  retryInfo: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  severityBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  severityContainer: {
    marginBottom: Spacing.lg,
  },
  severityText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  stackContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.sm,
    maxHeight: 200,
    padding: Spacing.sm,
  },
  stackTrace: {
    color: Colors.light.textSecondary,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 120,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  supportButtonText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
    lineHeight: Typography.lineHeight.button,
    textAlign: 'center',
  },
  title: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h2,
    lineHeight: Typography.lineHeight.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
