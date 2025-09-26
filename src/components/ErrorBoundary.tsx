/**
 * @fileoverview ErrorBoundary.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { logger } from '../utils/logger';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';
import { AppError } from '../types/comprehensive';

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
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      retryCount: 0,
      lastErrorTime: Date.now()
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
      }
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
        'We\'ve tried multiple times but the error persists. Please restart the app or contact support.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Contact Support', onPress: this.handleContactSupport }
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
    this.setState(prevState => ({
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
      const userFriendlyError = error ? errorHandler.getUserFriendlyError({
        code: 'REACT_ERROR_BOUNDARY',
        message: error.message,
        timestamp: new Date(),
        ...(error.stack && { stack: error.stack }),
      }) : null;

      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>
            
            <Text style={styles.title}>
              {userFriendlyError?.title || 'Something went wrong'}
            </Text>
            
            <Text style={styles.message}>
              {userFriendlyError?.message || 'We\'re sorry, but something unexpected happened. Please try again.'}
            </Text>

            {retryCount > 0 && (
              <Text style={styles.retryInfo}>
                Retry attempt {retryCount} of {this.maxRetries}
              </Text>
            )}

            {userFriendlyError && (
              <View style={styles.severityContainer}>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: this.getSeverityColor(userFriendlyError.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {userFriendlyError.severity} - {userFriendlyError.category}
                  </Text>
                </View>
              </View>
            )}
            
            {this.props.showDetails && error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>{error.message}</Text>
                {error.stack && (
                  <ScrollView style={styles.stackContainer}>
                    <Text style={styles.stackTrace}>{error.stack}</Text>
                  </ScrollView>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              {canRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                  <Text style={styles.retryButtonText}>
                    {userFriendlyError?.action || 'Try Again'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.supportButton} onPress={this.handleContactSupport}>
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.h2,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryInfo: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  severityContainer: {
    marginBottom: Spacing.lg,
  },
  severityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
    textAlign: 'center',
  },
  errorDetails: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  errorTitle: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.caption,
    color: Colors.avoid,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: 'monospace',
    lineHeight: Typography.lineHeight.caption,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  stackContainer: {
    maxHeight: 200,
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  stackTrace: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.light.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.button,
    color: Colors.white,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 120,
  },
  resetButtonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.button,
    color: Colors.light.text,
    textAlign: 'center',
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minWidth: 120,
  },
  supportButtonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: Typography.lineHeight.button,
    color: Colors.primary,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
