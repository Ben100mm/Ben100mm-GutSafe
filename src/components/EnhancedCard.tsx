/**
 * @fileoverview EnhancedCard.tsx - Enhanced Card Component with Unified Styling
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef } from 'react';
import type { ViewStyle } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';

import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { enhancedAccessibility } from '../utils/enhancedAccessibility';
import { HapticFeedback } from '../utils/haptics';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

export type CardVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type CardState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: CardVariant;
  size?: CardSize;
  state?: CardState;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  enableAnimations?: boolean;
  enableHaptics?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  elevated?: boolean;
  rounded?: boolean;
  outline?: boolean;
  gradient?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  subtitle,
  variant = 'secondary',
  size = 'md',
  state = 'default',
  style,
  onPress,
  disabled = false,
  loading = false,
  hapticType = 'light',
  enableAnimations = true,
  enableHaptics = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  elevated = true,
  rounded = false,
  outline = false,
  gradient = false,
  header,
  footer,
  actions,
}) => {
  const {
    getCardStyle,
    getTextStyle,
    getSpacing,
    getBorderRadius,
    getShadow,
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    shouldReduceMotion,
    colors,
  } = useResponsiveDesign();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Get unified styles
  const cardStyle = getCardStyle({
    variant,
    size,
    state,
  });

  const titleStyle = getTextStyle({
    variant: 'primary',
    size: size === 'xs' ? 'sm' : size === 'sm' ? 'md' : 'lg',
    state: 'default',
  });

  const subtitleStyle = getTextStyle({
    variant: 'secondary',
    size: size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md',
    state: 'default',
  });

  // Enhanced accessibility config
  const accessibilityConfig = enhancedAccessibility.createCardConfig(
    title || 'Card',
    subtitle,
    !!onPress
  );

  // Handle press animations
  const handlePressIn = () => {
    if (disabled || loading || !enableAnimations || shouldReduceMotion || !onPress) return;

    if (enableHaptics) {
      HapticFeedback.trigger(hapticType);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(translateYAnim, {
        toValue: -2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading || !enableAnimations || shouldReduceMotion || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  // Get variant-specific colors
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.surface,
          border: Colors.primary,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      case 'secondary':
        return {
          background: colors.surface,
          border: colors.border,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      case 'tertiary':
        return {
          background: colors.background,
          border: 'transparent',
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      case 'success':
        return {
          background: colors.surface,
          border: Colors.safe,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      case 'warning':
        return {
          background: colors.surface,
          border: Colors.caution,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      case 'error':
        return {
          background: colors.surface,
          border: Colors.avoid,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      case 'info':
        return {
          background: colors.surface,
          border: Colors.primaryLight,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
      default:
        return {
          background: colors.surface,
          border: colors.border,
          text: colors.text,
          subtitle: colors.textSecondary,
        };
    }
  };

  const variantColors = getVariantColors();

  // Enhanced card styles
  const enhancedCardStyle: ViewStyle = {
    ...cardStyle,
    backgroundColor: variantColors.background,
    borderColor: variantColors.border,
    borderWidth: outline ? 2 : 1,
    borderRadius: rounded ? getBorderRadius(BorderRadius.full) : cardStyle.borderRadius,
    ...(elevated && getShadow()),
    ...(isScreenReaderEnabled && {
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
    ...style,
  };

  // Animated styles
  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim },
    ],
    opacity: opacityAnim,
  };

  const CardContent = () => (
    <View style={enhancedCardStyle}>
      {header && (
        <View style={styles.header}>
          {header}
        </View>
      )}
      
      {(title || subtitle) && (
        <View style={styles.titleSection}>
          {title && (
            <Text style={[titleStyle, { color: variantColors.text }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[subtitleStyle, { color: variantColors.subtitle }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        {children}
      </View>
      
      {actions && (
        <View style={styles.actions}>
          {actions}
        </View>
      )}
      
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          disabled={disabled || loading}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...accessibilityConfig}
          testID={testID || `card-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}
        >
          <CardContent />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <View
        {...accessibilityConfig}
        testID={testID || `card-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}
      >
        <CardContent />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.md,
  },
  titleSection: {
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
  },
  actions: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default EnhancedCard;
