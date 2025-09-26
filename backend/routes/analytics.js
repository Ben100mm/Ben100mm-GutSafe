/**
 * Analytics Routes
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get analytics dashboard data
 * @access  Private
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  // Get scan statistics
  const scanStats = await databaseConnection.queryOne(
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

  // Get symptom statistics
  const symptomStats = await databaseConnection.queryOne(
    `SELECT 
       COUNT(*) as total_symptoms,
       AVG(severity) as avg_severity,
       COUNT(DISTINCT type) as unique_symptom_types
     FROM gut_symptoms 
     WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${parseInt(days)} days'`,
    [req.user.id]
  );

  // Get safe foods count
  const safeFoodsCount = await databaseConnection.queryOne(
    'SELECT COUNT(*) as count FROM safe_foods WHERE user_id = $1',
    [req.user.id]
  );

  // Get medications count
  const medicationsCount = await databaseConnection.queryOne(
    'SELECT COUNT(*) as count FROM medications WHERE user_id = $1 AND is_active = true',
    [req.user.id]
  );

  // Get daily activity for chart
  const dailyActivity = await databaseConnection.query(
    `SELECT 
       DATE(sh.timestamp) as date,
       COUNT(sh.id) as scans,
       COUNT(gs.id) as symptoms
     FROM scan_history sh
     FULL OUTER JOIN gut_symptoms gs ON DATE(sh.timestamp) = DATE(gs.timestamp) 
       AND sh.user_id = gs.user_id
     WHERE (sh.user_id = $1 OR gs.user_id = $1) 
       AND (sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days' 
            OR gs.timestamp >= NOW() - INTERVAL '${parseInt(days)} days')
     GROUP BY DATE(sh.timestamp), DATE(gs.timestamp)
     ORDER BY date DESC`,
    [req.user.id]
  );

  // Get top problematic ingredients
  const topIngredients = await databaseConnection.query(
    `SELECT 
       ingredient,
       COUNT(*) as frequency,
       AVG(CASE WHEN risk_level = 'severe' THEN 4
                WHEN risk_level = 'high' THEN 3
                WHEN risk_level = 'moderate' THEN 2
                ELSE 1 END) as avg_risk_score
     FROM scan_analysis sa
     JOIN scan_history sh ON sa.id = sh.analysis_id
     CROSS JOIN LATERAL jsonb_array_elements(sa.flagged_ingredients) AS ingredient_data
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY ingredient_data->>'ingredient'
     ORDER BY frequency DESC, avg_risk_score DESC
     LIMIT 10`,
    [req.user.id]
  );

  // Get symptom patterns
  const symptomPatterns = await databaseConnection.query(
    `SELECT 
       type,
       COUNT(*) as frequency,
       AVG(severity) as avg_severity,
       AVG(duration) as avg_duration
     FROM gut_symptoms 
     WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY type
     ORDER BY frequency DESC`,
    [req.user.id]
  );

  // Get food safety trends
  const safetyTrends = await databaseConnection.query(
    `SELECT 
       DATE(sh.timestamp) as date,
       COUNT(*) as total_scans,
       SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) as safe_count,
       SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_count,
       SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_count
     FROM scan_history sh
     JOIN scan_analysis sa ON sh.analysis_id = sa.id
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY DATE(sh.timestamp)
     ORDER BY date DESC`,
    [req.user.id]
  );

  logger.logUserAction(req.user.id, 'analytics_dashboard_viewed', { days });

  res.json({
    overview: {
      totalScans: parseInt(scanStats.total_scans) || 0,
      safeScans: parseInt(scanStats.safe_scans) || 0,
      cautionScans: parseInt(scanStats.caution_scans) || 0,
      avoidScans: parseInt(scanStats.avoid_scans) || 0,
      averageConfidence: parseFloat(scanStats.avg_confidence) || 0,
      totalSymptoms: parseInt(symptomStats.total_symptoms) || 0,
      averageSeverity: parseFloat(symptomStats.avg_severity) || 0,
      uniqueSymptomTypes: parseInt(symptomStats.unique_symptom_types) || 0,
      safeFoodsCount: parseInt(safeFoodsCount.count) || 0,
      activeMedications: parseInt(medicationsCount.count) || 0,
    },
    dailyActivity,
    topIngredients,
    symptomPatterns,
    safetyTrends,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/analytics/insights
 * @desc    Get AI-generated insights
 * @access  Private
 */
