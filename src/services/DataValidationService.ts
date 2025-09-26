/**
 * Data Validation Service
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Provides comprehensive data validation and sanitization for the GutSafe application.
 */

import { z } from 'zod';
import { 
  ScanHistory, 
  ScanAnalysis, 
  FoodItem, 
  GutProfile, 
  GutCondition, 
  SeverityLevel,
  GutSymptom,
  MedicationSupplement,
  SafeFood,
  ScanResult,
} from '../types';

// Validation schemas
const GutConditionSchema = z.enum([
  'ibs-fodmap',
  'gluten',
  'lactose',
  'reflux',
  'histamine',
  'allergies',
  'additives'
]);

const SeverityLevelSchema = z.enum(['mild', 'moderate', 'severe']);
const ScanResultSchema = z.enum(['safe', 'caution', 'avoid']);

// Food Item Validation
const FoodItemValidationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Food name is required').max(255, 'Food name too long'),
  barcode: z.string().regex(/^\d{8,14}$/, 'Invalid barcode format').optional(),
  brand: z.string().max(100, 'Brand name too long').optional(),
  category: z.string().max(50, 'Category name too long').optional(),
  ingredients: z.array(z.string().min(1, 'Ingredient cannot be empty')).max(100, 'Too many ingredients'),
  allergens: z.array(z.string().min(1, 'Allergen cannot be empty')).max(20, 'Too many allergens'),
  additives: z.array(z.string().min(1, 'Additive cannot be empty')).max(50, 'Too many additives'),
  nutritionalInfo: z.object({
    calories: z.number().min(0).max(10000).optional(),
    protein: z.number().min(0).max(1000).optional(),
    carbohydrates: z.number().min(0).max(1000).optional(),
    fat: z.number().min(0).max(1000).optional(),
    fiber: z.number().min(0).max(100).optional(),
    sugar: z.number().min(0).max(1000).optional(),
    sodium: z.number().min(0).max(10000).optional(),
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
  dataSource: z.string().min(1, 'Data source is required').max(100, 'Data source too long'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  isVerified: z.boolean().optional(),
  verificationDate: z.date().optional(),
});

// Scan Analysis Validation
const ScanAnalysisValidationSchema = z.object({
  id: z.string().uuid().optional(),
  foodItemId: z.string().uuid(),
  userId: z.string().uuid(),
  overallSafety: ScanResultSchema,
  confidence: z.number().min(0).max(1, 'Confidence must be between 0 and 1'),
  flaggedIngredients: z.array(z.object({
    ingredient: z.string().min(1, 'Ingredient name is required'),
    reason: z.string().min(1, 'Reason is required'),
    severity: SeverityLevelSchema,
    condition: GutConditionSchema,
  })).max(50, 'Too many flagged ingredients'),
  conditionWarnings: z.array(z.object({
    ingredient: z.string().min(1, 'Ingredient name is required'),
    severity: SeverityLevelSchema,
    condition: GutConditionSchema,
  })).max(50, 'Too many condition warnings'),
  safeAlternatives: z.array(z.string().min(1, 'Alternative cannot be empty')).max(20, 'Too many alternatives'),
  explanation: z.string().min(10, 'Explanation too short').max(1000, 'Explanation too long'),
  dataSource: z.string().min(1, 'Data source is required'),
  isUserVerified: z.boolean().optional(),
  userFeedback: z.enum(['accurate', 'inaccurate']).optional(),
});

// Gut Profile Validation
const GutProfileValidationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  conditions: z.record(GutConditionSchema, z.object({
    enabled: z.boolean(),
    severity: SeverityLevelSchema,
    knownTriggers: z.array(z.string().min(1, 'Trigger cannot be empty')).max(50, 'Too many triggers'),
  })),
  preferences: z.object({
    dietaryRestrictions: z.array(z.string().min(1, 'Restriction cannot be empty')).max(20, 'Too many restrictions'),
    preferredAlternatives: z.array(z.string().min(1, 'Alternative cannot be empty')).max(30, 'Too many alternatives'),
  }),
  isActive: z.boolean().optional(),
});

// Gut Symptom Validation
const GutSymptomValidationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  type: z.enum([
    'bloating', 'cramping', 'diarrhea', 'constipation', 'gas', 'nausea',
    'reflux', 'fatigue', 'headache', 'skin_irritation', 'other'
  ]),
  severity: z.number().int().min(1).max(10, 'Severity must be between 1 and 10'),
  description: z.string().max(500, 'Description too long').optional(),
  duration: z.number().int().min(1).max(1440, 'Duration must be between 1 and 1440 minutes'),
  timestamp: z.date(),
  potentialTriggers: z.array(z.string().min(1, 'Trigger cannot be empty')).max(20, 'Too many triggers'),
  location: z.enum([
    'upper_abdomen', 'lower_abdomen', 'full_abdomen', 'chest', 'general'
  ]).optional(),
  relatedFoods: z.array(z.string().uuid()).max(10, 'Too many related foods').optional(),
  weather: z.object({
    temperature: z.number().min(-50).max(60).optional(),
    humidity: z.number().min(0).max(100).optional(),
    pressure: z.number().min(800).max(1100).optional(),
  }).optional(),
  mood: z.number().int().min(1).max(10).optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
});

