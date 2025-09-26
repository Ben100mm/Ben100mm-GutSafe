/**
 * Database Schema Definition
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Defines the database schema for the GutSafe application.
 */

import { z } from 'zod';

// Base schemas for validation
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GutConditionSchema = z.enum([
  'ibs-fodmap',
  'gluten',
  'lactose',
  'reflux',
  'histamine',
  'allergies',
  'additives'
]);

export const SeverityLevelSchema = z.enum(['mild', 'moderate', 'severe']);
export const ScanResultSchema = z.enum(['safe', 'caution', 'avoid']);

// User Profile Schema
export const UserProfileSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()),
    preferredAlternatives: z.array(z.string()),
    notifications: z.object({
      scanReminders: z.boolean(),
      symptomAlerts: z.boolean(),
      medicationReminders: z.boolean(),
    }),
  }),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().default('en'),
    units: z.enum(['metric', 'imperial']),
    privacy: z.object({
      dataSharing: z.boolean(),
      analytics: z.boolean(),
      crashReporting: z.boolean(),
    }),
  }),
});

// Gut Profile Schema
export const GutProfileSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  conditions: z.record(GutConditionSchema, z.object({
    enabled: z.boolean(),
    severity: SeverityLevelSchema,
    knownTriggers: z.array(z.string()),
    lastUpdated: z.date(),
  })),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string()),
    preferredAlternatives: z.array(z.string()),
  }),
  isActive: z.boolean().default(true),
});

// Food Item Schema
export const FoodItemSchema = BaseEntitySchema.extend({
  name: z.string().min(1),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  ingredients: z.array(z.string()),
  allergens: z.array(z.string()),
  additives: z.array(z.string()),
  nutritionalInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbohydrates: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    sodium: z.number().optional(),
  }).optional(),
  gutHealthInfo: z.object({
    glutenFree: z.boolean(),
    lactoseFree: z.boolean(),
    fodmapLevel: z.enum(['low', 'moderate', 'high']).optional(),
    histamineLevel: z.enum(['low', 'moderate', 'high']).optional(),
    vegan: z.boolean().optional(),
    vegetarian: z.boolean().optional(),
    organic: z.boolean().optional(),
  }),
  dataSource: z.string(),
  imageUrl: z.string().url().optional(),
  isVerified: z.boolean().default(false),
  verificationDate: z.date().optional(),
});

// Scan Analysis Schema
export const ScanAnalysisSchema = BaseEntitySchema.extend({
  foodItemId: z.string().uuid(),
  userId: z.string().uuid(),
  overallSafety: ScanResultSchema,
  confidence: z.number().min(0).max(1),
  flaggedIngredients: z.array(z.object({
    ingredient: z.string(),
    reason: z.string(),
    severity: SeverityLevelSchema,
    condition: GutConditionSchema,
  })),
  conditionWarnings: z.array(z.object({
    ingredient: z.string(),
    severity: SeverityLevelSchema,
    condition: GutConditionSchema,
  })),
  safeAlternatives: z.array(z.string()),
  explanation: z.string(),
  dataSource: z.string(),
  isUserVerified: z.boolean().default(false),
  userFeedback: z.enum(['accurate', 'inaccurate']).optional(),
});

// Scan History Schema
export const ScanHistorySchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  foodItemId: z.string().uuid(),
  analysisId: z.string().uuid(),
  timestamp: z.date(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  deviceInfo: z.object({
    platform: z.string(),
    version: z.string(),
    model: z.string().optional(),
  }).optional(),
  isOffline: z.boolean().default(false),
});

// Gut Symptom Schema
export const GutSymptomSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  type: z.enum([
    'bloating', 'cramping', 'diarrhea', 'constipation', 'gas', 'nausea',
    'reflux', 'fatigue', 'headache', 'skin_irritation', 'other'
  ]),
  severity: z.number().min(1).max(10),
  description: z.string().optional(),
  duration: z.number(), // minutes
  timestamp: z.date(),
  potentialTriggers: z.array(z.string()),
  location: z.enum([
    'upper_abdomen', 'lower_abdomen', 'full_abdomen', 'chest', 'general'
  ]).optional(),
  relatedFoods: z.array(z.string().uuid()).optional(),
  weather: z.object({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    pressure: z.number().optional(),
  }).optional(),
  mood: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
});

// Medication/Supplement Schema
export const MedicationSupplementSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['medication', 'supplement', 'probiotic', 'enzyme', 'antacid', 'other']),
  dosage: z.string(),
  frequency: z.enum(['daily', 'twice_daily', 'as_needed', 'weekly', 'monthly']),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
  notes: z.string().optional(),
  gutRelated: z.boolean(),
  category: z.enum([
    'digestive_aid', 'anti_inflammatory', 'probiotic', 'enzyme_support',
    'acid_control', 'immune_support', 'other'
  ]).optional(),
  sideEffects: z.array(z.string()).optional(),
  effectiveness: z.number().min(1).max(10).optional(),
});

// Safe Food Schema
export const SafeFoodSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  foodItemId: z.string().uuid(),
  addedDate: z.date(),
  lastUsed: z.date().optional(),
  usageCount: z.number().default(0),
  notes: z.string().optional(),
  isFavorite: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
});

