/**
 * @fileoverview AnimatedButton.tsx
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

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import AccessibilityService from '../utils/accessibility';
import { AnimationPresets, TransformUtils } from '../utils/animations';
import { HapticFeedback } from '../utils/haptics';

import LinearGradient from './LinearGradientWrapper';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  hapticType?: string;
  enable3D?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  hapticType = 'light',
  enable3D = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateZAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize 3D animations if enabled
    if (enable3D) {
      const initialAnimation = AnimationPresets.scale3D({
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      });
      initialAnimation.start();
    }
  }, [enable3D]);

  const handlePressIn = () => {
    HapticFeedback.trigger(hapticType);

    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ];

    if (enable3D) {
      animations.push(
        Animated.timing(translateZAnim, {
          toValue: -5,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ];

    if (enable3D) {
      animations.push(
        Animated.timing(translateZAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
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

  const buttonStyle = [
    styles.button,
    styles[size],
    variant === 'outline' && styles.outline,
    variant === 'glass' && styles.glass,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${size}Text`],
    variant === 'outline' && styles.outlineText,
    variant === 'glass' && styles.glassText,
    disabled && styles.disabledText,
    textStyle,
  ];

  const glowStyle = {
    opacity: glowAnim,
    transform: [{ scale: glowAnim }],
  };

  // 3D transform styles
  const transform3DStyle = enable3D
    ? {
        transform: [
          { scale: scaleAnim },
          { translateZ: translateZAnim },
          ...TransformUtils.createRotation3D(rotateAnim, 'y'),
        ],
        ...TransformUtils.createPerspective(1000),
      }
    : {
        transform: [{ scale: scaleAnim }],
      };

  // Shadow style for 3D effect
  const shadowStyle = enable3D
    ? {
        shadowOpacity: shadowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.3],
        }),
        shadowRadius: shadowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [4, 12],
        }),
        shadowOffset: {
          width: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 4],
          }),
          height: shadowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 8],
          }),
        },
      }
    : {};

  // Accessibility config
  const accessibilityConfig = AccessibilityService.createButtonConfig(
    accessibilityLabel || title,
    accessibilityHint,
    disabled,
    false
  );

  if (variant === 'primary') {
    return (
      <Animated.View style={[transform3DStyle, shadowStyle]}>
        <TouchableOpacity
          disabled={disabled || loading}
          style={[buttonStyle, { overflow: 'hidden' }]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...accessibilityConfig}
        >
          <LinearGradient
            colors={
              disabled ? [Colors.body, Colors.body] : Colors.primaryGradient
            }
            style={styles.gradient}
          >
            <Animated.View style={[styles.glow, glowStyle]} />
            <View style={styles.content}>
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  {icon && <View style={styles.icon}>{icon}</View>}
                  <Text style={textStyleCombined}>{title}</Text>
                </>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[transform3DStyle, shadowStyle]}>
      <TouchableOpacity
        disabled={disabled || loading}
        style={buttonStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...accessibilityConfig}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' ? Colors.primary : Colors.white}
            size="small"
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={textStyleCombined}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.body,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  glassText: {
    color: Colors.white,
  },
  glow: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md + 2,
    bottom: -2,
    left: -2,
    opacity: 0.3,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  gradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  large: {
    minHeight: 56,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  largeText: {
    fontSize: Typography.fontSize.h3,
  },
  medium: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  mediumText: {
    fontSize: Typography.fontSize.body,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  outlineText: {
    color: Colors.primary,
  },
  small: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  smallText: {
    fontSize: Typography.fontSize.bodySmall,
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
});
