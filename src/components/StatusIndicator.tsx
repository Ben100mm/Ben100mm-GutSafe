/**
 * @fileoverview StatusIndicator.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { ScanResult } from '../types';

interface StatusIndicatorProps {
  result: ScanResult;
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  result,
  title,
  subtitle,
  style,
}) => {
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
    <View style={[styles.container, { backgroundColor: config.backgroundColor }, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: config.color }]}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.body,
    lineHeight: Typography.lineHeight.bodySmall,
  },
});
