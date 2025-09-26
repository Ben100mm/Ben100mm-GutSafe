/**
 * Scan Routes
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateScanAnalysis,
  validateGutSymptom,
  validateUUID,
  validatePagination,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   POST /api/scans/analyze
 * @desc    Analyze food for gut health
 * @access  Private
 */
router.post('/analyze', validateScanAnalysis, asyncHandler(async (req, res) => {
  const {
    foodItemId,
    overallSafety,
    confidence,
    flaggedIngredients,
    conditionWarnings,
    safeAlternatives,
    explanation,
    dataSource,
  } = req.body;

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

  // Create scan analysis
  const analysisId = require('uuid').v4();
  await databaseConnection.execute(
    `INSERT INTO scan_analysis (id, food_item_id, user_id, overall_safety, confidence, 
     flagged_ingredients, condition_warnings, safe_alternatives, explanation, data_source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      analysisId,
      foodItemId,
      req.user.id,
      overallSafety,
      confidence,
      JSON.stringify(flaggedIngredients),
      JSON.stringify(conditionWarnings),
      JSON.stringify(safeAlternatives),
      explanation,
      dataSource,
    ]
  );

  // Create scan history entry
  const historyId = require('uuid').v4();
  await databaseConnection.execute(
    `INSERT INTO scan_history (id, user_id, food_item_id, analysis_id, timestamp, 
     device_info, is_offline)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      historyId,
      req.user.id,
      foodItemId,
      analysisId,
      new Date(),
      JSON.stringify({
        userAgent: req.get('User-Agent'),
        platform: 'web',
      }),
      false,
    ]
  );

  // Get the created analysis
  const analysis = await databaseConnection.queryOne(
    'SELECT * FROM scan_analysis WHERE id = $1',
    [analysisId]
  );

  logger.logUserAction(req.user.id, 'food_analyzed', { 
    foodItemId, 
    foodName: foodItem.name,
    overallSafety,
    confidence 
  });

  res.status(201).json({
    message: 'Food analysis completed',
    analysis,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/scans/history
 * @desc    Get user's scan history
 * @access  Private
 */
router.get('/history', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, safety } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      sh.*,
      fi.name as food_name,
      fi.brand,
      fi.category,
      fi.image_url,
      sa.overall_safety,
      sa.confidence,
      sa.flagged_ingredients,
      sa.safe_alternatives
    FROM scan_history sh
    JOIN food_items fi ON sh.food_item_id = fi.id
    JOIN scan_analysis sa ON sh.analysis_id = sa.id
    WHERE sh.user_id = $1
  `;
  
  const params = [req.user.id];
  let paramCount = 1;

  // Add safety filter
  if (safety && ['safe', 'caution', 'avoid'].includes(safety)) {
    paramCount++;
    query += ` AND sa.overall_safety = $${paramCount}`;
    params.push(safety);
  }

  query += ` ORDER BY sh.timestamp DESC`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const scans = await databaseConnection.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*) as total
    FROM scan_history sh
    JOIN scan_analysis sa ON sh.analysis_id = sa.id
    WHERE sh.user_id = $1
  `;
  
  const countParams = [req.user.id];
  let countParamCount = 1;

  if (safety && ['safe', 'caution', 'avoid'].includes(safety)) {
    countParamCount++;
    countQuery += ` AND sa.overall_safety = $${countParamCount}`;
    countParams.push(safety);
  }

  const countResult = await databaseConnection.query(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'scan_history_viewed', { page, limit, safety });

  res.json({
    scans,
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
 * @route   GET /api/scans/analytics
 * @desc    Get scan analytics for user
 * @access  Private
 */
router.get('/analytics', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  // Get scan statistics
  const stats = await databaseConnection.queryOne(
    `SELECT 
       COUNT(*) as total_scans,
       SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) as safe_scans,
       SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_scans,
       SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_scans,
       AVG(sa.confidence) as avg_confidence
     FROM scan_history sh
     JOIN scan_analysis sa ON sh.analysis_id = sa.id
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'`,
    [req.user.id]
  );

  // Get daily scan counts
  const dailyScans = await databaseConnection.query(
    `SELECT 
       DATE(sh.timestamp) as date,
       COUNT(*) as total_scans,
       SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) as safe_scans,
       SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_scans,
       SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_scans
     FROM scan_history sh
     JOIN scan_analysis sa ON sh.analysis_id = sa.id
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY DATE(sh.timestamp)
     ORDER BY date DESC`,
    [req.user.id]
  );

  // Get most scanned foods
  const topFoods = await databaseConnection.query(
    `SELECT 
       fi.name,
       fi.brand,
       fi.category,
       COUNT(*) as scan_count,
       AVG(sa.confidence) as avg_confidence
     FROM scan_history sh
     JOIN food_items fi ON sh.food_item_id = fi.id
     JOIN scan_analysis sa ON sh.analysis_id = sa.id
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY fi.id, fi.name, fi.brand, fi.category
     ORDER BY scan_count DESC
     LIMIT 10`,
    [req.user.id]
  );

  // Get safety trends
  const safetyTrends = await databaseConnection.query(
    `SELECT 
       sa.overall_safety,
       COUNT(*) as count,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
     FROM scan_history sh
     JOIN scan_analysis sa ON sh.analysis_id = sa.id
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY sa.overall_safety`,
    [req.user.id]
  );

  logger.logUserAction(req.user.id, 'scan_analytics_viewed', { days });

  res.json({
    statistics: {
      totalScans: parseInt(stats.total_scans) || 0,
      safeScans: parseInt(stats.safe_scans) || 0,
      cautionScans: parseInt(stats.caution_scans) || 0,
      avoidScans: parseInt(stats.avoid_scans) || 0,
      averageConfidence: parseFloat(stats.avg_confidence) || 0,
    },
    dailyScans,
    topFoods,
    safetyTrends,
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/scans/symptoms
 * @desc    Record gut symptom
 * @access  Private
 */
router.post('/symptoms', validateGutSymptom, asyncHandler(async (req, res) => {
  const {
    type,
    severity,
    description,
    duration,
    potentialTriggers,
    location,
    relatedFoods,
    weather,
    mood,
    stressLevel,
  } = req.body;

  // Create gut symptom
  const symptomId = require('uuid').v4();
  await databaseConnection.execute(
    `INSERT INTO gut_symptoms (id, user_id, type, severity, description, duration, 
     timestamp, potential_triggers, location, related_foods, weather, mood, stress_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      symptomId,
      req.user.id,
      type,
      severity,
      description || null,
      duration,
      new Date(),
      JSON.stringify(potentialTriggers),
      location || null,
      relatedFoods ? JSON.stringify(relatedFoods) : null,
      weather ? JSON.stringify(weather) : null,
      mood || null,
      stressLevel || null,
    ]
  );

  // Get created symptom
  const symptom = await databaseConnection.queryOne(
    'SELECT * FROM gut_symptoms WHERE id = $1',
    [symptomId]
  );

  logger.logUserAction(req.user.id, 'symptom_recorded', { 
    type, 
    severity,
    duration 
  });

  res.status(201).json({
    message: 'Symptom recorded successfully',
    symptom,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/scans/symptoms
 * @desc    Get user's symptoms
 * @access  Private
 */
router.get('/symptoms', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, days = 30 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT * FROM gut_symptoms 
    WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
  `;
  
  const params = [req.user.id];
  let paramCount = 1;

  // Add type filter
  if (type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(type);
  }

  query += ` ORDER BY timestamp DESC`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const symptoms = await databaseConnection.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*) as total
    FROM gut_symptoms 
    WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
  `;
  
  const countParams = [req.user.id];
  let countParamCount = 1;

  if (type) {
    countParamCount++;
    countQuery += ` AND type = $${countParamCount}`;
    countParams.push(type);
  }

  const countResult = await databaseConnection.query(countQuery, countParams);
  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'symptoms_viewed', { page, limit, type, days });

  res.json({
    symptoms,
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
 * @route   PUT /api/scans/analysis/:id/verify
 * @desc    Verify scan analysis
 * @access  Private
 */
router.put('/analysis/:id/verify', validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isAccurate } = req.body;

  // Check if analysis exists and belongs to user
  const analysis = await databaseConnection.queryOne(
    'SELECT id FROM scan_analysis WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (!analysis) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Analysis not found',
      requestId: req.id,
    });
  }

  // Update analysis verification
  await databaseConnection.execute(
    'UPDATE scan_analysis SET is_user_verified = true, user_feedback = $1 WHERE id = $2',
    [isAccurate ? 'accurate' : 'inaccurate', id]
  );

  logger.logUserAction(req.user.id, 'analysis_verified', { 
    analysisId: id, 
    isAccurate 
  });

  res.json({
    message: 'Analysis verification updated',
    requestId: req.id,
  });
}));

/**
 * @route   DELETE /api/scans/symptoms/:id
 * @desc    Delete symptom
 * @access  Private
 */
router.delete('/symptoms/:id', validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if symptom exists and belongs to user
  const symptom = await databaseConnection.queryOne(
    'SELECT id, type FROM gut_symptoms WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (!symptom) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Symptom not found',
      requestId: req.id,
    });
  }

  // Delete symptom
  await databaseConnection.execute(
    'DELETE FROM gut_symptoms WHERE id = $1',
    [id]
  );

  logger.logUserAction(req.user.id, 'symptom_deleted', { 
    symptomId: id, 
    type: symptom.type 
  });

  res.json({
    message: 'Symptom deleted successfully',
    requestId: req.id,
  });
}));

module.exports = router;
