/**
 * @fileoverview ErrorMessage.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { AppError } from '../types/comprehensive';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';

interface ErrorMessageProps {
  error: AppError | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  context?: string;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  context,
  style,
}) => {
  const appError =
    error instanceof Error
      ? errorHandler.handleError(error, {
          ...(context && { operation: context }),
        })
      : error;

  const userFriendlyError = errorHandler.getUserFriendlyError(appError);

  const handleRetry = () => {
    if (userFriendlyError.canRetry && onRetry) {
      onRetry();
    } else if (!userFriendlyError.canRetry) {
      Alert.alert(
        'Cannot Retry',
        'This error cannot be retried. Please try a different action or contact support.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Please email support@gutsafe.com with the error details.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getSeverityIcon = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'ℹ️';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      case ErrorSeverity.HIGH:
        return '🚨';
      case ErrorSeverity.CRITICAL:
        return '💥';
      default:
        return '❌';
    }
  };

  const getSeverityColor = (severity: ErrorSeverity): string => {
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
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>
            {getSeverityIcon(userFriendlyError.severity)}
          </Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{userFriendlyError.title}</Text>
            <Text style={styles.message}>{userFriendlyError.message}</Text>
          </View>
        </View>

        <View style={styles.severityContainer}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(userFriendlyError.severity) },
            ]}
          >
            <Text style={styles.severityText}>
              {userFriendlyError.severity} - {userFriendlyError.category}
            </Text>
          </View>
        </View>

        {showDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Technical Details:</Text>
            <Text style={styles.detailsText}>Error Code: {appError.code}</Text>
            <Text style={styles.detailsText}>Message: {appError.message}</Text>
            {appError.details && (
              <Text style={styles.detailsText}>
                Details: {JSON.stringify(appError.details, null, 2)}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actionsContainer}>
          {userFriendlyError.canRetry && onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>
                {userFriendlyError.action || 'Try Again'}
              </Text>
            </TouchableOpacity>
          )}

          {onDismiss && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    elevation: 2,
    margin: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  detailsContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  detailsText: {
    color: Colors.light.textSecondary,
    fontFamily: 'monospace',
    fontSize: Typography.fontSize.caption,
    marginBottom: Spacing.xs,
  },
  detailsTitle: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    marginBottom: Spacing.sm,
  },
  dismissButton: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flex: 1,
    minWidth: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dismissButtonText: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
    textAlign: 'center',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  message: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    flex: 1,
    minWidth: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  retryButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
    textAlign: 'center',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  severityContainer: {
    marginBottom: Spacing.md,
  },
  severityText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flex: 1,
    minWidth: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  supportButtonText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
    textAlign: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
    lineHeight: Typography.lineHeight.h3,
    marginBottom: Spacing.sm,
  },
});

export default ErrorMessage;
