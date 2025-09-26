/**
 * @fileoverview AccessibleView.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect, useRef } from 'react';
import type {
  ViewStyle,
  TextStyle,
  AccessibilityRole} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  AccessibilityInfo
 useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { HapticFeedback } from '../utils/haptics';
// import { AnimationPresets } from '../utils/animations';
import AccessibilityService from '../utils/accessibility';

interface AccessibleViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  enableAnimations?: boolean;
  enableHaptics?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export const AccessibleView: React.FC<AccessibleViewProps> = ({
  children,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  onPress,
  disabled = false,
  selected = false,
  enableAnimations = true,
  enableHaptics = true,
  hapticType = 'light',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] =
    React.useState(false);

  useEffect(() => {
    // Check if screen reader is enabled
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);
    };

    checkScreenReader();

    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  const handlePressIn = () => {
    if (disabled || !enableAnimations) {return;}

    if (enableHaptics) {
      HapticFeedback.trigger(hapticType as any);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || !enableAnimations) {return;}

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  // Accessibility config
  const accessibilityConfig = {
    accessible: true,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState: {
      disabled,
      selected,
    },
    testID: accessibilityLabel?.toLowerCase().replace(/\s+/g, '-'),
  };

  // Animation styles
  const animatedStyle = enableAnimations
    ? {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }
    : {};

  // Screen reader specific styles
  const screenReaderStyle = isScreenReaderEnabled
    ? {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        padding: Spacing.xs,
      }
    : {};

  if (onPress) {
    return (
      <TouchableOpacity
        disabled={disabled}
        style={[styles.container, style, screenReaderStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...accessibilityConfig}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[styles.container, style, screenReaderStyle]}
      {...accessibilityConfig}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

interface AccessibleTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  accessibilityLabel?: string;
  accessibilityRole?: 'text' | 'header' | 'link' | 'button';
  onPress?: () => void;
  enableAnimations?: boolean;
  enableHaptics?: boolean;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  style,
  accessibilityLabel,
  accessibilityRole = 'text',
  onPress,
  enableAnimations = true,
  enableHaptics = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] =
    React.useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  const handlePress = () => {
    if (onPress) {
      if (enableHaptics) {
        HapticFeedback.buttonPress();
      }
      onPress();
    }
  };

  const accessibilityConfig = {
    accessible: true,
    accessibilityRole,
    accessibilityLabel:
      accessibilityLabel ||
      (typeof children === 'string' ? children : undefined),
    testID: accessibilityLabel?.toLowerCase().replace(/\s+/g, '-'),
  };

  const animatedStyle = enableAnimations
    ? {
        transform: [{ scale: scaleAnim }],
      }
    : {};

  const screenReaderStyle = isScreenReaderEnabled
    ? {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 4,
        padding: Spacing.xs,
      }
    : {};

  if (onPress) {
    return (
      <TouchableOpacity
        style={[screenReaderStyle]}
        onPress={handlePress}
        {...accessibilityConfig}
      >
        <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.Text
      style={[style, animatedStyle, screenReaderStyle]}
      {...accessibilityConfig}
    >
      {children}
    </Animated.Text>
  );
};

interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  enableAnimations?: boolean;
  enableHaptics?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  enableAnimations = true,
  enableHaptics = true,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading || !enableAnimations) {return;}

    if (enableHaptics) {
      HapticFeedback.trigger(hapticType as any);
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading || !enableAnimations) {return;}

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal:
        size === 'small'
          ? Spacing.md
          : size === 'large'
            ? Spacing.xl
            : Spacing.lg,
      paddingVertical:
        size === 'small'
          ? Spacing.sm
          : size === 'large'
            ? Spacing.lg
            : Spacing.md,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.textTertiary : colors.accent,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.accent,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontFamily: Typography.fontFamily.semiBold,
      fontSize:
        size === 'small'
          ? Typography.fontSize.bodySmall
          : size === 'large'
            ? Typography.fontSize.h3
            : Typography.fontSize.body,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: Colors.white,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.text,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: colors.accent,
        };
      default:
        return {
          ...baseStyle,
          color: colors.text,
        };
    }
  };

  const accessibilityConfig = AccessibilityService.createButtonConfig(
    accessibilityLabel || title,
    accessibilityHint,
    disabled,
    false
  );

  const animatedStyle = enableAnimations
    ? {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }
    : {};

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...accessibilityConfig}
    >
      <Animated.View style={[styles.buttonContent, animatedStyle]}>
        <Text style={[getTextStyle(), textStyle]}>
          {loading ? 'Loading...' : title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    // Base container styles
  },
  content: {
    // Base content styles
  },
});

const AccessibleComponents = {
  AccessibleView,
  AccessibleText,
  AccessibleButton,
};

export default AccessibleComponents;
