/**
 * @fileoverview HealthService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { GutSymptom, MedicationSupplement, GutProfile, GutCondition } from '../types';
import { logger } from '../utils/logger';

// Health Service Types
export interface SymptomLog {
  id: string;
  symptoms: GutSymptom[];
  foodItems: string[];
  timestamp: Date;
  notes?: string;
  weather?: string;
  stressLevel?: number; // 1-10 scale
  sleepQuality?: number; // 1-10 scale
  exerciseLevel?: 'none' | 'light' | 'moderate' | 'intense';
  medicationTaken?: string[];
  tags?: string[];
}

export interface SymptomPattern {
  symptom: string;
  frequency: number; // 0-1
  averageSeverity: number; // 1-10
  commonTriggers: string[];
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  dayOfWeek: {
    [key: string]: number;
  };
  correlation: {
    food: number; // 0-1
    stress: number; // 0-1
    sleep: number; // 0-1
    weather: number; // 0-1
  };
}

export interface SymptomInsights {
  patterns: SymptomPattern[];
  trends: {
    improving: string[];
    worsening: string[];
    stable: string[];
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
    lifestyle: string[];
  };
  correlations: {
    food: Array<{ food: string; correlation: number }>;
    lifestyle: Array<{ factor: string; correlation: number }>;
    time: Array<{ period: string; correlation: number }>;
  };
}

export interface MedicationLog {
  id: string;
  medication: MedicationSupplement;
  takenAt: Date;
  dosage: string;
  notes?: string;
  sideEffects?: string[];
  effectiveness?: number; // 1-10 scale
}

export interface HealthSummary {
  totalSymptoms: number;
  averageSeverity: number;
  mostCommonSymptoms: Array<{ symptom: string; count: number }>;
  medicationCompliance: number; // 0-1
  overallTrend: 'improving' | 'stable' | 'worsening';
  lastUpdated: Date;
}

/**
 * HealthService - Handles all health-related tracking and analysis
 * Consolidates symptom logging, medication tracking, and health insights
 */
class HealthService {
  private static instance: HealthService;
  private symptomLogs: SymptomLog[] = [];
  private medicationLogs: MedicationLog[] = [];
  private gutProfile: GutProfile | null = null;
  private listeners: Set<(summary: HealthSummary) => void> = new Set();

  private constructor() {}

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  /**
   * Initialize the health service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadHealthData();
      logger.info('HealthService initialized', 'HealthService');
    } catch (error) {
      logger.error('Failed to initialize HealthService', 'HealthService', error);
      throw error;
    }
  }

  /**
   * Subscribe to health summary changes
   */
  subscribe(listener: (summary: HealthSummary) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Set gut profile for analysis
   */
  setGutProfile(profile: GutProfile): void {
    this.gutProfile = profile;
    logger.info('Gut profile set', 'HealthService', { profileId: profile.id });
  }

  /**
   * Log symptoms
   */
  async logSymptoms(symptomData: Omit<SymptomLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const log: SymptomLog = {
        ...symptomData,
        id: this.generateId(),
        timestamp: new Date(),
      };

      this.symptomLogs.push(log);
      await this.saveHealthData();
      this.notifyListeners();

      logger.info('Symptoms logged', 'HealthService', { 
        logId: log.id, 
        symptomCount: log.symptoms.length 
      });

      return log.id;
    } catch (error) {
      logger.error('Failed to log symptoms', 'HealthService', error);
      throw error;
    }
  }

