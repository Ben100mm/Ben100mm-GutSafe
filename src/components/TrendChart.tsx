import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { ChartDataPoint, TrendAnalysis } from '../types';

const { width } = Dimensions.get('window');
const chartWidth = width - (Spacing.lg * 2);

interface TrendChartProps {
  data: TrendAnalysis;
  height?: number;
  showTooltip?: boolean;
  showArea?: boolean;
  color?: string;
  title?: string;
  subtitle?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 200,
  showTooltip = true,
  showArea = true,
  color = Colors.primary,
  title,
  subtitle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const chartData = data.dataPoints.map((point, index) => ({
    x: point.x,
    y: point.y,
    label: point.label || `${point.x}: ${point.y}`,
  }));

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return Colors.safe;
      case 'down':
        return Colors.avoid;
      case 'stable':
        return Colors.caution;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <View style={styles.trendIndicator}>
            <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {data.changePercentage > 0 ? '+' : ''}{data.changePercentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      )}
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}

      <View style={[styles.chartContainer, { height }]}>
        <VictoryChart
          theme={isDark ? VictoryTheme.material : VictoryTheme.material}
          width={chartWidth}
          height={height}
          padding={{ left: 50, right: 20, top: 20, bottom: 40 }}
          containerComponent={
            showTooltip ? (
              <VictoryVoronoiContainer
                voronoiDimension="x"
                labels={({ datum }) => `${datum.y}`}
                labelComponent={
                  <VictoryTooltip
                    style={{
                      fill: colors.text,
                      fontSize: 12,
                    }}
                    flyoutStyle={{
                      fill: colors.surface,
                      stroke: colors.border,
                      strokeWidth: 1,
                    }}
                  />
                }
              />
            ) : undefined
          }
        >
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textSecondary, fontSize: 12 },
            }}
          />
          
          {showArea && (
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: `${color}20`,
                  stroke: color,
                  strokeWidth: 2,
                },
              }}
            />
          )}
          
          <VictoryLine
            data={chartData}
            style={{
              data: {
                stroke: color,
                strokeWidth: 3,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </View>

      {data.insights.length > 0 && (
        <View style={styles.insightsContainer}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Insights
          </Text>
          {data.insights.map((insight, index) => (
            <Text key={index} style={[styles.insight, { color: colors.textSecondary }]}>
              • {insight}
            </Text>
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
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.multiChartContainer}
    >
      {charts.map((chart, index) => (
        <View key={index} style={[styles.chartWrapper, { width: chartWidth }]}>
          <TrendChart
            data={chart}
            height={height}
            color={chart.color}
            title={chart.title}
          />
        </View>
      ))}
    </ScrollView>
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
  ] as const;

  return (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period.key 
                ? colors.accent 
                : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onPeriodChange(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              {
                color: selectedPeriod === period.key 
                  ? Colors.white 
                  : colors.text,
              },
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  trendText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  insightsTitle: {
    fontSize: Typography.fontSize.subhead,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  insight: {
    fontSize: Typography.fontSize.caption,
    lineHeight: 18,
    marginBottom: 2,
  },
  multiChartContainer: {
    marginVertical: Spacing.sm,
  },
  chartWrapper: {
    marginRight: Spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
  },
});