router.get('/insights', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  // Get recent scan patterns
  const recentScans = await databaseConnection.query(
    `SELECT 
       fi.name,
       fi.category,
       sa.overall_safety,
       sa.confidence,
       sh.timestamp
     FROM scan_history sh
     JOIN food_items fi ON sh.food_item_id = fi.id
     JOIN scan_analysis sa ON sh.analysis_id = sa.id
     WHERE sh.user_id = $1 AND sh.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     ORDER BY sh.timestamp DESC
     LIMIT 50`,
    [req.user.id]
  );

  // Get symptom correlation data
  const symptomCorrelations = await databaseConnection.query(
    `SELECT 
       gs.type,
       gs.severity,
       gs.timestamp,
       fi.name as food_name,
       fi.category
     FROM gut_symptoms gs
     LEFT JOIN LATERAL (
       SELECT fi.name, fi.category
       FROM scan_history sh
       JOIN food_items fi ON sh.food_item_id = fi.id
       WHERE sh.user_id = gs.user_id 
         AND sh.timestamp BETWEEN gs.timestamp - INTERVAL '2 hours' 
         AND gs.timestamp + INTERVAL '2 hours'
       ORDER BY ABS(EXTRACT(EPOCH FROM (sh.timestamp - gs.timestamp)))
       LIMIT 1
     ) fi ON true
     WHERE gs.user_id = $1 AND gs.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
     ORDER BY gs.timestamp DESC`,
    [req.user.id]
  );

  // Generate insights (this would be AI-powered in production)
  const insights = generateInsights(recentScans, symptomCorrelations);

  logger.logUserAction(req.user.id, 'analytics_insights_viewed', { days });

  res.json({
    insights,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/analytics/export
 * @desc    Export user data
 * @access  Private
 */
router.get('/export', asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  if (!['json', 'csv'].includes(format)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid format. Supported formats: json, csv',
      requestId: req.id,
    });
  }

  // Get all user data
  const userData = await getUserDataForExport(req.user.id);

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = convertToCSV(userData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="gutsafe-data-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="gutsafe-data-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(userData);
  }

  logger.logUserAction(req.user.id, 'data_exported', { format });
}));

/**
 * @route   POST /api/analytics/analytics-data
 * @desc    Record analytics data
 * @access  Private
 */
router.post('/analytics-data', asyncHandler(async (req, res) => {
  const {
    date,
    totalScans,
    safeScans,
    cautionScans,
    avoidScans,
    symptomsReported,
    energyLevel,
    sleepQuality,
    mood,
    stressLevel,
    waterIntake,
    exerciseMinutes,
    weather,
  } = req.body;

  // Check if analytics data already exists for this date
  const existingData = await databaseConnection.queryOne(
    'SELECT id FROM analytics_data WHERE user_id = $1 AND date = $2',
    [req.user.id, date]
  );

  if (existingData) {
    // Update existing data
    await databaseConnection.execute(
      `UPDATE analytics_data SET 
       total_scans = $1, safe_scans = $2, caution_scans = $3, avoid_scans = $4,
       symptoms_reported = $5, energy_level = $6, sleep_quality = $7, mood = $8,
       stress_level = $9, water_intake = $10, exercise_minutes = $11, weather = $12
       WHERE user_id = $13 AND date = $14`,
      [
        totalScans, safeScans, cautionScans, avoidScans,
        symptomsReported, energyLevel, sleepQuality, mood,
        stressLevel, waterIntake, exerciseMinutes,
        weather ? JSON.stringify(weather) : null,
        req.user.id, date
      ]
    );
  } else {
    // Create new analytics data
    const analyticsId = require('uuid').v4();
    await databaseConnection.execute(
      `INSERT INTO analytics_data (id, user_id, date, total_scans, safe_scans, caution_scans, 
       avoid_scans, symptoms_reported, energy_level, sleep_quality, mood, stress_level, 
       water_intake, exercise_minutes, weather)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        analyticsId, req.user.id, date, totalScans, safeScans, cautionScans, avoidScans,
        symptomsReported, energyLevel, sleepQuality, mood, stressLevel,
        waterIntake, exerciseMinutes, weather ? JSON.stringify(weather) : null
      ]
    );
  }

  logger.logUserAction(req.user.id, 'analytics_data_recorded', { date });

  res.json({
    message: 'Analytics data recorded successfully',
    requestId: req.id,
  });
}));

/**
 * Generate insights from user data
 */
function generateInsights(recentScans, symptomCorrelations) {
  const insights = [];

  // Analyze scan patterns
  const safeFoods = recentScans.filter(scan => scan.overall_safety === 'safe');
  const cautionFoods = recentScans.filter(scan => scan.overall_safety === 'caution');
  const avoidFoods = recentScans.filter(scan => scan.overall_safety === 'avoid');

  if (safeFoods.length > 0) {
    const safeCategories = safeFoods.reduce((acc, scan) => {
      acc[scan.category] = (acc[scan.category] || 0) + 1;
      return acc;
    }, {});

    const topSafeCategory = Object.entries(safeCategories)
      .sort(([,a], [,b]) => b - a)[0];

    if (topSafeCategory) {
      insights.push({
        type: 'positive',
        title: 'Safe Food Pattern',
        message: `You've had good experiences with ${topSafeCategory[0]} foods. Consider exploring more options in this category.`,
        confidence: 0.8,
      });
    }
  }

  if (avoidFoods.length > 0) {
    const avoidCategories = avoidFoods.reduce((acc, scan) => {
      acc[scan.category] = (acc[scan.category] || 0) + 1;
      return acc;
    }, {});

    const topAvoidCategory = Object.entries(avoidCategories)
      .sort(([,a], [,b]) => b - a)[0];

    if (topAvoidCategory) {
      insights.push({
        type: 'warning',
        title: 'Problematic Food Pattern',
        message: `You've had issues with ${topAvoidCategory[0]} foods. Consider avoiding this category or finding alternatives.`,
        confidence: 0.7,
      });
    }
  }

  // Analyze symptom patterns
  if (symptomCorrelations.length > 0) {
    const symptomFoodMap = symptomCorrelations.reduce((acc, correlation) => {
      if (correlation.food_name) {
        const key = `${correlation.type}-${correlation.food_name}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const topCorrelation = Object.entries(symptomFoodMap)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCorrelation && topCorrelation[1] > 1) {
      const [symptomType, foodName] = topCorrelation[0].split('-');
      insights.push({
        type: 'correlation',
        title: 'Potential Food Trigger',
        message: `You've experienced ${symptomType} symptoms after consuming ${foodName} multiple times. Consider monitoring this relationship.`,
        confidence: 0.6,
      });
    }
  }

  return insights;
}