  /**
   * Get symptom logs
   */
  getSymptomLogs(limit?: number): SymptomLog[] {
    const logs = [...this.symptomLogs].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Update symptom log
   */
  async updateSymptomLog(logId: string, updates: Partial<SymptomLog>): Promise<void> {
    try {
      const index = this.symptomLogs.findIndex(log => log.id === logId);
      if (index === -1) {
        throw new Error('Symptom log not found');
      }

      this.symptomLogs[index] = {
        ...this.symptomLogs[index],
        ...updates,
        id: logId, // Ensure ID doesn't change
      };

      await this.saveHealthData();
      this.notifyListeners();

      logger.info('Symptom log updated', 'HealthService', { logId });
    } catch (error) {
      logger.error('Failed to update symptom log', 'HealthService', error);
      throw error;
    }
  }

  /**
   * Delete symptom log
   */
  async deleteSymptomLog(logId: string): Promise<void> {
    try {
      const index = this.symptomLogs.findIndex(log => log.id === logId);
      if (index === -1) {
        throw new Error('Symptom log not found');
      }

      this.symptomLogs.splice(index, 1);
      await this.saveHealthData();
      this.notifyListeners();

      logger.info('Symptom log deleted', 'HealthService', { logId });
    } catch (error) {
      logger.error('Failed to delete symptom log', 'HealthService', error);
      throw error;
    }
  }

  /**
   * Log medication intake
   */
  async logMedication(medicationData: Omit<MedicationLog, 'id' | 'takenAt'>): Promise<string> {
    try {
      const log: MedicationLog = {
        ...medicationData,
        id: this.generateId(),
        takenAt: new Date(),
      };

      this.medicationLogs.push(log);
      await this.saveHealthData();
      this.notifyListeners();

      logger.info('Medication logged', 'HealthService', { 
        logId: log.id, 
        medication: log.medication.name 
      });

      return log.id;
    } catch (error) {
      logger.error('Failed to log medication', 'HealthService', error);
      throw error;
    }
  }

  /**
   * Get medication logs
   */
  getMedicationLogs(limit?: number): MedicationLog[] {
    const logs = [...this.medicationLogs].sort((a, b) => 
      b.takenAt.getTime() - a.takenAt.getTime()
    );
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get medication compliance
   */
  getMedicationCompliance(medicationId: string, days: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantLogs = this.medicationLogs.filter(log => 
      log.medication.id === medicationId && 
      log.takenAt >= cutoffDate
    );

    // This would calculate actual compliance based on prescribed schedule
    // For now, return a mock value
    return Math.min(1, relevantLogs.length / 30);
  }

  /**
   * Analyze symptom patterns
   */
  async analyzeSymptomPatterns(): Promise<SymptomInsights> {
    try {
      const patterns = this.calculateSymptomPatterns();
      const trends = this.calculateTrends();
      const recommendations = this.generateRecommendations();
      const correlations = this.calculateCorrelations();

      const insights: SymptomInsights = {
        patterns,
        trends,
        recommendations,
        correlations,
      };

      logger.info('Symptom patterns analyzed', 'HealthService', { 
        patternCount: patterns.length 
      });

      return insights;
    } catch (error) {
      logger.error('Failed to analyze symptom patterns', 'HealthService', error);
      throw error;
    }
  }

  /**
   * Get health summary
   */
  getHealthSummary(): HealthSummary {
    const totalSymptoms = this.symptomLogs.reduce((sum, log) => sum + log.symptoms.length, 0);
    const averageSeverity = this.calculateAverageSeverity();
    const mostCommonSymptoms = this.getMostCommonSymptoms();
    const medicationCompliance = this.calculateOverallMedicationCompliance();
    const overallTrend = this.calculateOverallTrend();

    return {
      totalSymptoms,
      averageSeverity,
      mostCommonSymptoms,
      medicationCompliance,
      overallTrend,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate symptom patterns
   */
  private calculateSymptomPatterns(): SymptomPattern[] {
    // This would use pattern analysis algorithms in a real implementation
    const patterns: SymptomPattern[] = [];

    // Group symptoms by type
    const symptomGroups = new Map<string, SymptomLog[]>();
    this.symptomLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        if (!symptomGroups.has(symptom.type)) {
          symptomGroups.set(symptom.type, []);
        }
        symptomGroups.get(symptom.type)!.push(log);
      });
    });

    // Calculate patterns for each symptom type
    symptomGroups.forEach((logs, symptomType) => {
      const pattern: SymptomPattern = {
        symptom: symptomType,
        frequency: logs.length / this.symptomLogs.length,
        averageSeverity: this.calculateAverageSeverityForSymptom(symptomType),
        commonTriggers: this.findCommonTriggers(symptomType),
        timeOfDay: this.calculateTimeOfDayPattern(symptomType),
        dayOfWeek: this.calculateDayOfWeekPattern(symptomType),
        correlation: this.calculateCorrelationsForSymptom(symptomType),
      };
      patterns.push(pattern);
    });

    return patterns;
  }

