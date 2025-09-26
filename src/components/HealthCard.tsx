/**
 * @fileoverview HealthCard.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

interface HealthCardProps {
  title: string;
  value: string;
  unit: string;
  icon: 'scan' | 'heart' | 'trend' | 'check' | 'fire';
  color: string;
  description?: string;
  showChart?: boolean;
  onPress?: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  description,
  showChart = false,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const getIcon = () => {
    switch (icon) {
      case 'scan':
        return '📱';
      case 'heart':
        return '❤️';
      case 'trend':
        return '📈';
      case 'check':
        return '✅';
      case 'fire':
        return '🔥';
      default:
        return '📊';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={[styles.title, { color }]}>{title}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.unit, { color: colors.textSecondary }]}>
            {unit}
          </Text>
        </View>

        {showChart && (
          <View style={styles.chart}>
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 20 }]}
            />
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 15 }]}
            />
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 25 }]}
            />
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 18 }]}
            />
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 22 }]}
            />
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 16 }]}
            />
            <View
              style={[styles.chartBar, { backgroundColor: color, height: 28 }]}
            />
          </View>
        )}

        {description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 30,
    marginBottom: Spacing.sm,
  },
  chartBar: {
    borderRadius: 2,
    flex: 1,
    marginHorizontal: 1,
  },
  chevron: {
    color: Colors.body,
    fontSize: 16,
    fontWeight: '300',
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: Typography.lineHeight.bodySmall,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  unit: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  value: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginRight: Spacing.xs,
  },
  valueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
});
