/**
 * @fileoverview OpenFoodFactsAPI.integration.ts - Integration tests with real OpenFoodFacts API
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import OpenFoodFactsService from '../../services/OpenFoodFactsService';
import { FoodItem } from '../../types';

describe('OpenFoodFacts API Integration Tests', () => {
  let openFoodFactsService: OpenFoodFactsService;

  beforeEach(() => {
    openFoodFactsService = OpenFoodFactsService.getInstance();
    jest.clearAllMocks();
  });

  describe('Real API Calls', () => {
    it('should fetch real food data by barcode', async () => {
      // Use a real barcode from OpenFoodFacts database
      const realBarcode = '3017620422003'; // Nutella barcode

      const foodItem = await openFoodFactsService.getFoodByBarcode(realBarcode);

      expect(foodItem).toBeDefined();
      expect(foodItem?.name).toBeDefined();
      expect(foodItem?.brand).toBeDefined();
      expect(foodItem?.ingredients).toBeDefined();
      expect(foodItem?.barcode).toBe(realBarcode);
    }, 10000);

    it('should search real foods by name', async () => {
      const searchResults = await openFoodFactsService.searchFoods('yogurt');

      expect(searchResults).toBeDefined();
      expect(Array.isArray(searchResults)).toBe(true);
      expect(searchResults.length).toBeGreaterThan(0);

      const firstResult = searchResults[0];
      expect(firstResult.name).toBeDefined();
      expect(firstResult.brand).toBeDefined();
      expect(firstResult.category).toBeDefined();
    }, 10000);

    it('should get nutritional information from real API', async () => {
      const realBarcode = '3017620422003';

      const nutrition =
        await openFoodFactsService.getNutritionalInfo(realBarcode);

      expect(nutrition).toBeDefined();
      expect(nutrition?.energy).toBeDefined();
      expect(nutrition?.protein).toBeDefined();
      expect(nutrition?.carbohydrates).toBeDefined();
      expect(nutrition?.fat).toBeDefined();
    }, 10000);

    it('should get allergen information from real API', async () => {
      const realBarcode = '3017620422003';

      const allergens = await openFoodFactsService.getAllergenInfo(realBarcode);

      expect(allergens).toBeDefined();
      expect(allergens?.allergens).toBeDefined();
      expect(Array.isArray(allergens?.allergens)).toBe(true);
      expect(allergens?.traces).toBeDefined();
      expect(Array.isArray(allergens?.traces)).toBe(true);
    }, 10000);
  });

  describe('API Error Handling', () => {
    it('should handle invalid barcode gracefully', async () => {
      const invalidBarcode = '0000000000000';

      const foodItem =
        await openFoodFactsService.getFoodByBarcode(invalidBarcode);

      expect(foodItem).toBeNull();
    }, 10000);

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const foodItem = await openFoodFactsService.getFoodByBarcode('123456789');

      expect(foodItem).toBeNull();

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle API rate limiting', async () => {
      // Mock rate limit response
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const foodItem = await openFoodFactsService.getFoodByBarcode('123456789');

      expect(foodItem).toBeNull();

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      });

      const foodItem = await openFoodFactsService.getFoodByBarcode('123456789');

      expect(foodItem).toBeNull();

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Data Processing', () => {
    it('should correctly parse OpenFoodFacts product data', async () => {
      const realBarcode = '3017620422003';

      const foodItem = await openFoodFactsService.getFoodByBarcode(realBarcode);

      if (foodItem) {
        expect(foodItem.id).toBeDefined();
        expect(foodItem.name).toBeDefined();
        expect(foodItem.brand).toBeDefined();
        expect(foodItem.category).toBeDefined();
        expect(foodItem.ingredients).toBeDefined();
        expect(Array.isArray(foodItem.ingredients)).toBe(true);
        expect(foodItem.allergens).toBeDefined();
        expect(Array.isArray(foodItem.allergens)).toBe(true);
        expect(foodItem.additives).toBeDefined();
        expect(Array.isArray(foodItem.additives)).toBe(true);
        expect(foodItem.glutenFree).toBeDefined();
        expect(typeof foodItem.glutenFree).toBe('boolean');
        expect(foodItem.lactoseFree).toBeDefined();
        expect(typeof foodItem.lactoseFree).toBe('boolean');
        expect(foodItem.histamineLevel).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(foodItem.histamineLevel);
        expect(foodItem.dataSource).toBe('OpenFoodFacts');
      }
    }, 10000);

    it('should handle missing optional fields gracefully', async () => {
      // Mock response with missing fields
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            product: {
              product_name: 'Test Product',
              // Missing brand, category, ingredients, etc.
            },
          }),
      });

      const foodItem = await openFoodFactsService.getFoodByBarcode('123456789');

      expect(foodItem).toBeDefined();
      expect(foodItem?.name).toBe('Test Product');
      expect(foodItem?.brand).toBeUndefined();
      expect(foodItem?.category).toBeUndefined();
      expect(foodItem?.ingredients).toEqual([]);

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Performance', () => {
    it('should complete API calls within acceptable time', async () => {
      const startTime = Date.now();

      await openFoodFactsService.getFoodByBarcode('3017620422003');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    }, 10000);

    it('should handle concurrent API calls efficiently', async () => {
      const barcodes = ['3017620422003', '3017620422004', '3017620422005'];

      const startTime = Date.now();

      const promises = barcodes.map((barcode) =>
        openFoodFactsService.getFoodByBarcode(barcode)
      );

      const results = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(3);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    }, 15000);
  });

  describe('Caching', () => {
    it('should cache API responses', async () => {
      const barcode = '3017620422003';

      // First call
      const startTime1 = Date.now();
      const foodItem1 = await openFoodFactsService.getFoodByBarcode(barcode);
      const endTime1 = Date.now();
      const duration1 = endTime1 - startTime1;

      // Second call (should be cached)
      const startTime2 = Date.now();
      const foodItem2 = await openFoodFactsService.getFoodByBarcode(barcode);
      const endTime2 = Date.now();
      const duration2 = endTime2 - startTime2;

      expect(foodItem1).toEqual(foodItem2);
      expect(duration2).toBeLessThan(duration1); // Cached call should be faster
    }, 10000);

    it('should respect cache expiration', async () => {
      const barcode = '3017620422003';

      // First call
      await openFoodFactsService.getFoodByBarcode(barcode);

      // Clear cache
      await openFoodFactsService.clearCache();

      // Second call (should not be cached)
      const foodItem = await openFoodFactsService.getFoodByBarcode(barcode);

      expect(foodItem).toBeDefined();
    }, 10000);
  });

  describe('Real-world Scenarios', () => {
    it('should handle popular food items', async () => {
      const popularBarcodes = [
        '3017620422003', // Nutella
        '7622210951234', // Oreo
        '8712561735004', // Coca Cola
      ];

      for (const barcode of popularBarcodes) {
        const foodItem = await openFoodFactsService.getFoodByBarcode(barcode);

        if (foodItem) {
          expect(foodItem.name).toBeDefined();
          expect(foodItem.brand).toBeDefined();
          expect(foodItem.ingredients.length).toBeGreaterThan(0);
        }
      }
    }, 20000);

    it('should handle international products', async () => {
      const internationalBarcodes = [
        '8712561735004', // Dutch product
        '3017620422003', // French product
        '7622210951234', // American product
      ];

      for (const barcode of internationalBarcodes) {
        const foodItem = await openFoodFactsService.getFoodByBarcode(barcode);

        if (foodItem) {
          expect(foodItem.name).toBeDefined();
          expect(foodItem.dataSource).toBe('OpenFoodFacts');
        }
      }
    }, 20000);

    it('should handle seasonal and limited edition products', async () => {
      // Search for seasonal products
      const seasonalResults =
        await openFoodFactsService.searchFoods('pumpkin spice');

      expect(seasonalResults).toBeDefined();
      expect(Array.isArray(seasonalResults)).toBe(true);

      if (seasonalResults.length > 0) {
        const seasonalProduct = seasonalResults[0];
        expect(seasonalProduct.name).toBeDefined();
        expect(seasonalProduct.category).toBeDefined();
      }
    }, 10000);
  });

  describe('Data Quality', () => {
    it('should validate food data quality', async () => {
      const foodItem =
        await openFoodFactsService.getFoodByBarcode('3017620422003');

      if (foodItem) {
        // Check data completeness
        expect(foodItem.name.length).toBeGreaterThan(0);
        expect(foodItem.ingredients.length).toBeGreaterThan(0);

        // Check data consistency
        if (foodItem.allergens.includes('milk')) {
          expect(foodItem.lactoseFree).toBe(false);
        }

        if (foodItem.allergens.includes('gluten')) {
          expect(foodItem.glutenFree).toBe(false);
        }
      }
    }, 10000);

    it('should handle products with incomplete data', async () => {
      // Search for products that might have incomplete data
      const results = await openFoodFactsService.searchFoods('test');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Should handle products with missing fields gracefully
      results.forEach((product) => {
        expect(product.name).toBeDefined();
        expect(product.dataSource).toBe('OpenFoodFacts');
      });
    }, 10000);
  });
});
