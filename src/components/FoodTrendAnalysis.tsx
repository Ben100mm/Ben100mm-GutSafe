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
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { FoodTrendData } from '../types';

// const { width } = Dimensions.get('window');

interface FoodTrendAnalysisProps {
  data: FoodTrendData[];
  maxItems?: number;
  showChart?: boolean;
  showInsights?: boolean;
}

export const FoodTrendAnalysis: React.FC<FoodTrendAnalysisProps> = ({
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
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return Colors.safe;
      case 'declining': return Colors.avoid;
      case 'stable': return Colors.caution;
      default: return colors.text;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return Colors.safe;
    if (confidence >= 0.6) return Colors.caution;
    return Colors.avoid;
  };

  const formatLastScanned = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
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
            {sortedData.map((food, index) => (
              <View key={food.foodName} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${(food.totalScans / Math.max(...sortedData.map(f => f.totalScans))) * 100}%`,
                        backgroundColor: getTrendColor(food.trend),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
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

      <ScrollView style={styles.foodList} showsVerticalScrollIndicator={false}>
        {sortedData.map((food, index) => (
          <TouchableOpacity
            key={food.foodName}
            style={[
              styles.foodItem,
              { backgroundColor: colors.background },
              selectedFood?.foodName === food.foodName && styles.selectedFoodItem,
            ]}
            onPress={() => setSelectedFood(selectedFood?.foodName === food.foodName ? null : food)}
          >
            <View style={styles.foodHeader}>
              <Text style={[styles.foodName, { color: colors.text }]}>
                {food.foodName}
              </Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendIcon}>{getTrendIcon(food.trend)}</Text>
                <Text style={[styles.trendText, { color: getTrendColor(food.trend) }]}>
                  {food.trend}
                </Text>
              </View>
            </View>

            <View style={styles.foodStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {food.totalScans}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Scans
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.safe }]}>
                  {food.safeCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Safe
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.caution }]}>
                  {food.cautionCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Caution
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.avoid }]}>
                  {food.avoidCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Avoid
                </Text>
              </View>
            </View>

            <View style={styles.foodDetails}>
              <Text style={[styles.lastScanned, { color: colors.textSecondary }]}>
                Last scanned: {formatLastScanned(food.lastScanned)}
              </Text>
              <Text style={[styles.confidence, { color: getConfidenceColor(food.confidence) }]}>
                Confidence: {Math.round(food.confidence * 100)}%
              </Text>
            </View>

            {selectedFood?.foodName === food.foodName && (
              <View style={styles.expandedDetails}>
                <Text style={[styles.detailsTitle, { color: colors.text }]}>
                  Detailed Analysis
                </Text>
                <Text style={[styles.detailsText, { color: colors.textSecondary }]}>
                  This food has been scanned {food.totalScans} times with a {Math.round(food.confidence * 100)}% confidence level.
                  The trend shows it's {food.trend} in terms of gut health compatibility.
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
              Most scanned food: {sortedData[0]?.foodName} ({sortedData[0]?.totalScans} times)
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
              Average confidence: {Math.round((data.reduce((sum, food) => sum + food.confidence, 0) / data.length) * 100)}%
            </Text>
          </View>
        </View>
      )}
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
  title: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  chartArea: {
    gap: Spacing.sm,
  },
  chartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
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
  foodList: {
    maxHeight: 300,
  },
  foodItem: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedFoodItem: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semiBold,
    flex: 1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  foodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
  },
  foodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastScanned: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
  },
  confidence: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semiBold,
  },
  expandedDetails: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailsTitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  detailsText: {
    fontSize: Typography.fontSize.bodySmall,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: 18,
  },
  insightsContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
    lineHeight: 18,
  },
});