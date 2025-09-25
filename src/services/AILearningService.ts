/**
 * @fileoverview AILearningService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { GutCondition, SeverityLevel, ScanResult, GutProfile, GutSymptom } from '../types';
import { symptomLoggingService } from './SymptomLoggingService';
import { userSettingsService } from './UserSettingsService';

// AI Learning Types
export interface LearningData {
  scanHistory: Array<{
    foodItem: string;
    ingredients: string[];
    analysis: ScanResult;
    userFeedback?: 'accurate' | 'inaccurate';
    timestamp: Date;
  }>;
  symptomLogs: Array<{
    symptoms: GutSymptom[];
    foodItems: string[];
    timestamp: Date;
  }>;
  gutProfile: GutProfile;
  userConditions: GutCondition[];
}

export interface PatternInsight {
  type: 'food_trigger' | 'symptom_pattern' | 'condition_correlation' | 'timing_pattern';
  confidence: number; // 0-1
  description: string;
  evidence: {
    frequency: number;
    severity: number;
    consistency: number;
  };
  recommendations: string[];
  affectedConditions: GutCondition[];
}

export interface AdaptiveRecommendation {
  type: 'profile_update' | 'trigger_addition' | 'severity_adjustment' | 'condition_toggle';
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  description: string;
  currentValue: any;
  suggestedValue: any;
  reasoning: string[];
  evidence: {
    dataPoints: number;
    timeSpan: number; // days
    consistency: number; // 0-1
  };
}

export interface LearningInsights {
  patterns: PatternInsight[];
  recommendations: AdaptiveRecommendation[];
  confidence: number; // 0-1
  dataQuality: {
    completeness: number; // 0-1
    consistency: number; // 0-1
    recency: number; // 0-1
  };
  lastUpdated: Date;
}

export interface LearningMetrics {
  totalDataPoints: number;
  learningAccuracy: number; // 0-1
  predictionAccuracy: number; // 0-1
  userSatisfaction: number; // 0-1
  adaptationRate: number; // 0-1
  lastEvaluation: Date;
}

export default class AILearningService {
  private static instance: AILearningService;
  private learningData: LearningData | null = null;
  private insights: LearningInsights | null = null;
  private metrics: LearningMetrics | null = null;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour

  static getInstance(): AILearningService {
    if (!AILearningService.instance) {
      AILearningService.instance = new AILearningService();
    }
    return AILearningService.instance;
  }

  // Initialize learning service
  async initialize(): Promise<void> {
    try {
      await this.loadLearningData();
      await this.generateInsights();
      await this.calculateMetrics();
    } catch (error) {
      console.error('Failed to initialize AI learning service:', error);
    }
  }

  // Load learning data from various sources
  private async loadLearningData(): Promise<void> {
    try {
      // Load user settings and gut profile
      const settings = userSettingsService.getSettings();
      const gutProfile = settings.profile.gutProfile;
      const userConditions = userSettingsService.getEnabledConditions();

      // Load symptom logs
      const symptomLogs = symptomLoggingService.getSymptomLogs();

      // Load scan history (this would come from a scan history service)
      const scanHistory = this.getMockScanHistory(); // Replace with actual service

      this.learningData = {
        scanHistory,
        symptomLogs: symptomLogs.map(log => ({
          symptoms: log.symptoms,
          foodItems: log.foodItems,
          timestamp: log.timestamp,
        })),
        gutProfile,
        userConditions,
      };
    } catch (error) {
      console.error('Failed to load learning data:', error);
      throw error;
    }
  }

  // Generate insights from learning data
  async generateInsights(): Promise<LearningInsights> {
    if (!this.learningData) {
      throw new Error('Learning data not loaded');
    }

    const cacheKey = `insights_${this.learningData.gutProfile.updatedAt.toISOString()}`;
    const cached = this.getFromCache<LearningInsights>(cacheKey);
    if (cached) return cached;

    const patterns = await this.analyzePatterns();
    const recommendations = await this.generateRecommendations(patterns);
    const confidence = this.calculateInsightsConfidence(patterns, recommendations);
    const dataQuality = this.assessDataQuality();

    const insights: LearningInsights = {
      patterns,
      recommendations,
      confidence,
      dataQuality,
      lastUpdated: new Date(),
    };

    this.insights = insights;
    this.setCache(cacheKey, insights);
    return insights;
  }

  // Analyze patterns in user data
  private async analyzePatterns(): Promise<PatternInsight[]> {
    if (!this.learningData) return [];

    const patterns: PatternInsight[] = [];

    // Analyze food triggers
    const foodTriggerPatterns = this.analyzeFoodTriggers();
    patterns.push(...foodTriggerPatterns);

    // Analyze symptom patterns
    const symptomPatterns = this.analyzeSymptomPatterns();
    patterns.push(...symptomPatterns);

    // Analyze condition correlations
    const conditionPatterns = this.analyzeConditionCorrelations();
    patterns.push(...conditionPatterns);

    // Analyze timing patterns
    const timingPatterns = this.analyzeTimingPatterns();
    patterns.push(...timingPatterns);

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  // Analyze food triggers
  private analyzeFoodTriggers(): PatternInsight[] {
    if (!this.learningData) return [];

    const patterns: PatternInsight[] = [];
    const foodTriggerMap = new Map<string, {
      occurrences: number;
      totalSeverity: number;
      symptoms: GutSymptom[];
      timestamps: Date[];
    }>();

    // Process scan history and symptom logs
    this.learningData.scanHistory.forEach(scan => {
      if (scan.userFeedback === 'inaccurate' || scan.analysis === 'safe') return;

      scan.ingredients.forEach(ingredient => {
        if (!foodTriggerMap.has(ingredient)) {
          foodTriggerMap.set(ingredient, {
            occurrences: 0,
            totalSeverity: 0,
            symptoms: [],
            timestamps: [],
          });
        }

        const data = foodTriggerMap.get(ingredient)!;
        data.occurrences++;
        data.timestamps.push(scan.timestamp);

        // Find related symptoms
        const relatedSymptoms = this.learningData!.symptomLogs.filter(log =>
          log.foodItems.some(item => item.toLowerCase().includes(ingredient.toLowerCase())) &&
          Math.abs(log.timestamp.getTime() - scan.timestamp.getTime()) < 24 * 60 * 60 * 1000 // Within 24 hours
        );

        relatedSymptoms.forEach(log => {
          data.symptoms.push(...log.symptoms);
          data.totalSeverity += log.symptoms.reduce((sum, s) => sum + s.severity, 0);
        });
      });
    });

    // Generate insights for frequent triggers
    foodTriggerMap.forEach((data, ingredient) => {
      if (data.occurrences >= 3 && data.symptoms.length > 0) {
        const averageSeverity = data.totalSeverity / data.symptoms.length;
        const consistency = this.calculateConsistency(data.timestamps);
        const frequency = data.occurrences / this.learningData!.scanHistory.length;

        if (frequency > 0.1 && averageSeverity > 5) {
          patterns.push({
            type: 'food_trigger',
            confidence: Math.min(0.9, frequency * averageSeverity / 10 * consistency),
            description: `${ingredient} appears to trigger digestive symptoms`,
            evidence: {
              frequency,
              severity: averageSeverity,
              consistency,
            },
            recommendations: [
              `Consider avoiding ${ingredient}`,
              `Look for alternatives to foods containing ${ingredient}`,
              `Monitor symptoms when consuming ${ingredient}`,
            ],
            affectedConditions: this.getAffectedConditions(ingredient),
          });
        }
      }
    });

    return patterns;
  }

  // Analyze symptom patterns
  private analyzeSymptomPatterns(): PatternInsight[] {
    if (!this.learningData) return [];

    const patterns: PatternInsight[] = [];
    const symptomMap = new Map<string, {
      occurrences: number;
      totalSeverity: number;
      timestamps: Date[];
      foodItems: string[];
    }>();

    // Process symptom logs
    this.learningData.symptomLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        if (!symptomMap.has(symptom.type)) {
          symptomMap.set(symptom.type, {
            occurrences: 0,
            totalSeverity: 0,
            timestamps: [],
            foodItems: [],
          });
        }

        const data = symptomMap.get(symptom.type)!;
        data.occurrences++;
        data.totalSeverity += symptom.severity;
        data.timestamps.push(log.timestamp);
        data.foodItems.push(...log.foodItems);
      });
    });

    // Generate insights for frequent symptoms
    symptomMap.forEach((data, symptomType) => {
      if (data.occurrences >= 5) {
        const averageSeverity = data.totalSeverity / data.occurrences;
        const consistency = this.calculateConsistency(data.timestamps);
        const frequency = data.occurrences / this.learningData!.symptomLogs.length;

        if (frequency > 0.2) {
          patterns.push({
            type: 'symptom_pattern',
            confidence: Math.min(0.9, frequency * consistency),
            description: `${symptomType} occurs frequently (${Math.round(frequency * 100)}% of logs)`,
            evidence: {
              frequency,
              severity: averageSeverity,
              consistency,
            },
            recommendations: [
              `Focus on managing ${symptomType} symptoms`,
              `Consider dietary changes to reduce ${symptomType}`,
              `Track triggers for ${symptomType}`,
            ],
            affectedConditions: this.getConditionsForSymptom(symptomType),
          });
        }
      }
    });

    return patterns;
  }

  // Analyze condition correlations
  private analyzeConditionCorrelations(): PatternInsight[] {
    if (!this.learningData) return [];

    const patterns: PatternInsight[] = [];
    const conditionMap = new Map<GutCondition, {
      enabled: boolean;
      severity: SeverityLevel;
      symptomCount: number;
      triggerCount: number;
    }>();

    // Analyze current gut profile
    Object.entries(this.learningData.gutProfile.conditions).forEach(([condition, config]) => {
      conditionMap.set(condition as GutCondition, {
        enabled: config.enabled,
        severity: config.severity,
        symptomCount: 0,
        triggerCount: 0,
      });
    });

    // Count symptoms and triggers for each condition
    this.learningData.symptomLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        const relatedConditions = this.getConditionsForSymptom(symptom.type);
        relatedConditions.forEach(condition => {
          const data = conditionMap.get(condition);
          if (data) {
            data.symptomCount++;
          }
        });
      });
    });

    // Generate insights
    conditionMap.forEach((data, condition) => {
      if (data.enabled && data.symptomCount > 0) {
        const symptomRate = data.symptomCount / this.learningData!.symptomLogs.length;
        
        if (symptomRate > 0.3) {
          patterns.push({
            type: 'condition_correlation',
            confidence: Math.min(0.9, symptomRate),
            description: `${condition.replace('-', ' ')} is highly active with ${data.symptomCount} related symptoms`,
            evidence: {
              frequency: symptomRate,
              severity: this.getSeverityScore(data.severity),
              consistency: 0.8, // Assume high consistency for enabled conditions
            },
            recommendations: [
              `Continue monitoring ${condition.replace('-', ' ')} symptoms`,
              `Consider adjusting severity level if symptoms persist`,
              `Focus on ${condition.replace('-', ' ')}-friendly foods`,
            ],
            affectedConditions: [condition],
          });
        }
      }
    });

    return patterns;
  }

  // Analyze timing patterns
  private analyzeTimingPatterns(): PatternInsight[] {
    if (!this.learningData) return [];

    const patterns: PatternInsight[] = [];
    const timeMap = new Map<string, number[]>();

    // Analyze symptom timing
    this.learningData.symptomLogs.forEach(log => {
      const hour = log.timestamp.getHours();
      const dayOfWeek = log.timestamp.getDay();
      const timeKey = `${dayOfWeek}_${hour}`;
      
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, []);
      }
      
      timeMap.get(timeKey)!.push(log.symptoms.reduce((sum, s) => sum + s.severity, 0));
    });

    // Find peak times
    const peakTimes: Array<{ time: string; averageSeverity: number; count: number }> = [];
    timeMap.forEach((severities, timeKey) => {
      if (severities.length >= 3) {
        const averageSeverity = severities.reduce((sum, s) => sum + s, 0) / severities.length;
        peakTimes.push({
          time: timeKey,
          averageSeverity,
          count: severities.length,
        });
      }
    });

    peakTimes.sort((a, b) => b.averageSeverity - a.averageSeverity);

    if (peakTimes.length > 0) {
      const peakTime = peakTimes[0];
      const [dayOfWeek, hour] = peakTime.time.split('_').map(Number);
      
      patterns.push({
        type: 'timing_pattern',
        confidence: Math.min(0.8, peakTime.count / 10),
        description: `Symptoms peak on ${this.getDayName(dayOfWeek)} at ${hour}:00`,
        evidence: {
          frequency: peakTime.count / this.learningData.symptomLogs.length,
          severity: peakTime.averageSeverity,
          consistency: 0.7,
        },
        recommendations: [
          `Be extra careful with food choices on ${this.getDayName(dayOfWeek)}s`,
          `Consider meal timing around ${hour}:00`,
          `Plan ahead for high-risk times`,
        ],
        affectedConditions: this.learningData.userConditions,
      });
    }

    return patterns;
  }

  // Generate adaptive recommendations
  private async generateRecommendations(patterns: PatternInsight[]): Promise<AdaptiveRecommendation[]> {
    const recommendations: AdaptiveRecommendation[] = [];

    // Generate recommendations based on patterns
    patterns.forEach(pattern => {
      if (pattern.type === 'food_trigger' && pattern.confidence > 0.7) {
        recommendations.push({
          type: 'trigger_addition',
          priority: 'high',
          confidence: pattern.confidence,
          description: `Add ${this.extractIngredientFromDescription(pattern.description)} to known triggers`,
          currentValue: this.getCurrentTriggers(),
          suggestedValue: [...this.getCurrentTriggers(), this.extractIngredientFromDescription(pattern.description)],
          reasoning: [
            `High confidence (${Math.round(pattern.confidence * 100)}%) trigger detection`,
            `Occurs in ${Math.round(pattern.evidence.frequency * 100)}% of scans`,
            `Average severity: ${pattern.evidence.severity.toFixed(1)}/10`,
          ],
          evidence: {
            dataPoints: Math.round(pattern.evidence.frequency * this.learningData!.scanHistory.length),
            timeSpan: this.getDataTimeSpan(),
            consistency: pattern.evidence.consistency,
          },
        });
      }

      if (pattern.type === 'symptom_pattern' && pattern.confidence > 0.8) {
        const condition = this.getPrimaryConditionForSymptom(pattern.description);
        if (condition) {
          recommendations.push({
            type: 'severity_adjustment',
            priority: 'medium',
            confidence: pattern.confidence,
            description: `Consider increasing ${condition} severity level`,
            currentValue: this.getCurrentSeverity(condition),
            suggestedValue: this.getSuggestedSeverity(this.getCurrentSeverity(condition)),
            reasoning: [
              `Frequent ${pattern.description} symptoms`,
              `High consistency (${Math.round(pattern.evidence.consistency * 100)}%)`,
              `Severity level may be too low`,
            ],
            evidence: {
              dataPoints: Math.round(pattern.evidence.frequency * this.learningData!.symptomLogs.length),
              timeSpan: this.getDataTimeSpan(),
              consistency: pattern.evidence.consistency,
            },
          });
        }
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Calculate insights confidence
  private calculateInsightsConfidence(patterns: PatternInsight[], recommendations: AdaptiveRecommendation[]): number {
    if (patterns.length === 0) return 0;

    const patternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const recommendationConfidence = recommendations.length > 0 
      ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length 
      : 0;

    return (patternConfidence + recommendationConfidence) / 2;
  }

  // Assess data quality
  private assessDataQuality(): { completeness: number; consistency: number; recency: number } {
    if (!this.learningData) {
      return { completeness: 0, consistency: 0, recency: 0 };
    }

    const totalPossibleDataPoints = 100; // Arbitrary baseline
    const actualDataPoints = this.learningData.scanHistory.length + this.learningData.symptomLogs.length;
    const completeness = Math.min(1, actualDataPoints / totalPossibleDataPoints);

    // Calculate consistency based on data spread
    const allTimestamps = [
      ...this.learningData.scanHistory.map(s => s.timestamp),
      ...this.learningData.symptomLogs.map(s => s.timestamp),
    ].sort((a, b) => a.getTime() - b.getTime());

    const consistency = this.calculateConsistency(allTimestamps);

    // Calculate recency (more recent data = higher score)
    const now = new Date();
    const mostRecent = allTimestamps[allTimestamps.length - 1];
    const daysSinceRecent = (now.getTime() - mostRecent.getTime()) / (24 * 60 * 60 * 1000);
    const recency = Math.max(0, 1 - daysSinceRecent / 30); // 30 days = 0 recency

    return { completeness, consistency, recency };
  }

  // Calculate metrics
  async calculateMetrics(): Promise<LearningMetrics> {
    if (!this.learningData) {
      return {
        totalDataPoints: 0,
        learningAccuracy: 0,
        predictionAccuracy: 0,
        userSatisfaction: 0,
        adaptationRate: 0,
        lastEvaluation: new Date(),
      };
    }

    const totalDataPoints = this.learningData.scanHistory.length + this.learningData.symptomLogs.length;
    
    // Calculate learning accuracy based on user feedback
    const feedbackData = this.learningData.scanHistory.filter(s => s.userFeedback);
    const learningAccuracy = feedbackData.length > 0 
      ? feedbackData.filter(s => s.userFeedback === 'accurate').length / feedbackData.length 
      : 0.5;

    // Calculate prediction accuracy (simplified)
    const predictionAccuracy = this.calculatePredictionAccuracy();

    // Calculate user satisfaction (based on feedback and usage patterns)
    const userSatisfaction = this.calculateUserSatisfaction();

    // Calculate adaptation rate
    const adaptationRate = this.calculateAdaptationRate();

    const metrics: LearningMetrics = {
      totalDataPoints,
      learningAccuracy,
      predictionAccuracy,
      userSatisfaction,
      adaptationRate,
      lastEvaluation: new Date(),
    };

    this.metrics = metrics;
    return metrics;
  }

  // Apply recommendations
  async applyRecommendations(recommendationIds: string[]): Promise<boolean> {
    if (!this.insights) return false;

    try {
      const recommendationsToApply = this.insights.recommendations.filter(r => 
        recommendationIds.includes(r.description)
      );

      for (const recommendation of recommendationsToApply) {
        await this.applyRecommendation(recommendation);
      }

      // Refresh insights after applying recommendations
      await this.generateInsights();
      return true;
    } catch (error) {
      console.error('Failed to apply recommendations:', error);
      return false;
    }
  }

  // Apply individual recommendation
  private async applyRecommendation(recommendation: AdaptiveRecommendation): Promise<void> {
    switch (recommendation.type) {
      case 'trigger_addition':
        // Add trigger to gut profile
        const condition = this.getPrimaryConditionForTrigger(recommendation.description);
        if (condition) {
          const currentTriggers = this.getCurrentTriggersForCondition(condition);
          const newTriggers = [...currentTriggers, recommendation.suggestedValue];
          await userSettingsService.updateGutProfile({
            conditions: {
              ...this.learningData!.gutProfile.conditions,
              [condition]: {
                ...this.learningData!.gutProfile.conditions[condition],
                knownTriggers: newTriggers,
              },
            },
          });
        }
        break;

      case 'severity_adjustment':
        // Update severity level
        const conditionForSeverity = this.getPrimaryConditionForSymptom(recommendation.description);
        if (conditionForSeverity) {
          await userSettingsService.updateGutProfile({
            conditions: {
              ...this.learningData!.gutProfile.conditions,
              [conditionForSeverity]: {
                ...this.learningData!.gutProfile.conditions[conditionForSeverity],
                severity: recommendation.suggestedValue,
              },
            },
          });
        }
        break;

      case 'condition_toggle':
        // Enable/disable condition
        const conditionForToggle = this.getPrimaryConditionForSymptom(recommendation.description);
        if (conditionForToggle) {
          await userSettingsService.updateGutProfile({
            conditions: {
              ...this.learningData!.gutProfile.conditions,
              [conditionForToggle]: {
                ...this.learningData!.gutProfile.conditions[conditionForToggle],
                enabled: recommendation.suggestedValue,
              },
            },
          });
        }
        break;
    }
  }

  // Helper methods
  private calculateConsistency(timestamps: Date[]): number {
    if (timestamps.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i].getTime() - timestamps[i - 1].getTime());
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    return Math.max(0, 1 - standardDeviation / averageInterval);
  }

  private getAffectedConditions(ingredient: string): GutCondition[] {
    // This would be more sophisticated in a real implementation
    const conditionMap: { [key: string]: GutCondition[] } = {
      'wheat': ['gluten'],
      'milk': ['lactose'],
      'onion': ['ibs-fodmap'],
      'garlic': ['ibs-fodmap'],
      'soy': ['ibs-fodmap'],
    };

    const lowerIngredient = ingredient.toLowerCase();
    for (const [key, conditions] of Object.entries(conditionMap)) {
      if (lowerIngredient.includes(key)) {
        return conditions;
      }
    }

    return ['additives'];
  }

  private getConditionsForSymptom(symptomType: string): GutCondition[] {
    const symptomMap: { [key: string]: GutCondition[] } = {
      'bloating': ['ibs-fodmap', 'lactose'],
      'cramping': ['ibs-fodmap', 'lactose'],
      'diarrhea': ['ibs-fodmap', 'lactose'],
      'constipation': ['ibs-fodmap'],
      'gas': ['ibs-fodmap', 'lactose'],
      'nausea': ['reflux', 'histamine'],
      'reflux': ['reflux'],
      'fatigue': ['histamine'],
      'headache': ['histamine'],
    };

    return symptomMap[symptomType] || ['additives'];
  }

  private getSeverityScore(severity: SeverityLevel): number {
    const severityMap = { mild: 3, moderate: 6, severe: 9 };
    return severityMap[severity];
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  private extractIngredientFromDescription(description: string): string {
    // Extract ingredient name from description
    const match = description.match(/([a-zA-Z\s]+) appears to trigger/);
    return match ? match[1].trim() : '';
  }

  private getCurrentTriggers(): string[] {
    if (!this.learningData) return [];
    return Object.values(this.learningData.gutProfile.conditions)
      .flatMap(condition => condition.knownTriggers);
  }

  private getCurrentTriggersForCondition(condition: GutCondition): string[] {
    if (!this.learningData) return [];
    return this.learningData.gutProfile.conditions[condition]?.knownTriggers || [];
  }

  private getCurrentSeverity(condition: GutCondition): SeverityLevel {
    if (!this.learningData) return 'mild';
    return this.learningData.gutProfile.conditions[condition]?.severity || 'mild';
  }

  private getSuggestedSeverity(current: SeverityLevel): SeverityLevel {
    const severityOrder = ['mild', 'moderate', 'severe'];
    const currentIndex = severityOrder.indexOf(current);
    return severityOrder[Math.min(currentIndex + 1, severityOrder.length - 1)] as SeverityLevel;
  }

  private getPrimaryConditionForSymptom(description: string): GutCondition | null {
    const conditionMap: { [key: string]: GutCondition } = {
      'bloating': 'ibs-fodmap',
      'cramping': 'ibs-fodmap',
      'diarrhea': 'ibs-fodmap',
      'constipation': 'ibs-fodmap',
      'gas': 'ibs-fodmap',
      'nausea': 'reflux',
      'reflux': 'reflux',
      'fatigue': 'histamine',
      'headache': 'histamine',
    };

    for (const [symptom, condition] of Object.entries(conditionMap)) {
      if (description.toLowerCase().includes(symptom)) {
        return condition;
      }
    }

    return null;
  }

  private getPrimaryConditionForTrigger(description: string): GutCondition | null {
    const triggerMap: { [key: string]: GutCondition } = {
      'wheat': 'gluten',
      'milk': 'lactose',
      'onion': 'ibs-fodmap',
      'garlic': 'ibs-fodmap',
      'soy': 'ibs-fodmap',
    };

    for (const [trigger, condition] of Object.entries(triggerMap)) {
      if (description.toLowerCase().includes(trigger)) {
        return condition;
      }
    }

    return 'additives';
  }

  private getDataTimeSpan(): number {
    if (!this.learningData) return 0;
    
    const allTimestamps = [
      ...this.learningData.scanHistory.map(s => s.timestamp),
      ...this.learningData.symptomLogs.map(s => s.timestamp),
    ];

    if (allTimestamps.length < 2) return 0;

    const sorted = allTimestamps.sort((a, b) => a.getTime() - b.getTime());
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];

    return (newest.getTime() - oldest.getTime()) / (24 * 60 * 60 * 1000); // days
  }

  private calculatePredictionAccuracy(): number {
    // Simplified calculation - in reality this would be more sophisticated
    if (!this.learningData) return 0.5;

    const feedbackData = this.learningData.scanHistory.filter(s => s.userFeedback);
    if (feedbackData.length === 0) return 0.5;

    const accuratePredictions = feedbackData.filter(s => s.userFeedback === 'accurate').length;
    return accuratePredictions / feedbackData.length;
  }

  private calculateUserSatisfaction(): number {
    // Simplified calculation based on usage patterns and feedback
    if (!this.learningData) return 0.5;

    const feedbackData = this.learningData.scanHistory.filter(s => s.userFeedback);
    const positiveFeedback = feedbackData.filter(s => s.userFeedback === 'accurate').length;
    
    if (feedbackData.length === 0) return 0.5;
    
    return positiveFeedback / feedbackData.length;
  }

  private calculateAdaptationRate(): number {
    // Simplified calculation - in reality this would track actual adaptations
    if (!this.insights) return 0;

    const highConfidenceRecommendations = this.insights.recommendations.filter(r => r.confidence > 0.7);
    return Math.min(1, highConfidenceRecommendations.length / 10); // Normalize to 0-1
  }

  private getMockScanHistory() {
    // Mock data for demonstration - replace with actual service
    return [
      {
        foodItem: 'Wheat Bread',
        ingredients: ['wheat flour', 'water', 'yeast', 'salt'],
        analysis: 'caution' as ScanResult,
        userFeedback: 'accurate' as const,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        foodItem: 'Greek Yogurt',
        ingredients: ['milk', 'live cultures'],
        analysis: 'caution' as ScanResult,
        userFeedback: 'inaccurate' as const,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Cache methods
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Public getters
  getInsights(): LearningInsights | null {
    return this.insights;
  }

  getMetrics(): LearningMetrics | null {
    return this.metrics;
  }

  getLearningData(): LearningData | null {
    return this.learningData;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Remove named export if present
