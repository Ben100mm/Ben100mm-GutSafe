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
  ingredients: string[];
  allergens: string[];
  additives: string[];
  fodmapLevel?: 'low' | 'moderate' | 'high';
  glutenFree: boolean;
  lactoseFree: boolean;
  histamineLevel?: 'low' | 'moderate' | 'high';
}

export interface ScanAnalysis {
  result: ScanResult;
  confidence: number;
  flaggedIngredients: {
    ingredient: string;
    reason: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }[];
  safeAlternatives: string[];
  explanation: string;
}

export interface ScanHistory {
  id: string;
  foodItem: FoodItem;
  analysis: ScanAnalysis;
  timestamp: Date;
  userFeedback?: 'accurate' | 'inaccurate';
}

export type OnboardingStep = 
  | 'welcome'
  | 'conditions'
  | 'severity'
  | 'triggers'
  | 'complete';
