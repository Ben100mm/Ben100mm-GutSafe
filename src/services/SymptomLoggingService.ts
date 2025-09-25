/**
 * @fileoverview SymptomLoggingService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { GutSymptom } from '../types';

// Symptom Logging Types
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
    dietary: string[];
    lifestyle: string[];
    medical: string[];
  };
  riskFactors: {
    high: string[];
    medium: string[];
    low: string[];
  };
  confidence: number; // 0-1
}

export interface SymptomReport {
  period: 'week' | 'month' | 'quarter' | 'year';
  totalLogs: number;
  symptomFrequency: { [symptom: string]: number };
  averageSeverity: number;
  topTriggers: Array<{
    trigger: string;
    frequency: number;
    averageSeverity: number;
  }>;
  insights: SymptomInsights;
  recommendations: string[];
  generatedAt: Date;
}

export class SymptomLoggingService {
  private static instance: SymptomLoggingService;
  private symptomLogs: SymptomLog[] = [];
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SymptomLoggingService {
    if (!SymptomLoggingService.instance) {
      SymptomLoggingService.instance = new SymptomLoggingService();
    }
    return SymptomLoggingService.instance;
  }

  // Initialize service
  async initialize(): Promise<void> {
    try {
      const storedLogs = await this.loadFromStorage();
      if (storedLogs) {
        this.symptomLogs = storedLogs;
      }
    } catch (error) {
      console.error('Failed to load symptom logs:', error);
    }
  }

  // Log symptoms
  async logSymptoms(symptomData: Omit<SymptomLog, 'id' | 'timestamp'>): Promise<SymptomLog> {
    const symptomLog: SymptomLog = {
      ...symptomData,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.symptomLogs.unshift(symptomLog); // Add to beginning
    await this.saveToStorage();
    
    return symptomLog;
  }

  // Get all symptom logs
  getSymptomLogs(): SymptomLog[] {
    return [...this.symptomLogs];
  }

  // Get symptom logs by date range
  getSymptomLogsByDateRange(startDate: Date, endDate: Date): SymptomLog[] {
    return this.symptomLogs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  // Get recent symptom logs
  getRecentSymptomLogs(limit: number = 10): SymptomLog[] {
    return this.symptomLogs.slice(0, limit);
  }

  // Get symptom logs by food item
  getSymptomLogsByFood(foodItem: string): SymptomLog[] {
    return this.symptomLogs.filter(log => 
      log.foodItems.some(item => 
        item.toLowerCase().includes(foodItem.toLowerCase())
      )
    );
  }

  // Get symptom logs by symptom type
  getSymptomLogsByType(symptomType: string): SymptomLog[] {
    return this.symptomLogs.filter(log => 
      log.symptoms.some(symptom => symptom.type === symptomType)
    );
  }

  // Update symptom log
  async updateSymptomLog(id: string, updates: Partial<SymptomLog>): Promise<boolean> {
    const index = this.symptomLogs.findIndex(log => log.id === id);
    if (index === -1) return false;

    this.symptomLogs[index] = { ...this.symptomLogs[index], ...updates };
    await this.saveToStorage();
    return true;
  }

  // Delete symptom log
  async deleteSymptomLog(id: string): Promise<boolean> {
    const index = this.symptomLogs.findIndex(log => log.id === id);
    if (index === -1) return false;

    this.symptomLogs.splice(index, 1);
    await this.saveToStorage();
    return true;
  }

  // Analyze symptom patterns
  async analyzeSymptomPatterns(
    startDate?: Date,
    endDate?: Date
  ): Promise<SymptomInsights> {
    const cacheKey = `symptom_patterns_${startDate?.toISOString() || 'all'}_${endDate?.toISOString() || 'all'}`;
    const cached = this.getFromCache<SymptomInsights>(cacheKey);
    if (cached) return cached;

    const logs = startDate && endDate 
      ? this.getSymptomLogsByDateRange(startDate, endDate)
      : this.symptomLogs;

    if (logs.length === 0) {
      return this.getEmptyInsights();
    }

    const patterns = this.analyzePatterns(logs);
    const trends = this.analyzeTrends(logs);
    const recommendations = this.generateRecommendations(patterns, trends);
    const riskFactors = this.identifyRiskFactors(patterns, logs);
    const confidence = this.calculateConfidence(logs);

    const insights: SymptomInsights = {
      patterns,
      trends,
      recommendations,
      riskFactors,
      confidence,
    };

    this.setCache(cacheKey, insights);
    return insights;
  }

  // Generate symptom report
  async generateSymptomReport(period: 'week' | 'month' | 'quarter' | 'year'): Promise<SymptomReport> {
    const cacheKey = `symptom_report_${period}_${new Date().toISOString().split('T')[0]}`;
    const cached = this.getFromCache<SymptomReport>(cacheKey);
    if (cached) return cached;

    const endDate = new Date();
    const startDate = this.getPeriodStartDate(endDate, period);
    
    const logs = this.getSymptomLogsByDateRange(startDate, endDate);
    const insights = await this.analyzeSymptomPatterns(startDate, endDate);
    
    const symptomFrequency = this.calculateSymptomFrequency(logs);
    const averageSeverity = this.calculateAverageSeverity(logs);
    const topTriggers = this.identifyTopTriggers(logs);
    const recommendations = this.generateReportRecommendations(insights, logs);

    const report: SymptomReport = {
      period,
      totalLogs: logs.length,
      symptomFrequency,
      averageSeverity,
      topTriggers,
      insights,
      recommendations,
      generatedAt: new Date(),
    };

    this.setCache(cacheKey, report);
    return report;
  }

  // Analyze patterns from logs
  private analyzePatterns(logs: SymptomLog[]): SymptomPattern[] {
    const symptomMap = new Map<string, {
      occurrences: number;
      totalSeverity: number;
      triggers: Set<string>;
      timeOfDay: { [key: string]: number };
      dayOfWeek: { [key: string]: number };
      correlations: { [key: string]: number };
    }>();

    // Process each log
    logs.forEach(log => {
      log.symptoms.forEach(symptom => {
        const key = symptom.type;
        if (!symptomMap.has(key)) {
          symptomMap.set(key, {
            occurrences: 0,
            totalSeverity: 0,
            triggers: new Set(),
            timeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
            dayOfWeek: {},
            correlations: { food: 0, stress: 0, sleep: 0, weather: 0 },
          });
        }

        const data = symptomMap.get(key)!;
        data.occurrences++;
        data.totalSeverity += symptom.severity;
        
        // Add triggers
        log.foodItems.forEach(item => data.triggers.add(item));
        if (log.notes) data.triggers.add(log.notes);
        
        // Time of day
        const hour = log.timestamp.getHours();
        if (hour >= 6 && hour < 12) data.timeOfDay.morning++;
        else if (hour >= 12 && hour < 18) data.timeOfDay.afternoon++;
        else if (hour >= 18 && hour < 22) data.timeOfDay.evening++;
        else data.timeOfDay.night++;
        
        // Day of week
        const day = log.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
        data.dayOfWeek[day] = (data.dayOfWeek[day] || 0) + 1;
        
        // Correlations
        if (log.foodItems.length > 0) data.correlations.food++;
        if (log.stressLevel && log.stressLevel > 5) data.correlations.stress++;
        if (log.sleepQuality && log.sleepQuality < 5) data.correlations.sleep++;
        if (log.weather) data.correlations.weather++;
      });
    });

    // Convert to patterns
    const patterns: SymptomPattern[] = [];
    symptomMap.forEach((data, symptom) => {
      const frequency = data.occurrences / logs.length;
      const averageSeverity = data.totalSeverity / data.occurrences;
      
      patterns.push({
        symptom,
        frequency,
        averageSeverity,
        commonTriggers: Array.from(data.triggers).slice(0, 5),
        timeOfDay: {
          morning: data.timeOfDay.morning || 0,
          afternoon: data.timeOfDay.afternoon || 0,
          evening: data.timeOfDay.evening || 0,
          night: data.timeOfDay.night || 0,
        },
        dayOfWeek: data.dayOfWeek,
        correlation: {
          food: data.correlations.food / data.occurrences,
          stress: data.correlations.stress / data.occurrences,
          sleep: data.correlations.sleep / data.occurrences,
          weather: data.correlations.weather / data.occurrences,
        },
      });
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  // Analyze trends
  private analyzeTrends(logs: SymptomLog[]): {
    improving: string[];
    worsening: string[];
    stable: string[];
  } {
    const symptomTrends = new Map<string, number[]>();
    
    // Group logs by week
    const weeklyLogs = this.groupLogsByWeek(logs);
    
    // Calculate weekly averages for each symptom
    weeklyLogs.forEach(weekLogs => {
      const weekSymptoms = new Map<string, number[]>();
      
      weekLogs.forEach(log => {
        log.symptoms.forEach(symptom => {
          if (!weekSymptoms.has(symptom.type)) {
            weekSymptoms.set(symptom.type, []);
          }
          weekSymptoms.get(symptom.type)!.push(symptom.severity);
        });
      });
      
      weekSymptoms.forEach((severities, symptom) => {
        const average = severities.reduce((sum, s) => sum + s, 0) / severities.length;
        if (!symptomTrends.has(symptom)) {
          symptomTrends.set(symptom, []);
        }
        symptomTrends.get(symptom)!.push(average);
      });
    });
    
    const improving: string[] = [];
    const worsening: string[] = [];
    const stable: string[] = [];
    
    symptomTrends.forEach((trend, symptom) => {
      if (trend.length < 2) {
        stable.push(symptom);
        return;
      }
      
      const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
      const secondHalf = trend.slice(Math.floor(trend.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
      
      const change = (secondAvg - firstAvg) / firstAvg;
      
      if (change < -0.1) improving.push(symptom);
      else if (change > 0.1) worsening.push(symptom);
      else stable.push(symptom);
    });
    
    return { improving, worsening, stable };
  }

  // Generate recommendations
  private generateRecommendations(
    patterns: SymptomPattern[],
    trends: { improving: string[]; worsening: string[]; stable: string[] }
  ): {
    dietary: string[];
    lifestyle: string[];
    medical: string[];
  } {
    const dietary: string[] = [];
    const lifestyle: string[] = [];
    const medical: string[] = [];
    
    // High frequency symptoms
    const highFrequencySymptoms = patterns.filter(p => p.frequency > 0.3);
    if (highFrequencySymptoms.length > 0) {
      dietary.push('Consider keeping a detailed food diary to identify specific triggers');
      medical.push('Consult with a healthcare provider about persistent symptoms');
    }
    
    // Food correlations
    const foodCorrelatedSymptoms = patterns.filter(p => p.correlation.food > 0.5);
    if (foodCorrelatedSymptoms.length > 0) {
      dietary.push('Focus on identifying and avoiding food triggers');
      dietary.push('Consider working with a dietitian for personalized dietary guidance');
    }
    
    // Stress correlations
    const stressCorrelatedSymptoms = patterns.filter(p => p.correlation.stress > 0.5);
    if (stressCorrelatedSymptoms.length > 0) {
      lifestyle.push('Practice stress management techniques like meditation or yoga');
      lifestyle.push('Consider counseling or therapy for stress management');
    }
    
    // Sleep correlations
    const sleepCorrelatedSymptoms = patterns.filter(p => p.correlation.sleep > 0.5);
    if (sleepCorrelatedSymptoms.length > 0) {
      lifestyle.push('Improve sleep hygiene and maintain consistent sleep schedule');
      lifestyle.push('Consider sleep tracking to monitor sleep quality');
    }
    
    // Worsening trends
    if (trends.worsening.length > 0) {
      medical.push('Schedule an appointment with your healthcare provider');
      medical.push('Consider keeping detailed symptom logs for your doctor');
    }
    
    // Improving trends
    if (trends.improving.length > 0) {
      lifestyle.push('Continue current management strategies');
      dietary.push('Maintain current dietary approach');
    }
    
    return { dietary, lifestyle, medical };
  }

  // Identify risk factors
  private identifyRiskFactors(
    patterns: SymptomPattern[],
    logs: SymptomLog[]
  ): {
    high: string[];
    medium: string[];
    low: string[];
  } {
    const high: string[] = [];
    const medium: string[] = [];
    const low: string[] = [];
    
    patterns.forEach(pattern => {
      if (pattern.frequency > 0.5 && pattern.averageSeverity > 7) {
        high.push(`${pattern.symptom} (frequent and severe)`);
      } else if (pattern.frequency > 0.3 || pattern.averageSeverity > 5) {
        medium.push(`${pattern.symptom} (moderate frequency or severity)`);
      } else {
        low.push(`${pattern.symptom} (low frequency and severity)`);
      }
    });
    
    // Check for concerning patterns
    const recentLogs = logs.filter(log => 
      log.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentLogs.length > 5) {
      high.push('High frequency of symptom logging (may indicate worsening condition)');
    }
    
    const severeSymptoms = recentLogs.filter(log => 
      log.symptoms.some(s => s.severity > 8)
    );
    
    if (severeSymptoms.length > 2) {
      high.push('Multiple severe symptoms in recent period');
    }
    
    return { high, medium, low };
  }

  // Calculate confidence
  private calculateConfidence(logs: SymptomLog[]): number {
    if (logs.length === 0) return 0;
    
    let confidence = 0.5; // Base confidence
    
    // More logs = higher confidence
    if (logs.length >= 30) confidence += 0.3;
    else if (logs.length >= 10) confidence += 0.2;
    else if (logs.length >= 5) confidence += 0.1;
    
    // Consistent logging = higher confidence
    const days = new Set(logs.map(log => log.timestamp.toDateString())).size;
    const consistency = days / Math.max(1, Math.ceil((Date.now() - logs[logs.length - 1].timestamp.getTime()) / (24 * 60 * 60 * 1000)));
    confidence += consistency * 0.2;
    
    return Math.min(1, confidence);
  }

  // Helper methods
  private getPeriodStartDate(endDate: Date, period: string): Date {
    const startDate = new Date(endDate);
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return startDate;
  }

  private groupLogsByWeek(logs: SymptomLog[]): SymptomLog[][] {
    const weeks: SymptomLog[][] = [];
    const sortedLogs = [...logs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    let currentWeek: SymptomLog[] = [];
    let currentWeekStart = new Date(sortedLogs[0]?.timestamp || new Date());
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    sortedLogs.forEach(log => {
      const logWeekStart = new Date(log.timestamp);
      logWeekStart.setDate(logWeekStart.getDate() - logWeekStart.getDay());
      
      if (logWeekStart.getTime() !== currentWeekStart.getTime()) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek);
        }
        currentWeek = [log];
        currentWeekStart = logWeekStart;
      } else {
        currentWeek.push(log);
      }
    });
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }

  private calculateSymptomFrequency(logs: SymptomLog[]): { [symptom: string]: number } {
    const frequency: { [symptom: string]: number } = {};
    
    logs.forEach(log => {
      log.symptoms.forEach(symptom => {
        frequency[symptom.type] = (frequency[symptom.type] || 0) + 1;
      });
    });
    
    return frequency;
  }

  private calculateAverageSeverity(logs: SymptomLog[]): number {
    if (logs.length === 0) return 0;
    
    let totalSeverity = 0;
    let totalSymptoms = 0;
    
    logs.forEach(log => {
      log.symptoms.forEach(symptom => {
        totalSeverity += symptom.severity;
        totalSymptoms++;
      });
    });
    
    return totalSymptoms > 0 ? totalSeverity / totalSymptoms : 0;
  }

  private identifyTopTriggers(logs: SymptomLog[]): Array<{
    trigger: string;
    frequency: number;
    averageSeverity: number;
  }> {
    const triggerMap = new Map<string, { count: number; totalSeverity: number }>();
    
    logs.forEach(log => {
      log.foodItems.forEach(item => {
        if (!triggerMap.has(item)) {
          triggerMap.set(item, { count: 0, totalSeverity: 0 });
        }
        const data = triggerMap.get(item)!;
        data.count++;
        data.totalSeverity += log.symptoms.reduce((sum, s) => sum + s.severity, 0) / log.symptoms.length;
      });
    });
    
    return Array.from(triggerMap.entries())
      .map(([trigger, data]) => ({
        trigger,
        frequency: data.count,
        averageSeverity: data.totalSeverity / data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private generateReportRecommendations(
    insights: SymptomInsights,
    logs: SymptomLog[]
  ): string[] {
    const recommendations: string[] = [];
    
    // High frequency symptoms
    const highFreqSymptoms = insights.patterns.filter(p => p.frequency > 0.3);
    if (highFreqSymptoms.length > 0) {
      recommendations.push(`Focus on managing ${highFreqSymptoms.map(s => s.symptom).join(', ')} symptoms`);
    }
    
    // Food triggers
    const foodTriggers = insights.patterns.filter(p => p.correlation.food > 0.5);
    if (foodTriggers.length > 0) {
      recommendations.push('Keep detailed food logs to identify specific triggers');
    }
    
    // Stress management
    const stressSymptoms = insights.patterns.filter(p => p.correlation.stress > 0.5);
    if (stressSymptoms.length > 0) {
      recommendations.push('Implement stress management strategies');
    }
    
    // Medical consultation
    if (insights.riskFactors.high.length > 0) {
      recommendations.push('Schedule a consultation with your healthcare provider');
    }
    
    return recommendations;
  }

  private getEmptyInsights(): SymptomInsights {
    return {
      patterns: [],
      trends: { improving: [], worsening: [], stable: [] },
      recommendations: { dietary: [], lifestyle: [], medical: [] },
      riskFactors: { high: [], medium: [], low: [] },
      confidence: 0,
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Storage methods
  private async loadFromStorage(): Promise<SymptomLog[] | null> {
    try {
      const stored = localStorage.getItem('gutsafe_symptom_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load symptom logs from storage:', error);
    }
    return null;
  }

  private async saveToStorage(): Promise<void> {
    try {
      localStorage.setItem('gutsafe_symptom_logs', JSON.stringify(this.symptomLogs));
    } catch (error) {
      console.error('Failed to save symptom logs to storage:', error);
      throw error;
    }
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

  // Clear all data
  async clearAllData(): Promise<void> {
    this.symptomLogs = [];
    this.cache.clear();
    await this.saveToStorage();
  }

  // Export data
  exportData(): string {
    return JSON.stringify({
      symptomLogs: this.symptomLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }, null, 2);
  }

  // Import data
  async importData(dataJson: string): Promise<void> {
    try {
      const data = JSON.parse(dataJson);
      if (data.symptomLogs && Array.isArray(data.symptomLogs)) {
        this.symptomLogs = data.symptomLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        await this.saveToStorage();
      }
    } catch (error) {
      console.error('Failed to import symptom data:', error);
      throw new Error('Invalid data format');
    }
  }
}

// Export singleton instance
export const symptomLoggingService = SymptomLoggingService.getInstance();
