/**
 * @fileoverview LoadingStates.tsx - Comprehensive Loading State Components
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useColorScheme } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  message,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const spinnerColor = color || colors.accent;

  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text style={[styles.spinnerMessage, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  onPress?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
  transparent = false,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: transparent ? 'transparent' : colors.overlay,
          opacity: fadeAnim,
        },
      ]}
      onTouchEnd={onPress}
    >
      <View style={[styles.overlayContent, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.overlayMessage, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [animated, shimmerAnim]);

  const shimmerStyle = animated
    ? {
        opacity: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.7],
        }),
      }
    : { opacity: 0.5 };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
};

interface LoadingCardProps {
  title?: string;
  subtitle?: string;
  showSkeleton?: boolean;
  skeletonLines?: number;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Loading...',
  subtitle,
  showSkeleton = true,
  skeletonLines = 3,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={120} height={16} />
        {subtitle && (
          <SkeletonLoader width={80} height={12} style={{ marginTop: 4 }} />
        )}
      </View>
      
      {showSkeleton && (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: skeletonLines }).map((_, index) => (
            <SkeletonLoader
              key={index}
              width={index === skeletonLines - 1 ? '60%' : '100%'}
              height={14}
              style={{ marginBottom: 8 }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface PullToRefreshLoaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}

export const PullToRefreshLoader: React.FC<PullToRefreshLoaderProps> = ({
  refreshing,
  onRefresh,
  children,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Note: In a real implementation, you'd use RefreshControl from react-native
  // This is a simplified version for demonstration
  return (
    <View style={styles.pullToRefreshContainer}>
      {refreshing && (
        <View style={[styles.refreshIndicator, { backgroundColor: colors.surface }]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.refreshText, { color: colors.text }]}>
            Refreshing...
          </Text>
        </View>
      )}
      {children}
    </View>
  );
};

interface LoadingButtonProps {
  title: string;
  loading: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  loading,
  onPress,
  disabled = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        styles.loadingButton,
        {
          backgroundColor: disabled ? colors.border : colors.accent,
        },
        style,
      ]}
    >
      {loading ? (
        <View style={styles.buttonContent}>
          <ActivityIndicator size="small" color={Colors.white} />
          <Text style={[styles.buttonText, { color: Colors.white }, textStyle]}>
            Loading...
          </Text>
        </View>
      ) : (
        <Text
          style={[styles.buttonText, { color: Colors.white }, textStyle]}
          onPress={disabled ? undefined : onPress}
        >
          {title}
        </Text>
      )}
    </View>
  );
};

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  spinnerMessage: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    minWidth: 120,
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
  overlayMessage: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  skeletonContainer: {
    marginTop: Spacing.sm,
  },
  pullToRefreshContainer: {
    flex: 1,
  },
  refreshIndicator: {
    padding: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  refreshText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  loadingButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
});

export default {
  LoadingSpinner,
  LoadingOverlay,
  SkeletonLoader,
  LoadingCard,
  PullToRefreshLoader,
  LoadingButton,
};
