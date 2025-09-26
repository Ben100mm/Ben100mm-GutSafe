/**
 * @fileoverview validation.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { z } from 'zod';

import type { AppError } from '../types/comprehensive';
import { ValidationError } from '../types/comprehensive';

// ===== VALIDATION SCHEMAS =====

// Base validation schemas
export const dateSchema = z.date();
export const stringSchema = z.string();
export const numberSchema = z.number();
export const booleanSchema = z.boolean();
export const uuidSchema = z.string().uuid();

// User Settings Schemas
export const quietHoursSchema = z.object({
  enabled: booleanSchema,
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const notificationPreferencesSchema = z.object({
  enabled: booleanSchema,
  mealReminders: booleanSchema,
  newSafeFoods: booleanSchema,
  weeklyReports: booleanSchema,
  scanReminders: booleanSchema,
  quietHours: quietHoursSchema.optional(),
});

export const hapticPreferencesSchema = z.object({
  enabled: booleanSchema,
  intensity: z.enum(['light', 'medium', 'strong']),
});

export const accessibilityPreferencesSchema = z.object({
  voiceOver: booleanSchema,
  largeText: booleanSchema,
  highContrast: booleanSchema,
  reducedMotion: booleanSchema,
});

export const privacySettingsSchema = z.object({
  dataSharing: booleanSchema,
  analytics: booleanSchema,
  crashReporting: booleanSchema,
  personalizedAds: booleanSchema,
});

export const syncSettingsSchema = z.object({
  enabled: booleanSchema,
  frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']),
  lastSync: dateSchema.optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: stringSchema,
  units: z.enum(['metric', 'imperial']),
  notifications: notificationPreferencesSchema,
  haptics: hapticPreferencesSchema,
  accessibility: accessibilityPreferencesSchema,
});

export const userProfileSchema = z.object({
  name: stringSchema.optional(),
  email: z.string().email().optional(),
  age: z.number().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  gutProfile: z.any(), // Will be validated separately
});

export const userSettingsSchema = z.object({
  profile: userProfileSchema,
  preferences: userPreferencesSchema,
  privacy: privacySettingsSchema,
  sync: syncSettingsSchema,
});

// Food Service Schemas
export const nutritionFactsSchema = z.object({
  calories: numberSchema.optional(),
  fat: numberSchema.optional(),
  saturatedFat: numberSchema.optional(),
  carbs: numberSchema.optional(),
  sugars: numberSchema.optional(),
  fiber: numberSchema.optional(),
  protein: numberSchema.optional(),
  salt: numberSchema.optional(),
  sodium: numberSchema.optional(),
  cholesterol: numberSchema.optional(),
  potassium: numberSchema.optional(),
  calcium: numberSchema.optional(),
  iron: numberSchema.optional(),
  vitaminA: numberSchema.optional(),
  vitaminC: numberSchema.optional(),
  vitaminD: numberSchema.optional(),
  vitaminE: numberSchema.optional(),
  vitaminK: numberSchema.optional(),
  thiamine: numberSchema.optional(),
  riboflavin: numberSchema.optional(),
  niacin: numberSchema.optional(),
  vitaminB6: numberSchema.optional(),
  folate: numberSchema.optional(),
  vitaminB12: numberSchema.optional(),
  biotin: numberSchema.optional(),
  pantothenicAcid: numberSchema.optional(),
  phosphorus: numberSchema.optional(),
  iodine: numberSchema.optional(),
  magnesium: numberSchema.optional(),
  zinc: numberSchema.optional(),
  selenium: numberSchema.optional(),
  copper: numberSchema.optional(),
  manganese: numberSchema.optional(),
  chromium: numberSchema.optional(),
  molybdenum: numberSchema.optional(),
});

export const foodItemSchema = z.object({
  id: uuidSchema,
  name: stringSchema,
  brand: stringSchema.optional(),
  category: stringSchema.optional(),
  ingredients: stringSchema,
  barcode: stringSchema.optional(),
  imageUrl: z.string().url().optional(),
  nutritionFacts: nutritionFactsSchema.optional(),
  allergens: z.array(stringSchema),
  additives: z.array(stringSchema),
  source: stringSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const foodSearchResultSchema = z.object({
  items: z.array(foodItemSchema),
  totalCount: numberSchema,
  hasMore: booleanSchema,
  nextOffset: numberSchema.optional(),
});

// Health Service Schemas
export const gutSymptomSchema = z.object({
  id: uuidSchema,
  type: z.enum([
    'bloating',
    'cramping',
    'diarrhea',
    'constipation',
    'gas',
    'nausea',
    'reflux',
    'fatigue',
    'headache',
    'skin_irritation',
    'other',
  ]),
  severity: z.number().min(1).max(10),
  description: stringSchema.optional(),
  duration: numberSchema,
  timestamp: dateSchema,
  potentialTriggers: z.array(stringSchema).optional(),
  location: z
    .enum([
      'upper_abdomen',
      'lower_abdomen',
      'full_abdomen',
      'chest',
      'general',
    ])
    .optional(),
});

export const medicationSupplementSchema = z.object({
  id: uuidSchema,
  name: stringSchema,
  type: z.enum([
    'medication',
    'supplement',
    'probiotic',
    'enzyme',
    'antacid',
    'other',
  ]),
  dosage: stringSchema,
  frequency: z.enum(['daily', 'twice_daily', 'as_needed', 'weekly', 'monthly']),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  isActive: booleanSchema,
  notes: stringSchema.optional(),
  gutRelated: booleanSchema,
  category: z
    .enum([
      'digestive_aid',
      'anti_inflammatory',
      'probiotic',
      'enzyme_support',
      'acid_control',
      'immune_support',
      'other',
    ])
    .optional(),
});

export const symptomLogSchema = z.object({
  id: uuidSchema,
  symptoms: z.array(gutSymptomSchema),
  foodItems: z.array(stringSchema),
  timestamp: dateSchema,
  notes: stringSchema.optional(),
  weather: stringSchema.optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  exerciseLevel: z.enum(['none', 'light', 'moderate', 'intense']).optional(),
  medicationTaken: z.array(stringSchema).optional(),
  tags: z.array(stringSchema).optional(),
});

export const medicationLogSchema = z.object({
  id: uuidSchema,
  medication: medicationSupplementSchema,
  takenAt: dateSchema,
  dosage: stringSchema,
  notes: stringSchema.optional(),
  sideEffects: z.array(stringSchema).optional(),
  effectiveness: z.number().min(1).max(10).optional(),
});

// Network Service Schemas
export const notificationSettingsSchema = z.object({
  mealReminders: booleanSchema,
  newSafeFoods: booleanSchema,
  scanReminders: booleanSchema,
  weeklyReports: booleanSchema,
  quietHours: quietHoursSchema,
});

export const scheduledNotificationSchema = z.object({
  id: uuidSchema,
  title: stringSchema,
  body: stringSchema,
  scheduledFor: dateSchema,
  type: z.enum([
    'meal_reminder',
    'scan_reminder',
    'weekly_report',
    'safe_food_alert',
  ]),
  data: z.record(z.unknown()).optional(),
});

// Storage Service Schemas
export const cacheEntrySchema = z.object({
  data: z.unknown(),
  timestamp: numberSchema,
  lastAccessed: numberSchema,
  expiresAt: numberSchema.optional(),
});

export const syncQueueItemSchema = z.object({
  key: stringSchema,
  data: z.unknown(),
  timestamp: numberSchema,
  retryCount: numberSchema,
  maxRetries: numberSchema,
});

// ===== VALIDATION FUNCTIONS =====

export class ValidationError extends Error {
  constructor(
    public field: string,
    public value: unknown,
    public expected: string,
    public details?: Record<string, unknown>
  ) {
    super(
      `Validation failed for field '${field}': expected ${expected}, got ${typeof value}`
    );
    this.name = 'ValidationError';
  }
}

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        firstError.path.join('.'),
        firstError.input,
        firstError.message,
        { zodError: error.errors }
      );
    }
    throw error;
  }
}

export function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  return schema.parseAsync(data);
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: ValidationError } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: new ValidationError(
          firstError.path.join('.'),
          firstError.input,
          firstError.message,
          { zodError: error.errors }
        ),
      };
    }
    throw error;
  }
}

// ===== TYPE GUARDS =====

export function isValidUserSettings(
  data: unknown
): data is import('../types/comprehensive').UserSettings {
  return safeValidate(userSettingsSchema, data).success;
}

export function isValidFoodItem(
  data: unknown
): data is import('../types/comprehensive').FoodItem {
  return safeValidate(foodItemSchema, data).success;
}

export function isValidSymptomLog(
  data: unknown
): data is import('../types/comprehensive').SymptomLog {
  return safeValidate(symptomLogSchema, data).success;
}

export function isValidMedicationLog(
  data: unknown
): data is import('../types/comprehensive').MedicationLog {
  return safeValidate(medicationLogSchema, data).success;
}

export function isValidNotificationSettings(
  data: unknown
): data is import('../types/comprehensive').NotificationSettings {
  return safeValidate(notificationSettingsSchema, data).success;
}

// ===== RUNTIME VALIDATION DECORATORS =====

export function validateInput<T>(schema: z.ZodSchema<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Validate the first argument (assuming it's the input)
      if (args.length > 0) {
        try {
          args[0] = validate(schema, args[0]);
        } catch (error) {
          throw new ValidationError('input', args[0], 'valid input data', {
            method: propertyKey,
            error,
          });
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export function validateOutput<T>(schema: z.ZodSchema<T>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      try {
        return validate(schema, result);
      } catch (error) {
        throw new ValidationError('output', result, 'valid output data', {
          method: propertyKey,
          error,
        });
      }
    };

    return descriptor;
  };
}

// ===== VALIDATION UTILITIES =====

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validate(schema, data),
    validateAsync: (data: unknown) => validateAsync(schema, data),
    safeValidate: (data: unknown) => safeValidate(schema, data),
    isValid: (data: unknown): data is T => safeValidate(schema, data).success,
  };
}

export function validateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  return data.map((item, index) => {
    try {
      return validate(schema, item);
    } catch (error) {
      throw new ValidationError(`[${index}]`, item, 'valid array item', {
        arrayIndex: index,
        error,
      });
    }
  });
}

export function validateOptional<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | undefined {
  if (data === undefined || data === null) {
    return undefined;
  }
  return validate(schema, data);
}

// ===== ERROR HANDLING =====

export function handleValidationError(error: unknown): AppError {
  if (error instanceof ValidationError) {
    return {
      code: 'VALIDATION_ERROR',
      message: error.message,
      details: {
        field: error.field,
        value: error.value,
        expected: error.expected,
        ...error.details,
      },
      timestamp: new Date(),
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: { stack: error.stack },
      timestamp: new Date(),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    details: { error },
    timestamp: new Date(),
  };
}

// ===== EXPORTED VALIDATORS =====

export const validators = {
  userSettings: createValidator(userSettingsSchema),
  foodItem: createValidator(foodItemSchema),
  symptomLog: createValidator(symptomLogSchema),
  medicationLog: createValidator(medicationLogSchema),
  notificationSettings: createValidator(notificationSettingsSchema),
  scheduledNotification: createValidator(scheduledNotificationSchema),
  cacheEntry: createValidator(cacheEntrySchema),
  syncQueueItem: createValidator(syncQueueItemSchema),
} as const;
