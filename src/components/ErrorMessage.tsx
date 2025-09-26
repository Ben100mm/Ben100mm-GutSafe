/**
 * @fileoverview ErrorMessage.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';
import { AppError } from '../types/comprehensive';

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
  const appError = error instanceof Error 
    ? errorHandler.handleError(error, { ...(context && { operation: context }) })
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
          <Text style={styles.icon}>{getSeverityIcon(userFriendlyError.severity)}</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{userFriendlyError.title}</Text>
            <Text style={styles.message}>{userFriendlyError.message}</Text>
          </View>
        </View>

        <View style={styles.severityContainer}>
          <View style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(userFriendlyError.severity) }
          ]}>
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
          
          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: Typography.lineHeight.h3,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.body,
    color: Colors.light.textSecondary,
  },
  severityContainer: {
    marginBottom: Spacing.md,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
  },
  detailsContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  detailsTitle: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  detailsText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: 'monospace',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flex: 1,
    minWidth: 100,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flex: 1,
    minWidth: 100,
  },
  dismissButtonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.light.text,
    textAlign: 'center',
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flex: 1,
    minWidth: 100,
  },
  supportButtonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
    textAlign: 'center',
  },
});

export default ErrorMessage;
