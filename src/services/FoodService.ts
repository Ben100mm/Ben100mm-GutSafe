/**
 * @fileoverview FoodService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { FoodItem, GutCondition, ScanResult, ScanAnalysis, IngredientAnalysisResult, HiddenTrigger } from '../types';
import { 
  FoodRecommendation, 
  PatternAnalysis, 
  NutritionFacts,
  ServiceError, 
  Result,
  NetworkError
} from '../types/comprehensive';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';
import { apiKeyManager } from '../utils/apiKeyManager';
import OpenFoodFactsService, { OpenFoodFactsProduct } from './OpenFoodFactsService';

// API Configuration
const API_CONFIG = {
  OPENFOODFACTS: {
    baseUrl: 'https://world.openfoodfacts.org/api/v2',
    timeout: 10000,
    userAgent: 'GutSafe/1.0.0 (https://gutsafe.com)',
  },
  USDA: {
    baseUrl: 'https://api.nal.usda.gov/fdc/v1',
    timeout: 10000,
  },
  SPOONACULAR: {
    baseUrl: 'https://api.spoonacular.com',
    timeout: 10000,
  },
  GOOGLE_VISION: {
    baseUrl: 'https://vision.googleapis.com/v1',
    timeout: 15000,
  },
};

// API Keys will be managed through apiKeyManager

// Database Types

interface USDAProduct {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  foodNutrients: Array<{
    nutrient: {
      id: number;
      name: string;
      unitName: string;
    };
    amount: number;
  }>;
}

interface SpoonacularProduct {
  id: number;
  title: string;
  image: string;
  imageType: string;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  ingredients: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
}

export interface ComplexFoodAnalysis {
  foodName: string;
  overallRisk: ScanResult;
  flaggedIngredients: IngredientAnalysisResult[];
  hiddenTriggers: HiddenTrigger[];
  riskSummary: {
    totalIngredients: number;
    problematicCount: number;
    hiddenCount: number;
    severeCount: number;
    moderateCount: number;
    mildCount: number;
  };
  recommendations: {
    overall: string;
    specific: string[];
    alternatives: string[];
  };
  confidence: number;
}

/**
 * FoodService - Handles all food-related operations
 * Consolidates food database, scanning, analysis, recommendations, and AI learning
 */
class FoodService {
  private static instance: FoodService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour
  private openFoodFactsService: OpenFoodFactsService;

  private constructor() {
    this.openFoodFactsService = OpenFoodFactsService.getInstance();
  }

  public static getInstance(): FoodService {
    if (!FoodService.instance) {
      FoodService.instance = new FoodService();
    }
    return FoodService.instance;
  }

