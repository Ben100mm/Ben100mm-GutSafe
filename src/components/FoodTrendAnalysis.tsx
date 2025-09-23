import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { FoodTrendData } from '../types';

const { width } = Dimensions.get('window');
const chartWidth = width - (Spacing.lg * 2);

interface FoodTrendAnalysisProps {
  data: FoodTrendData[];
  maxItems?: number;
  showChart?: boolean;
  showInsights?: boolean;
}

export const FoodTrendAnalysis: React.FC<FoodTrendAnalysisProps> = ({
  data,
  maxItems = 10,
  showChart = true,
  showInsights = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [sortBy, setSortBy] = useState<'total' | 'trend' | 'recent'>('total');
  const [filterBy, setFilterBy] = useState<'all' | 'improving' | 'declining' | 'stable'>('all');

  const processedData = useMemo(() => {
    let filtered = data;

    // Filter by trend
    if (filterBy !== 'all') {
      filtered = data.filter(item => item.trend === filterBy);
    }

    // Sort data
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'total':
          return b.totalScans - a.totalScans;
        case 'trend':
          return b.confidence - a.confidence;
        case 'recent':
          return new Date(b.lastScanned).getTime() - new Date(a.lastScanned).getTime();
        default:
          return 0;
      }
    });

    return sorted.slice(0, maxItems);
  }, [data, sortBy, filterBy, maxItems]);

  const chartData = processedData.map((item, index) => ({
    x: item.foodName.length > 8 ? `${item.foodName.substring(0, 8)}...` : item.foodName,
    y: item.totalScans,
    safeCount: item.safeCount,
    cautionCount: item.cautionCount,
    avoidCount: item.avoidCount,
    trend: item.trend,
  }));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '❓';
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
        return colors.textSecondary;
    }
  };

  const getInsights = () => {
    const insights = [];
    
    const improving = data.filter(item => item.trend === 'improving');
    const declining = data.filter(item => item.trend === 'declining');
    const mostScanned = data.reduce((prev, current) => 
      prev.totalScans > current.totalScans ? prev : current
    );

    if (improving.length > 0) {
      insights.push(`${improving.length} foods are showing improvement trends`);
    }
    
    if (declining.length > 0) {
      insights.push(`${declining.length} foods may be causing more issues`);
    }
    
    if (mostScanned) {
      insights.push(`"${mostScanned.foodName}" is your most scanned food (${mostScanned.totalScans} times)`);
    }

    return insights;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Food Trend Analysis
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sortButtons}>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
              Sort by:
            </Text>
            {[
              { key: 'total', label: 'Total Scans' },
              { key: 'trend', label: 'Confidence' },
              { key: 'recent', label: 'Recent' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.controlButton,
                  {
                    backgroundColor: sortBy === option.key ? colors.accent : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSortBy(option.key as any)}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    {
                      color: sortBy === option.key ? Colors.white : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
              Filter:
            </Text>
            {[
              { key: 'all', label: 'All' },
              { key: 'improving', label: 'Improving' },
              { key: 'declining', label: 'Declining' },
              { key: 'stable', label: 'Stable' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.controlButton,
                  {
                    backgroundColor: filterBy === option.key ? colors.accent : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFilterBy(option.key as any)}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    {
                      color: filterBy === option.key ? Colors.white : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Chart */}
      {showChart && chartData.length > 0 && (
        <View style={styles.chartContainer}>
          <VictoryChart
            theme={isDark ? VictoryTheme.material : VictoryTheme.material}
            width={chartWidth}
            height={200}
            padding={{ left: 60, right: 20, top: 20, bottom: 60 }}
            containerComponent={
              <VictoryVoronoiContainer
                voronoiDimension="x"
                labels={({ datum }) => `Scans: ${datum.y}`}
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
            }
          >
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: colors.border },
                tickLabels: { fill: colors.textSecondary, fontSize: 10 },
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: colors.border },
                tickLabels: { fill: colors.textSecondary, fontSize: 10 },
              }}
            />
            <VictoryBar
              data={chartData}
              style={{
                data: {
                  fill: ({ datum }) => getTrendColor(datum.trend),
                  fillOpacity: 0.8,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>
      )}

      {/* Food List */}
      <ScrollView style={styles.foodList} showsVerticalScrollIndicator={false}>
        {processedData.map((item, index) => (
          <View key={item.foodName} style={[styles.foodItem, { borderBottomColor: colors.border }]}>
            <View style={styles.foodHeader}>
              <Text style={[styles.foodName, { color: colors.text }]}>
                {item.foodName}
              </Text>
              <View style={styles.trendIndicator}>
                <Text style={styles.trendIcon}>{getTrendIcon(item.trend)}</Text>
                <Text style={[styles.trendText, { color: getTrendColor(item.trend) }]}>
                  {item.trend}
                </Text>
              </View>
            </View>
            
            <View style={styles.foodStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.safe }]}>
                  {item.safeCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Safe
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.caution }]}>
                  {item.cautionCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Caution
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.avoid }]}>
                  {item.avoidCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Avoid
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {item.totalScans}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total
                </Text>
              </View>
            </View>
            
            <Text style={[styles.lastScanned, { color: colors.textTertiary }]}>
              Last scanned: {new Date(item.lastScanned).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Insights */}
      {showInsights && getInsights().length > 0 && (
        <View style={styles.insightsContainer}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Insights
          </Text>
          {getInsights().map((insight, index) => (
            <Text key={index} style={[styles.insight, { color: colors.textSecondary }]}>
              • {insight}
            </Text>
          ))}
        </View>
      )}
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
  title: {
    fontSize: Typography.fontSize.title2,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  controls: {
    marginBottom: Spacing.md,
  },
  sortButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    marginRight: Spacing.sm,
  },
  controlButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
  },
  controlButtonText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
  },
  chartContainer: {
    marginBottom: Spacing.md,
  },
  foodList: {
    maxHeight: 300,
  },
  foodItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontSize: Typography.fontSize.subhead,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  trendText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
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
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },
  lastScanned: {
    fontSize: Typography.fontSize.caption,
    fontStyle: 'italic',
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
});
