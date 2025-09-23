import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { ChartDataPoint, TrendAnalysis } from '../types';

const { width } = Dimensions.get('window');
const chartWidth = width - (Spacing.lg * 2);

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
  data,
  title,
  subtitle,
  color = Colors.primary,
  height = 200,
  showInsights = true,
  showRecommendations = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up': return Colors.safe;
      case 'down': return Colors.avoid;
      case 'stable': return Colors.caution;
      default: return color;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.trendIndicator}>
          <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {data.trend.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Simple Chart Representation */}
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chartArea}>
          <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>
            📊 Chart Visualization
          </Text>
          <Text style={[styles.chartDescription, { color: colors.textTertiary }]}>
            {data.dataPoints.length} data points over {data.period}
          </Text>
          <Text style={[styles.changeText, { color: getTrendColor() }]}>
            {data.changePercentage > 0 ? '+' : ''}{data.changePercentage.toFixed(1)}% change
          </Text>
        </View>
      </View>

      {/* Insights */}
      {showInsights && data.insights && data.insights.length > 0 && (
        <View style={styles.insightsContainer}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Insights
          </Text>
          {data.insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                {insight}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {showRecommendations && data.recommendations && data.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={[styles.recommendationsTitle, { color: colors.text }]}>
            Recommendations
          </Text>
          {data.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                {recommendation}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
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