  /**
   * Initialize the food service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('FoodService initialized', 'FoodService');
    } catch (error) {
      logger.error('Failed to initialize FoodService', 'FoodService', error);
      throw error;
    }
  }


  /**
   * Search for food by barcode
   */
  async searchByBarcode(barcode: string): Promise<Result<FoodItem | null, ServiceError>> {
    const result = await errorHandler.withErrorHandling(async () => {
      const cacheKey = `barcode_${barcode}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Try OpenFoodFacts first with retry
      const openFoodFactsResult = await this.openFoodFactsService.getProductByBarcode(barcode);
      
      if (openFoodFactsResult.success && openFoodFactsResult.data) {
        const foodItem = this.convertToFoodItem(openFoodFactsResult.data, 'openfoodfacts');
        this.setCachedData(cacheKey, foodItem);
        return foodItem;
      }

      // Try USDA if OpenFoodFacts fails with retry
      const usdaResult = await this.searchUSDA(barcode);
      
      if (usdaResult.success && usdaResult.data) {
        const foodItem = this.convertToFoodItem(usdaResult.data, 'usda');
        this.setCachedData(cacheKey, foodItem);
        return foodItem;
      }

      return null;
    }, {
      operation: 'searchByBarcode',
      service: 'FoodService',
      additionalData: { barcode }
    }, 'FoodService');

    if (result.success) {
      return { success: true, data: result.data as FoodItem | null };
    } else {
      return { 
        success: false, 
        error: {
          ...result.error,
          code: 'SERVICE_ERROR' as const,
          service: 'FoodService',
          operation: 'searchByBarcode'
        }
      };
    }
  }

  /**
   * Search for food by name
   */
  async searchByName(query: string): Promise<Result<FoodItem[], ServiceError>> {
    const result = await errorHandler.withErrorHandling(async () => {
      const cacheKey = `search_${query.toLowerCase()}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      const results: FoodItem[] = [];

      // Search multiple sources with retry
      const [openFoodFactsResults, usdaResults, spoonacularResults] = await Promise.allSettled([
        this.openFoodFactsService.searchProducts({
          search_terms: query,
          page_size: 10,
          sort_by: 'popularity'
        }),
        this.searchUSDAByName(query),
        this.searchSpoonacularByName(query),
      ]);

      // Process results
      if (openFoodFactsResults.status === 'fulfilled' && openFoodFactsResults.value.success) {
        const foodItems = openFoodFactsResults.value.data.products.map(product => 
          this.convertToFoodItem(product, 'openfoodfacts')
        );
        results.push(...foodItems);
      }
      if (usdaResults.status === 'fulfilled' && usdaResults.value.success) {
        const foodItems = usdaResults.value.data;
        results.push(...foodItems);
      }
      if (spoonacularResults.status === 'fulfilled' && spoonacularResults.value.success) {
        const foodItems = spoonacularResults.value.data;
        results.push(...foodItems);
      }

      // Remove duplicates and limit results
      const uniqueResults = this.removeDuplicateFoods(results).slice(0, 20);
      this.setCachedData(cacheKey, uniqueResults);
      
      return uniqueResults;
    }, {
      operation: 'searchByName',
      service: 'FoodService',
      additionalData: { query }
    }, 'FoodService');

    if (result.success) {
      return { success: true, data: result.data as FoodItem[] };
    } else {
      return { 
        success: false, 
        error: {
          ...result.error,
          code: 'SERVICE_ERROR' as const,
          service: 'FoodService',
          operation: 'searchByName'
        }
      };
    }
  }

  /**
   * Analyze food for gut health
   */
  async analyzeFood(foodItem: FoodItem, gutProfile: GutCondition[]): Promise<Result<ScanAnalysis, ServiceError>> {
    const result = await errorHandler.withErrorHandling(async () => {
      const analysis: ScanAnalysis = {
        overallSafety: 'safe' as ScanResult,
        flaggedIngredients: [],
        conditionWarnings: [],
        safeAlternatives: [],
        explanation: '',
        dataSource: 'FoodService',
        lastUpdated: new Date(),
      };

      // Analyze ingredients
      if (foodItem.ingredients) {
        const ingredientAnalysis = await this.analyzeIngredients(foodItem.ingredients.join(', '), gutProfile);
        analysis.flaggedIngredients = ingredientAnalysis.flagged.map(ing => ({
          ingredient: ing.ingredient,
          reason: 'Potential trigger',
          severity: ing.riskLevel === 'severe' ? 'severe' : ing.riskLevel === 'moderate' ? 'moderate' : 'mild',
          condition: 'ibs-fodmap' as GutCondition, // Default condition
        }));
        analysis.overallSafety = this.calculateOverallRisk(ingredientAnalysis);
      }

      // Generate recommendations
      analysis.safeAlternatives = this.generateRecommendations(foodItem, analysis, gutProfile);
      analysis.explanation = `Analysis completed with ${analysis.flaggedIngredients.length} flagged ingredients`;

      logger.info('Food analysis completed', 'FoodService', { 
        foodId: foodItem.id, 
        risk: analysis.overallSafety,
      });

      return analysis;
    }, {
      operation: 'analyzeFood',
      service: 'FoodService',
      additionalData: { foodId: foodItem.id, gutProfileCount: gutProfile.length }
    }, 'FoodService');

    if (result.success) {
      return { success: true, data: result.data as ScanAnalysis };
    } else {
      return { 
        success: false, 
        error: {
          ...result.error,
          code: 'SERVICE_ERROR' as const,
          service: 'FoodService',
          operation: 'analyzeFood'
        }
      };
    }
  }

