/**
 * @fileoverview EnhancedButton.tsx - Enhanced Button Component with Unified Styling
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';

import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { enhancedAccessibility } from '../utils/enhancedAccessibility';
import { EnhancedAnimationPresets } from '../utils/enhancedAnimations';
import { HapticFeedback } from '../utils/haptics';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

interface EnhancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  enableAnimations?: boolean;
  enableHaptics?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  fullWidth?: boolean;
  rounded?: boolean;
  outline?: boolean;
  gradient?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  hapticType = 'light',
  enableAnimations = true,
  enableHaptics = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  fullWidth = false,
  rounded = false,
  outline = false,
  gradient = false,
}) => {
  const {
    getButtonStyle,
    getTextStyle,
    getSpacing,
    getBorderRadius,
    getTouchTargetSize,
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    shouldReduceMotion,
    colors,
  } = useResponsiveDesign();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Determine button state
  const buttonState: ButtonState = loading ? 'loading' : disabled ? 'disabled' : 'default';

  // Get unified styles
  const buttonStyle = getButtonStyle({
    variant: outline ? 'secondary' : variant,
    size,
    state: buttonState,
  });

  const textStyleUnified = getTextStyle({
    variant: outline ? 'primary' : 'primary',
    size,
    state: buttonState,
  });

  // Enhanced accessibility config
  const accessibilityConfig = enhancedAccessibility.createButtonConfig(
    accessibilityLabel || title,
    accessibilityHint,
    disabled,
    loading
  );

  // Handle press animations
  const handlePressIn = () => {
    if (disabled || loading || !enableAnimations || shouldReduceMotion) return;

    if (enableHaptics) {
      HapticFeedback.trigger(hapticType);
    }

    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ];

    if (variant === 'primary' && !outline) {
      animations.push(
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    if (disabled || loading || !enableAnimations || shouldReduceMotion) return;

    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ];

    if (variant === 'primary' && !outline) {
      animations.push(
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  // Get variant-specific colors
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: outline ? 'transparent' : Colors.primary,
          border: Colors.primary,
          text: outline ? Colors.primary : Colors.white,
        };
      case 'secondary':
        return {
          background: outline ? 'transparent' : colors.surface,
          border: colors.border,
          text: colors.text,
        };
      case 'tertiary':
        return {
          background: 'transparent',
          border: 'transparent',
          text: colors.text,
        };
      case 'success':
        return {
          background: outline ? 'transparent' : Colors.safe,
          border: Colors.safe,
          text: outline ? Colors.safe : Colors.white,
        };
      case 'warning':
        return {
          background: outline ? 'transparent' : Colors.caution,
          border: Colors.caution,
          text: outline ? Colors.caution : Colors.white,
        };
      case 'error':
        return {
          background: outline ? 'transparent' : Colors.avoid,
          border: Colors.avoid,
          text: outline ? Colors.avoid : Colors.white,
        };
      case 'info':
        return {
          background: outline ? 'transparent' : Colors.primaryLight,
          border: Colors.primaryLight,
          text: outline ? Colors.primaryLight : Colors.white,
        };
      default:
        return {
          background: Colors.primary,
          border: Colors.primary,
          text: Colors.white,
        };
    }
  };

  const variantColors = getVariantColors();

  // Enhanced button styles
  const enhancedButtonStyle: ViewStyle = {
    ...buttonStyle,
    backgroundColor: variantColors.background,
    borderColor: variantColors.border,
    borderWidth: outline ? 2 : 1,
    borderRadius: rounded ? getBorderRadius(BorderRadius.full) : buttonStyle.borderRadius,
    width: fullWidth ? '100%' : undefined,
    minHeight: getTouchTargetSize(),
    opacity: disabled ? 0.5 : 1,
    ...(isScreenReaderEnabled && {
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
    ...style,
  };

  const enhancedTextStyle: TextStyle = {
    ...textStyleUnified,
    color: variantColors.text,
    fontWeight: Typography.fontWeight.semiBold,
    ...textStyle,
  };

  // Glow effect for primary buttons
  const glowStyle = {
    position: 'absolute' as const,
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: rounded ? getBorderRadius(BorderRadius.full) : buttonStyle.borderRadius,
    backgroundColor: Colors.primaryLight,
    opacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
    }),
  };

  // Animated styles
  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[animatedStyle, { width: fullWidth ? '100%' : undefined }]}>
      <TouchableOpacity
        disabled={disabled || loading}
        style={enhancedButtonStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...accessibilityConfig}
        testID={testID || `button-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {variant === 'primary' && !outline && (
          <Animated.View style={glowStyle} />
        )}
        
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator 
              color={variantColors.text} 
              size="small" 
              style={styles.loadingIndicator}
            />
          ) : (
            <>
              {icon && <View style={styles.icon}>{icon}</View>}
              <Text style={enhancedTextStyle}>{title}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  loadingIndicator: {
    marginRight: Spacing.sm,
  },
});

export default EnhancedButton;