// Medication Validation
const MedicationValidationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Medication name is required').max(100, 'Name too long'),
  type: z.enum(['medication', 'supplement', 'probiotic', 'enzyme', 'antacid', 'other']),
  dosage: z.string().min(1, 'Dosage is required').max(100, 'Dosage too long'),
  frequency: z.enum(['daily', 'twice_daily', 'as_needed', 'weekly', 'monthly']),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
  notes: z.string().max(500, 'Notes too long').optional(),
  gutRelated: z.boolean(),
  category: z.enum([
    'digestive_aid', 'anti_inflammatory', 'probiotic', 'enzyme_support',
    'acid_control', 'immune_support', 'other'
  ]).optional(),
  sideEffects: z.array(z.string().min(1, 'Side effect cannot be empty')).max(20, 'Too many side effects').optional(),
  effectiveness: z.number().int().min(1).max(10).optional(),
});

// Safe Food Validation
const SafeFoodValidationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  foodItem: FoodItemValidationSchema,
  addedDate: z.date(),
  lastUsed: z.date().optional(),
  usageCount: z.number().int().min(0).max(10000, 'Usage count too high'),
  notes: z.string().max(500, 'Notes too long').optional(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).max(10, 'Too many tags').optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export class DataValidationService {
  private static instance: DataValidationService;

  static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  // Validate Food Item
  validateFoodItem(data: any): { success: boolean; data?: FoodItem; errors?: string[] } {
    try {
      const validatedData = FoodItemValidationSchema.parse(data);
      return { success: true, data: validatedData as FoodItem };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  // Validate Scan Analysis
  validateScanAnalysis(data: any): { success: boolean; data?: ScanAnalysis; errors?: string[] } {
    try {
      const validatedData = ScanAnalysisValidationSchema.parse(data);
      return { success: true, data: validatedData as ScanAnalysis };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  // Validate Gut Profile
  validateGutProfile(data: any): { success: boolean; data?: GutProfile; errors?: string[] } {
    try {
      const validatedData = GutProfileValidationSchema.parse(data);
      return { success: true, data: validatedData as GutProfile };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  // Validate Gut Symptom
  validateGutSymptom(data: any): { success: boolean; data?: GutSymptom; errors?: string[] } {
    try {
      const validatedData = GutSymptomValidationSchema.parse(data);
      return { success: true, data: validatedData as GutSymptom };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  // Validate Medication
  validateMedication(data: any): { success: boolean; data?: MedicationSupplement; errors?: string[] } {
    try {
      const validatedData = MedicationValidationSchema.parse(data);
      return { success: true, data: validatedData as MedicationSupplement };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  // Validate Safe Food
  validateSafeFood(data: any): { success: boolean; data?: SafeFood; errors?: string[] } {
    try {
      const validatedData = SafeFoodValidationSchema.parse(data);
      return { success: true, data: validatedData as SafeFood };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Unknown validation error'] };
    }
  }

  // Sanitize string input
  sanitizeString(input: string, maxLength?: number): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters
    let sanitized = input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();

    // Limit length if specified
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  // Sanitize array of strings
  sanitizeStringArray(input: string[], maxItems?: number): string[] {
    if (!Array.isArray(input)) {
      return [];
    }

    let sanitized = input
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => this.sanitizeString(item, 100));

    // Remove duplicates
    sanitized = [...new Set(sanitized)];

    // Limit items if specified
    if (maxItems && sanitized.length > maxItems) {
      sanitized = sanitized.slice(0, maxItems);
    }

    return sanitized;
  }

  // Validate and sanitize barcode
  validateBarcode(barcode: string): { isValid: boolean; sanitized?: string } {
    if (!barcode || typeof barcode !== 'string') {
      return { isValid: false };
    }

    // Remove non-numeric characters
    const sanitized = barcode.replace(/\D/g, '');

    // Check length (8-14 digits for standard barcodes)
    if (sanitized.length < 8 || sanitized.length > 14) {
      return { isValid: false };
    }

    return { isValid: true, sanitized };
  }

  // Validate email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate date range
  validateDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  // Validate numeric range
  validateNumericRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // Comprehensive validation for scan history
  validateScanHistory(data: any): { success: boolean; data?: ScanHistory; errors?: string[] } {
    const errors: string[] = [];

    // Validate food item
    const foodItemValidation = this.validateFoodItem(data.foodItem);
    if (!foodItemValidation.success) {
      errors.push(...(foodItemValidation.errors || []).map(err => `foodItem.${err}`));
    }

    // Validate analysis
    const analysisValidation = this.validateScanAnalysis(data.analysis);
    if (!analysisValidation.success) {
      errors.push(...(analysisValidation.errors || []).map(err => `analysis.${err}`));
    }

    // Validate timestamp
    if (!data.timestamp || !(data.timestamp instanceof Date)) {
      errors.push('timestamp: Invalid timestamp');
    }

    // Validate user ID
    if (!data.userId || typeof data.userId !== 'string') {
      errors.push('userId: User ID is required');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: data as ScanHistory };
  }

  // Get validation summary
  getValidationSummary(validationResults: Array<{ success: boolean; errors?: string[] }>): {
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    allErrors: string[];
  } {
    const totalValidations = validationResults.length;
    const successfulValidations = validationResults.filter(r => r.success).length;
    const failedValidations = totalValidations - successfulValidations;
    const allErrors = validationResults
      .filter(r => !r.success)
      .flatMap(r => r.errors || []);

    return {
      totalValidations,
      successfulValidations,
      failedValidations,
      allErrors,
    };
  }
}

export default DataValidationService;
