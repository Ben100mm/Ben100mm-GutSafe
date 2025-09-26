/**
 * User Routes
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateUserProfileUpdate,
  validateGutProfile,
  validatePagination,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await databaseConnection.queryOne(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.email_verified, u.created_at,
            up.preferences, up.settings
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = $1`,
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'User not found',
      requestId: req.id,
    });
  }

  logger.logUserAction(req.user.id, 'profile_viewed');

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      preferences: user.preferences || {},
      settings: user.settings || {},
    },
    requestId: req.id,
  });
}));

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', validateUserProfileUpdate, asyncHandler(async (req, res) => {
  const { firstName, lastName, preferences, settings } = req.body;

  // Update user basic info
  if (firstName || lastName) {
    await databaseConnection.execute(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name) WHERE id = $3',
      [firstName || null, lastName || null, req.user.id]
    );
  }

  // Update or create user profile
  const existingProfile = await databaseConnection.queryOne(
    'SELECT id FROM user_profiles WHERE user_id = $1',
    [req.user.id]
  );

  if (existingProfile) {
    await databaseConnection.execute(
      'UPDATE user_profiles SET preferences = COALESCE($1, preferences), settings = COALESCE($2, settings) WHERE user_id = $3',
      [
        preferences ? JSON.stringify(preferences) : null,
        settings ? JSON.stringify(settings) : null,
        req.user.id
      ]
    );
  } else {
    await databaseConnection.execute(
      'INSERT INTO user_profiles (user_id, preferences, settings) VALUES ($1, $2, $3)',
      [
        req.user.id,
        JSON.stringify(preferences || {}),
        JSON.stringify(settings || {})
      ]
    );
  }

  logger.logUserAction(req.user.id, 'profile_updated', { 
    firstName: !!firstName, 
    lastName: !!lastName,
    preferences: !!preferences,
    settings: !!settings
  });

  res.json({
    message: 'Profile updated successfully',
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/users/gut-profile
 * @desc    Get user's gut profile
 * @access  Private
 */
router.get('/gut-profile', asyncHandler(async (req, res) => {
  const gutProfile = await databaseConnection.queryOne(
    'SELECT * FROM gut_profiles WHERE user_id = $1',
    [req.user.id]
  );

  if (!gutProfile) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Gut profile not found',
      requestId: req.id,
    });
  }

  logger.logUserAction(req.user.id, 'gut_profile_viewed');

  res.json({
    gutProfile,
    requestId: req.id,
  });
}));

/**
 * @route   PUT /api/users/gut-profile
 * @desc    Update user's gut profile
 * @access  Private
 */
