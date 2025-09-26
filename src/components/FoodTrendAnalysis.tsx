/**
 * @fileoverview FoodTrendAnalysis.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  // Dimensions,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { FoodTrendData } from '../types';

// const { width } = Dimensions.get('window');

interface FoodTrendAnalysisProps {
  data: FoodTrendData[];
  maxItems?: number;
  showChart?: boolean;
  showInsights?: boolean;
}

export const FoodTrendAnalysis: React.FC<FoodTrendAnalysisProps> = React.memo(({
  data,
  maxItems = 5,
  showChart = true,
  showInsights = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [selectedFood, setSelectedFood] = useState<FoodTrendData | null>(null);

  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalScans - a.totalScans)
      .slice(0, maxItems);
  }, [data, maxItems]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return Colors.safe;
      case 'declining':
        return Colors.avoid;
      case 'stable':
        return Colors.caution;
      default:
        return colors.text;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) {
      return Colors.safe;
    }
    if (confidence >= 0.6) {
      return Colors.caution;
    }
    return Colors.avoid;
  };

  const formatLastScanned = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Food Trend Analysis
      </Text>

      {showChart && (
        <View style={styles.chartContainer}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Top Scanned Foods
          </Text>
          <View style={styles.chartArea}>
            {sortedData.map((food, _index) => (
              <View key={food.foodName} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${(food.totalScans / Math.max(...sortedData.map((f) => f.totalScans))) * 100}%`,
                        backgroundColor: getTrendColor(food.trend),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.barLabel, { color: colors.textSecondary }]}
                >
                  {food.foodName}
                </Text>
                <Text style={[styles.barValue, { color: colors.text }]}>
                  {food.totalScans}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} style={styles.foodList}>
        {sortedData.map((food, _index) => (
          <TouchableOpacity
            key={food.foodName}
            style={[
              styles.foodItem,
              { backgroundColor: colors.background },
              selectedFood?.foodName === food.foodName &&
                styles.selectedFoodItem,
            ]}
            onPress={() =>
              setSelectedFood(
                selectedFood?.foodName === food.foodName ? null : food
              )
            }
          >
            <View style={styles.foodHeader}>
              <Text style={[styles.foodName, { color: colors.text }]}>
                {food.foodName}
              </Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendIcon}>{getTrendIcon(food.trend)}</Text>
                <Text
                  style={[
                    styles.trendText,
                    { color: getTrendColor(food.trend) },
                  ]}
                >
                  {food.trend}
                </Text>
              </View>
            </View>

            <View style={styles.foodStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {food.totalScans}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Scans
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.safe }]}>
                  {food.safeCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Safe
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.caution }]}>
                  {food.cautionCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Caution
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.avoid }]}>
                  {food.avoidCount}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Avoid
                </Text>
              </View>
            </View>

            <View style={styles.foodDetails}>
              <Text
                style={[styles.lastScanned, { color: colors.textSecondary }]}
              >
                Last scanned: {formatLastScanned(food.lastScanned)}
              </Text>
              <Text
                style={[
                  styles.confidence,
                  { color: getConfidenceColor(food.confidence) },
                ]}
              >
                Confidence: {Math.round(food.confidence * 100)}%
              </Text>
            </View>

            {selectedFood?.foodName === food.foodName && (
              <View style={styles.expandedDetails}>
                <Text style={[styles.detailsTitle, { color: colors.text }]}>
                  Detailed Analysis
                </Text>
                <Text
                  style={[styles.detailsText, { color: colors.textSecondary }]}
                >
                  This food has been scanned {food.totalScans} times with a{' '}
                  {Math.round(food.confidence * 100)}% confidence level. The
                  trend shows it's {food.trend} in terms of gut health
                  compatibility.
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showInsights && (
        <View style={styles.insightsContainer}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Key Insights
          </Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              Most scanned food: {sortedData[0]?.foodName} (
              {sortedData[0]?.totalScans} times)
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              Total foods tracked: {data.length}
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightBullet}>•</Text>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              Average confidence:{' '}
              {Math.round(
                (data.reduce((sum, food) => sum + food.confidence, 0) /
                  data.length) *
                  100
              )}
              %
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});

FoodTrendAnalysis.displayName = 'FoodTrendAnalysis';

const styles = StyleSheet.create({
  bar: {
    borderRadius: 10,
    height: '100%',
  },
  barContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    flex: 1,
    height: 20,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    minWidth: 80,
  },
  barValue: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.bold,
    minWidth: 30,
    textAlign: 'right',
  },
  chartArea: {
    gap: Spacing.sm,
  },
  chartBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chartContainer: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  confidence: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semiBold,
  },
  container: {
    borderRadius: 16,
    elevation: 3,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  detailsText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: 18,
  },
  detailsTitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  expandedDetails: {
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  foodDetails: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  foodItem: {
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  foodList: {
    maxHeight: 300,
  },
  foodName: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
  },
  foodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  insightBullet: {
    fontSize: 16,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  insightItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  insightText: {
    flex: 1,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: 18,
  },
  insightsContainer: {
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: 1,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
  },
  insightsTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  lastScanned: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
  },
  selectedFoodItem: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
  },
  statValue: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  title: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  trendContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  trendIcon: {
    fontSize: 16,
  },
  trendText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semiBold,
    textTransform: 'capitalize',
  },
});
