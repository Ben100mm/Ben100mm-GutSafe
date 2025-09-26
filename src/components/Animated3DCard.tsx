/**
 * @fileoverview Animated3DCard.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { BlurView } from '@react-native-community/blur';
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  // Dimensions,
  Platform,
} from 'react-native';
import type { ViewStyle } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import AccessibilityService from '../utils/accessibility';
import {
  AnimationPresets,
  TransformUtils,
  AnimationUtils,
} from '../utils/animations';
import { HapticFeedback } from '../utils/haptics';

import LinearGradient from './LinearGradientWrapper';

// const { width: screenWidth } = Dimensions.get('window');

interface Animated3DCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'glass' | 'solid' | 'gradient';
  enable3D?: boolean;
  hapticType?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  selected?: boolean;
}

export const Animated3DCard: React.FC<Animated3DCardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  variant = 'solid',
  enable3D = true,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  selected = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateXAnim = useRef(new Animated.Value(0)).current;
  const rotateYAnim = useRef(new Animated.Value(0)).current;
  const translateZAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial entrance animation
    if (enable3D) {
      const entranceAnimation = AnimationPresets.scale3D({
        duration: 600,
        useNativeDriver: Platform.OS !== 'web',
      });
      entranceAnimation.start();
    }

    // Pulse animation for selected state
    if (selected) {
      const pulseAnimation = AnimationUtils.createPulse(
        pulseAnim,
        0.98,
        1.02,
        2000
      );
      pulseAnimation.start();
    }
  }, [enable3D, selected, pulseAnim]);

  const handlePressIn = () => {
    if (disabled) {
      return;
    }

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
          toValue: -8,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rotateXAnim, {
          toValue: 5,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rotateYAnim, {
          toValue: 5,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    if (disabled) {
      return;
    }

    const animations = [
      Animated.spring(scaleAnim, {
        toValue: selected ? 1.02 : 1,
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
        }),
        Animated.timing(rotateXAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rotateYAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  // 3D transform styles
  const transform3DStyle = enable3D
    ? {
        transform: [
          { scale: Animated.multiply(scaleAnim, pulseAnim) },
          { translateZ: translateZAnim },
          {
            rotateX: rotateXAnim.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            }),
          },
          {
            rotateY: rotateYAnim.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
        ...TransformUtils.createPerspective(1000),
      }
    : {
        transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
      };

  // Shadow style for 3D effect
  const shadowStyle = enable3D
    ? {
        ...Platform.select({
          web: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          default: {
            shadowOpacity: shadowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.4],
            }),
            shadowRadius: shadowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 20],
            }),
            shadowOffset: {
              width: shadowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 6],
              }),
              height: shadowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 12],
              }),
            },
            shadowColor: '#000',
          },
        }),
      }
    : {};

  // Glow effect
  const glowStyle = {
    opacity: glowAnim,
    transform: [{ scale: glowAnim }],
  };

  // Card content
  const cardContent = (
    <View style={styles.content}>
      {title && (
        <Text style={[styles.title, { color: Colors.light.text }]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.subtitle, { color: Colors.light.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );

  // Accessibility config
  const accessibilityConfig = AccessibilityService.createCardConfig(
    accessibilityLabel || title || 'Card',
    subtitle,
    accessibilityHint,
    selected
  );

  // Render different variants
  const renderCard = () => {
    switch (variant) {
      case 'glass':
        return (
          <BlurView
            blurAmount={20}
            blurType="light"
            reducedTransparencyFallbackColor={Colors.white}
            style={styles.blurContainer}
          >
            <Animated.View style={[styles.glow, glowStyle]} />
            <View
              style={[styles.glassContent, { opacity: disabled ? 0.5 : 1 }]}
            >
              {cardContent}
            </View>
          </BlurView>
        );

      case 'gradient':
        return (
          <LinearGradient
            colors={
              disabled ? [Colors.body, Colors.body] : Colors.primaryGradient
            }
            style={
              [styles.gradientContainer, { opacity: disabled ? 0.5 : 1 }] as any
            }
          >
            <Animated.View style={[styles.glow, glowStyle]} />
            {cardContent}
          </LinearGradient>
        );

      default:
        return (
          <View
            style={[
              styles.solidContainer,
              {
                backgroundColor: Colors.surface,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <Animated.View style={[styles.glow, glowStyle]} />
            {cardContent}
          </View>
        );
    }
  };

  if (onPress) {
    return (
      <Animated.View style={[transform3DStyle, shadowStyle]}>
        <TouchableOpacity
          disabled={disabled}
          style={[styles.container, style]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...accessibilityConfig}
        >
          {renderCard()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[transform3DStyle, shadowStyle, styles.container, style]}
    >
      {renderCard()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: BorderRadius.lg,
    flex: 1,
  },
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  content: {
    padding: Spacing.lg,
  },
  glassContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
  },
  glow: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg + 2,
    bottom: -2,
    left: -2,
    opacity: 0.3,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  gradientContainer: {
    borderRadius: BorderRadius.lg,
    flex: 1,
  },
  solidContainer: {
    borderRadius: BorderRadius.lg,
    flex: 1,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.xs,
  },
});

export default Animated3DCard;