  /**
   * Get food recommendations based on gut profile
   */
  async getRecommendations(_gutProfile: GutCondition[]): Promise<FoodRecommendation[]> {
    try {
      // This would use AI/ML in a real implementation
      const recommendations: FoodRecommendation[] = [
        {
          id: '1',
          name: 'Quinoa',
          reason: 'High in fiber and protein, gentle on digestive system',
          confidence: 0.9,
          category: 'Grains',
          nutritionalValue: {
            calories: 120,
            protein: 4.4,
            carbs: 22,
            fat: 1.9,
          },
        },
        {
          id: '2',
          name: 'Greek Yogurt',
          reason: 'Contains probiotics that support gut health',
          confidence: 0.85,
          category: 'Dairy',
          nutritionalValue: {
            calories: 100,
            protein: 10,
            carbs: 6,
            fat: 0,
          },
        },
      ];

      return recommendations;
    } catch (error) {
      logger.error('Failed to get recommendations', 'FoodService', error);
      return [];
    }
  }

  /**
   * Analyze pattern in food consumption
   */
  async analyzePatterns(_scanHistory: any[]): Promise<PatternAnalysis> {
    try {
      // This would use pattern analysis algorithms in a real implementation
      const analysis: PatternAnalysis = {
        commonTriggers: ['Dairy', 'Gluten', 'Spicy foods'],
        safeFoods: ['Rice', 'Bananas', 'Oatmeal'],
        timePatterns: {
          morning: ['Oatmeal', 'Bananas'],
          afternoon: ['Rice', 'Chicken'],
          evening: ['Vegetables', 'Fish'],
        },
        seasonalPatterns: {
          spring: ['Leafy greens', 'Berries'],
          summer: ['Watermelon', 'Cucumber'],
          fall: ['Squash', 'Apples'],
          winter: ['Root vegetables', 'Citrus'],
        },
      };

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze patterns', 'FoodService', error);
      throw error;
    }
  }


  /**
   * Search USDA by barcode
   */
  private async searchUSDA(barcode: string): Promise<Result<USDAProduct | null, NetworkError>> {
    try {
      const apiKey = await apiKeyManager.getApiKey('USDA_API_KEY');
      if (!apiKey) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: 'USDA API key not configured',
          status: 500,
          url: `${API_CONFIG.USDA.baseUrl}/foods/search`,
          method: 'GET',
          timestamp: new Date(),
          details: { barcode }
        };
        return { success: false, error: networkError };
      }

