/**
 * @fileoverview LazyWrapper.tsx - Enhanced with Loading States
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { ComponentType, ReactNode } from 'react';
import React, { Suspense } from 'react';
import { View, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { LoadingSpinner } from './LoadingStates';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingMessage?: string;
}

const LoadingFallback: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <LoadingSpinner size="large" message={message} />
  </View>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  loadingMessage,
}) => {
  const defaultFallback = <LoadingFallback message={loadingMessage} />;
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode,
  loadingMessage?: string
) {
  const LazyComponent = (props: P) => (
    <LazyWrapper fallback={fallback} loadingMessage={loadingMessage}>
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
});

export default LazyWrapper;
