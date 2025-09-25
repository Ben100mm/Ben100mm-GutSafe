/**
 * @fileoverview TrendChart.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  // Dimensions,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { TrendAnalysis } from '../types';
import Svg, { Path } from 'react-native-svg';


interface TrendChartProps {
  data: TrendAnalysis;
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
  showInsights?: boolean;
  showRecommendations?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data: _data,
  title: _title,
  subtitle: _subtitle,
  color: _color = Colors.primary,
  height: _height = 200,
  showInsights: _showInsights = true,
  showRecommendations: _showRecommendations = false,
}) => {

  // Simple line chart implementation
  return (
    <Svg height="200" width="300">
      <Path d="M0 200 L100 100 L200 150 L300 50" stroke="blue" fill="none" />
    </Svg>
  );
};

interface MultiTrendChartProps {
  charts: Array<TrendAnalysis & { title: string; color: string }>;
  height?: number;
}

export const MultiTrendChart: React.FC<MultiTrendChartProps> = ({
  charts,
  height = 180,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.multiContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.multiTitle, { color: colors.text }]}>
        Multiple Trends
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartsRow}>
          {charts.map((chart, index) => (
            <TrendChart
              key={index}
              data={chart}
              title={chart.title}
              color={chart.color}
              height={height}
              showInsights={false}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

interface PeriodSelectorProps {
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'quarter' | 'year') => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'quarter', label: 'Quarter' },
    { key: 'year', label: 'Year' },
  ];

  return (
    <View style={[styles.periodSelector, { backgroundColor: colors.surface }]}>
      <Text style={[styles.periodTitle, { color: colors.text }]}>
        Time Period
      </Text>
      <View style={styles.periodButtons}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              {
                backgroundColor: selectedPeriod === period.key ? colors.accent : colors.background,
              },
            ]}
            onPress={() => onPeriodChange(period.key as any)}
          >
            <Text
              style={[
                styles.periodButtonText,
                {
                  color: selectedPeriod === period.key ? Colors.white : colors.text,
                },
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.regular,
  },
  trendIndicator: {
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  trendText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semiBold,
  },
  chartContainer: {
    marginBottom: Spacing.md,
  },
  chartArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: Spacing.lg,
  },
  chartPlaceholder: {
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.sm,
  },
  chartDescription: {
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  changeText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
  insightsContainer: {
    marginTop: Spacing.md,
  },
  insightsTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  insightBullet: {
    fontSize: 16,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: 20,
  },
  recommendationsContainer: {
    marginTop: Spacing.md,
  },
  recommendationsTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  recommendationBullet: {
    fontSize: 16,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: 20,
  },
  multiContainer: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  multiTitle: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  periodSelector: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  periodTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  periodButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  periodButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: Typography.fontWeight.semiBold,
  },
});