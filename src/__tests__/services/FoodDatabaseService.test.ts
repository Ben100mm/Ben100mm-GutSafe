/**
 * @fileoverview FoodDatabaseService.test.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import FoodDatabaseService from '../../services/FoodDatabaseService';
import { FoodItem, SeverityLevel } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('FoodDatabaseService', () => {
  let service: FoodDatabaseService;

  beforeEach(() => {
    service = FoodDatabaseService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = FoodDatabaseService.getInstance();
      const instance2 = FoodDatabaseService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('searchFoods', () => {
    it('should search foods by name', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            products: [
              {
                product_name: 'Test Food',
                brands: 'Test Brand',
                categories: 'Test Category',
                ingredients_text: 'Test ingredients',
                allergens_tags: ['en:milk'],
                additives_tags: ['en:e100'],
                nutrition_grades: 'a',
              },
            ],
          }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const results = await service.searchFoods('test food');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Test Food');
      expect(results[0].brand).toBe('Test Brand');
    });

    it('should handle search errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const results = await service.searchFoods('test food');
      expect(results).toEqual([]);
    });
  });

  describe('getFoodByBarcode', () => {
    it('should get food by barcode', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            product: {
              product_name: 'Barcode Food',
              brands: 'Barcode Brand',
              categories: 'Barcode Category',
              ingredients_text: 'Barcode ingredients',
              allergens_tags: ['en:gluten'],
              additives_tags: [],
              nutrition_grades: 'b',
            },
          }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await service.getFoodByBarcode('123456789');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Barcode Food');
      expect(result?.barcode).toBe('123456789');
    });

    it('should return null for invalid barcode', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await service.getFoodByBarcode('invalid');
      expect(result).toBeNull();
    });
  });

  describe('analyzeFoodForGutHealth', () => {
    it('should analyze food for gut health conditions', async () => {
      const foodItem: FoodItem = {
        id: '1',
        name: 'Test Food',
        brand: 'Test Brand',
        category: 'Dairy',
        barcode: '123456789',
        ingredients: ['milk', 'sugar', 'artificial flavors'],
        allergens: ['milk'],
        additives: ['artificial flavors'],
        glutenFree: false,
        lactoseFree: false,
        histamineLevel: 'low',
        dataSource: 'Test Database',
      };

      const analysis = await service.analyzeFoodForGutHealth(foodItem, {
        conditions: {
          lactose: {
            enabled: true,
            severity: 'moderate' as SeverityLevel,
            knownTriggers: [],
            lastUpdated: new Date(),
          },
          gluten: {
            enabled: false,
            severity: 'mild' as SeverityLevel,
            knownTriggers: [],
            lastUpdated: new Date(),
          },
        },
        preferences: {
          dietaryRestrictions: [],
          alternativePreferences: [],
          mealTiming: 'regular',
        },
        lastUpdated: new Date(),
      });

      expect(analysis).toBeDefined();
      expect(analysis.overallSafety).toBeDefined();
      expect(analysis.flaggedIngredients).toBeDefined();
      expect(analysis.conditionWarnings).toBeDefined();
    });
  });

  describe('getNutritionalInfo', () => {
    it('should get nutritional information', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            product: {
              nutriments: {
                energy_100g: 250,
                proteins_100g: 10,
                carbohydrates_100g: 30,
                fat_100g: 5,
                fiber_100g: 2,
                sugars_100g: 15,
              },
            },
          }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const nutrition = await service.getNutritionalInfo('123456789');

      expect(nutrition).toBeDefined();
      expect(nutrition?.energy).toBe(250);
      expect(nutrition?.protein).toBe(10);
    });
  });

  describe('getAllergenInfo', () => {
    it('should get allergen information', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            product: {
              allergens_tags: ['en:milk', 'en:gluten'],
              traces_tags: ['en:nuts'],
              additives_tags: ['en:e100', 'en:e200'],
            },
          }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const allergens = await service.getAllergenInfo('123456789');

      expect(allergens).toBeDefined();
      expect(allergens?.allergens).toContain('milk');
      expect(allergens?.allergens).toContain('gluten');
      expect(allergens?.traces).toContain('nuts');
    });
  });

  describe('getSafeAlternatives', () => {
    it('should get safe alternatives for flagged food', async () => {
      const foodItem: FoodItem = {
        id: '1',
        name: 'Wheat Bread',
        brand: 'Test Brand',
        category: 'Bakery',
        barcode: '123456789',
        ingredients: ['wheat flour', 'water', 'yeast'],
        allergens: ['gluten'],
        additives: [],
        glutenFree: false,
        lactoseFree: true,
        histamineLevel: 'low',
        dataSource: 'Test Database',
      };

      const alternatives = await service.getSafeAlternatives(foodItem, {
        conditions: {
          gluten: {
            enabled: true,
            severity: 'moderate' as SeverityLevel,
            knownTriggers: [],
            lastUpdated: new Date(),
          },
        },
        preferences: {
          dietaryRestrictions: [],
          alternativePreferences: [],
          mealTiming: 'regular',
        },
        lastUpdated: new Date(),
      });

      expect(alternatives).toBeDefined();
      expect(Array.isArray(alternatives)).toBe(true);
    });
  });

  describe('getFoodTrends', () => {
    it('should get food trends', async () => {
      const trends = await service.getFoodTrends();

      expect(trends).toBeDefined();
      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('getFoodRecommendations', () => {
    it('should get food recommendations based on profile', async () => {
      const profile = {
        conditions: {
          'ibs-fodmap': {
            enabled: true,
            severity: 'moderate' as SeverityLevel,
            knownTriggers: [],
            lastUpdated: new Date(),
          },
        },
        preferences: {
          dietaryRestrictions: [],
          alternativePreferences: [],
          mealTiming: 'regular',
        },
        lastUpdated: new Date(),
      };

      const recommendations = await service.getFoodRecommendations(profile);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('getCacheStats', () => {
    it('should get cache statistics', async () => {
      const stats = await service.getCacheStats();

      expect(stats).toBeDefined();
      expect(typeof stats.foodItemCount).toBe('number');
      expect(typeof stats.totalSize).toBe('number');
      expect(typeof stats.lastCleanup).toBe('number');
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', async () => {
      await expect(service.clearCache()).resolves.not.toThrow();
    });
  });
});
