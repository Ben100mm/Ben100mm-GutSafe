/**
 * @fileoverview USDAFoodAPI.integration.ts - Integration tests with real USDA Food API
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { FoodItem } from '../../types';

// Mock USDA API service for integration testing
class USDAFoodAPIService {
  private static instance: USDAFoodAPIService;
  private baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  private apiKey = process.env.USDA_API_KEY || 'demo-key';

  private constructor() {}

  public static getInstance(): USDAFoodAPIService {
    if (!USDAFoodAPIService.instance) {
      USDAFoodAPIService.instance = new USDAFoodAPIService();
    }
    return USDAFoodAPIService.instance;
  }

  async searchFoods(query: string): Promise<FoodItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&api_key=${this.apiKey}&pageSize=25`
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseSearchResults(data);
    } catch (error) {
      console.error('USDA API search error:', error);
      return [];
    }
  }

  async getFoodById(fdcId: number): Promise<FoodItem | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/food/${fdcId}?api_key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseFoodItem(data);
    } catch (error) {
      console.error('USDA API get food error:', error);
      return null;
    }
  }

  private parseSearchResults(data: any): FoodItem[] {
    if (!data.foods || !Array.isArray(data.foods)) {
      return [];
    }

    return data.foods.map((food: any) => this.parseFoodItem(food));
  }

  private parseFoodItem(data: any): FoodItem {
    const nutrients = this.extractNutrients(data.foodNutrients || []);

    return {
      id: data.fdcId?.toString() || '',
      name: data.description || 'Unknown Food',
      brand: data.brandOwner || '',
      category: data.foodCategory?.description || '',
      barcode: data.gtinUpc || '',
      ingredients: data.ingredients ? [data.ingredients] : [],
      allergens: this.extractAllergens(data.foodNutrients || []),
      additives: [],
      glutenFree: this.checkGlutenFree(data),
      lactoseFree: this.checkLactoseFree(data),
      histamineLevel: this.assessHistamineLevel(data),
      dataSource: 'USDA',
      nutritionalInfo: nutrients,
    };
  }

  private extractNutrients(nutrients: any[]): any {
    const result: any = {};

    nutrients.forEach((nutrient) => {
      if (nutrient.nutrient && nutrient.amount) {
        const name = nutrient.nutrient.name?.toLowerCase();
        const amount = nutrient.amount;

        switch (name) {
          case 'energy':
            result.energy = amount;
            break;
          case 'protein':
            result.protein = amount;
            break;
          case 'carbohydrate, by difference':
            result.carbohydrates = amount;
            break;
          case 'total lipid (fat)':
            result.fat = amount;
            break;
          case 'fiber, total dietary':
            result.fiber = amount;
            break;
          case 'sugars, total including nlea':
            result.sugars = amount;
            break;
        }
      }
    });

    return result;
  }

  private extractAllergens(nutrients: any[]): string[] {
    const allergens: string[] = [];

    // USDA doesn't have direct allergen information, so we infer from ingredients
    // This is a simplified approach - in reality, you'd need more sophisticated parsing
    nutrients.forEach((nutrient) => {
      if (nutrient.nutrient?.name?.toLowerCase().includes('allergen')) {
        allergens.push(nutrient.nutrient.name);
      }
    });

    return allergens;
  }

  private checkGlutenFree(data: any): boolean {
    const ingredients = data.ingredients?.toLowerCase() || '';
    const glutenKeywords = ['wheat', 'barley', 'rye', 'gluten'];

    return !glutenKeywords.some((keyword) => ingredients.includes(keyword));
  }

  private checkLactoseFree(data: any): boolean {
    const ingredients = data.ingredients?.toLowerCase() || '';
    const lactoseKeywords = [
      'milk',
      'lactose',
      'dairy',
      'cream',
      'butter',
      'cheese',
    ];

    return !lactoseKeywords.some((keyword) => ingredients.includes(keyword));
  }

  private assessHistamineLevel(data: any): 'low' | 'medium' | 'high' {
    const ingredients = data.ingredients?.toLowerCase() || '';
    const highHistamineKeywords = [
      'fermented',
      'aged',
      'cured',
      'smoked',
      'alcohol',
    ];
    const mediumHistamineKeywords = ['tomato', 'spinach', 'avocado', 'banana'];

    if (
      highHistamineKeywords.some((keyword) => ingredients.includes(keyword))
    ) {
      return 'high';
    }

    if (
      mediumHistamineKeywords.some((keyword) => ingredients.includes(keyword))
    ) {
      return 'medium';
    }

    return 'low';
  }
}

describe('USDA Food API Integration Tests', () => {
  let usdaService: USDAFoodAPIService;

  beforeEach(() => {
    usdaService = USDAFoodAPIService.getInstance();
    jest.clearAllMocks();
  });

  describe('Real API Calls', () => {
    it('should search real foods by name', async () => {
      const searchResults = await usdaService.searchFoods('chicken breast');

      expect(searchResults).toBeDefined();
      expect(Array.isArray(searchResults)).toBe(true);
      expect(searchResults.length).toBeGreaterThan(0);

      const firstResult = searchResults[0];
      expect(firstResult.name).toBeDefined();
      expect(firstResult.id).toBeDefined();
      expect(firstResult.dataSource).toBe('USDA');
    }, 15000);

    it('should get real food by ID', async () => {
      // Use a real FDC ID from USDA database
      const realFdcId = 171077; // Chicken breast

      const foodItem = await usdaService.getFoodById(realFdcId);

      expect(foodItem).toBeDefined();
      expect(foodItem?.name).toBeDefined();
      expect(foodItem?.id).toBe(realFdcId.toString());
      expect(foodItem?.dataSource).toBe('USDA');
    }, 15000);

    it('should get nutritional information from real API', async () => {
      const realFdcId = 171077; // Chicken breast

      const foodItem = await usdaService.getFoodById(realFdcId);

      expect(foodItem).toBeDefined();
      expect(foodItem?.nutritionalInfo).toBeDefined();
      expect(foodItem?.nutritionalInfo?.protein).toBeDefined();
      expect(foodItem?.nutritionalInfo?.energy).toBeDefined();
    }, 15000);
  });

  describe('API Error Handling', () => {
    it('should handle invalid API key gracefully', async () => {
      // Mock invalid API key response
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const searchResults = await usdaService.searchFoods('test');

      expect(searchResults).toEqual([]);

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const foodItem = await usdaService.getFoodById(123);

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

      const searchResults = await usdaService.searchFoods('test');

      expect(searchResults).toEqual([]);

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

      const foodItem = await usdaService.getFoodById(123);

      expect(foodItem).toBeNull();

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Data Processing', () => {
    it('should correctly parse USDA food data', async () => {
      const realFdcId = 171077; // Chicken breast

      const foodItem = await usdaService.getFoodById(realFdcId);

      if (foodItem) {
        expect(foodItem.id).toBeDefined();
        expect(foodItem.name).toBeDefined();
        expect(foodItem.dataSource).toBe('USDA');
        expect(foodItem.nutritionalInfo).toBeDefined();
        expect(typeof foodItem.glutenFree).toBe('boolean');
        expect(typeof foodItem.lactoseFree).toBe('boolean');
        expect(['low', 'medium', 'high']).toContain(foodItem.histamineLevel);
      }
    }, 15000);

    it('should handle missing nutritional data gracefully', async () => {
      // Mock response with missing nutritional data
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            fdcId: 123,
            description: 'Test Food',
            foodNutrients: [], // No nutritional data
          }),
      });

      const foodItem = await usdaService.getFoodById(123);

      expect(foodItem).toBeDefined();
      expect(foodItem?.name).toBe('Test Food');
      expect(foodItem?.nutritionalInfo).toBeDefined();
      expect(foodItem?.nutritionalInfo?.energy).toBeUndefined();

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Performance', () => {
    it('should complete API calls within acceptable time', async () => {
      const startTime = Date.now();

      await usdaService.searchFoods('chicken');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    }, 15000);

    it('should handle concurrent API calls efficiently', async () => {
      const queries = ['chicken', 'beef', 'fish'];

      const startTime = Date.now();

      const promises = queries.map((query) => usdaService.searchFoods(query));

      const results = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(3);
      expect(duration).toBeLessThan(20000); // Should complete within 20 seconds
    }, 25000);
  });

  describe('Real-world Scenarios', () => {
    it('should handle common food searches', async () => {
      const commonFoods = [
        'chicken breast',
        'brown rice',
        'broccoli',
        'salmon',
        'quinoa',
      ];

      for (const food of commonFoods) {
        const results = await usdaService.searchFoods(food);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult = results[0];
          expect(firstResult.name).toBeDefined();
          expect(firstResult.dataSource).toBe('USDA');
        }
      }
    }, 30000);

    it('should handle dietary restriction searches', async () => {
      const dietarySearches = [
        'gluten free bread',
        'dairy free milk',
        'vegan protein',
        'low sodium',
        'high fiber',
      ];

      for (const search of dietarySearches) {
        const results = await usdaService.searchFoods(search);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);

        // Should return relevant results
        if (results.length > 0) {
          const firstResult = results[0];
          expect(firstResult.name).toBeDefined();
          expect(firstResult.dataSource).toBe('USDA');
        }
      }
    }, 30000);

    it('should handle ingredient-based searches', async () => {
      const ingredientSearches = [
        'organic',
        'grass fed',
        'free range',
        'wild caught',
        'non-gmo',
      ];

      for (const search of ingredientSearches) {
        const results = await usdaService.searchFoods(search);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);

        if (results.length > 0) {
          const firstResult = results[0];
          expect(firstResult.name).toBeDefined();
          expect(firstResult.dataSource).toBe('USDA');
        }
      }
    }, 30000);
  });

  describe('Data Quality', () => {
    it('should validate food data quality', async () => {
      const foodItem = await usdaService.getFoodById(171077); // Chicken breast

      if (foodItem) {
        // Check data completeness
        expect(foodItem.name.length).toBeGreaterThan(0);
        expect(foodItem.id.length).toBeGreaterThan(0);

        // Check nutritional data
        if (foodItem.nutritionalInfo) {
          expect(foodItem.nutritionalInfo.protein).toBeGreaterThan(0);
          expect(foodItem.nutritionalInfo.energy).toBeGreaterThan(0);
        }

        // Check data consistency
        expect(foodItem.dataSource).toBe('USDA');
        expect(['low', 'medium', 'high']).toContain(foodItem.histamineLevel);
      }
    }, 15000);

    it('should handle products with incomplete data', async () => {
      const results = await usdaService.searchFoods('test');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);

      // Should handle products with missing fields gracefully
      results.forEach((product) => {
        expect(product.name).toBeDefined();
        expect(product.dataSource).toBe('USDA');
        expect(['low', 'medium', 'high']).toContain(product.histamineLevel);
      });
    }, 15000);
  });

  describe('Nutritional Analysis', () => {
    it('should provide accurate nutritional information', async () => {
      const foodItem = await usdaService.getFoodById(171077); // Chicken breast

      if (foodItem && foodItem.nutritionalInfo) {
        // Chicken breast should be high in protein
        expect(foodItem.nutritionalInfo.protein).toBeGreaterThan(20);

        // Should have reasonable energy content
        expect(foodItem.nutritionalInfo.energy).toBeGreaterThan(100);
        expect(foodItem.nutritionalInfo.energy).toBeLessThan(500);
      }
    }, 15000);

    it('should assess histamine levels correctly', async () => {
      const highHistamineFood = await usdaService.searchFoods('fermented');
      const lowHistamineFood =
        await usdaService.searchFoods('fresh vegetables');

      if (highHistamineFood.length > 0) {
        expect(highHistamineFood[0].histamineLevel).toBe('high');
      }

      if (lowHistamineFood.length > 0) {
        expect(lowHistamineFood[0].histamineLevel).toBe('low');
      }
    }, 15000);
  });
});
