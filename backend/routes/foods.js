/**
 * Food Routes
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const express = require('express');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validateFoodItem,
  validateUUID,
  validatePagination,
  validateSearch,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/foods
 * @desc    Get all foods with pagination and search
 * @access  Private
 */
router.get('/', validatePagination, validateSearch, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = 'created_at', order = 'desc', q } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM food_items';
  let countQuery = 'SELECT COUNT(*) as total FROM food_items';
  const params = [];
  let paramCount = 0;

  const conditions = [];

  // Add search condition
  if (q) {
    paramCount++;
    conditions.push(`(name ILIKE $${paramCount} OR brand ILIKE $${paramCount} OR category ILIKE $${paramCount})`);
    params.push(`%${q}%`);
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    query += whereClause;
    countQuery += whereClause;
  }

  // Add sorting
  query += ` ORDER BY ${sort} ${order.toUpperCase()}`;

  // Add pagination
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  // Execute queries
  const [foods, countResult] = await Promise.all([
    databaseConnection.query(query, params),
    databaseConnection.query(countQuery, params.slice(0, -2)) // Remove limit and offset params
  ]);

  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'foods_listed', { 
    page, 
    limit, 
    search: q,
    total 
  });

  res.json({
    foods,
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
 * @route   GET /api/foods/:id
 * @desc    Get food by ID
 * @access  Private
 */
router.get('/:id', validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const food = await databaseConnection.queryOne(
    'SELECT * FROM food_items WHERE id = $1',
    [id]
  );

  if (!food) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Food item not found',
      requestId: req.id,
    });
  }

  logger.logUserAction(req.user.id, 'food_viewed', { foodId: id });

  res.json({
    food,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/foods/barcode/:barcode
 * @desc    Get food by barcode
 * @access  Private
 */
router.get('/barcode/:barcode', asyncHandler(async (req, res) => {
  const { barcode } = req.params;

  const food = await databaseConnection.queryOne(
    'SELECT * FROM food_items WHERE barcode = $1',
    [barcode]
  );

  if (!food) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Food item not found',
      requestId: req.id,
    });
  }

  logger.logUserAction(req.user.id, 'food_viewed_by_barcode', { barcode });

  res.json({
    food,
    requestId: req.id,
  });
}));

/**
 * @route   POST /api/foods
 * @desc    Create new food item
 * @access  Private
 */
