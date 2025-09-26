/**
 * @fileoverview ErrorHandlingExample.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { getFoodService } from '../services/ServiceManager';
import { retryUtils } from '../utils/retryUtils';

import { ErrorMessage } from './ErrorMessage';
import { withErrorBoundary, useErrorHandler } from './withErrorBoundary';

/**
 * Example component demonstrating comprehensive error handling
 */
const ErrorHandlingExample: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, handleAsyncError } = useErrorHandler();

  const simulateNetworkError = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate a network error
      const result = await retryUtils.retryApiCall(
        async () => {
          // This will fail and trigger retry logic
          throw new Error('Network request failed');
        },
        { maxAttempts: 3 },
        'ErrorHandlingExample.simulateNetworkError'
      );

      if (!result.success) {
        setError(
          new Error((result as any).error.message || 'Unknown error occurred')
        );
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateValidationError = () => {
    try {
      // Simulate validation error
      throw new Error('Invalid input: Email format is incorrect');
    } catch (err) {
      const errorResult = handleError(
        err as Error,
        'ErrorHandlingExample.simulateValidationError'
      );
      setError(new Error(errorResult.error.message));
    }
  };

  const simulateServiceError = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate service error with async handling
      const result = await handleAsyncError(async () => {
        const foodService = getFoodService();
        // This will trigger the service error handling
        await foodService.searchByBarcode('invalid-barcode');
      }, 'ErrorHandlingExample.simulateServiceError');

      if (!result.success && result.error) {
        setError(
          new Error(result.error.error?.message || 'Unknown error occurred')
        );
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCriticalError = () => {
    // This will trigger the error boundary
    throw new Error('Critical error: This will be caught by ErrorBoundary');
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Error Handling Examples</Text>
        <Text style={styles.subtitle}>
          This component demonstrates various error handling patterns
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Scenarios</Text>

          <TouchableOpacity
            disabled={isLoading}
            style={[styles.button, styles.networkButton]}
            onPress={simulateNetworkError}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Simulate Network Error (with Retry)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.validationButton]}
            onPress={simulateValidationError}
          >
            <Text style={styles.buttonText}>Simulate Validation Error</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isLoading}
            style={[styles.button, styles.serviceButton]}
            onPress={simulateServiceError}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Simulate Service Error'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.criticalButton]}
            onPress={simulateCriticalError}
          >
            <Text style={styles.buttonText}>
              Simulate Critical Error (Error Boundary)
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.sectionTitle}>Error Display</Text>
            <ErrorMessage
              showDetails
              context="ErrorHandlingExample"
              error={error}
              onDismiss={clearError}
              onRetry={clearError}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Handling Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Centralized error handling</Text>
            <Text style={styles.featureItem}>• Automatic retry mechanisms</Text>
            <Text style={styles.featureItem}>
              • User-friendly error messages
            </Text>
            <Text style={styles.featureItem}>
              • Error categorization and severity
            </Text>
            <Text style={styles.featureItem}>
              • Error reporting and logging
            </Text>
            <Text style={styles.featureItem}>
              • Error boundaries for React components
            </Text>
            <Text style={styles.featureItem}>
              • Retry with exponential backoff
            </Text>
            <Text style={styles.featureItem}>
              • Context-aware error handling
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Wrap the component with error boundary
const ErrorHandlingExampleWithBoundary = withErrorBoundary(
  ErrorHandlingExample,
  {
    context: 'ErrorHandlingExample',
    showDetails: true,
    enableReporting: true,
  }
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.button,
  },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  criticalButton: {
    backgroundColor: '#dc2626',
  },
  errorSection: {
    marginBottom: Spacing.xl,
  },
  featureItem: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.sm,
  },
  featureList: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  networkButton: {
    backgroundColor: Colors.primary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.md,
  },
  serviceButton: {
    backgroundColor: Colors.avoid,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  title: {
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  validationButton: {
    backgroundColor: Colors.caution,
  },
});

export default ErrorHandlingExampleWithBoundary;
