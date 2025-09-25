/**
 * @fileoverview index.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// GutSafe App Types

export type GutCondition = 
  | 'ibs-fodmap'
  | 'gluten'
  | 'lactose'
  | 'reflux'
  | 'histamine'
  | 'allergies'
  | 'additives';

export type SeverityLevel = 'mild' | 'moderate' | 'severe';

export type ScanResult = 'safe' | 'caution' | 'avoid';

export interface GutProfile {
  id: string;
  conditions: {
    [K in GutCondition]: {
      enabled: boolean;
      severity: SeverityLevel;
      knownTriggers: string[];
    };
  };
  preferences: {
    dietaryRestrictions: string[];
    preferredAlternatives: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodItem {
  id: string;
  name: string;
  barcode?: string;
  brand?: string;
  category?: string;
  ingredients: string[];
  allergens: string[];
  additives: string[];
  fodmapLevel?: 'low' | 'moderate' | 'high';
  glutenFree: boolean;
  lactoseFree: boolean;
  histamineLevel?: 'low' | 'moderate' | 'high';
  dataSource?: string;
  isSafeFood?: boolean;
  addedToSafeFoods?: Date;
}

export interface ScanAnalysis {
  overallSafety: ScanResult;
  flaggedIngredients: {
    ingredient: string;
    reason: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }[];
  conditionWarnings: {
    ingredient: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }[];
  safeAlternatives: string[];
  explanation: string;
  dataSource: string;
  lastUpdated: Date;
}

export interface ScanHistory {
  id: string;
  foodItem: FoodItem;
  analysis: ScanAnalysis;
  timestamp: Date;
  userFeedback?: 'accurate' | 'inaccurate';
}

export interface SafeFood {
  id: string;
  foodItem: FoodItem;
  addedDate: Date;
  lastUsed?: Date;
  usageCount: number;
  notes?: string;
}

export interface ShareableContent {
  type: 'scan' | 'profile' | 'analytics' | 'scan_result' | 'gut_report' | 'safe_food';
  title?: string;
  description?: string;
  imageUrl?: string;
  data: any;
  shareUrl?: string;
}

export type OnboardingStep = 
  | 'welcome'
  | 'conditions'
  | 'severity'
  | 'triggers'
  | 'complete';

// Analytics and Visualization Types
export interface GutHealthMetrics {
  date: Date;
  overallScore: number; // 0-100
  safeFoodsCount: number;
  cautionFoodsCount: number;
  avoidFoodsCount: number;
  symptomsReported: number; // 0-10 scale
  energyLevel: number; // 0-10 scale
  sleepQuality: number; // 0-10 scale
}

export interface FoodTrendData {
  foodName: string;
  totalScans: number;
  safeCount: number;
  cautionCount: number;
  avoidCount: number;
  lastScanned: Date;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number; // 0-1
}

export interface WeeklyProgress {
  week: string; // "2024-W01"
  goal: number;
  achieved: number;
  percentage: number;
  streak: number;
  insights: string[];
}

export interface ProgressRing {
  id: string;
  label: string;
  value: number; // 0-100
  goal: number;
  color: string;
  unit: string;
}

export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
}

export interface TrendAnalysis {
  period: 'week' | 'month' | 'quarter' | 'year';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  dataPoints: ChartDataPoint[];
  insights: string[];
  recommendations: string[];
}

// Gut-Specific Types
export interface GutSymptom {
  id: string;
  type: 'bloating' | 'cramping' | 'diarrhea' | 'constipation' | 'gas' | 'nausea' | 'reflux' | 'fatigue' | 'headache' | 'skin_irritation' | 'other';
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // 1-10 scale
  description?: string;
  duration: number; // minutes
  timestamp: Date;
  potentialTriggers?: string[];
  location?: 'upper_abdomen' | 'lower_abdomen' | 'full_abdomen' | 'chest' | 'general';
}

export interface MedicationSupplement {
  id: string;
  name: string;
  type: 'medication' | 'supplement' | 'probiotic' | 'enzyme' | 'antacid' | 'other';
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'as_needed' | 'weekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  gutRelated: boolean;
  category?: 'digestive_aid' | 'anti_inflammatory' | 'probiotic' | 'enzyme_support' | 'acid_control' | 'immune_support' | 'other';
}

export interface GutConditionToggle {
  condition: GutCondition;
  enabled: boolean;
  severity: SeverityLevel;
  knownTriggers: string[];
  lastUpdated: Date;
}

// Additional types for IngredientAnalysisService
export interface HiddenTrigger {
  trigger: string;
  condition: GutCondition;
  severity: SeverityLevel;
}

export interface IngredientAnalysisResult {
  ingredient: string;
  isProblematic: boolean;
  isHidden: boolean;
  detectedTriggers: HiddenTrigger[];
  confidence: number;
  category: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  recommendations: {
    avoid: boolean;
    caution: boolean;
    alternatives: string[];
    modifications: string[];
  };
}

export interface ComplexFoodAnalysis {
  foodName: string;
  overallRisk: ScanResult;
  flaggedIngredients: IngredientAnalysisResult[];
  hiddenTriggers: HiddenTrigger[];
  riskSummary: {
    totalIngredients: number;
    problematicCount: number;
    hiddenCount: number;
    severeCount: number;
    moderateCount: number;
    mildCount: number;
  };
  recommendations: {
    overall: string;
    specific: string[];
    alternatives: string[];
  };
  confidence: number;
}