router.post('/', validateFoodItem, asyncHandler(async (req, res) => {
  const {
    name,
    barcode,
    brand,
    category,
    ingredients,
    allergens,
    additives,
    nutritionalInfo,
    gutHealthInfo,
    dataSource,
    imageUrl,
  } = req.body;

  // Check if food with barcode already exists
  if (barcode) {
    const existingFood = await databaseConnection.queryOne(
      'SELECT id FROM food_items WHERE barcode = $1',
      [barcode]
    );

    if (existingFood) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Food item with this barcode already exists',
        requestId: req.id,
      });
    }
  }

  // Create food item
  const foodId = require('uuid').v4();
  await databaseConnection.execute(
    `INSERT INTO food_items (id, name, barcode, brand, category, ingredients, allergens, additives, 
     nutritional_info, gut_health_info, data_source, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      foodId,
      name,
      barcode || null,
      brand || null,
      category || null,
      JSON.stringify(ingredients),
      JSON.stringify(allergens),
      JSON.stringify(additives),
      nutritionalInfo ? JSON.stringify(nutritionalInfo) : null,
      JSON.stringify(gutHealthInfo),
      dataSource,
      imageUrl || null,
    ]
  );

  // Get created food item
  const food = await databaseConnection.queryOne(
    'SELECT * FROM food_items WHERE id = $1',
    [foodId]
  );

  logger.logUserAction(req.user.id, 'food_created', { foodId, name, dataSource });

  res.status(201).json({
    message: 'Food item created successfully',
    food,
    requestId: req.id,
  });
}));

/**
 * @route   PUT /api/foods/:id
 * @desc    Update food item
 * @access  Private
 */
router.put('/:id', validateUUID('id'), validateFoodItem, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    barcode,
    brand,
    category,
    ingredients,
    allergens,
    additives,
    nutritionalInfo,
    gutHealthInfo,
    dataSource,
    imageUrl,
  } = req.body;

  // Check if food exists
  const existingFood = await databaseConnection.queryOne(
    'SELECT id FROM food_items WHERE id = $1',
    [id]
  );

  if (!existingFood) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Food item not found',
      requestId: req.id,
    });
  }

  // Check if barcode is already used by another food
  if (barcode) {
    const barcodeConflict = await databaseConnection.queryOne(
      'SELECT id FROM food_items WHERE barcode = $1 AND id != $2',
      [barcode, id]
    );

    if (barcodeConflict) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Barcode already used by another food item',
        requestId: req.id,
      });
    }
  }

  // Update food item
  await databaseConnection.execute(
    `UPDATE food_items SET name = $1, barcode = $2, brand = $3, category = $4, 
     ingredients = $5, allergens = $6, additives = $7, nutritional_info = $8, 
     gut_health_info = $9, data_source = $10, image_url = $11, updated_at = NOW()
     WHERE id = $12`,
    [
      name,
      barcode || null,
      brand || null,
      category || null,
      JSON.stringify(ingredients),
      JSON.stringify(allergens),
      JSON.stringify(additives),
      nutritionalInfo ? JSON.stringify(nutritionalInfo) : null,
      JSON.stringify(gutHealthInfo),
      dataSource,
      imageUrl || null,
      id,
    ]
  );

  // Get updated food item
  const food = await databaseConnection.queryOne(
    'SELECT * FROM food_items WHERE id = $1',
    [id]
  );

  logger.logUserAction(req.user.id, 'food_updated', { foodId: id, name });

  res.json({
    message: 'Food item updated successfully',
    food,
    requestId: req.id,
  });
}));

/**
 * @route   DELETE /api/foods/:id
 * @desc    Delete food item
 * @access  Private
 */
router.delete('/:id', validateUUID('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if food exists
  const food = await databaseConnection.queryOne(
    'SELECT name FROM food_items WHERE id = $1',
    [id]
  );

  if (!food) {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Food item not found',
      requestId: req.id,
    });
  }

  // Delete food item (cascade will handle related records)
  await databaseConnection.execute(
    'DELETE FROM food_items WHERE id = $1',
    [id]
  );

  logger.logUserAction(req.user.id, 'food_deleted', { foodId: id, name: food.name });

  res.json({
    message: 'Food item deleted successfully',
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/foods/categories
 * @desc    Get food categories
 * @access  Private
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await databaseConnection.query(
    `SELECT category, COUNT(*) as count 
     FROM food_items 
     WHERE category IS NOT NULL 
     GROUP BY category 
     ORDER BY count DESC`
  );

  logger.logUserAction(req.user.id, 'food_categories_listed');

  res.json({
    categories,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/foods/brands
 * @desc    Get food brands
 * @access  Private
 */
router.get('/brands', asyncHandler(async (req, res) => {
  const brands = await databaseConnection.query(
    `SELECT brand, COUNT(*) as count 
     FROM food_items 
     WHERE brand IS NOT NULL 
     GROUP BY brand 
     ORDER BY count DESC`
  );

  logger.logUserAction(req.user.id, 'food_brands_listed');

  res.json({
    brands,
    requestId: req.id,
  });
}));

/**
 * @route   GET /api/foods/gluten-free
 * @desc    Get gluten-free foods
 * @access  Private
 */
router.get('/gluten-free', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const foods = await databaseConnection.query(
    `SELECT * FROM food_items 
     WHERE gut_health_info->>'glutenFree' = 'true'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await databaseConnection.query(
    `SELECT COUNT(*) as total FROM food_items 
     WHERE gut_health_info->>'glutenFree' = 'true'`
  );

  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'gluten_free_foods_listed', { page, limit });

  res.json({
    foods,
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
 * @route   GET /api/foods/lactose-free
 * @desc    Get lactose-free foods
 * @access  Private
 */
router.get('/lactose-free', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const foods = await databaseConnection.query(
    `SELECT * FROM food_items 
     WHERE gut_health_info->>'lactoseFree' = 'true'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await databaseConnection.query(
    `SELECT COUNT(*) as total FROM food_items 
     WHERE gut_health_info->>'lactoseFree' = 'true'`
  );

  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'lactose_free_foods_listed', { page, limit });

  res.json({
    foods,
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
 * @route   GET /api/foods/low-fodmap
 * @desc    Get low FODMAP foods
 * @access  Private
 */
router.get('/low-fodmap', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const foods = await databaseConnection.query(
    `SELECT * FROM food_items 
     WHERE gut_health_info->>'fodmapLevel' = 'low'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await databaseConnection.query(
    `SELECT COUNT(*) as total FROM food_items 
     WHERE gut_health_info->>'fodmapLevel' = 'low'`
  );

  const total = parseInt(countResult[0].total);
  const totalPages = Math.ceil(total / limit);

  logger.logUserAction(req.user.id, 'low_fodmap_foods_listed', { page, limit });

  res.json({
    foods,
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
 * @route   GET /api/foods/trending
 * @desc    Get trending foods
 * @access  Private
 */
router.get('/trending', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const trendingFoods = await databaseConnection.query(
    `SELECT 
       fi.*,
       COUNT(sh.id) as scan_count,
       ft.trend
     FROM food_items fi
     LEFT JOIN scan_history sh ON fi.id = sh.food_item_id 
       AND sh.timestamp >= NOW() - INTERVAL '30 days'
     LEFT JOIN food_trends ft ON fi.name = ft.food_name
     GROUP BY fi.id, ft.trend
     HAVING COUNT(sh.id) > 0
     ORDER BY scan_count DESC, fi.created_at DESC
     LIMIT $1`,
    [limit]
  );

  logger.logUserAction(req.user.id, 'trending_foods_listed', { limit });

  res.json({
    foods: trendingFoods,
    requestId: req.id,
  });
}));

module.exports = router;