      const response = await fetch(`${API_CONFIG.USDA.baseUrl}/foods/search?query=${barcode}&api_key=${apiKey}`, {
        signal: AbortSignal.timeout(API_CONFIG.USDA.timeout),
      });
      
      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: { barcode }
        };
        return { success: false, error: networkError };
      }
      
      const data = await response.json();
      const product = data.foods?.[0] || null;
      return { success: true, data: product };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { barcode, error }
      };
      
      logger.error('USDA search failed', 'FoodService', { barcode, error });
      return { success: false, error: networkError };
    }
  }

  /**
   * Search USDA by name
   */
  private async searchUSDAByName(query: string): Promise<Result<FoodItem[], NetworkError>> {
    try {
      const apiKey = await apiKeyManager.getApiKey('USDA_API_KEY');
      if (!apiKey) {
        logger.warn('USDA API key not configured', 'FoodService');
        return { success: true, data: [] };
      }

      const response = await fetch(`${API_CONFIG.USDA.baseUrl}/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}`, {
        signal: AbortSignal.timeout(API_CONFIG.USDA.timeout),
      });
      
      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: { query }
        };
        return { success: false, error: networkError };
      }
      
      const data = await response.json();
      const products = data.foods?.slice(0, 10).map((product: USDAProduct) => 
        this.convertToFoodItem(product, 'usda')
      ) || [];
      
      return { success: true, data: products };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { query, error }
      };
      
      logger.error('USDA name search failed', 'FoodService', { query, error });
      return { success: false, error: networkError };
    }
  }

  /**
   * Search Spoonacular by name
   */
  private async searchSpoonacularByName(query: string): Promise<Result<FoodItem[], NetworkError>> {
    try {
      const apiKey = await apiKeyManager.getApiKey('SPOONACULAR_API_KEY');
      if (!apiKey) {
        logger.warn('Spoonacular API key not configured', 'FoodService');
        return { success: true, data: [] };
      }

      const response = await fetch(`${API_CONFIG.SPOONACULAR.baseUrl}/food/products/search?query=${encodeURIComponent(query)}&apiKey=${apiKey}`, {
        signal: AbortSignal.timeout(API_CONFIG.SPOONACULAR.timeout),
      });
      
      if (!response.ok) {
        const networkError: NetworkError = {
          code: 'NETWORK_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          url: response.url,
          method: 'GET',
          timestamp: new Date(),
          details: { query }
        };
        return { success: false, error: networkError };
      }
      
      const data = await response.json();
      const products = data.products?.slice(0, 10).map((product: SpoonacularProduct) => 
        this.convertToFoodItem(product, 'spoonacular')
      ) || [];
      
      return { success: true, data: products };
    } catch (error) {
      const networkError: NetworkError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
        timestamp: new Date(),
        details: { query, error }
      };
      
      logger.error('Spoonacular search failed', 'FoodService', { query, error });
      return { success: false, error: networkError };
    }
  }

  /**
   * Convert API product to FoodItem
   */
  private convertToFoodItem(product: OpenFoodFactsProduct | USDAProduct | SpoonacularProduct, source: string): FoodItem {
    const baseId = 'code' in product ? product.code : 'fdcId' in product ? product.fdcId : product.id;
    const name = 'product_name' in product ? product.product_name : 'description' in product ? product.description : product.title;
    const brand = 'brands' in product ? product.brands : 'brandOwner' in product ? product.brandOwner : '';
    const category = 'categories' in product ? product.categories : 'Unknown';
    const ingredients = 'ingredients_text' in product ? product.ingredients_text : 'ingredients' in product ? 
      (Array.isArray(product.ingredients) ? product.ingredients.map(ing => typeof ing === 'string' ? ing : ing.name).join(', ') : '') : '';
    const barcode = 'code' in product ? product.code : '';
    const imageUrl = 'image_url' in product ? product.image_url : 'image' in product ? product.image : '';
    const allergens = 'allergens_tags' in product ? product.allergens_tags || [] : [];
    const additives = 'additives_tags' in product ? (Array.isArray(product.additives_tags) ? product.additives_tags : []) : [];
    const labels = 'labels_tags' in product ? product.labels_tags || [] : [];
    const categories = 'categories_tags' in product ? product.categories_tags || [] : [];
    const countries = 'countries_tags' in product ? product.countries_tags || [] : [];
    const traces = 'traces_tags' in product ? product.traces_tags || [] : [];

    return {
      id: `${source}_${baseId}`,
      name: name || 'Unknown Product',
      brand: brand || '',
      category: category || 'Unknown',
      ingredients: ingredients || '',
      barcode: barcode || '',
      imageUrl: imageUrl || '',
      nutritionFacts: this.extractNutritionFacts(product),
      allergens,
      additives,
      source,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Additional OpenFoodFacts metadata
      ...(source === 'openfoodfacts' && {
        nutriscore: 'nutriscore_grade' in product ? product.nutriscore_grade : undefined,
        ecoscore: 'ecoscore_grade' in product ? product.ecoscore_grade : undefined,
        novaGroup: 'nova_group' in product ? product.nova_group : undefined,
        labels,
        categories,
        countries,
        traces,
        lastModified: 'last_modified_t' in product ? new Date(product.last_modified_t * 1000) : undefined,
      }),
    };
  }

  /**
   * Extract nutrition facts from product data
   */
  private extractNutritionFacts(product: OpenFoodFactsProduct | USDAProduct | SpoonacularProduct): NutritionFacts {
    const nutrition: NutritionFacts = {};
    
    // OpenFoodFacts nutrition data
    if ('energy_kcal_100g' in product && product.energy_kcal_100g) {
      nutrition.calories = product.energy_kcal_100g;
    }
    if ('fat_100g' in product && product.fat_100g) {
      nutrition.fat = product.fat_100g;
    }
    if ('saturated_fat_100g' in product && product.saturated_fat_100g) {
      nutrition.saturatedFat = product.saturated_fat_100g;
    }
    if ('carbohydrates_100g' in product && product.carbohydrates_100g) {
      nutrition.carbs = product.carbohydrates_100g;
    }
    if ('sugars_100g' in product && product.sugars_100g) {
      nutrition.sugars = product.sugars_100g;
    }
    if ('fiber_100g' in product && product.fiber_100g) {
      nutrition.fiber = product.fiber_100g;
    }
    if ('proteins_100g' in product && product.proteins_100g) {
      nutrition.protein = product.proteins_100g;
    }
    if ('salt_100g' in product && product.salt_100g) {
      nutrition.salt = product.salt_100g;
    }
    if ('sodium_100g' in product && product.sodium_100g) {
      nutrition.sodium = product.sodium_100g;
    }
    
    // USDA nutrition data
    if ('foodNutrients' in product && product.foodNutrients) {
      product.foodNutrients.forEach(nutrient => {
        const name = nutrient.nutrient.name.toLowerCase();
        const amount = nutrient.amount;
        
        switch (name) {
          case 'energy':
            nutrition.calories = amount;
            break;
          case 'protein':
            nutrition.protein = amount;
            break;
          case 'total lipid (fat)':
            nutrition.fat = amount;
            break;
          case 'carbohydrate, by difference':
            nutrition.carbs = amount;
            break;
          case 'fiber, total dietary':
            nutrition.fiber = amount;
            break;
          case 'sugars, total including nlea':
            nutrition.sugars = amount;
            break;
          case 'sodium, na':
            nutrition.sodium = amount;
            break;
        }
      });
    }
    
    // Spoonacular nutrition data
    if ('nutrition' in product && product.nutrition?.nutrients) {
      product.nutrition.nutrients.forEach(nutrient => {
        const name = nutrient.name.toLowerCase();
        const amount = nutrient.amount;
        
        switch (name) {
          case 'calories':
            nutrition.calories = amount;
            break;
          case 'protein':
            nutrition.protein = amount;
            break;
          case 'fat':
            nutrition.fat = amount;
            break;
          case 'carbohydrates':
            nutrition.carbs = amount;
            break;
          case 'sugar':
            nutrition.sugars = amount;
            break;
          case 'fiber':
            nutrition.fiber = amount;
            break;
          case 'sodium':
            nutrition.sodium = amount;
            break;
        }
      });
    }
    
    return nutrition;
  }

  /**
   * Analyze ingredients for gut health
   */
  private async analyzeIngredients(ingredients: string, _gutProfile: GutCondition[]): Promise<{
    flagged: IngredientAnalysisResult[];
    hidden: HiddenTrigger[];
    confidence: number;
  }> {
    // This would use AI/ML in a real implementation
    const flagged: IngredientAnalysisResult[] = [];
    const hidden: HiddenTrigger[] = [];
    
    // Mock analysis based on common triggers
    const commonTriggers = ['dairy', 'gluten', 'soy', 'nuts', 'eggs'];
    const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
    
    ingredientList.forEach(ingredient => {
      commonTriggers.forEach(trigger => {
        if (ingredient.includes(trigger)) {
          flagged.push({
            ingredient: ingredient.trim(),
            isProblematic: true,
            isHidden: false,
            detectedTriggers: [],
            confidence: 0.7,
            category: 'common_trigger',
            riskLevel: 'moderate',
            recommendations: {
              avoid: true,
              caution: false,
              alternatives: [],
              modifications: [],
            },
          });
        }
      });
    });

    return {
      flagged,
      hidden,
      confidence: 0.8,
    };
  }

  /**
   * Calculate overall risk from analysis
   */
  private calculateOverallRisk(analysis: { flagged: IngredientAnalysisResult[] }): ScanResult {
    if (analysis.flagged.length === 0) return 'safe';
    if (analysis.flagged.some(f => f.riskLevel === 'severe')) return 'avoid';
    if (analysis.flagged.some(f => f.riskLevel === 'moderate')) return 'caution';
    return 'safe';
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(_foodItem: FoodItem, analysis: ScanAnalysis, _gutProfile: GutCondition[]): string[] {
    const recommendations: string[] = [];
    
    if (analysis.overallSafety === 'avoid') {
      recommendations.push('Consider avoiding this food due to potential triggers');
    } else if (analysis.overallSafety === 'caution') {
      recommendations.push('Consume in moderation and monitor symptoms');
    } else {
      recommendations.push('This food appears safe for your gut profile');
    }
    
    return recommendations;
  }

  /**
   * Remove duplicate foods from search results
   */
  private removeDuplicateFoods(foods: FoodItem[]): FoodItem[] {
    const seen = new Set<string>();
    return foods.filter(food => {
      const key = `${food.name}_${food.brand}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Cache management
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.cache.clear();
    this.openFoodFactsService.cleanup();
    logger.info('FoodService cleaned up', 'FoodService');
  }
}

export default FoodService;