router.put('/gut-profile', validateGutProfile, asyncHandler(async (req, res) => {
  const { conditions, preferences, isActive } = req.body;

  // Check if gut profile exists
  const existingProfile = await databaseConnection.queryOne(
    'SELECT id FROM gut_profiles WHERE user_id = $1',
    [req.user.id]
  );

  if (existingProfile) {
    // Update existing profile
    await databaseConnection.execute(
      'UPDATE gut_profiles SET conditions = $1, preferences = $2, is_active = COALESCE($3, is_active) WHERE user_id = $4',
      [
        JSON.stringify(conditions),
        JSON.stringify(preferences),
        isActive,
        req.user.id
      ]
    );
  } else {
    // Create new profile
    const profileId = require('uuid').v4();
    await databaseConnection.execute(
      'INSERT INTO gut_profiles (id, user_id, conditions, preferences, is_active) VALUES ($1, $2, $3, $4, $5)',
      [
        profileId,
        req.user.id,
        JSON.stringify(conditions),
        JSON.stringify(preferences),
        isActive !== undefined ? isActive : true
      ]
    );
  }

  logger.logUserAction(req.user.id, 'gut_profile_updated', { 
    conditionsCount: Object.keys(conditions).length,
    isActive 
  });

  res.json({
    message: 'Gut profile updated successfully',
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/users/safe-foods
 * @desc    Get user's safe foods
 * @access  Private
 */
router.get('/safe-foods', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, favorite } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      sf.*,
      fi.name as food_name,
      fi.brand,
      fi.category,
      fi.image_url,
      fi.gut_health_info
    FROM safe_foods sf
    JOIN food_items fi ON sf.food_item_id = fi.id
    WHERE sf.user_id = $1
  `;
  
  const params = [req.user.id];
  let paramCount = 1;

  // Add favorite filter
  if (favorite === 'true') {
    paramCount++;
    query += ` AND sf.is_favorite = $${paramCount}`;
    params.push(true);
  }

  query += ` ORDER BY sf.last_used DESC NULLS LAST, sf.added_date DESC`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const safeFoods = await databaseConnection.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*) as total
    FROM safe_foods sf
    WHERE sf.user_id = $1
  `;
  
  const countParams = [req.user.id];
  let countParamCount = 1;

  if (favorite === 'true') {
    countParamCount++;
    countQuery += ` AND sf.is_favorite = $${countParamCount}`;
    countParams.push(true);
  }

  const countResult = await databaseConnection.query(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'safe_foods_viewed', { page, limit, favorite });

  res.json({
    safeFoods,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/users/safe-foods
 * @desc    Add food to safe foods
 * @access  Private
 */
router.post('/safe-foods', asyncHandler(async (req, res) => {
  const { foodItemId, notes, isFavorite, tags, rating } = req.body;

  // Check if food item exists
  const foodItem = await databaseConnection.queryOne(
    'SELECT id, name FROM food_items WHERE id = $1',
    [foodItemId]
  );

  if (!foodItem) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Food item not found',
      requestId: req.id,
    });
  }

  // Check if already in safe foods
  const existingSafeFood = await databaseConnection.queryOne(
    'SELECT id FROM safe_foods WHERE user_id = $1 AND food_item_id = $2',
    [req.user.id, foodItemId]
  );

  if (existingSafeFood) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Food item already in safe foods',
      requestId: req.id,
    });
  }

  // Add to safe foods
  const safeFoodId = require('uuid').v4();
  await databaseConnection.execute(
    `INSERT INTO safe_foods (id, user_id, food_item_id, added_date, notes, is_favorite, tags, rating)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      safeFoodId,
      req.user.id,
      foodItemId,
      new Date(),
      notes || null,
      isFavorite || false,
      tags ? JSON.stringify(tags) : null,
      rating || null,
    ]
  );

  logger.logUserAction(req.user.id, 'safe_food_added', { 
    foodItemId, 
    foodName: foodItem.name 
  });

  res.status(201).json({
    message: 'Food added to safe foods',
    requestId: req.id,
  });
}));

/**
 * @route   DELETE /api/users/safe-foods/:id
 * @desc    Remove food from safe foods
 * @access  Private
 */
router.delete('/safe-foods/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if safe food exists and belongs to user
  const safeFood = await databaseConnection.queryOne(
    'SELECT id FROM safe_foods WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (!safeFood) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Safe food not found',
      requestId: req.id,
    });
  }

  // Remove from safe foods
  await databaseConnection.execute(
    'DELETE FROM safe_foods WHERE id = $1',
    [id]
  );

  logger.logUserAction(req.user.id, 'safe_food_removed', { safeFoodId: id });

  res.json({
    message: 'Food removed from safe foods',
    requestId: req.id,
  });
}));

/**
 * @route   PUT /api/users/safe-foods/:id
 * @desc    Update safe food
 * @access  Private
 */
router.put('/safe-foods/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, isFavorite, tags, rating } = req.body;

  // Check if safe food exists and belongs to user
  const safeFood = await databaseConnection.queryOne(
    'SELECT id FROM safe_foods WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (!safeFood) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Safe food not found',
      requestId: req.id,
    });
  }

  // Update safe food
  await databaseConnection.execute(
    `UPDATE safe_foods SET 
     notes = COALESCE($1, notes),
     is_favorite = COALESCE($2, is_favorite),
     tags = COALESCE($3, tags),
     rating = COALESCE($4, rating),
     last_used = NOW()
     WHERE id = $5`,
    [
      notes,
      isFavorite,
      tags ? JSON.stringify(tags) : null,
      rating,
      id
    ]
  );

  logger.logUserAction(req.user.id, 'safe_food_updated', { safeFoodId: id });

  res.json({
    message: 'Safe food updated successfully',
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/users/medications
 * @desc    Get user's medications
 * @access  Private
 */
router.get('/medications', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, active, type } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM medications 
    WHERE user_id = $1
  `;
  
  const params = [req.user.id];
  let paramCount = 1;

  // Add active filter
  if (active === 'true' || active === 'false') {
    paramCount++;
    query += ` AND is_active = $${paramCount}`;
    params.push(active === 'true');
  }

  // Add type filter
  if (type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(type);
  }

  query += ` ORDER BY created_at DESC`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const medications = await databaseConnection.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*) as total
    FROM medications 
    WHERE user_id = $1
  `;
  
  const countParams = [req.user.id];
  let countParamCount = 1;

  if (active === 'true' || active === 'false') {
    countParamCount++;
    countQuery += ` AND is_active = $${countParamCount}`;
    countParams.push(active === 'true');
  }

  if (type) {
    countParamCount++;
    countQuery += ` AND type = $${countParamCount}`;
    countParams.push(type);
  }

  const countResult = await databaseConnection.query(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'medications_viewed', { page, limit, active, type });

  res.json({
    medications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/users/medications
 * @desc    Add medication
 * @access  Private
 */
router.post('/medications', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    dosage,
    frequency,
    startDate,
    endDate,
    isActive,
    notes,
    gutRelated,
    category,
    sideEffects,
    effectiveness,
  } = req.body;

  // Add medication
  const medicationId = require('uuid').v4();
  await databaseConnection.execute(
    `INSERT INTO medications (id, user_id, name, type, dosage, frequency, start_date, 
     end_date, is_active, notes, gut_related, category, side_effects, effectiveness)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      medicationId,
      req.user.id,
      name,
      type,
      dosage,
      frequency,
      startDate,
      endDate || null,
      isActive,
      notes || null,
      gutRelated,
      category || null,
      sideEffects ? JSON.stringify(sideEffects) : null,
      effectiveness || null,
    ]
  );

  logger.logUserAction(req.user.id, 'medication_added', { 
    medicationId, 
    name, 
    type 
  });

  res.status(201).json({
    message: 'Medication added successfully',
    requestId: req.id,
  });
}));

/**
 * @route   DELETE /api/users/medications/:id
 * @desc    Delete medication
 * @access  Private
 */
router.delete('/medications/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if medication exists and belongs to user
  const medication = await databaseConnection.queryOne(
    'SELECT id, name FROM medications WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (!medication) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Medication not found',
      requestId: req.id,
    });
  }

  // Delete medication
  await databaseConnection.execute(
    'DELETE FROM medications WHERE id = $1',
    [id]
  );

  logger.logUserAction(req.user.id, 'medication_deleted', { 
    medicationId: id, 
    name: medication.name 
  });

  res.json({
    message: 'Medication deleted successfully',
    requestId: req.id,
  });
}));

module.exports = router;
