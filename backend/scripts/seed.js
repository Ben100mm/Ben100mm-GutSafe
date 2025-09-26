/**
 * Database Seeder
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...', 'Seeder');

    // Connect to database
    await databaseConnection.connect();

    // Check if data already exists
    const userCount = await databaseConnection.queryOne('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.count) > 0) {
      logger.info('Database already has data, skipping seed', 'Seeder');
      return;
    }

    // Seed sample food items
    await seedFoodItems();

    // Seed sample ingredient analysis
    await seedIngredientAnalysis();

    // Seed sample food trends
    await seedFoodTrends();

    logger.info('Database seeding completed successfully', 'Seeder');
  } catch (error) {
    logger.error('Database seeding failed', 'Seeder', error);
    process.exit(1);
  } finally {
    await databaseConnection.disconnect();
  }
}

async function seedFoodItems() {
  const sampleFoods = [
    {
      name: 'Quinoa',
      category: 'Grains',
      brand: 'Bob\'s Red Mill',
      ingredients: ['quinoa'],
      allergens: [],
      additives: [],
      nutritionalInfo: {
        calories: 120,
        protein: 4.4,
        carbohydrates: 22,
        fat: 1.9,
        fiber: 2.8,
        sodium: 7,
      },
      gutHealthInfo: {
        glutenFree: true,
        lactoseFree: true,
        fodmapLevel: 'low',
        vegan: true,
        vegetarian: true,
        organic: true,
      },
      dataSource: 'manual',
    },
    {
      name: 'Greek Yogurt',
      category: 'Dairy',
      brand: 'Chobani',
      ingredients: ['cultured pasteurized nonfat milk', 'live active cultures'],
      allergens: ['milk'],
      additives: [],
      nutritionalInfo: {
        calories: 100,
        protein: 10,
        carbohydrates: 6,
        fat: 0,
        fiber: 0,
        sodium: 50,
      },
      gutHealthInfo: {
        glutenFree: true,
        lactoseFree: false,
        fodmapLevel: 'low',
        vegan: false,
        vegetarian: true,
        organic: false,
      },
      dataSource: 'manual',
    },
    {
      name: 'Whole Wheat Bread',
      category: 'Bakery',
      brand: 'Dave\'s Killer Bread',
      ingredients: ['whole wheat flour', 'water', 'honey', 'yeast', 'salt'],
      allergens: ['wheat', 'gluten'],
      additives: [],
      nutritionalInfo: {
        calories: 110,
        protein: 5,
        carbohydrates: 22,
        fat: 1.5,
        fiber: 3,
        sodium: 200,
      },
      gutHealthInfo: {
        glutenFree: false,
        lactoseFree: true,
        fodmapLevel: 'moderate',
        vegan: true,
        vegetarian: true,
        organic: true,
      },
      dataSource: 'manual',
    },
    {
      name: 'Almonds',
      category: 'Nuts',
      brand: 'Blue Diamond',
      ingredients: ['almonds'],
      allergens: ['tree nuts'],
      additives: [],
      nutritionalInfo: {
        calories: 160,
        protein: 6,
        carbohydrates: 6,
        fat: 14,
        fiber: 3.5,
        sodium: 0,
      },
      gutHealthInfo: {
        glutenFree: true,
        lactoseFree: true,
        fodmapLevel: 'low',
        vegan: true,
        vegetarian: true,
        organic: false,
      },
      dataSource: 'manual',
    },
    {
      name: 'Coconut Milk',
      category: 'Dairy Alternatives',
      brand: 'Thai Kitchen',
      ingredients: ['coconut extract', 'water', 'guar gum'],
      allergens: [],
      additives: ['guar gum'],
      nutritionalInfo: {
        calories: 45,
        protein: 0.5,
        carbohydrates: 2,
        fat: 4.5,
        fiber: 0,
        sodium: 15,
      },
      gutHealthInfo: {
        glutenFree: true,
        lactoseFree: true,
        fodmapLevel: 'low',
        vegan: true,
        vegetarian: true,
        organic: false,
      },
      dataSource: 'manual',
    },
  ];

  for (const food of sampleFoods) {
    const foodId = require('uuid').v4();
    await databaseConnection.execute(
      `INSERT INTO food_items (id, name, category, brand, ingredients, allergens, additives, 
       nutritional_info, gut_health_info, data_source, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        foodId,
        food.name,
        food.category,
        food.brand,
        JSON.stringify(food.ingredients),
        JSON.stringify(food.allergens),
        JSON.stringify(food.additives),
        JSON.stringify(food.nutritionalInfo),
        JSON.stringify(food.gutHealthInfo),
        food.dataSource,
        true,
      ]
    );
  }

  logger.info(`Seeded ${sampleFoods.length} food items`, 'Seeder');
}

async function seedIngredientAnalysis() {
  const sampleIngredients = [
    {
      ingredient: 'wheat',
      isProblematic: true,
      isHidden: false,
      detectedTriggers: [
        { trigger: 'gluten', condition: 'gluten', severity: 'severe' },
        { trigger: 'fodmap', condition: 'ibs-fodmap', severity: 'moderate' }
      ],
      confidence: 0.95,
      category: 'grain',
      riskLevel: 'severe',
      recommendations: {
        avoid: true,
        caution: false,
        alternatives: ['rice', 'quinoa', 'buckwheat'],
        modifications: ['gluten-free options']
      },
      dataSource: 'manual',
    },
    {
      ingredient: 'milk',
      isProblematic: true,
      isHidden: false,
      detectedTriggers: [
        { trigger: 'lactose', condition: 'lactose', severity: 'moderate' },
        { trigger: 'dairy', condition: 'ibs-fodmap', severity: 'moderate' }
      ],
      confidence: 0.9,
      category: 'dairy',
      riskLevel: 'moderate',
      recommendations: {
        avoid: false,
        caution: true,
        alternatives: ['almond milk', 'coconut milk', 'oat milk'],
        modifications: ['lactose-free options']
      },
      dataSource: 'manual',
    },
    {
      ingredient: 'onion',
      isProblematic: true,
      isHidden: true,
      detectedTriggers: [
        { trigger: 'fodmap', condition: 'ibs-fodmap', severity: 'severe' }
      ],
      confidence: 0.85,
      category: 'vegetable',
      riskLevel: 'severe',
      recommendations: {
        avoid: true,
        caution: false,
        alternatives: ['green onion tops', 'chives', 'asafoetida'],
        modifications: ['use infused oils']
      },
      dataSource: 'manual',
    },
    {
      ingredient: 'quinoa',
      isProblematic: false,
      isHidden: false,
      detectedTriggers: [],
      confidence: 0.95,
      category: 'grain',
      riskLevel: 'low',
      recommendations: {
        avoid: false,
        caution: false,
        alternatives: [],
        modifications: []
      },
      dataSource: 'manual',
    },
    {
      ingredient: 'almonds',
      isProblematic: false,
      isHidden: false,
      detectedTriggers: [],
      confidence: 0.9,
      category: 'nut',
      riskLevel: 'low',
      recommendations: {
        avoid: false,
        caution: false,
        alternatives: [],
        modifications: []
      },
      dataSource: 'manual',
    },
  ];

  for (const ingredient of sampleIngredients) {
    const ingredientId = require('uuid').v4();
    await databaseConnection.execute(
      `INSERT INTO ingredient_analysis (id, ingredient, is_problematic, is_hidden, 
       detected_triggers, confidence, category, risk_level, recommendations, last_analyzed, data_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        ingredientId,
        ingredient.ingredient,
        ingredient.isProblematic,
        ingredient.isHidden,
        JSON.stringify(ingredient.detectedTriggers),
        ingredient.confidence,
        ingredient.category,
        ingredient.riskLevel,
        JSON.stringify(ingredient.recommendations),
        new Date(),
        ingredient.dataSource,
      ]
    );
  }

  logger.info(`Seeded ${sampleIngredients.length} ingredient analyses`, 'Seeder');
}

async function seedFoodTrends() {
  const sampleTrends = [
    {
      foodName: 'Quinoa',
      totalScans: 150,
      safeCount: 140,
      cautionCount: 8,
      avoidCount: 2,
      lastScanned: new Date(),
      trend: 'improving',
      confidence: 0.85,
      category: 'Grains',
      brand: 'Bob\'s Red Mill',
    },
    {
      foodName: 'Greek Yogurt',
      totalScans: 200,
      safeCount: 120,
      cautionCount: 60,
      avoidCount: 20,
      lastScanned: new Date(),
      trend: 'stable',
      confidence: 0.75,
      category: 'Dairy',
      brand: 'Chobani',
    },
    {
      foodName: 'Whole Wheat Bread',
      totalScans: 300,
      safeCount: 50,
      cautionCount: 100,
      avoidCount: 150,
      lastScanned: new Date(),
      trend: 'declining',
      confidence: 0.9,
      category: 'Bakery',
      brand: 'Dave\'s Killer Bread',
    },
  ];

  for (const trend of sampleTrends) {
    const trendId = require('uuid').v4();
    await databaseConnection.execute(
      `INSERT INTO food_trends (id, food_name, total_scans, safe_count, caution_count, 
       avoid_count, last_scanned, trend, confidence, category, brand)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        trendId,
        trend.foodName,
        trend.totalScans,
        trend.safeCount,
        trend.cautionCount,
        trend.avoidCount,
        trend.lastScanned,
        trend.trend,
        trend.confidence,
        trend.category,
        trend.brand,
      ]
    );
  }

  logger.info(`Seeded ${sampleTrends.length} food trends`, 'Seeder');
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
