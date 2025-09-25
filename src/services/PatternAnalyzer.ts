/**
 * @fileoverview PatternAnalyzer.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { GutCondition, SeverityLevel, ScanResult, GutProfile, GutSymptom } from '../types';
import { logger } from '../utils/logger';

// Pattern Analysis Types
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

export interface FoodTriggerPattern {
  ingredient: string;
  frequency: number;
  severity: number;
  conditions: GutCondition[];
  confidence: number;
}

export interface SymptomPattern {
  symptoms: GutSymptom[];
  frequency: number;
  timing: 'immediate' | 'delayed' | 'chronic';
  confidence: number;
}

export interface TimingPattern {
  timeOfDay: string;
  frequency: number;
  severity: number;
  confidence: number;
}

export default class PatternAnalyzer {
  private static instance: PatternAnalyzer;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour

  static getInstance(): PatternAnalyzer {
    if (!PatternAnalyzer.instance) {
      PatternAnalyzer.instance = new PatternAnalyzer();
    }
    return PatternAnalyzer.instance;
  }

  // Analyze food trigger patterns
  analyzeFoodTriggers(learningData: LearningData): FoodTriggerPattern[] {
    const triggers: Map<string, FoodTriggerPattern> = new Map();
    
    // Analyze scan history for food triggers
    learningData.scanHistory.forEach(scan => {
      if (scan.analysis === 'avoid' || scan.analysis === 'caution') {
        scan.ingredients.forEach(ingredient => {
          const existing = triggers.get(ingredient);
          if (existing) {
            existing.frequency += 1;
            existing.severity = Math.max(existing.severity, this.getSeverityScore(scan.analysis));
          } else {
            triggers.set(ingredient, {
              ingredient,
              frequency: 1,
              severity: this.getSeverityScore(scan.analysis),
              conditions: this.getConditionsForIngredient(ingredient, learningData.userConditions),
              confidence: 0.5, // Initial confidence
            });
          }
        });
      }
    });

    // Calculate confidence scores
    const totalScans = learningData.scanHistory.length;
    triggers.forEach(trigger => {
      trigger.confidence = Math.min(0.95, trigger.frequency / totalScans + 0.1);
    });

    return Array.from(triggers.values()).sort((a, b) => b.confidence - a.confidence);
  }

  // Analyze symptom patterns
  analyzeSymptomPatterns(learningData: LearningData): SymptomPattern[] {
    const patterns: Map<string, SymptomPattern> = new Map();
    
    learningData.symptomLogs.forEach(log => {
      const symptomKey = log.symptoms.map(s => s.type).sort().join(',');
      const existing = patterns.get(symptomKey);
      
      if (existing) {
        existing.frequency += 1;
      } else {
        patterns.set(symptomKey, {
          symptoms: log.symptoms,
          frequency: 1,
          timing: this.analyzeTiming(log, learningData.scanHistory),
          confidence: 0.5,
        });
      }
    });

    // Calculate confidence scores
    const totalLogs = learningData.symptomLogs.length;
    patterns.forEach(pattern => {
      pattern.confidence = Math.min(0.95, pattern.frequency / totalLogs + 0.1);
    });

    return Array.from(patterns.values()).sort((a, b) => b.confidence - a.confidence);
  }

  // Analyze timing patterns
  analyzeTimingPatterns(learningData: LearningData): TimingPattern[] {
    const timePatterns: Map<string, TimingPattern> = new Map();
    
    learningData.symptomLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      const timeSlot = this.getTimeSlot(hour);
      
      const existing = timePatterns.get(timeSlot);
      if (existing) {
        existing.frequency += 1;
        existing.severity = Math.max(existing.severity, this.getSymptomSeverity(log.symptoms));
      } else {
        timePatterns.set(timeSlot, {
          timeOfDay: timeSlot,
          frequency: 1,
          severity: this.getSymptomSeverity(log.symptoms),
          confidence: 0.5,
        });
      }
    });

    // Calculate confidence scores
    const totalLogs = learningData.symptomLogs.length;
    timePatterns.forEach(pattern => {
      pattern.confidence = Math.min(0.95, pattern.frequency / totalLogs + 0.1);
    });

    return Array.from(timePatterns.values()).sort((a, b) => b.confidence - a.confidence);
  }

  // Generate comprehensive pattern insights
  generatePatternInsights(learningData: LearningData): PatternInsight[] {
    const insights: PatternInsight[] = [];
    
    // Food trigger insights
    const foodTriggers = this.analyzeFoodTriggers(learningData);
    foodTriggers.forEach(trigger => {
      if (trigger.confidence > 0.7) {
        insights.push({
          type: 'food_trigger',
          confidence: trigger.confidence,
          description: `${trigger.ingredient} appears to trigger symptoms with ${Math.round(trigger.confidence * 100)}% confidence`,
          evidence: {
            frequency: trigger.frequency,
            severity: trigger.severity,
            consistency: trigger.confidence,
          },
          recommendations: [
            `Consider avoiding ${trigger.ingredient}`,
            `Look for alternatives without ${trigger.ingredient}`,
            `Monitor symptoms when consuming ${trigger.ingredient}`,
          ],
          affectedConditions: trigger.conditions,
        });
      }
    });

    // Symptom pattern insights
    const symptomPatterns = this.analyzeSymptomPatterns(learningData);
    symptomPatterns.forEach(pattern => {
      if (pattern.confidence > 0.6) {
        insights.push({
          type: 'symptom_pattern',
          confidence: pattern.confidence,
          description: `Symptom combination: ${pattern.symptoms.map(s => s.type).join(', ')} occurs frequently`,
          evidence: {
            frequency: pattern.frequency,
            severity: this.getSymptomSeverity(pattern.symptoms),
            consistency: pattern.confidence,
          },
          recommendations: [
            'Track these symptoms together',
            'Look for common triggers',
            'Consider dietary adjustments',
          ],
          affectedConditions: this.getConditionsForSymptoms(pattern.symptoms, learningData.userConditions),
        });
      }
    });

    // Timing pattern insights
    const timingPatterns = this.analyzeTimingPatterns(learningData);
    timingPatterns.forEach(pattern => {
      if (pattern.confidence > 0.6) {
        insights.push({
          type: 'timing_pattern',
          confidence: pattern.confidence,
          description: `Symptoms frequently occur during ${pattern.timeOfDay}`,
          evidence: {
            frequency: pattern.frequency,
            severity: pattern.severity,
            consistency: pattern.confidence,
          },
          recommendations: [
            `Monitor diet during ${pattern.timeOfDay}`,
            'Consider meal timing adjustments',
            'Track pre-meal activities',
          ],
          affectedConditions: learningData.userConditions,
        });
      }
    });

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods
  private getSeverityScore(analysis: ScanResult): number {
    switch (analysis) {
      case 'safe': return 0;
      case 'caution': return 0.5;
      case 'avoid': return 1;
      default: return 0;
    }
  }

  private getConditionsForIngredient(ingredient: string, userConditions: GutCondition[]): GutCondition[] {
    // Simple mapping - in a real app, this would be more sophisticated
    const conditionMap: Record<string, GutCondition[]> = {
      'gluten': ['gluten'],
      'lactose': ['lactose'],
      'fructose': ['ibs-fodmap'],
      'sorbitol': ['ibs-fodmap'],
      'histamine': ['histamine'],
    };

    return conditionMap[ingredient.toLowerCase()] || userConditions;
  }

  private getConditionsForSymptoms(symptoms: GutSymptom[], userConditions: GutCondition[]): GutCondition[] {
    // Map symptoms to likely conditions
    const symptomConditionMap: Record<string, GutCondition[]> = {
      'bloating': ['ibs-fodmap', 'lactose'],
      'diarrhea': ['ibs-fodmap', 'gluten', 'lactose'],
      'constipation': ['ibs-fodmap'],
      'nausea': ['reflux', 'histamine'],
      'heartburn': ['reflux'],
    };

    const conditions = new Set<GutCondition>();
    symptoms.forEach(symptom => {
      const mappedConditions = symptomConditionMap[symptom.type] || [];
      mappedConditions.forEach(condition => conditions.add(condition));
    });

    return Array.from(conditions).filter(condition => userConditions.includes(condition));
  }

  private analyzeTiming(log: any, scanHistory: any[]): 'immediate' | 'delayed' | 'chronic' {
    // Find related scans within 24 hours
    const relatedScans = scanHistory.filter(scan => 
      Math.abs(scan.timestamp.getTime() - log.timestamp.getTime()) < 24 * 60 * 60 * 1000
    );

    if (relatedScans.length === 0) return 'chronic';
    
    const timeDiff = log.timestamp.getTime() - relatedScans[0].timestamp.getTime();
    if (timeDiff < 2 * 60 * 60 * 1000) return 'immediate'; // Within 2 hours
    return 'delayed';
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private getSymptomSeverity(symptoms: GutSymptom[]): number {
    if (symptoms.length === 0) return 0;
    return symptoms.reduce((sum, symptom) => sum + symptom.severity, 0) / symptoms.length;
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
