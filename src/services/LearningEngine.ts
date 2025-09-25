/**
 * @fileoverview LearningEngine.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { GutCondition, GutProfile } from '../types';
import PatternAnalyzer, { LearningData, PatternInsight } from './PatternAnalyzer';
import RecommendationEngine, { AdaptiveRecommendation } from './RecommendationEngine';
import { logger } from '../utils/logger';

// Learning Engine Types
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

export interface LearningProgress {
  dataPoints: number;
  patternsDiscovered: number;
  recommendationsGenerated: number;
  accuracy: number;
  lastUpdate: Date;
}

export default class LearningEngine {
  private static instance: LearningEngine;
  private patternAnalyzer: PatternAnalyzer;
  private recommendationEngine: RecommendationEngine;
  private learningData: LearningData | null = null;
  private insights: LearningInsights | null = null;
  private metrics: LearningMetrics | null = null;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.patternAnalyzer = PatternAnalyzer.getInstance();
    this.recommendationEngine = RecommendationEngine.getInstance();
  }

  static getInstance(): LearningEngine {
    if (!LearningEngine.instance) {
      LearningEngine.instance = new LearningEngine();
    }
    return LearningEngine.instance;
  }

  // Initialize learning engine
  async initialize(): Promise<void> {
    try {
      await this.loadLearningData();
      await this.generateInsights();
      await this.calculateMetrics();
      logger.info('LearningEngine initialized successfully', 'LearningEngine');
    } catch (error) {
      logger.error('Failed to initialize LearningEngine', 'LearningEngine', error);
      throw error;
    }
  }

  // Load learning data from various sources
  private async loadLearningData(): Promise<void> {
    try {
      // In a real app, this would load from actual data sources
      this.learningData = {
        scanHistory: [],
        symptomLogs: [],
        gutProfile: this.getDefaultGutProfile(),
        userConditions: [],
      };
      logger.info('Learning data loaded', 'LearningEngine');
    } catch (error) {
      logger.error('Failed to load learning data', 'LearningEngine', error);
      throw error;
    }
  }

  // Generate comprehensive insights
  async generateInsights(): Promise<LearningInsights> {
    if (!this.learningData) {
      throw new Error('Learning data not loaded');
    }

    try {
      const patterns = this.patternAnalyzer.generatePatternInsights(this.learningData);
      const recommendations = this.recommendationEngine.generateAdaptiveRecommendations(
        patterns,
        this.learningData.gutProfile,
        this.getDataPointCount(),
        this.getTimeSpan()
      );

      const insights: LearningInsights = {
        patterns,
        recommendations,
        confidence: this.calculateOverallConfidence(patterns, recommendations),
        dataQuality: this.assessDataQuality(),
        lastUpdated: new Date(),
      };

      this.insights = insights;
      logger.info('Insights generated', 'LearningEngine', { 
        patternCount: patterns.length,
        recommendationCount: recommendations.length 
      });

      return insights;
    } catch (error) {
      logger.error('Failed to generate insights', 'LearningEngine', error);
      throw error;
    }
  }

  // Calculate learning metrics
  async calculateMetrics(): Promise<LearningMetrics> {
    if (!this.learningData) {
      throw new Error('Learning data not loaded');
    }

    try {
      const metrics: LearningMetrics = {
        totalDataPoints: this.getDataPointCount(),
        learningAccuracy: this.calculateLearningAccuracy(),
        predictionAccuracy: this.calculatePredictionAccuracy(),
        userSatisfaction: this.calculateUserSatisfaction(),
        adaptationRate: this.calculateAdaptationRate(),
        lastEvaluation: new Date(),
      };

      this.metrics = metrics;
      logger.info('Metrics calculated', 'LearningEngine', metrics);
      return metrics;
    } catch (error) {
      logger.error('Failed to calculate metrics', 'LearningEngine', error);
      throw error;
    }
  }

  // Get current insights
  getInsights(): LearningInsights | null {
    return this.insights;
  }

  // Get current metrics
  getMetrics(): LearningMetrics | null {
    return this.metrics;
  }

  // Get learning progress
  getLearningProgress(): LearningProgress {
    const dataPoints = this.getDataPointCount();
    const patterns = this.insights?.patterns.length || 0;
    const recommendations = this.insights?.recommendations.length || 0;
    const accuracy = this.metrics?.learningAccuracy || 0;

    return {
      dataPoints,
      patternsDiscovered: patterns,
      recommendationsGenerated: recommendations,
      accuracy,
      lastUpdate: new Date(),
    };
  }

  // Add new scan data for learning
  addScanData(scanData: any): void {
    if (!this.learningData) return;

    this.learningData.scanHistory.push({
      foodItem: scanData.foodItem?.name || 'Unknown',
      ingredients: scanData.foodItem?.ingredients || [],
      analysis: scanData.analysis?.overallSafety || 'safe',
      userFeedback: scanData.userFeedback,
      timestamp: new Date(),
    });

    // Trigger re-analysis
    this.generateInsights();
    logger.info('Scan data added for learning', 'LearningEngine', { scanId: scanData.id });
  }

  // Add new symptom data for learning
  addSymptomData(symptomData: any): void {
    if (!this.learningData) return;

    this.learningData.symptomLogs.push({
      symptoms: symptomData.symptoms || [],
      foodItems: symptomData.foodItems || [],
      timestamp: new Date(),
    });

    // Trigger re-analysis
    this.generateInsights();
    logger.info('Symptom data added for learning', 'LearningEngine', { symptomCount: symptomData.symptoms?.length || 0 });
  }

  // Update gut profile
  updateGutProfile(profile: GutProfile): void {
    if (this.learningData) {
      this.learningData.gutProfile = profile;
      this.learningData.userConditions = Object.keys(profile.conditions).filter(
        condition => profile.conditions[condition as GutCondition].enabled
      ) as GutCondition[];

      // Trigger re-analysis
      this.generateInsights();
      logger.info('Gut profile updated', 'LearningEngine', { profileId: profile.id });
    }
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(): string[] {
    if (!this.learningData || !this.insights) return [];

    return this.recommendationEngine.generatePersonalizedRecommendations(
      this.learningData.gutProfile,
      this.insights.patterns,
      {} // User preferences would be passed here
    );
  }

  // Helper methods
  private getDefaultGutProfile(): GutProfile {
    return {
      id: 'default',
      conditions: {
        'ibs-fodmap': { enabled: false, severity: 'mild', knownTriggers: [] },
        'gluten': { enabled: false, severity: 'mild', knownTriggers: [] },
        'lactose': { enabled: false, severity: 'mild', knownTriggers: [] },
        'reflux': { enabled: false, severity: 'mild', knownTriggers: [] },
        'histamine': { enabled: false, severity: 'mild', knownTriggers: [] },
        'allergies': { enabled: false, severity: 'mild', knownTriggers: [] },
        'additives': { enabled: false, severity: 'mild', knownTriggers: [] },
      },
      preferences: {
        dietaryRestrictions: [],
        preferredAlternatives: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private getDataPointCount(): number {
    if (!this.learningData) return 0;
    return this.learningData.scanHistory.length + this.learningData.symptomLogs.length;
  }

  private getTimeSpan(): number {
    if (!this.learningData || this.learningData.scanHistory.length === 0) return 0;
    
    const now = new Date();
    const oldest = Math.min(
      ...this.learningData.scanHistory.map(s => s.timestamp.getTime()),
      ...this.learningData.symptomLogs.map(s => s.timestamp.getTime())
    );
    
    return Math.ceil((now.getTime() - oldest) / (1000 * 60 * 60 * 24)); // Days
  }

  private calculateOverallConfidence(patterns: PatternInsight[], recommendations: AdaptiveRecommendation[]): number {
    if (patterns.length === 0 && recommendations.length === 0) return 0;
    
    const patternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const recommendationConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;
    
    return (patternConfidence + recommendationConfidence) / 2;
  }

  private assessDataQuality(): { completeness: number; consistency: number; recency: number } {
    if (!this.learningData) {
      return { completeness: 0, consistency: 0, recency: 0 };
    }

    const dataPoints = this.getDataPointCount();
    const completeness = Math.min(1, dataPoints / 100); // Assume 100 is complete
    
    const consistency = this.calculateConsistency();
    const recency = this.calculateRecency();

    return { completeness, consistency, recency };
  }

  private calculateConsistency(): number {
    // Simplified consistency calculation
    return 0.8; // Placeholder
  }

  private calculateRecency(): number {
    if (!this.learningData) return 0;
    
    const now = new Date();
    const recentData = [...this.learningData.scanHistory, ...this.learningData.symptomLogs]
      .filter(item => (now.getTime() - item.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    return Math.min(1, recentData.length / 10); // Assume 10 recent items is recent
  }

  private calculateLearningAccuracy(): number {
    // Simplified accuracy calculation
    return 0.75; // Placeholder
  }

  private calculatePredictionAccuracy(): number {
    // Simplified prediction accuracy calculation
    return 0.70; // Placeholder
  }

  private calculateUserSatisfaction(): number {
    // Simplified user satisfaction calculation
    return 0.80; // Placeholder
  }

  private calculateAdaptationRate(): number {
    // Simplified adaptation rate calculation
    return 0.60; // Placeholder
  }

  // Cache management
  private getCachedResult<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedResult<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}
