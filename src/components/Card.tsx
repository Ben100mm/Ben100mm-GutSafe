/**
 * @fileoverview Card.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const paddingStyle =
    styles[
      `padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles
    ];

  const cardStyle = [styles.card, styles[variant], paddingStyle, style];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  default: {
    ...Shadows.sm,
  },
  elevated: {
    ...Shadows.md,
  },
  outlined: {
    borderColor: Colors.border,
    borderWidth: 1,
  },
  paddingLarge: {
    padding: Spacing.lg,
  },
  paddingMedium: {
    padding: Spacing.md,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: Spacing.sm,
  },
});
