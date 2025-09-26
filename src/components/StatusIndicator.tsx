/**
 * @fileoverview StatusIndicator.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { ScanResult } from '../types';

interface StatusIndicatorProps {
  result: ScanResult;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(
  ({ result, title, subtitle, style }) => {
    const config = useMemo(() => {
      switch (result) {
        case 'safe':
          return {
            color: Colors.safe,
            icon: '✅',
            backgroundColor: `${Colors.safe}15`,
          };
        case 'caution':
          return {
            color: Colors.caution,
            icon: '⚠️',
            backgroundColor: `${Colors.caution}15`,
          };
        case 'avoid':
          return {
            color: Colors.avoid,
            icon: '❌',
            backgroundColor: `${Colors.avoid}15`,
          };
        default:
          return {
            color: Colors.safe,
            icon: '✅',
            backgroundColor: `${Colors.safe}15`,
          };
      }
    }, [result]);

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: config.backgroundColor },
          style,
        ]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.color }]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    marginVertical: Spacing.sm,
    padding: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  subtitle: {
    color: Colors.body,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: Typography.lineHeight.bodySmall,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.xs,
  },
});
