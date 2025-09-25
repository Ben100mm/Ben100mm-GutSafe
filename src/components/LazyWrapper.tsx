/**
 * @fileoverview LazyWrapper.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { Suspense, ComponentType, ReactNode } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
});

export default LazyWrapper;