/**
 * Get all user data for export
 */
async function getUserDataForExport(userId) {
  const [
    user,
    gutProfile,
    scanHistory,
    symptoms,
    safeFoods,
    medications,
    analyticsData
  ] = await Promise.all([
    databaseConnection.queryOne(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [userId]
    ),
    databaseConnection.queryOne(
      'SELECT * FROM gut_profiles WHERE user_id = $1',
      [userId]
    ),
    databaseConnection.query(
      `SELECT sh.*, fi.name as food_name, sa.overall_safety, sa.confidence
       FROM scan_history sh
       JOIN food_items fi ON sh.food_item_id = fi.id
       JOIN scan_analysis sa ON sh.analysis_id = sa.id
       WHERE sh.user_id = $1
       ORDER BY sh.timestamp DESC`,
      [userId]
    ),
    databaseConnection.query(
      'SELECT * FROM gut_symptoms WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    ),
    databaseConnection.query(
      `SELECT sf.*, fi.name as food_name
       FROM safe_foods sf
       JOIN food_items fi ON sf.food_item_id = fi.id
       WHERE sf.user_id = $1
       ORDER BY sf.added_date DESC`,
      [userId]
    ),
    databaseConnection.query(
      'SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    ),
    databaseConnection.query(
      'SELECT * FROM analytics_data WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    )
  ]);

  return {
    user,
    gutProfile,
    scanHistory,
    symptoms,
    safeFoods,
    medications,
    analyticsData,
    exportDate: new Date().toISOString(),
  };
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
  // This is a simplified CSV conversion
  // In production, you'd want a more robust CSV library
  const csvRows = [];
  
  // Add headers
  csvRows.push('Data Type,Field,Value');
  
  // Add user data
  csvRows.push(`User,Email,${data.user.email}`);
  csvRows.push(`User,First Name,${data.user.first_name}`);
  csvRows.push(`User,Last Name,${data.user.last_name}`);
  csvRows.push(`User,Created At,${data.user.created_at}`);
  
  // Add scan history
  data.scanHistory.forEach((scan, index) => {
    csvRows.push(`Scan ${index + 1},Food Name,${scan.food_name}`);
    csvRows.push(`Scan ${index + 1},Safety,${scan.overall_safety}`);
    csvRows.push(`Scan ${index + 1},Confidence,${scan.confidence}`);
    csvRows.push(`Scan ${index + 1},Timestamp,${scan.timestamp}`);
  });
  
  return csvRows.join('\n');
}

module.exports = router;
