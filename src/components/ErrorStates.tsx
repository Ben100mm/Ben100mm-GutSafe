/**
 * @fileoverview ErrorStates.tsx - Comprehensive Error State Components
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { AccessibleButton } from './AccessibleView';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  error?: Error;
  type?: 'network' | 'validation' | 'permission' | 'notFound' | 'server' | 'unknown';
  style?: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  onDismiss,
  showDetails = false,
  error,
  type = 'unknown',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return '🌐';
      case 'validation':
        return '⚠️';
      case 'permission':
        return '🔒';
      case 'notFound':
        return '🔍';
      case 'server':
        return '⚙️';
      default:
        return '❌';
    }
  };

  const getErrorTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'validation':
        return 'Invalid Input';
      case 'permission':
        return 'Permission Required';
      case 'notFound':
        return 'Not Found';
      case 'server':
        return 'Server Error';
      default:
        return 'Something went wrong';
    }
  };

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  const handleShowDetails = useCallback(() => {
    if (error && showDetails) {
      Alert.alert(
        'Error Details',
        `Message: ${error.message}\n\nStack: ${error.stack || 'No stack trace available'}`,
        [{ text: 'OK' }]
      );
    }
  }, [error, showDetails]);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, style]}
      style={styles.scrollView}
    >
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getErrorIcon()}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {getErrorTitle()}
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>

        {showDetails && error && (
          <TouchableOpacity
            style={[styles.detailsButton, { borderColor: colors.border }]}
            onPress={handleShowDetails}
          >
            <Text style={[styles.detailsButtonText, { color: colors.accent }]}>
              Show Details
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          {onRetry && (
            <AccessibleButton
              title="Try Again"
              onPress={handleRetry}
              variant="primary"
              style={styles.retryButton}
            />
          )}
          
          {onDismiss && (
            <AccessibleButton
              title="Dismiss"
              onPress={handleDismiss}
              variant="outline"
              style={styles.dismissButton}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export interface NetworkErrorProps {
  onRetry: () => void;
  onGoOffline?: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  onGoOffline,
  message = 'Please check your internet connection and try again.',
}) => {
  return (
    <ErrorState
      type="network"
      message={message}
      onRetry={onRetry}
      onDismiss={onGoOffline}
    />
  );
};

export interface ValidationErrorProps {
  errors: string[];
  onRetry: () => void;
  onDismiss?: () => void;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({
  errors,
  onRetry,
  onDismiss,
}) => {
  const message = errors.length === 1 
    ? errors[0] 
    : `Please fix the following issues:\n• ${errors.join('\n• ')}`;

  return (
    <ErrorState
      type="validation"
      message={message}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
};

export interface PermissionErrorProps {
  permission: string;
  onRequestPermission: () => void;
  onDismiss?: () => void;
}

export const PermissionError: React.FC<PermissionErrorProps> = ({
  permission,
  onRequestPermission,
  onDismiss,
}) => {
  const message = `This feature requires ${permission} permission. Please grant access to continue.`;

  return (
    <ErrorState
      type="permission"
      message={message}
      onRetry={onRequestPermission}
      onDismiss={onDismiss}
    />
  );
};

export interface NotFoundErrorProps {
  item: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  item,
  onRetry,
  onGoBack,
}) => {
  const message = `The ${item} you're looking for could not be found.`;

  return (
    <ErrorState
      type="notFound"
      message={message}
      onRetry={onRetry}
      onDismiss={onGoBack}
    />
  );
};

export interface ServerErrorProps {
  onRetry: () => void;
  onContactSupport?: () => void;
  message?: string;
}

export const ServerError: React.FC<ServerErrorProps> = ({
  onRetry,
  onContactSupport,
  message = 'Our servers are experiencing issues. Please try again later.',
}) => {
  return (
    <ErrorState
      type="server"
      message={message}
      onRetry={onRetry}
      onDismiss={onContactSupport}
    />
  );
};

export interface ErrorBoundaryFallbackProps {
  error: Error;
  onRetry: () => void;
  onReset: () => void;
  onContactSupport?: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  onRetry,
  onReset,
  onContactSupport,
}) => {
  return (
    <ErrorState
      title="App Error"
      message="Something unexpected happened. We're sorry for the inconvenience."
      error={error}
      showDetails={__DEV__}
      onRetry={onRetry}
      onDismiss={onReset}
    />
  );
};

export interface InlineErrorProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  style?: any;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onDismiss,
  type = 'error',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const getErrorColor = () => {
    switch (type) {
      case 'warning':
        return Colors.caution;
      case 'info':
        return Colors.safe;
      default:
        return Colors.avoid;
    }
  };

  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <View
      style={[
        styles.inlineError,
        {
          backgroundColor: getErrorColor() + '20',
          borderColor: getErrorColor(),
        },
        style,
      ]}
    >
      <Text style={styles.inlineErrorIcon}>{getErrorIcon()}</Text>
      <Text style={[styles.inlineErrorText, { color: colors.text }]}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissInlineButton}>
          <Text style={[styles.dismissInlineText, { color: colors.textSecondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    maxWidth: 400,
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
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
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.lg,
  },
  detailsButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  detailsButtonText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  retryButton: {
    flex: 1,
  },
  dismissButton: {
    flex: 1,
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  inlineErrorIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  inlineErrorText: {
    flex: 1,
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  dismissInlineButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  dismissInlineText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
  },
});

export default {
  ErrorState,
  NetworkError,
  ValidationError,
  PermissionError,
  NotFoundError,
  ServerError,
  ErrorBoundaryFallback,
  InlineError,
};
