/**
 * @fileoverview analytics.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type {
  GutHealthMetrics,
  FoodTrendData,
  TrendAnalysis,
  ChartDataPoint,
  ScanHistory,
} from '../types';

/**
 * Analytics utility functions for gut health data processing
 */

export class AnalyticsUtils {
  /**
   * Calculate overall gut health score from metrics
   */
  static calculateOverallScore(metrics: GutHealthMetrics): number {
    const weights = {
      safeFoods: 0.3,
      symptoms: 0.25,
      energy: 0.25,
      sleep: 0.2,
    };

    const safeFoodsScore = (metrics.safeFoodsCount / 15) * 100; // Normalize to 0-100
    const symptomsScore = (10 - metrics.symptomsReported) * 10; // Invert symptoms (lower is better)
    const energyScore = metrics.energyLevel * 10;
    const sleepScore = metrics.sleepQuality * 10;

    return Math.round(
      safeFoodsScore * weights.safeFoods +
        symptomsScore * weights.symptoms +
        energyScore * weights.energy +
        sleepScore * weights.sleep
    );
  }

  /**
   * Generate trend analysis from metrics data
   */
  static generateTrendAnalysis(
    metrics: GutHealthMetrics[],
    period: 'week' | 'month' | 'quarter' | 'year'
  ): TrendAnalysis {
    if (metrics.length === 0) {
      return {
        period,
        trend: 'stable',
        changePercentage: 0,
        dataPoints: [],
        insights: ['No data available for analysis'],
        recommendations: ['Start tracking your gut health metrics'],
      };
    }

    const dataPoints: ChartDataPoint[] = metrics.map((metric, index) => ({
      x: index + 1,
      y: this.calculateOverallScore(metric),
      label: metric.date.toLocaleDateString(),
    }));

    const firstScore = dataPoints[0]?.y;
    const lastScore = dataPoints[dataPoints.length - 1]?.y;
    const changePercentage =
      firstScore && lastScore
        ? ((lastScore - firstScore) / firstScore) * 100
        : 0;

    const trend: 'up' | 'down' | 'stable' =
      changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable';

    const insights = this.generateInsights(metrics, changePercentage);
    const recommendations = this.generateRecommendations(metrics, trend);

    return {
      period,
      trend,
      changePercentage,
      dataPoints,
      insights,
      recommendations,
    };
  }

  /**
   * Process scan history to generate food trend data
   */
  static processFoodTrends(scanHistory: ScanHistory[]): FoodTrendData[] {
    const foodMap = new Map<
      string,
      {
        totalScans: number;
        safeCount: number;
        cautionCount: number;
        avoidCount: number;
        lastScanned: Date;
        timestamps: Date[];
      }
    >();

    // Process each scan
    scanHistory.forEach((scan) => {
      const foodName = scan.foodItem.name;
      const existing = foodMap.get(foodName) || {
        totalScans: 0,
        safeCount: 0,
        cautionCount: 0,
        avoidCount: 0,
        lastScanned: scan.timestamp,
        timestamps: [],
      };

      existing.totalScans++;
      existing.timestamps.push(scan.timestamp);
      existing.lastScanned =
        scan.timestamp > existing.lastScanned
          ? scan.timestamp
          : existing.lastScanned;

      switch (scan.analysis.overallSafety) {
        case 'safe':
          existing.safeCount++;
          break;
        case 'caution':
          existing.cautionCount++;
          break;
        case 'avoid':
          existing.avoidCount++;
          break;
      }

      foodMap.set(foodName, existing);
    });

    // Convert to FoodTrendData array
    return Array.from(foodMap.entries()).map(([foodName, data]) => {
      const trend = this.calculateFoodTrend(
        data.timestamps,
        data.safeCount,
        data.totalScans
      );
      const confidence = this.calculateConfidence(
        data.totalScans,
        data.safeCount,
        data.avoidCount
      );

      return {
        foodName,
        totalScans: data.totalScans,
        safeCount: data.safeCount,
        cautionCount: data.cautionCount,
        avoidCount: data.avoidCount,
        lastScanned: data.lastScanned,
        trend,
        confidence,
      };
    });
  }

