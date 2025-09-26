/**
 * @fileoverview Button.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useCallback, useMemo } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { getButtonAccessibilityProps } from '../utils/accessibilityHelpers';

import LinearGradient from './LinearGradientWrapper';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
  }) => {
    const buttonStyle = useMemo(
      () => [
        styles.button,
        styles[size],
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ],
      [size, variant, disabled, style]
    );

    const textStyleCombined = useMemo(
      () => [
        styles.text,
        styles[`${size}Text`],
        variant === 'outline' && styles.outlineText,
        disabled && styles.disabledText,
        textStyle,
      ],
      [size, variant, disabled, textStyle]
    );

    const accessibilityProps = useMemo(
      () =>
        getButtonAccessibilityProps({
          title,
          disabled: disabled || loading,
          loading,
          variant,
        }),
      [title, disabled, loading, variant]
    );

    const handlePress = useCallback(() => {
      if (!disabled && !loading) {
        onPress();
      }
    }, [onPress, disabled, loading]);

    if (variant === 'primary') {
      return (
        <TouchableOpacity
          disabled={disabled || loading}
          style={[buttonStyle, { overflow: 'hidden' }]}
          onPress={handlePress}
          {...accessibilityProps}
        >
          <LinearGradient
            colors={
              disabled ? [Colors.body, Colors.body] : Colors.primaryGradient
            }
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={textStyleCombined}>{title}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        disabled={disabled || loading}
        style={buttonStyle}
        onPress={handlePress}
        {...accessibilityProps}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' ? Colors.primary : Colors.white}
            size="small"
          />
        ) : (
          <Text style={textStyleCombined}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.body,
  },
  gradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
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
