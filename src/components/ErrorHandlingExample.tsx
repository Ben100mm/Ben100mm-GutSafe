/**
 * @fileoverview ErrorHandlingExample.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorMessage } from './ErrorMessage';
import { withErrorBoundary, useErrorHandler } from './withErrorBoundary';
import { errorHandler } from '../utils/errorHandler';
import { retryUtils } from '../utils/retryUtils';
import { getFoodService } from '../services/ServiceManager';

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
        setError(result.error as Error);
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
      const errorResult = handleError(err as Error, 'ErrorHandlingExample.simulateValidationError');
      setError(errorResult.error);
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

      if (!result.success) {
        setError(result.error);
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
            style={[styles.button, styles.networkButton]}
            onPress={simulateNetworkError}
            disabled={isLoading}
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
            style={[styles.button, styles.serviceButton]}
            onPress={simulateServiceError}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Simulate Service Error'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.criticalButton]}
            onPress={simulateCriticalError}
          >
            <Text style={styles.buttonText}>Simulate Critical Error (Error Boundary)</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.sectionTitle}>Error Display</Text>
            <ErrorMessage
              error={error}
              onRetry={clearError}
              onDismiss={clearError}
              showDetails={true}
              context="ErrorHandlingExample"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Handling Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Centralized error handling</Text>
            <Text style={styles.featureItem}>• Automatic retry mechanisms</Text>
            <Text style={styles.featureItem}>• User-friendly error messages</Text>
            <Text style={styles.featureItem}>• Error categorization and severity</Text>
            <Text style={styles.featureItem}>• Error reporting and logging</Text>
            <Text style={styles.featureItem}>• Error boundaries for React components</Text>
            <Text style={styles.featureItem}>• Retry with exponential backoff</Text>
            <Text style={styles.featureItem}>• Context-aware error handling</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Wrap the component with error boundary
const ErrorHandlingExampleWithBoundary = withErrorBoundary(ErrorHandlingExample, {
  context: 'ErrorHandlingExample',
  showDetails: true,
  enableReporting: true,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  networkButton: {
    backgroundColor: Colors.primary,
  },
  validationButton: {
    backgroundColor: Colors.caution,
  },
  serviceButton: {
    backgroundColor: Colors.avoid,
  },
  criticalButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
  },
  errorSection: {
    marginBottom: Spacing.xl,
  },
  featureList: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  featureItem: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
});

export default ErrorHandlingExampleWithBoundary;
