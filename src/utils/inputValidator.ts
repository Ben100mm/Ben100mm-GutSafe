/**
 * @fileoverview inputValidator.ts - Comprehensive Input Validation System
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';
import { securityUtils } from './securityUtils';

// Validation rule interface
export interface ValidationRule {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'email'
    | 'uuid'
    | 'url'
    | 'date'
    | 'array'
    | 'object'
    | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  customValidator?: (value: any) => { isValid: boolean; error?: string };
  sanitize?: boolean;
  trim?: boolean;
  transform?: (value: any) => any;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  sanitizedData?: any;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
}

// Input validator class
export class InputValidator {
  private static instance: InputValidator;
  private readonly rules: Map<string, ValidationRule[]> = new Map();
  private readonly customValidators: Map<
    string,
    (value: any) => { isValid: boolean; error?: string }
  > = new Map();

  private constructor() {
    this.initializeDefaultRules();
    this.initializeCustomValidators();
  }

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  private initializeDefaultRules(): void {
    // User registration rules
    this.rules.set('userRegistration', [
      { type: 'email', required: true, sanitize: true, trim: true },
      {
        type: 'string',
        required: true,
        minLength: 8,
        maxLength: 100,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        sanitize: true,
        trim: true,
      },
    ]);

    // User login rules
    this.rules.set('userLogin', [
      { type: 'email', required: true, sanitize: true, trim: true },
      { type: 'string', required: true, minLength: 1, sanitize: false },
    ]);

    // Password reset rules
    this.rules.set('passwordReset', [
      { type: 'email', required: true, sanitize: true, trim: true },
    ]);

    // Gut profile rules
    this.rules.set('gutProfile', [
      { type: 'object', required: true },
      { type: 'object', required: true },
      { type: 'boolean', required: false },
    ]);

    // Food item rules
    this.rules.set('foodItem', [
      {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: false,
        minLength: 8,
        maxLength: 50,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: false,
        maxLength: 100,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: false,
        maxLength: 100,
        sanitize: true,
        trim: true,
      },
      { type: 'array', required: true },
      { type: 'array', required: true },
      { type: 'array', required: true },
      { type: 'object', required: false },
      { type: 'object', required: true },
      {
        type: 'string',
        required: true,
        enum: ['openfoodfacts', 'usda', 'spoonacular', 'manual', 'user'],
      },
    ]);

    // Scan analysis rules
    this.rules.set('scanAnalysis', [
      { type: 'uuid', required: true },
      { type: 'string', required: true, enum: ['safe', 'caution', 'avoid'] },
      { type: 'number', required: true, min: 0, max: 1 },
      { type: 'array', required: true },
      { type: 'array', required: true },
      { type: 'array', required: true },
      {
        type: 'string',
        required: true,
        minLength: 1,
        sanitize: true,
        trim: true,
      },
      { type: 'string', required: true, enum: ['ai', 'manual', 'user', 'api'] },
    ]);

    // Gut symptom rules
    this.rules.set('gutSymptom', [
      {
        type: 'string',
        required: true,
        enum: [
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
        ],
      },
      { type: 'number', required: true, min: 1, max: 10 },
      {
        type: 'string',
        required: false,
        maxLength: 1000,
        sanitize: true,
        trim: true,
      },
      { type: 'number', required: true, min: 1 },
      { type: 'array', required: true },
      {
        type: 'string',
        required: false,
        enum: [
          'upper_abdomen',
          'lower_abdomen',
          'full_abdomen',
          'chest',
          'general',
        ],
      },
      { type: 'array', required: false },
      { type: 'object', required: false },
      { type: 'number', required: false, min: 1, max: 10 },
      { type: 'number', required: false, min: 1, max: 10 },
    ]);

    // Medication rules
    this.rules.set('medication', [
      {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: true,
        enum: [
          'medication',
          'supplement',
          'probiotic',
          'enzyme',
          'antacid',
          'other',
        ],
      },
      {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        sanitize: true,
        trim: true,
      },
      {
        type: 'string',
        required: true,
        enum: ['daily', 'twice_daily', 'as_needed', 'weekly', 'monthly'],
      },
      { type: 'date', required: true },
      { type: 'date', required: false },
      { type: 'boolean', required: true },
      {
        type: 'string',
        required: false,
        maxLength: 1000,
        sanitize: true,
        trim: true,
      },
      { type: 'boolean', required: true },
      {
        type: 'string',
        required: false,
        enum: [
          'digestive_aid',
          'anti_inflammatory',
          'probiotic',
          'enzyme_support',
          'acid_control',
          'immune_support',
          'other',
        ],
      },
      { type: 'array', required: false },
      { type: 'number', required: false, min: 1, max: 10 },
    ]);

    // Safe food rules
    this.rules.set('safeFood', [
      { type: 'uuid', required: true },
      {
        type: 'string',
        required: false,
        maxLength: 1000,
        sanitize: true,
        trim: true,
      },
      { type: 'boolean', required: false },
      { type: 'array', required: false },
      { type: 'number', required: false, min: 1, max: 5 },
    ]);

    // Analytics data rules
    this.rules.set('analyticsData', [
      { type: 'date', required: true },
      { type: 'number', required: true, min: 0 },
      { type: 'number', required: true, min: 0 },
      { type: 'number', required: true, min: 0 },
      { type: 'number', required: true, min: 0 },
      { type: 'number', required: true, min: 0 },
      { type: 'number', required: false, min: 1, max: 10 },
      { type: 'number', required: false, min: 1, max: 10 },
      { type: 'number', required: false, min: 1, max: 10 },
      { type: 'number', required: false, min: 1, max: 10 },
      { type: 'number', required: false, min: 0 },
      { type: 'number', required: false, min: 0 },
      { type: 'object', required: false },
    ]);
  }

  private initializeCustomValidators(): void {
    // Password strength validator
    this.customValidators.set('passwordStrength', (value: string) => {
      const validation = securityUtils.validateInput(value, 'password');
      return {
        isValid: validation.isValid,
        error: validation.errors.join(', '),
      };
    });

    // Barcode validator
    this.customValidators.set('barcode', (value: string) => {
      if (!value) {
        return { isValid: true };
      }

      const barcodeRegex = /^[0-9]{8,14}$/;
      const isValid = barcodeRegex.test(value);

      return {
        isValid,
        error: isValid ? '' : 'Invalid barcode format',
      };
    });

    // URL validator
    this.customValidators.set('url', (value: string) => {
      if (!value) {
        return { isValid: true };
      }

      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return {
          isValid: false,
          error: 'Invalid URL format',
        };
      }
    });

    // Date validator
    this.customValidators.set('date', (value: any) => {
      if (!value) {
        return { isValid: true };
      }

      const date = new Date(value);
      const isValid = !isNaN(date.getTime());

      return {
        isValid,
        error: isValid ? '' : 'Invalid date format',
      };
    });

    // Array validator
    this.customValidators.set('array', (value: any) => {
      const isValid = Array.isArray(value);

      return {
        isValid,
        error: isValid ? undefined : 'Value must be an array',
      };
    });

    // Object validator
    this.customValidators.set('object', (value: any) => {
      const isValid =
        typeof value === 'object' && value !== null && !Array.isArray(value);

      return {
        isValid,
        error: isValid ? undefined : 'Value must be an object',
      };
    });
  }

  // Validate data against rules
  validate(
    data: any,
    ruleSet: string,
    fieldNames?: string[]
  ): ValidationResult {
    const rules = this.rules.get(ruleSet);

    if (!rules) {
      return {
        isValid: false,
        errors: [`Unknown validation rule set: ${ruleSet}`],
        warnings: [],
        fieldErrors: {},
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors: Record<string, string[]> = {};
    const sanitizedData: any = {};

    // Convert data to array if it's not already
    const dataArray = Array.isArray(data) ? data : [data];
    const names = fieldNames || Object.keys(dataArray[0] || {});

    // Validate each field
    names.forEach((fieldName, index) => {
      const rule = rules[index];
      const value = dataArray[index];

      if (!rule) {
        return;
      }

      const fieldResult = this.validateField(value, rule, fieldName);

      if (!fieldResult.isValid) {
        errors.push(...fieldResult.errors);
        fieldErrors[fieldName] = fieldResult.errors;
      }

      if (fieldResult.warnings.length > 0) {
        warnings.push(...fieldResult.warnings);
      }

      sanitizedData[fieldName] = fieldResult.sanitized;
    });

    return {
      isValid: errors.length === 0,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
      errors,
      warnings,
      fieldErrors,
    };
  }

  // Validate single field
  private validateField(
    value: any,
    rule: ValidationRule,
    fieldName: string
  ): {
    isValid: boolean;
    sanitized: any;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = value;

    // Check if required
    if (
      rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, sanitized, errors, warnings };
    }

    // Skip validation if value is empty and not required
    if (
      !rule.required &&
      (value === undefined || value === null || value === '')
    ) {
      return { isValid: true, sanitized, errors, warnings };
    }

    // Apply transformations
    if (rule.transform) {
      try {
        sanitized = rule.transform(sanitized);
      } catch (error) {
        errors.push(`${fieldName} transformation failed: ${error}`);
        return { isValid: false, sanitized, errors, warnings };
      }
    }

    // Trim if specified
    if (rule.trim && typeof sanitized === 'string') {
      sanitized = sanitized.trim();
    }

    // Sanitize if specified
    if (rule.sanitize && typeof sanitized === 'string') {
      sanitized = securityUtils.sanitizeInput(sanitized);
    }

    // Type validation
    const typeValidation = this.validateType(sanitized, rule, fieldName);
    if (!typeValidation.isValid) {
      errors.push(...typeValidation.errors);
      return { isValid: false, sanitized, errors, warnings };
    }

    // Length validation for strings
    if (rule.type === 'string' && typeof sanitized === 'string') {
      if (rule.minLength !== undefined && sanitized.length < rule.minLength) {
        errors.push(
          `${fieldName} must be at least ${rule.minLength} characters long`
        );
      }
      if (rule.maxLength !== undefined && sanitized.length > rule.maxLength) {
        errors.push(
          `${fieldName} must be no more than ${rule.maxLength} characters long`
        );
      }
    }

    // Range validation for numbers
    if (rule.type === 'number' && typeof sanitized === 'number') {
      if (rule.min !== undefined && sanitized < rule.min) {
        errors.push(`${fieldName} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && sanitized > rule.max) {
        errors.push(`${fieldName} must be no more than ${rule.max}`);
      }
    }

    // Pattern validation
    if (rule.pattern && typeof sanitized === 'string') {
      if (!rule.pattern.test(sanitized)) {
        errors.push(`${fieldName} format is invalid`);
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(sanitized)) {
      errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
    }

    // Custom validation
    if (rule.customValidator) {
      const customResult = rule.customValidator(sanitized);
      if (!customResult.isValid) {
        errors.push(customResult.error || `${fieldName} validation failed`);
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors,
      warnings,
    };
  }

  // Validate type
  private validateType(
    value: any,
    rule: ValidationRule,
    fieldName: string
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${fieldName} must be a string`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${fieldName} must be a number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${fieldName} must be a boolean`);
        }
        break;

      case 'email':
        if (
          typeof value !== 'string' ||
          !securityUtils.validateInput(value, 'email').isValid
        ) {
          errors.push(`${fieldName} must be a valid email address`);
        }
        break;

      case 'uuid':
        if (
          typeof value !== 'string' ||
          !securityUtils.validateInput(value, 'uuid').isValid
        ) {
          errors.push(`${fieldName} must be a valid UUID`);
        }
        break;

      case 'url':
        const urlValidator = this.customValidators.get('url');
        if (urlValidator && !urlValidator(value).isValid) {
          errors.push(`${fieldName} must be a valid URL`);
        }
        break;

      case 'date':
        const dateValidator = this.customValidators.get('date');
        if (dateValidator && !dateValidator(value).isValid) {
          errors.push(`${fieldName} must be a valid date`);
        }
        break;

      case 'array':
        const arrayValidator = this.customValidators.get('array');
        if (arrayValidator && !arrayValidator(value).isValid) {
          errors.push(`${fieldName} must be an array`);
        }
        break;

      case 'object':
        const objectValidator = this.customValidators.get('object');
        if (objectValidator && !objectValidator(value).isValid) {
          errors.push(`${fieldName} must be an object`);
        }
        break;

      case 'custom':
        // Custom validation will be handled by customValidator
        break;

      default:
        errors.push(`Unknown validation type: ${rule.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Add custom validator
  addCustomValidator(
    name: string,
    validator: (value: any) => { isValid: boolean; error?: string }
  ): void {
    this.customValidators.set(name, validator);
    logger.info('Custom validator added', 'InputValidator', { name });
  }

  // Add validation rule set
  addRuleSet(name: string, rules: ValidationRule[]): void {
    this.rules.set(name, rules);
    logger.info('Validation rule set added', 'InputValidator', {
      name,
      ruleCount: rules.length,
    });
  }

  // Get validation rule set
  getRuleSet(name: string): ValidationRule[] | null {
    return this.rules.get(name) || null;
  }

  // List all rule sets
  listRuleSets(): string[] {
    return Array.from(this.rules.keys());
  }

  // Validate request body
  validateRequestBody(req: any, ruleSet: string): ValidationResult {
    const data = req.body;
    const fieldNames = Object.keys(data || {});
    return this.validate(data, ruleSet, fieldNames);
  }

  // Validate query parameters
  validateQueryParams(req: any, ruleSet: string): ValidationResult {
    const data = req.query;
    const fieldNames = Object.keys(data || {});
    return this.validate(data, ruleSet, fieldNames);
  }

  // Validate URL parameters
  validateUrlParams(req: any, ruleSet: string): ValidationResult {
    const data = req.params;
    const fieldNames = Object.keys(data || {});
    return this.validate(data, ruleSet, fieldNames);
  }
}

// Export singleton instance
export const inputValidator = InputValidator.getInstance();
export default inputValidator;
