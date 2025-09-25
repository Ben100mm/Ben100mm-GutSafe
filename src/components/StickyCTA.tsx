/**
 * @fileoverview StickyCTA.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useColorScheme,
  Platform,
  // Dimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { HapticFeedback } from '../utils/haptics';

// const { width } = Dimensions.get('window');

interface StickyCTAProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom' | 'top' | 'floating';
  enablePulse?: boolean;
  enableShake?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({
  text,
  onPress,
  variant = 'primary',
  size = 'medium',
  position = 'bottom',
  enablePulse = false,
  enableShake = false,
  disabled = false,
  accessibilityLabel,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Pulse animation
    if (enablePulse) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [enablePulse, pulseAnim, slideAnim]);

  const handlePress = () => {
    if (disabled) return;

    HapticFeedback.buttonPress();

    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Shake animation if enabled
    if (enableShake) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }

    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.accent,
          borderWidth: 2,
        };
      case 'accent':
        return {
          backgroundColor: Colors.safe,
          borderColor: Colors.safe,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.surface;
      case 'secondary':
        return colors.accent;
      case 'accent':
        return colors.surface;
      default:
        return colors.surface;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: 44,
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: 52,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl * 1.5,
          paddingVertical: Spacing.xl,
          minHeight: 60,
        };
      default:
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: 52,
        };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return Typography.fontSize.bodySmall;
      case 'medium':
        return Typography.fontSize.button;
      case 'large':
        return Typography.fontSize.bodyLarge;
      default:
        return Typography.fontSize.button;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom':
        return {
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
        };
      case 'top':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
        };
      case 'floating':
        return {
          position: 'absolute' as const,
          bottom: Spacing.xl,
          left: Spacing.lg,
          right: Spacing.lg,
        };
      default:
        return {};
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          getVariantStyles(),
          getSizeStyles(),
          {
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale: pulseAnim }],
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || text}
        accessibilityState={{ disabled }}
      >
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            },
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    ...Platform.select({
      web: {
        boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  button: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
  },
});

export default StickyCTA;