  /**
   * Calculate food trend based on recent scans
   */
  private static calculateFoodTrend(
    _timestamps: Date[],
    safeCount: number,
    totalScans: number
  ): 'improving' | 'stable' | 'declining' {
    if (totalScans < 3) {
      return 'stable';
    }

    // const recentScans = timestamps
    //   .sort((a, b) => b.getTime() - a.getTime())
    //   .slice(0, Math.min(5, totalScans));

    const recentSafeRatio = safeCount / totalScans;

    if (recentSafeRatio > 0.7) {
      return 'improving';
    }
    if (recentSafeRatio < 0.3) {
      return 'declining';
    }
    return 'stable';
  }

  /**
   * Calculate confidence score for food trend
   */
  private static calculateConfidence(
    totalScans: number,
    safeCount: number,
    avoidCount: number
  ): number {
    if (totalScans === 0) {
      return 0;
    }

    const consistency = 1 - Math.abs(safeCount - avoidCount) / totalScans;
    const sampleSize = Math.min(totalScans / 10, 1); // More scans = higher confidence

    return Math.round((consistency * 0.7 + sampleSize * 0.3) * 100) / 100;
  }

  /**
   * Generate insights based on metrics
   */
  private static generateInsights(
    metrics: GutHealthMetrics[],
    changePercentage: number
  ): string[] {
    const insights = [];

    if (changePercentage > 10) {
      insights.push(
        'Excellent progress! Your gut health is improving significantly'
      );
    } else if (changePercentage > 5) {
      insights.push("Great job! You're making steady improvements");
    } else if (changePercentage < -10) {
      insights.push('Consider reviewing your recent food choices');
    } else if (changePercentage < -5) {
      insights.push('Your gut health has declined slightly - stay consistent');
    } else {
      insights.push('Your gut health is stable - keep up the good work');
    }

    // Add specific insights based on data
    const avgSymptoms =
      metrics.reduce((sum, m) => sum + m.symptomsReported, 0) / metrics.length;
    if (avgSymptoms < 2) {
      insights.push("Low symptom levels - you're managing your triggers well");
    } else if (avgSymptoms > 6) {
      insights.push('High symptom levels - consider identifying trigger foods');
    }

    const avgEnergy =
      metrics.reduce((sum, m) => sum + m.energyLevel, 0) / metrics.length;
    if (avgEnergy > 8) {
      insights.push(
        'High energy levels - your diet is supporting your wellbeing'
      );
    }

    return insights;
  }

  /**
   * Generate recommendations based on trends
   */
  private static generateRecommendations(
    _metrics: GutHealthMetrics[],
    trend: 'up' | 'down' | 'stable'
  ): string[] {
    const recommendations = [];

    switch (trend) {
      case 'up':
        recommendations.push(
          "Continue your current approach - it's working well"
        );
        recommendations.push('Consider adding more variety to your safe foods');
        break;
      case 'down':
        recommendations.push(
          'Review your recent food choices for potential triggers'
        );
        recommendations.push(
          'Consider keeping a detailed food and symptom diary'
        );
        recommendations.push(
          'Consult with a healthcare provider if symptoms persist'
        );
        break;
      case 'stable':
        recommendations.push('Maintain consistency in your dietary choices');
        recommendations.push(
          'Consider experimenting with new gut-friendly foods'
        );
        break;
    }

    // Add general recommendations
    recommendations.push('Track your food intake daily for better insights');
    recommendations.push('Pay attention to portion sizes and meal timing');

    return recommendations;
  }

  /**
   * Generate mock data for testing
   */
  static generateMockData(days: number = 30) {
    const now = new Date();
    const metrics: GutHealthMetrics[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));

      metrics.push({
        date,
        overallScore: 70 + Math.random() * 20,
        safeFoodsCount: Math.floor(Math.random() * 10) + 5,
        cautionFoodsCount: Math.floor(Math.random() * 5) + 1,
        avoidFoodsCount: Math.floor(Math.random() * 3),
        symptomsReported: Math.random() * 5,
        energyLevel: 5 + Math.random() * 4,
        sleepQuality: 5 + Math.random() * 4,
      });
    }

    return metrics;
  }
}
