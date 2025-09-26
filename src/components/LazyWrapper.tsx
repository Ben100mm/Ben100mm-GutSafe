/**
 * @fileoverview LazyWrapper.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { ComponentType, ReactNode } from 'react';
import React, { Suspense } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color={Colors.primary} size="large" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <LoadingFallback />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
) {
  const LazyComponent = (props: P) => (
    <LazyWrapper fallback={fallback}>
      <WrappedComponent {...props} />
    </LazyWrapper>
  );

  LazyComponent.displayName = `withLazyLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return LazyComponent;
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginTop: Spacing.md,
  },
});

export default LazyWrapper;