  /**
   * Calculate trends
   */
  private calculateTrends(): SymptomInsights['trends'] {
    // This would analyze trends over time in a real implementation
    return {
      improving: ['Digestive comfort', 'Energy levels'],
      worsening: ['Bloating'],
      stable: ['Sleep quality'],
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): SymptomInsights['recommendations'] {
    // This would use AI/ML in a real implementation
    return {
      immediate: [
        'Consider avoiding dairy products',
        'Try gentle stretching exercises',
      ],
      longTerm: [
        'Maintain a food diary',
        'Consider probiotic supplements',
      ],
      lifestyle: [
        'Improve sleep hygiene',
        'Practice stress management techniques',
      ],
    };
  }

  /**
   * Calculate correlations
   */
  private calculateCorrelations(): SymptomInsights['correlations'] {
    // This would use statistical analysis in a real implementation
    return {
      food: [
        { food: 'Dairy', correlation: 0.7 },
        { food: 'Gluten', correlation: 0.5 },
      ],
      lifestyle: [
        { factor: 'Stress', correlation: 0.6 },
        { factor: 'Sleep', correlation: 0.4 },
      ],
      time: [
        { period: 'Morning', correlation: 0.3 },
        { period: 'Evening', correlation: 0.8 },
      ],
    };
  }

  /**
   * Calculate average severity
   */
  private calculateAverageSeverity(): number {
    if (this.symptomLogs.length === 0) return 0;
    
    const totalSeverity = this.symptomLogs.reduce((sum, log) => {
      return sum + log.symptoms.reduce((symptomSum, symptom) => 
        symptomSum + symptom.severity, 0
      );
    }, 0);

    const totalSymptoms = this.symptomLogs.reduce((sum, log) => 
      sum + log.symptoms.length, 0
    );

    return totalSymptoms > 0 ? totalSeverity / totalSymptoms : 0;
  }

  /**
   * Calculate average severity for specific symptom
   */
  private calculateAverageSeverityForSymptom(symptomType: string): number {
    const relevantLogs = this.symptomLogs.filter(log => 
      log.symptoms.some(symptom => symptom.type === symptomType)
    );

    if (relevantLogs.length === 0) return 0;

    const totalSeverity = relevantLogs.reduce((sum, log) => {
      return sum + log.symptoms
        .filter(symptom => symptom.type === symptomType)
        .reduce((symptomSum, symptom) => symptomSum + symptom.severity, 0);
    }, 0);

    const totalSymptoms = relevantLogs.reduce((sum, log) => 
      sum + log.symptoms.filter(symptom => symptom.type === symptomType).length, 0
    );

    return totalSymptoms > 0 ? totalSeverity / totalSymptoms : 0;
  }

  /**
   * Get most common symptoms
   */
  private getMostCommonSymptoms(): Array<{ symptom: string; count: number }> {
    const symptomCounts = new Map<string, number>();
    
    this.symptomLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        const count = symptomCounts.get(symptom.type) || 0;
        symptomCounts.set(symptom.type, count + 1);
      });
    });

    return Array.from(symptomCounts.entries())
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Calculate overall medication compliance
   */
  private calculateOverallMedicationCompliance(): number {
    if (this.medicationLogs.length === 0) return 0;
    
    // This would calculate based on prescribed schedules in a real implementation
    return 0.85; // Mock value
  }

  /**
   * Calculate overall trend
   */
  private calculateOverallTrend(): 'improving' | 'stable' | 'worsening' {
    // This would analyze trends over time in a real implementation
    return 'stable';
  }

  /**
   * Find common triggers for symptom
   */
  private findCommonTriggers(symptomType: string): string[] {
    // This would analyze food correlations in a real implementation
    return ['Dairy', 'Spicy foods'];
  }

  /**
   * Calculate time of day pattern
   */
  private calculateTimeOfDayPattern(symptomType: string): SymptomPattern['timeOfDay'] {
    // This would analyze time patterns in a real implementation
    return {
      morning: 0.2,
      afternoon: 0.3,
      evening: 0.4,
      night: 0.1,
    };
  }

  /**
   * Calculate day of week pattern
   */
  private calculateDayOfWeekPattern(symptomType: string): SymptomPattern['dayOfWeek'] {
    // This would analyze day patterns in a real implementation
    return {
      monday: 0.15,
      tuesday: 0.15,
      wednesday: 0.15,
      thursday: 0.15,
      friday: 0.15,
      saturday: 0.1,
      sunday: 0.15,
    };
  }

  /**
   * Calculate correlations for symptom
   */
  private calculateCorrelationsForSymptom(symptomType: string): SymptomPattern['correlation'] {
    // This would calculate actual correlations in a real implementation
    return {
      food: 0.6,
      stress: 0.4,
      sleep: 0.3,
      weather: 0.1,
    };
  }

  /**
   * Load health data from storage
   */
  private async loadHealthData(): Promise<void> {
    try {
      // This would load from actual storage in a real implementation
      this.symptomLogs = [];
      this.medicationLogs = [];
    } catch (error) {
      logger.error('Failed to load health data', 'HealthService', error);
    }
  }

  /**
   * Save health data to storage
   */
  private async saveHealthData(): Promise<void> {
    try {
      // This would save to actual storage in a real implementation
      logger.info('Health data saved', 'HealthService');
    } catch (error) {
      logger.error('Failed to save health data', 'HealthService', error);
    }
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    const summary = this.getHealthSummary();
    this.listeners.forEach(listener => {
      try {
        listener(summary);
      } catch (error) {
        logger.error('Error notifying health listener', 'HealthService', error);
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.listeners.clear();
    logger.info('HealthService cleaned up', 'HealthService');
  }
}

export default HealthService;
