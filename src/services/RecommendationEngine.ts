/**
 * @fileoverview RecommendationEngine.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { GutCondition, SeverityLevel, GutProfile } from '../types';
import { PatternInsight } from './PatternAnalyzer';
// import { logger } from '../utils/logger';

// Recommendation Types
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

export interface ProfileUpdateRecommendation {
  condition: GutCondition;
  field: 'enabled' | 'severity' | 'knownTriggers';
  currentValue: any;
  suggestedValue: any;
  confidence: number;
  reasoning: string[];
}

export interface TriggerRecommendation {
  ingredient: string;
  action: 'add' | 'remove' | 'modify';
  currentTriggers: string[];
  suggestedTriggers: string[];
  confidence: number;
  reasoning: string[];
}

export interface SeverityAdjustmentRecommendation {
  condition: GutCondition;
  currentSeverity: SeverityLevel;
  suggestedSeverity: SeverityLevel;
  confidence: number;
  reasoning: string[];
}

export default class RecommendationEngine {
  private static instance: RecommendationEngine;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour

  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  // Generate adaptive recommendations based on patterns
  generateAdaptiveRecommendations(
    patterns: PatternInsight[],
    gutProfile: GutProfile,
    dataPoints: number,
    timeSpan: number
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    // Profile update recommendations
    const profileUpdates = this.generateProfileUpdateRecommendations(patterns, gutProfile);
    recommendations.push(...profileUpdates);

    // Trigger addition recommendations
    const triggerAdditions = this.generateTriggerRecommendations(patterns, gutProfile);
    recommendations.push(...triggerAdditions);

    // Severity adjustment recommendations
    const severityAdjustments = this.generateSeverityAdjustmentRecommendations(patterns, gutProfile);
    recommendations.push(...severityAdjustments);

    // Condition toggle recommendations
    const conditionToggles = this.generateConditionToggleRecommendations(patterns, gutProfile);
    recommendations.push(...conditionToggles);

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Generate profile update recommendations
  private generateProfileUpdateRecommendations(
    patterns: PatternInsight[],
    gutProfile: GutProfile
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    patterns.forEach(pattern => {
      if (pattern.type === 'food_trigger' && pattern.confidence > 0.7) {
        pattern.affectedConditions.forEach(condition => {
          const conditionData = gutProfile.conditions[condition];
          if (conditionData) {
            // Check if trigger should be added
            const trigger = this.extractTriggerFromPattern(pattern);
            if (trigger && !conditionData.knownTriggers.includes(trigger)) {
              recommendations.push({
                type: 'profile_update',
                priority: pattern.confidence > 0.8 ? 'high' : 'medium',
                confidence: pattern.confidence,
                description: `Add "${trigger}" to known triggers for ${condition}`,
                currentValue: conditionData.knownTriggers,
                suggestedValue: [...conditionData.knownTriggers, trigger],
                reasoning: [
                  `Pattern analysis shows ${trigger} triggers symptoms with ${Math.round(pattern.confidence * 100)}% confidence`,
                  `Evidence: ${pattern.evidence.frequency} occurrences`,
                  `Consistency: ${Math.round(pattern.evidence.consistency * 100)}%`,
                ],
                evidence: {
                  dataPoints: pattern.evidence.frequency,
                  timeSpan: 30, // Assume 30 days
                  consistency: pattern.evidence.consistency,
                },
              });
            }
          }
        });
      }
    });

    return recommendations;
  }

  // Generate trigger recommendations
  private generateTriggerRecommendations(
    patterns: PatternInsight[],
    gutProfile: GutProfile
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    patterns.forEach(pattern => {
      if (pattern.type === 'food_trigger' && pattern.confidence > 0.6) {
        const trigger = this.extractTriggerFromPattern(pattern);
        if (trigger) {
          recommendations.push({
            type: 'trigger_addition',
            priority: pattern.confidence > 0.8 ? 'high' : 'medium',
            confidence: pattern.confidence,
            description: `Consider adding "${trigger}" to your trigger list`,
            currentValue: this.getCurrentTriggers(gutProfile),
            suggestedValue: [...this.getCurrentTriggers(gutProfile), trigger],
            reasoning: [
              `High confidence pattern detected for ${trigger}`,
              `Frequency: ${pattern.evidence.frequency} occurrences`,
              `Severity: ${Math.round(pattern.evidence.severity * 100)}%`,
            ],
            evidence: {
              dataPoints: pattern.evidence.frequency,
              timeSpan: 30,
              consistency: pattern.evidence.consistency,
            },
          });
        }
      }
    });

    return recommendations;
  }

  // Generate severity adjustment recommendations
  private generateSeverityAdjustmentRecommendations(
    patterns: PatternInsight[],
    gutProfile: GutProfile
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    patterns.forEach(pattern => {
      if (pattern.type === 'food_trigger' && pattern.confidence > 0.8) {
        pattern.affectedConditions.forEach(condition => {
          const conditionData = gutProfile.conditions[condition];
          if (conditionData) {
            const suggestedSeverity = this.calculateSuggestedSeverity(pattern.evidence.severity);
            if (suggestedSeverity !== conditionData.severity) {
              recommendations.push({
                type: 'severity_adjustment',
                priority: 'medium',
                confidence: pattern.confidence,
                description: `Adjust ${condition} severity from ${conditionData.severity} to ${suggestedSeverity}`,
                currentValue: conditionData.severity,
                suggestedValue: suggestedSeverity,
                reasoning: [
                  `Pattern analysis suggests higher severity for ${condition}`,
                  `Evidence severity: ${Math.round(pattern.evidence.severity * 100)}%`,
                  `Confidence: ${Math.round(pattern.confidence * 100)}%`,
                ],
                evidence: {
                  dataPoints: pattern.evidence.frequency,
                  timeSpan: 30,
                  consistency: pattern.evidence.consistency,
                },
              });
            }
          }
        });
      }
    });

    return recommendations;
  }

  // Generate condition toggle recommendations
  private generateConditionToggleRecommendations(
    patterns: PatternInsight[],
    gutProfile: GutProfile
  ): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    // Analyze if any conditions should be enabled based on patterns
    patterns.forEach(pattern => {
      if (pattern.type === 'symptom_pattern' && pattern.confidence > 0.7) {
        pattern.affectedConditions.forEach(condition => {
          const conditionData = gutProfile.conditions[condition];
          if (conditionData && !conditionData.enabled) {
            recommendations.push({
              type: 'condition_toggle',
              priority: 'medium',
              confidence: pattern.confidence,
              description: `Enable ${condition} tracking based on symptom patterns`,
              currentValue: false,
              suggestedValue: true,
              reasoning: [
                `Symptom patterns suggest ${condition} may be relevant`,
                `Confidence: ${Math.round(pattern.confidence * 100)}%`,
                `Evidence: ${pattern.evidence.frequency} occurrences`,
              ],
              evidence: {
                dataPoints: pattern.evidence.frequency,
                timeSpan: 30,
                consistency: pattern.evidence.consistency,
              },
            });
          }
        });
      }
    });

    return recommendations;
  }

  // Generate personalized recommendations
  generatePersonalizedRecommendations(
    gutProfile: GutProfile,
    recentPatterns: PatternInsight[],
    userPreferences: any
  ): string[] {
    const recommendations: string[] = [];

    // Dietary recommendations based on conditions
    Object.entries(gutProfile.conditions).forEach(([condition, conditionData]) => {
      if (conditionData.enabled) {
        switch (condition as GutCondition) {
          case 'ibs-fodmap':
            recommendations.push('Consider following a low-FODMAP diet');
            recommendations.push('Avoid high-FODMAP foods like onions, garlic, and certain fruits');
            break;
          case 'gluten':
            recommendations.push('Maintain a strict gluten-free diet');
            recommendations.push('Check labels carefully for hidden gluten sources');
            break;
          case 'lactose':
            recommendations.push('Use lactose-free dairy products or lactase supplements');
            recommendations.push('Consider plant-based milk alternatives');
            break;
          case 'histamine':
            recommendations.push('Avoid aged and fermented foods');
            recommendations.push('Consider a low-histamine diet');
            break;
        }
      }
    });

    // Pattern-based recommendations
    recentPatterns.forEach(pattern => {
      if (pattern.confidence > 0.7) {
        recommendations.push(...pattern.recommendations);
      }
    });

    // Timing-based recommendations
    const timingPatterns = recentPatterns.filter(p => p.type === 'timing_pattern');
    if (timingPatterns.length > 0) {
      recommendations.push('Consider adjusting meal timing based on your symptom patterns');
      recommendations.push('Keep a food diary to track timing correlations');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Helper methods
  private extractTriggerFromPattern(pattern: PatternInsight): string | null {
    if (pattern.type === 'food_trigger' && pattern.description) {
      const match = pattern.description.match(/([A-Za-z\s]+) appears to trigger/);
      return match?.[1]?.trim() || null;
    }
    return null;
  }

  private getCurrentTriggers(gutProfile: GutProfile): string[] {
    const triggers = new Set<string>();
    Object.values(gutProfile.conditions).forEach(condition => {
      condition.knownTriggers.forEach(trigger => triggers.add(trigger));
    });
    return Array.from(triggers);
  }

  private calculateSuggestedSeverity(evidenceSeverity: number): SeverityLevel {
    if (evidenceSeverity >= 0.8) return 'severe';
    if (evidenceSeverity >= 0.5) return 'moderate';
    return 'mild';
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
