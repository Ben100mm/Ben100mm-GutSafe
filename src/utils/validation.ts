/**
 * @fileoverview validation.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { z } from 'zod';

// Base schemas
export const barcodeSchema = z.string().min(8).max(20).regex(/^\d+$/);
export const emailSchema = z.string().email();
export const dateSchema = z.date();
export const severityLevelSchema = z.enum(['mild', 'moderate', 'severe']);
export const scanResultSchema = z.enum(['safe', 'caution', 'avoid']);
export const gutConditionSchema = z.enum([
  'ibs-fodmap',
  'gluten',
  'lactose',
  'reflux',
  'histamine',
  'allergies',
  'additives'
]);

// Food item validation
export const foodItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  barcode: barcodeSchema.optional(),
  brand: z.string().max(50).optional(),
  category: z.string().max(30).optional(),
  ingredients: z.array(z.string().min(1)).min(1),
  allergens: z.array(z.string().min(1)),
  additives: z.array(z.string().min(1)),
  fodmapLevel: z.enum(['low', 'moderate', 'high']).optional(),
  glutenFree: z.boolean(),
  lactoseFree: z.boolean(),
  histamineLevel: z.enum(['low', 'moderate', 'high']).optional(),
  dataSource: z.string().max(50).optional(),
  isSafeFood: z.boolean().optional(),
});

// Scan analysis validation
export const flaggedIngredientSchema = z.object({
  ingredient: z.string().min(1),
  reason: z.string().min(1),
  severity: severityLevelSchema,
  condition: gutConditionSchema,
});

export const conditionWarningSchema = z.object({
  ingredient: z.string().min(1),
  severity: severityLevelSchema,
  condition: gutConditionSchema,
});

export const scanAnalysisSchema = z.object({
  overallSafety: scanResultSchema,
  flaggedIngredients: z.array(flaggedIngredientSchema),
  conditionWarnings: z.array(conditionWarningSchema),
  safeAlternatives: z.array(z.string().min(1)),
  explanation: z.string().min(1),
  dataSource: z.string().min(1),
  lastUpdated: dateSchema,
});

// Scan history validation
export const scanHistorySchema = z.object({
  id: z.string().min(1),
  foodItem: foodItemSchema,
  analysis: scanAnalysisSchema,
  timestamp: dateSchema,
  userFeedback: z.enum(['accurate', 'inaccurate']).optional(),
});

// Gut profile validation
export const gutProfileSchema = z.object({
  id: z.string().min(1),
  conditions: z.record(gutConditionSchema, z.object({
    enabled: z.boolean(),
    severity: severityLevelSchema,
    knownTriggers: z.array(z.string().min(1)),
  })),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string().min(1)),
    preferredAlternatives: z.array(z.string().min(1)),
  }),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// User settings validation
export const userSettingsSchema = z.object({
  profile: z.object({
    name: z.string().max(50).optional(),
    email: emailSchema.optional(),
    age: z.number().min(1).max(120).optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    gutProfile: gutProfileSchema,
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string().min(2).max(10),
    units: z.enum(['metric', 'imperial']),
    notifications: z.object({
      enabled: z.boolean(),
      mealReminders: z.boolean(),
      newSafeFoods: z.boolean(),
      weeklyReports: z.boolean(),
      scanReminders: z.boolean(),
      quietHours: z.object({
        enabled: z.boolean(),
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      }).optional(),
    }),
    haptics: z.object({
      enabled: z.boolean(),
      intensity: z.enum(['light', 'medium', 'strong']),
    }),
    accessibility: z.object({
      voiceOver: z.boolean(),
      largeText: z.boolean(),
      highContrast: z.boolean(),
      reducedMotion: z.boolean(),
    }),
  }),
  scanning: z.object({
    autoScan: z.boolean(),
    hapticFeedback: z.boolean(),
    soundFeedback: z.boolean(),
    saveToHistory: z.boolean(),
    shareResults: z.boolean(),
  }),
  privacy: z.object({
    dataCollection: z.boolean(),
    analytics: z.boolean(),
    crashReporting: z.boolean(),
    personalizedAds: z.boolean(),
  }),
});

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    throw error;
  }
};

export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Type exports for use in other files
export type ValidatedFoodItem = z.infer<typeof foodItemSchema>;
export type ValidatedScanAnalysis = z.infer<typeof scanAnalysisSchema>;
export type ValidatedScanHistory = z.infer<typeof scanHistorySchema>;
export type ValidatedGutProfile = z.infer<typeof gutProfileSchema>;
export type ValidatedUserSettings = z.infer<typeof userSettingsSchema>;