// Analytics Data Schema
export const AnalyticsDataSchema = BaseEntitySchema.extend({
  userId: z.string().uuid(),
  date: z.date(),
  totalScans: z.number(),
  safeScans: z.number(),
  cautionScans: z.number(),
  avoidScans: z.number(),
  symptomsReported: z.number(),
  energyLevel: z.number().min(1).max(10).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  mood: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  waterIntake: z.number().optional(), // liters
  exerciseMinutes: z.number().optional(),
  weather: z.object({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    pressure: z.number().optional(),
  }).optional(),
});

// Food Trend Schema
export const FoodTrendSchema = BaseEntitySchema.extend({
  foodName: z.string(),
  totalScans: z.number(),
  safeCount: z.number(),
  cautionCount: z.number(),
  avoidCount: z.number(),
  lastScanned: z.date(),
  trend: z.enum(['improving', 'stable', 'declining']),
  confidence: z.number().min(0).max(1),
  category: z.string().optional(),
  brand: z.string().optional(),
});

// Ingredient Analysis Schema
export const IngredientAnalysisSchema = BaseEntitySchema.extend({
  ingredient: z.string(),
  isProblematic: z.boolean(),
  isHidden: z.boolean(),
  detectedTriggers: z.array(z.object({
    trigger: z.string(),
    condition: GutConditionSchema,
    severity: SeverityLevelSchema,
  })),
  confidence: z.number().min(0).max(1),
  category: z.string(),
  riskLevel: z.enum(['low', 'moderate', 'high', 'severe']),
  recommendations: z.object({
    avoid: z.boolean(),
    caution: z.boolean(),
    alternatives: z.array(z.string()),
    modifications: z.array(z.string()),
  }),
  lastAnalyzed: z.date(),
  dataSource: z.string(),
});

// Database Indexes
export const DatabaseIndexes = {
  // User indexes
  user_profiles_user_id: 'user_profiles_user_id_idx',
  gut_profiles_user_id: 'gut_profiles_user_id_idx',
  
  // Food indexes
  food_items_barcode: 'food_items_barcode_idx',
  food_items_name: 'food_items_name_idx',
  food_items_category: 'food_items_category_idx',
  food_items_brand: 'food_items_brand_idx',
  
  // Scan indexes
  scan_history_user_id: 'scan_history_user_id_idx',
  scan_history_timestamp: 'scan_history_timestamp_idx',
  scan_history_food_item_id: 'scan_history_food_item_id_idx',
  scan_analysis_user_id: 'scan_analysis_user_id_idx',
  scan_analysis_food_item_id: 'scan_analysis_food_item_id_idx',
  
  // Symptom indexes
  gut_symptoms_user_id: 'gut_symptoms_user_id_idx',
  gut_symptoms_timestamp: 'gut_symptoms_timestamp_idx',
  gut_symptoms_type: 'gut_symptoms_type_idx',
  
  // Medication indexes
  medications_user_id: 'medications_user_id_idx',
  medications_active: 'medications_active_idx',
  medications_type: 'medications_type_idx',
  
  // Safe food indexes
  safe_foods_user_id: 'safe_foods_user_id_idx',
  safe_foods_food_item_id: 'safe_foods_food_item_id_idx',
  safe_foods_usage_count: 'safe_foods_usage_count_idx',
  
  // Analytics indexes
  analytics_user_id: 'analytics_user_id_idx',
  analytics_date: 'analytics_date_idx',
  
  // Trend indexes
  food_trends_food_name: 'food_trends_food_name_idx',
  food_trends_trend: 'food_trends_trend_idx',
  
  // Ingredient analysis indexes
  ingredient_analysis_ingredient: 'ingredient_analysis_ingredient_idx',
  ingredient_analysis_risk_level: 'ingredient_analysis_risk_level_idx',
};

// Database constraints
export const DatabaseConstraints = {
  // Foreign key constraints
  gut_profiles_user_id_fk: 'gut_profiles_user_id_fk',
  scan_history_user_id_fk: 'scan_history_user_id_fk',
  scan_history_food_item_id_fk: 'scan_history_food_item_id_fk',
  scan_history_analysis_id_fk: 'scan_history_analysis_id_fk',
  scan_analysis_food_item_id_fk: 'scan_analysis_food_item_id_fk',
  gut_symptoms_user_id_fk: 'gut_symptoms_user_id_fk',
  medications_user_id_fk: 'medications_user_id_fk',
  safe_foods_user_id_fk: 'safe_foods_user_id_fk',
  safe_foods_food_item_id_fk: 'safe_foods_food_item_id_fk',
  analytics_user_id_fk: 'analytics_user_id_fk',
  
  // Unique constraints
  user_profiles_user_id_unique: 'user_profiles_user_id_unique',
  gut_profiles_user_id_unique: 'gut_profiles_user_id_unique',
  food_items_barcode_unique: 'food_items_barcode_unique',
  analytics_user_date_unique: 'analytics_user_date_unique',
};

// Export types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type GutProfile = z.infer<typeof GutProfileSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type ScanAnalysis = z.infer<typeof ScanAnalysisSchema>;
export type ScanHistory = z.infer<typeof ScanHistorySchema>;
export type GutSymptom = z.infer<typeof GutSymptomSchema>;
export type MedicationSupplement = z.infer<typeof MedicationSupplementSchema>;
export type SafeFood = z.infer<typeof SafeFoodSchema>;
export type AnalyticsData = z.infer<typeof AnalyticsDataSchema>;
export type FoodTrend = z.infer<typeof FoodTrendSchema>;
export type IngredientAnalysis = z.infer<typeof IngredientAnalysisSchema>;
