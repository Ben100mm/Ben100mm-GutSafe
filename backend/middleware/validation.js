/**
 * Validation Middleware
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { body, param, query, validationResult } = require('express-validator');
const { validationErrorHandler } = require('./errorHandler');

/**
 * Handle validation results
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorResponse = validationErrorHandler(errors);
    return res.status(400).json({
      ...errorResponse,
      requestId: req.id,
    });
  }
  
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  validateRequest,
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];

/**
 * Password reset request validation
 */
const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  validateRequest,
];

/**
 * Password reset validation
 */
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  validateRequest,
];

/**
 * Email verification validation
 */
const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  validateRequest,
];

/**
 * User profile update validation
 */
const validateUserProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  validateRequest,
];

/**
 * Gut profile validation
 */
const validateGutProfile = [
  body('conditions')
    .isObject()
    .withMessage('Conditions must be an object'),
  body('preferences')
    .isObject()
    .withMessage('Preferences must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validateRequest,
];

/**
 * Food item validation
 */
const validateFoodItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Food name is required and must be less than 255 characters'),
  body('barcode')
    .optional()
    .isLength({ min: 8, max: 50 })
    .withMessage('Barcode must be between 8 and 50 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must be less than 100 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  body('ingredients')
    .isArray()
    .withMessage('Ingredients must be an array'),
  body('allergens')
    .isArray()
    .withMessage('Allergens must be an array'),
  body('additives')
    .isArray()
    .withMessage('Additives must be an array'),
  body('nutritionalInfo')
    .optional()
    .isObject()
    .withMessage('Nutritional info must be an object'),
  body('gutHealthInfo')
    .isObject()
    .withMessage('Gut health info must be an object'),
  body('dataSource')
    .isIn(['openfoodfacts', 'usda', 'spoonacular', 'manual', 'user'])
    .withMessage('Invalid data source'),
  validateRequest,
];

/**
 * Scan analysis validation
 */
const validateScanAnalysis = [
  body('foodItemId')
    .isUUID()
    .withMessage('Food item ID must be a valid UUID'),
  body('overallSafety')
    .isIn(['safe', 'caution', 'avoid'])
    .withMessage('Overall safety must be safe, caution, or avoid'),
  body('confidence')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  body('flaggedIngredients')
    .isArray()
    .withMessage('Flagged ingredients must be an array'),
  body('conditionWarnings')
    .isArray()
    .withMessage('Condition warnings must be an array'),
  body('safeAlternatives')
    .isArray()
    .withMessage('Safe alternatives must be an array'),
  body('explanation')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Explanation is required'),
  body('dataSource')
    .isIn(['ai', 'manual', 'user', 'api'])
    .withMessage('Invalid data source'),
  validateRequest,
];

/**
 * Gut symptom validation
 */
const validateGutSymptom = [
  body('type')
    .isIn(['bloating', 'cramping', 'diarrhea', 'constipation', 'gas', 'nausea', 'reflux', 'fatigue', 'headache', 'skin_irritation', 'other'])
    .withMessage('Invalid symptom type'),
  body('severity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Severity must be between 1 and 10'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (minutes)'),
  body('potentialTriggers')
    .isArray()
    .withMessage('Potential triggers must be an array'),
  body('location')
    .optional()
    .isIn(['upper_abdomen', 'lower_abdomen', 'full_abdomen', 'chest', 'general'])
    .withMessage('Invalid location'),
  body('relatedFoods')
    .optional()
    .isArray()
    .withMessage('Related foods must be an array'),
  body('weather')
    .optional()
    .isObject()
    .withMessage('Weather must be an object'),
  body('mood')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood must be between 1 and 10'),
  body('stressLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  validateRequest,
];

/**
 * Medication validation
 */
const validateMedication = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Medication name is required and must be less than 255 characters'),
  body('type')
    .isIn(['medication', 'supplement', 'probiotic', 'enzyme', 'antacid', 'other'])
    .withMessage('Invalid medication type'),
  body('dosage')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Dosage is required and must be less than 100 characters'),
  body('frequency')
    .isIn(['daily', 'twice_daily', 'as_needed', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('gutRelated')
    .isBoolean()
    .withMessage('gutRelated must be a boolean'),
  body('category')
    .optional()
    .isIn(['digestive_aid', 'anti_inflammatory', 'probiotic', 'enzyme_support', 'acid_control', 'immune_support', 'other'])
    .withMessage('Invalid category'),
  body('sideEffects')
    .optional()
    .isArray()
    .withMessage('Side effects must be an array'),
  body('effectiveness')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Effectiveness must be between 1 and 10'),
  validateRequest,
];

/**
 * Safe food validation
 */
const validateSafeFood = [
  body('foodItemId')
    .isUUID()
    .withMessage('Food item ID must be a valid UUID'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  validateRequest,
];

/**
 * Analytics data validation
 */
const validateAnalyticsData = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('totalScans')
    .isInt({ min: 0 })
    .withMessage('Total scans must be a non-negative integer'),
  body('safeScans')
    .isInt({ min: 0 })
    .withMessage('Safe scans must be a non-negative integer'),
  body('cautionScans')
    .isInt({ min: 0 })
    .withMessage('Caution scans must be a non-negative integer'),
  body('avoidScans')
    .isInt({ min: 0 })
    .withMessage('Avoid scans must be a non-negative integer'),
  body('symptomsReported')
    .isInt({ min: 0 })
    .withMessage('Symptoms reported must be a non-negative integer'),
  body('energyLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  body('sleepQuality')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Sleep quality must be between 1 and 10'),
  body('mood')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood must be between 1 and 10'),
  body('stressLevel')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  body('waterIntake')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Water intake must be a non-negative number'),
  body('exerciseMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Exercise minutes must be a non-negative integer'),
  body('weather')
    .optional()
    .isObject()
    .withMessage('Weather must be an object'),
  validateRequest,
];

/**
 * UUID parameter validation
 */
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  validateRequest,
];

/**
 * Pagination validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['created_at', 'updated_at', 'name', 'email'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  validateRequest,
];

/**
 * Search validation
 */
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  validateRequest,
];

module.exports = {
  validateRequest,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  validateUserProfileUpdate,
  validateGutProfile,
  validateFoodItem,
  validateScanAnalysis,
  validateGutSymptom,
  validateMedication,
  validateSafeFood,
  validateAnalyticsData,
  validateUUID,
  validatePagination,
  validateSearch,
};
