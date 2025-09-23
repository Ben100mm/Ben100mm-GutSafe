import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { ProgressRing, MultipleProgressRings } from '../components/ProgressRing';
import { TrendChart, MultiTrendChart, PeriodSelector } from '../components/TrendChart';
import { FoodTrendAnalysis } from '../components/FoodTrendAnalysis';
import { 
  GutHealthMetrics, 
  FoodTrendData, 
  WeeklyProgress, 
  ProgressRing as ProgressRingType,
  TrendAnalysis,
  ChartDataPoint,
  ShareableContent
} from '../types';
import { SharingService } from '../utils/sharing';

// Mock data - in a real app, this would come from your data store
const generateMockData = () => {
  const now = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return {
      date,
      overallScore: 70 + Math.random() * 20,
      safeFoodsCount: Math.floor(Math.random() * 10) + 5,
      cautionFoodsCount: Math.floor(Math.random() * 5) + 1,
      avoidFoodsCount: Math.floor(Math.random() * 3),
      symptomsReported: Math.random() * 5,
      energyLevel: 5 + Math.random() * 4,
      sleepQuality: 5 + Math.random() * 4,
    } as GutHealthMetrics;
  });

  const foodTrends: FoodTrendData[] = [
    {
      foodName: 'Dairy Products',
      totalScans: 25,
      safeCount: 15,
      cautionCount: 7,
      avoidCount: 3,
      lastScanned: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      trend: 'improving',
      confidence: 0.85,
    },
    {
      foodName: 'Gluten Foods',
      totalScans: 18,
      safeCount: 5,
      cautionCount: 8,
      avoidCount: 5,
      lastScanned: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      trend: 'declining',
      confidence: 0.72,
    },
    {
      foodName: 'High FODMAP',
      totalScans: 12,
      safeCount: 3,
      cautionCount: 4,
      avoidCount: 5,
      lastScanned: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      trend: 'stable',
      confidence: 0.68,
    },
    {
      foodName: 'Processed Foods',
      totalScans: 20,
      safeCount: 8,
      cautionCount: 9,
      avoidCount: 3,
      lastScanned: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      trend: 'improving',
      confidence: 0.78,
    },
  ];

  return { last30Days, foodTrends };
};

const AnalyticsScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [mockData] = useState(generateMockData());

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleShareAnalytics = async () => {
    const shareContent: ShareableContent = {
      type: 'gut_report',
      title: 'My Gut Health Analytics',
      description: `Check out my gut health progress! Score: ${Math.round(mockData.last30Days[mockData.last30Days.length - 1].overallScore)}/100`,
      data: {
        score: Math.round(mockData.last30Days[mockData.last30Days.length - 1].overallScore),
        improvement: gutHealthTrend.changePercentage,
        period: selectedPeriod,
      },
      shareUrl: 'gutsafe://analytics',
    };
    await SharingService.shareWithOptions(shareContent);
  };

  // Process data for charts
  const progressRings: ProgressRingType[] = useMemo(() => {
    const latest = mockData.last30Days[mockData.last30Days.length - 1];
    return [
      {
        id: 'gut-health',
        label: 'Gut Health',
        value: latest.overallScore,
        goal: 90,
        color: Colors.primary,
        unit: 'score',
      },
      {
        id: 'safe-foods',
        label: 'Safe Foods',
        value: (latest.safeFoodsCount / 15) * 100,
        goal: 100,
        color: Colors.safe,
        unit: 'foods',
      },
      {
        id: 'energy',
        label: 'Energy',
        value: (latest.energyLevel / 10) * 100,
        goal: 100,
        color: Colors.primaryLight,
        unit: 'level',
      },
    ];
  }, [mockData.last30Days]);

  const gutHealthTrend: TrendAnalysis = useMemo(() => {
    const dataPoints: ChartDataPoint[] = mockData.last30Days.map((day, index) => ({
      x: index + 1,
      y: day.overallScore,
      label: day.date.toLocaleDateString(),
    }));

    const firstScore = dataPoints[0].y;
    const lastScore = dataPoints[dataPoints.length - 1].y;
    const changePercentage = ((lastScore - firstScore) / firstScore) * 100;

    return {
      period: selectedPeriod,
      trend: changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable',
      changePercentage,
      dataPoints,
      insights: [
        `Your gut health score has ${changePercentage > 0 ? 'improved' : 'declined'} by ${Math.abs(changePercentage).toFixed(1)}% this period`,
        changePercentage > 0 ? 'Keep up the great work with your dietary choices!' : 'Consider reviewing foods that may be causing issues',
      ],
      recommendations: [
        'Continue tracking your food intake daily',
        'Pay attention to foods that consistently cause symptoms',
        'Consider consulting with a nutritionist for personalized advice',
      ],
    };
  }, [mockData.last30Days, selectedPeriod]);

  const symptomsTrend: TrendAnalysis = useMemo(() => {
    const dataPoints: ChartDataPoint[] = mockData.last30Days.map((day, index) => ({
      x: index + 1,
      y: day.symptomsReported,
      label: day.date.toLocaleDateString(),
    }));

    const firstScore = dataPoints[0].y;
    const lastScore = dataPoints[dataPoints.length - 1].y;
    const changePercentage = ((lastScore - firstScore) / firstScore) * 100;

    return {
      period: selectedPeriod,
      trend: changePercentage < -5 ? 'up' : changePercentage > 5 ? 'down' : 'stable',
      changePercentage: -changePercentage, // Invert for symptoms (lower is better)
      dataPoints,
      insights: [
        `Symptoms have ${changePercentage < 0 ? 'decreased' : 'increased'} by ${Math.abs(changePercentage).toFixed(1)}% this period`,
        changePercentage < 0 ? 'Great job managing your symptoms!' : 'Consider identifying trigger foods',
      ],
      recommendations: [
        'Track symptoms alongside food intake',
        'Look for patterns in symptom triggers',
        'Consider keeping a detailed food diary',
      ],
    };
  }, [mockData.last30Days, selectedPeriod]);

  const multiCharts = [
    { ...gutHealthTrend, title: 'Gut Health Score', color: Colors.primary },
    { ...symptomsTrend, title: 'Symptoms', color: Colors.avoid },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your gut health progress
          </Text>
        </View>
        <TouchableOpacity onPress={handleShareAnalytics} style={styles.shareButton}>
          <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Progress Rings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Progress
          </Text>
          <MultipleProgressRings
            rings={progressRings}
            size={100}
            strokeWidth={8}
            layout="horizontal"
          />
        </View>

        {/* Period Selector */}
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Trend Charts */}
        <TrendChart
          data={gutHealthTrend}
          title="Gut Health Trend"
          subtitle="Your overall gut health score over time"
          color={Colors.primary}
        />

        <MultiTrendChart charts={multiCharts} height={180} />

        {/* Food Trend Analysis */}
        <FoodTrendAnalysis
          data={mockData.foodTrends}
          maxItems={8}
          showChart={true}
          showInsights={true}
        />

        {/* Weekly Insights */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Weekly Insights
          </Text>
          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.insightNumber, { color: Colors.safe }]}>+12%</Text>
              <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                Improvement
              </Text>
            </View>
            <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.insightNumber, { color: Colors.primary }]}>7</Text>
              <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
            <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.insightNumber, { color: Colors.caution }]}>3</Text>
              <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                New Triggers
              </Text>
            </View>
            <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.insightNumber, { color: Colors.primaryLight }]}>85%</Text>
              <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                Accuracy
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recommendations
          </Text>
          {gutHealthTrend.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={[styles.recommendationBullet, { color: Colors.primary }]}>
                •
              </Text>
              <Text style={[styles.recommendationText, { color: colors.text }]}>
                {recommendation}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  shareButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.body,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
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
  sectionTitle: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  insightCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  insightNumber: {
    fontSize: Typography.fontSize.title1,
    fontWeight: Typography.fontWeight.bold,
  },
  insightLabel: {
    fontSize: Typography.fontSize.caption,
    marginTop: 4,
    textAlign: 'center',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  recommendationBullet: {
    fontSize: 16,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default AnalyticsScreen;
