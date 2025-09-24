import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { HapticFeedback, HapticType } from '../utils/haptics';
import { AnimationPresets, TransformUtils, HapticAnimations } from '../utils/animations';
import AccessibilityService from '../utils/accessibility';

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
  hapticType?: HapticType;
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
  hapticType = HapticType.LIGHT,
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
      const initialAnimation = AnimationPresets.scale3D({ duration: 300 });
      initialAnimation.start();
    }
  }, [enable3D]);

  const handlePressIn = () => {
    HapticFeedback.trigger(hapticType);
    
    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ];

    if (enable3D) {
      animations.push(
        Animated.timing(translateZAnim, {
          toValue: -5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  };

  const handlePressOut = () => {
    const animations = [
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ];

    if (enable3D) {
      animations.push(
        Animated.timing(translateZAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
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
  const transform3DStyle = enable3D ? {
    transform: [
      { scale: scaleAnim },
      { translateZ: translateZAnim },
      ...TransformUtils.createRotation3D(rotateAnim, 'y'),
    ],
    ...TransformUtils.createPerspective(1000),
  } : {
    transform: [{ scale: scaleAnim }],
  };

  // Shadow style for 3D effect
  const shadowStyle = enable3D ? {
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
  } : {};

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
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[buttonStyle, { overflow: 'hidden' }]}
          {...accessibilityConfig}
        >
          <LinearGradient
            colors={disabled ? [Colors.body, Colors.body] : Colors.primaryGradient}
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
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyle}
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
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.md + 2,
    backgroundColor: Colors.primaryLight,
    opacity: 0.3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabled: {
    opacity: 0.5,
  },
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },
  text: {
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: Typography.fontSize.bodySmall,
  },
  mediumText: {
    fontSize: Typography.fontSize.body,
  },
  largeText: {
    fontSize: Typography.fontSize.h3,
  },
  outlineText: {
    color: Colors.primary,
  },
  glassText: {
    color: Colors.white,
  },
  disabledText: {
    color: Colors.body,
  },
});
