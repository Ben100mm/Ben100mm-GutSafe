/**
 * @fileoverview FoodDatabaseService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { FoodItem, GutCondition, ScanResult, SeverityLevel } from '../types';

// API Configuration
const API_CONFIG = {
  OPENFOODFACTS: {
    baseUrl: 'https://world.openfoodfacts.org/api/v0',
    timeout: 10000,
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

// API Keys (should be stored in environment variables in production)
const API_KEYS = {
  OPENFOODFACTS: process.env.REACT_APP_OPENFOODFACTS_API_KEY || '',
  USDA: process.env.REACT_APP_USDA_API_KEY || '',
  SPOONACULAR: process.env.REACT_APP_SPOONACULAR_API_KEY || '',
  GOOGLE_VISION: process.env.REACT_APP_GOOGLE_VISION_API_KEY || '',
};

// Database Types
interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  categories?: string;
  ingredients_text?: string;
  allergens_tags?: string[];
  additives_tags?: string[];
  nutrition_grades?: string;
  image_url?: string;
  image_ingredients_url?: string;
  image_nutrition_url?: string;
  data_sources?: string;
  last_modified_t?: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  ingredients?: string;
  foodCategory?: {
    description: string;
  };
  foodNutrients?: Array<{
    nutrient: {
      name: string;
      unitName: string;
    };
    amount: number;
  }>;
  dataType: string;
  publishedDate: string;
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
  ingredientList: string;
  analyzedInstructions?: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
}

interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
    };
  }>;
}

// Gut Health Analysis Types
interface IngredientAnalysis {
  ingredient: string;
  isProblematic: boolean;
  conditions: GutCondition[];
  severity: SeverityLevel;
  reason: string;
  alternatives?: string[];
}

interface GutHealthAnalysis {
  overallSafety: ScanResult;
  flaggedIngredients: IngredientAnalysis[];
  conditionWarnings: Array<{
    ingredient: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }>;
  safeAlternatives: string[];
  explanation: string;
  confidence: number; // 0-1
  dataSource: string;
  lastUpdated: Date;
}

// Database Service Class
export class FoodDatabaseService {
  private static instance: FoodDatabaseService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): FoodDatabaseService {
    if (!FoodDatabaseService.instance) {
      FoodDatabaseService.instance = new FoodDatabaseService();
    }
    return FoodDatabaseService.instance;
  }

  // Generic API call method
  private async makeApiCall<T>(
    url: string,
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Cache management
  private getCacheKey(prefix: string, params: any): string {
    return `${prefix}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // OpenFoodFacts API
  async searchByBarcode(barcode: string): Promise<FoodItem | null> {
    const cacheKey = this.getCacheKey('openfoodfacts_barcode', barcode);
    const cached = this.getFromCache<FoodItem>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_CONFIG.OPENFOODFACTS.baseUrl}/product/${barcode}.json`;
      const response = await this.makeApiCall<{ product: OpenFoodFactsProduct }>(
        url,
        {},
        API_CONFIG.OPENFOODFACTS.timeout
      );

      if (!response.product) return null;

      const foodItem = this.transformOpenFoodFactsProduct(response.product);
      this.setCache(cacheKey, foodItem);
      return foodItem;
    } catch (error) {
      console.error('OpenFoodFacts API error:', error);
      return null;
    }
  }

  async searchByText(query: string, page: number = 1, pageSize: number = 20): Promise<FoodItem[]> {
    const cacheKey = this.getCacheKey('openfoodfacts_search', { query, page, pageSize });
    const cached = this.getFromCache<FoodItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_CONFIG.OPENFOODFACTS.baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`;
      const response = await this.makeApiCall<{ products: OpenFoodFactsProduct[] }>(
        url,
        {},
        API_CONFIG.OPENFOODFACTS.timeout
      );

      const foodItems = response.products
        .filter(product => product.product_name && product.product_name !== '')
        .map(product => this.transformOpenFoodFactsProduct(product))
        .filter(item => item !== null) as FoodItem[];

      this.setCache(cacheKey, foodItems);
      return foodItems;
    } catch (error) {
      console.error('OpenFoodFacts search error:', error);
      return [];
    }
  }

  // USDA API
  async searchUSDAFoods(query: string, pageNumber: number = 1, pageSize: number = 50): Promise<FoodItem[]> {
    const cacheKey = this.getCacheKey('usda_search', { query, pageNumber, pageSize });
    const cached = this.getFromCache<FoodItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_CONFIG.USDA.baseUrl}/foods/search?api_key=${API_KEYS.USDA}&query=${encodeURIComponent(query)}&pageNumber=${pageNumber}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy`;
      const response = await this.makeApiCall<{ foods: USDAFood[] }>(
        url,
        {},
        API_CONFIG.USDA.timeout
      );

      const foodItems = response.foods
        .map(food => this.transformUSDAFood(food))
        .filter(item => item !== null) as FoodItem[];

      this.setCache(cacheKey, foodItems);
      return foodItems;
    } catch (error) {
      console.error('USDA API error:', error);
      return [];
    }
  }

  // Spoonacular API
  async searchSpoonacularFoods(query: string, number: number = 20): Promise<FoodItem[]> {
    const cacheKey = this.getCacheKey('spoonacular_search', { query, number });
    const cached = this.getFromCache<FoodItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_CONFIG.SPOONACULAR.baseUrl}/food/products/search?apiKey=${API_KEYS.SPOONACULAR}&query=${encodeURIComponent(query)}&number=${number}`;
      const response = await this.makeApiCall<{ products: SpoonacularProduct[] }>(
        url,
        {},
        API_CONFIG.SPOONACULAR.timeout
      );

      const foodItems = response.products
        .map(product => this.transformSpoonacularProduct(product))
        .filter(item => item !== null) as FoodItem[];

      this.setCache(cacheKey, foodItems);
      return foodItems;
    } catch (error) {
      console.error('Spoonacular API error:', error);
      return [];
    }
  }

  // Google Vision API for OCR
  async extractTextFromImage(imageBase64: string): Promise<string> {
    const cacheKey = this.getCacheKey('google_vision_ocr', imageBase64.substring(0, 100));
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${API_CONFIG.GOOGLE_VISION.baseUrl}/images:annotate?key=${API_KEYS.GOOGLE_VISION}`;
      const requestBody = {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      };

      const response = await this.makeApiCall<GoogleVisionResponse>(
        url,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        },
        API_CONFIG.GOOGLE_VISION.timeout
      );

      const extractedText = response.responses[0]?.fullTextAnnotation?.text || '';
      this.setCache(cacheKey, extractedText);
      return extractedText;
    } catch (error) {
      console.error('Google Vision API error:', error);
      return '';
    }
  }

  // Transform OpenFoodFacts product to FoodItem
  private transformOpenFoodFactsProduct(product: OpenFoodFactsProduct): FoodItem | null {
    if (!product.product_name) return null;

    return {
      id: product.code,
      name: product.product_name,
      barcode: product.code,
      brand: product.brands || 'Unknown',
      category: product.categories?.split(',')[0]?.trim() || 'Unknown',
      ingredients: this.parseIngredients(product.ingredients_text || ''),
      allergens: this.parseAllergens(product.allergens_tags || []),
      additives: this.parseAdditives(product.additives_tags || []),
      glutenFree: !this.containsGluten(product.ingredients_text || ''),
      lactoseFree: !this.containsLactose(product.ingredients_text || ''),
      histamineLevel: this.assessHistamineLevel(product.ingredients_text || ''),
      dataSource: 'OpenFoodFacts',
    };
  }

  // Transform USDA food to FoodItem
  private transformUSDAFood(food: USDAFood): FoodItem | null {
    if (!food.description) return null;

    return {
      id: food.fdcId.toString(),
      name: food.description,
      brand: food.brandOwner || 'Unknown',
      category: food.foodCategory?.description || 'Unknown',
      ingredients: this.parseIngredients(food.ingredients || ''),
      allergens: this.extractAllergensFromIngredients(food.ingredients || ''),
      additives: this.extractAdditivesFromIngredients(food.ingredients || ''),
      glutenFree: !this.containsGluten(food.ingredients || ''),
      lactoseFree: !this.containsLactose(food.ingredients || ''),
      histamineLevel: this.assessHistamineLevel(food.ingredients || ''),
      dataSource: 'USDA',
    };
  }

  // Transform Spoonacular product to FoodItem
  private transformSpoonacularProduct(product: SpoonacularProduct): FoodItem | null {
    if (!product.title) return null;

    return {
      id: product.id.toString(),
      name: product.title,
      brand: 'Unknown',
      category: 'Unknown',
      ingredients: this.parseIngredients(product.ingredientList || ''),
      allergens: this.extractAllergensFromIngredients(product.ingredientList || ''),
      additives: this.extractAdditivesFromIngredients(product.ingredientList || ''),
      glutenFree: !this.containsGluten(product.ingredientList || ''),
      lactoseFree: !this.containsLactose(product.ingredientList || ''),
      histamineLevel: this.assessHistamineLevel(product.ingredientList || ''),
      dataSource: 'Spoonacular',
    };
  }

  // Parse ingredients from text
  private parseIngredients(ingredientsText: string): string[] {
    if (!ingredientsText) return [];
    
    return ingredientsText
      .split(/[,;]/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  }

  // Parse allergens from OpenFoodFacts tags
  private parseAllergens(allergenTags: string[]): string[] {
    return allergenTags
      .map(tag => tag.replace('en:', '').replace('-', ' ').toUpperCase())
      .filter(tag => tag.length > 0);
  }

  // Parse additives from OpenFoodFacts tags
  private parseAdditives(additiveTags: string[]): string[] {
    return additiveTags
      .map(tag => tag.replace('en:', '').replace('-', ' ').toUpperCase())
      .filter(tag => tag.length > 0);
  }

  // Extract allergens from ingredients text
  private extractAllergensFromIngredients(ingredients: string): string[] {
    const commonAllergens = [
      'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soybeans',
      'gluten', 'lactose', 'casein', 'whey', 'albumin', 'lecithin'
    ];
    
    const foundAllergens: string[] = [];
    const lowerIngredients = ingredients.toLowerCase();
    
    commonAllergens.forEach(allergen => {
      if (lowerIngredients.includes(allergen)) {
        foundAllergens.push(allergen.toUpperCase());
      }
    });
    
    return foundAllergens;
  }

  // Extract additives from ingredients text
  private extractAdditivesFromIngredients(ingredients: string): string[] {
    const commonAdditives = [
      'preservatives', 'artificial flavors', 'artificial colors', 'sweeteners',
      'emulsifiers', 'stabilizers', 'thickeners', 'antioxidants', 'acidity regulators'
    ];
    
    const foundAdditives: string[] = [];
    const lowerIngredients = ingredients.toLowerCase();
    
    commonAdditives.forEach(additive => {
      if (lowerIngredients.includes(additive)) {
        foundAdditives.push(additive.toUpperCase());
      }
    });
    
    return foundAdditives;
  }

  // Check if ingredients contain gluten
  private containsGluten(ingredients: string): boolean {
    const glutenSources = [
      'wheat', 'barley', 'rye', 'oats', 'triticale', 'spelt', 'kamut',
      'flour', 'bread', 'pasta', 'cereal', 'malt', 'brewer'
    ];
    
    const lowerIngredients = ingredients.toLowerCase();
    return glutenSources.some(source => lowerIngredients.includes(source));
  }

  // Check if ingredients contain lactose
  private containsLactose(ingredients: string): boolean {
    const lactoseSources = [
      'milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein',
      'lactose', 'lactose', 'dairy', 'lactose'
    ];
    
    const lowerIngredients = ingredients.toLowerCase();
    return lactoseSources.some(source => lowerIngredients.includes(source));
  }

  // Assess histamine level
  private assessHistamineLevel(ingredients: string): 'low' | 'moderate' | 'high' {
    const highHistamine = [
      'aged cheese', 'fermented', 'sauerkraut', 'kimchi', 'wine', 'beer',
      'cured meat', 'salami', 'pepperoni', 'anchovies', 'sardines',
      'tomatoes', 'spinach', 'avocado', 'banana', 'citrus'
    ];
    
    const moderateHistamine = [
      'chocolate', 'nuts', 'seeds', 'legumes', 'soy', 'vinegar'
    ];
    
    const lowerIngredients = ingredients.toLowerCase();
    
    const highCount = highHistamine.filter(item => lowerIngredients.includes(item)).length;
    const moderateCount = moderateHistamine.filter(item => lowerIngredients.includes(item)).length;
    
    if (highCount >= 2) return 'high';
    if (highCount >= 1 || moderateCount >= 3) return 'moderate';
    return 'low';
  }

  // Gut Health Analysis
  async analyzeGutHealth(
    foodItem: FoodItem,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<GutHealthAnalysis> {
    const flaggedIngredients: IngredientAnalysis[] = [];
    const conditionWarnings: Array<{
      ingredient: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }> = [];
    const safeAlternatives: string[] = [];

    // Analyze each ingredient
    for (const ingredient of foodItem.ingredients) {
      const analysis = this.analyzeIngredient(ingredient, userConditions, userTriggers);
      if (analysis.isProblematic) {
        flaggedIngredients.push(analysis);
        conditionWarnings.push({
          ingredient: analysis.ingredient,
          severity: analysis.severity,
          condition: analysis.conditions[0] || 'ibs-fodmap', // Use first condition for warnings
        });
      }
    }

    // Determine overall safety
    const overallSafety = this.determineOverallSafety(flaggedIngredients);
    
    // Generate safe alternatives
    const alternatives = this.generateSafeAlternatives(foodItem, flaggedIngredients);
    safeAlternatives.push(...alternatives);

    // Generate explanation
    const explanation = this.generateExplanation(foodItem, flaggedIngredients, overallSafety);

    // Calculate confidence based on data source and completeness
    const confidence = this.calculateConfidence(foodItem, flaggedIngredients);

    return {
      overallSafety,
      flaggedIngredients,
      conditionWarnings,
      safeAlternatives,
      explanation,
      confidence,
      dataSource: foodItem.dataSource || 'Unknown',
      lastUpdated: new Date(),
    };
  }

  // Analyze individual ingredient
  private analyzeIngredient(
    ingredient: string,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] }
  ): IngredientAnalysis {
    const lowerIngredient = ingredient.toLowerCase();
    const problematicConditions: GutCondition[] = [];
    let severity: SeverityLevel = 'mild';
    let reason = '';

    // Check against user conditions
    for (const condition of userConditions) {
      const analysis = this.checkConditionSpecificTriggers(lowerIngredient, condition, userTriggers[condition] || []);
      if (analysis.isProblematic) {
        problematicConditions.push(condition);
        if (analysis.severity === 'severe') severity = 'severe';
        else if (analysis.severity === 'moderate' && severity !== 'severe') severity = 'moderate';
        reason += analysis.reason + ' ';
      }
    }

    return {
      ingredient,
      isProblematic: problematicConditions.length > 0,
      conditions: problematicConditions,
      severity,
      reason: reason.trim(),
      alternatives: this.getIngredientAlternatives(ingredient, problematicConditions),
    };
  }

  // Check condition-specific triggers
  private checkConditionSpecificTriggers(
    ingredient: string,
    condition: GutCondition,
    userTriggers: string[]
  ): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    // Check user-defined triggers first
    if (userTriggers.some(trigger => ingredient.includes(trigger.toLowerCase()))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: `Known trigger for ${condition.replace('-', ' ')}`,
      };
    }

    // Check condition-specific patterns
    switch (condition) {
      case 'ibs-fodmap':
        return this.checkFODMAPTriggers(ingredient);
      case 'gluten':
        return this.checkGlutenTriggers(ingredient);
      case 'lactose':
        return this.checkLactoseTriggers(ingredient);
      case 'reflux':
        return this.checkRefluxTriggers(ingredient);
      case 'histamine':
        return this.checkHistamineTriggers(ingredient);
      case 'allergies':
        return this.checkAllergyTriggers(ingredient);
      case 'additives':
        return this.checkAdditiveTriggers(ingredient);
      default:
        return { isProblematic: false, severity: 'mild', reason: '' };
    }
  }

  // FODMAP trigger checking
  private checkFODMAPTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const highFODMAP = [
      'onion', 'garlic', 'apple', 'pear', 'mango', 'watermelon', 'cauliflower',
      'broccoli', 'asparagus', 'artichoke', 'mushroom', 'wheat', 'rye', 'barley',
      'lactose', 'milk', 'yogurt', 'cheese', 'honey', 'agave', 'sorbitol',
      'mannitol', 'xylitol', 'erythritol'
    ];

    const moderateFODMAP = [
      'avocado', 'cherry', 'peach', 'plum', 'sweet potato', 'corn', 'cashew',
      'pistachio', 'chickpea', 'lentil', 'kidney bean'
    ];

    if (highFODMAP.some(item => ingredient.includes(item))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'High FODMAP content may cause bloating and digestive discomfort',
      };
    }

    if (moderateFODMAP.some(item => ingredient.includes(item))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Moderate FODMAP content may cause symptoms in sensitive individuals',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Gluten trigger checking
  private checkGlutenTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const glutenSources = [
      'wheat', 'barley', 'rye', 'oats', 'triticale', 'spelt', 'kamut',
      'flour', 'bread', 'pasta', 'cereal', 'malt', 'brewer'
    ];

    if (glutenSources.some(source => ingredient.includes(source))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'Contains gluten which may trigger digestive symptoms',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Lactose trigger checking
  private checkLactoseTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const lactoseSources = [
      'milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein',
      'lactose', 'dairy'
    ];

    if (lactoseSources.some(source => ingredient.includes(source))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Contains lactose which may cause digestive discomfort',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Reflux trigger checking
  private checkRefluxTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const refluxTriggers = [
      'coffee', 'caffeine', 'chocolate', 'mint', 'peppermint', 'spearmint',
      'citrus', 'orange', 'lemon', 'lime', 'grapefruit', 'tomato',
      'spicy', 'hot', 'pepper', 'alcohol', 'wine', 'beer', 'soda',
      'carbonated', 'fried', 'fatty', 'oily'
    ];

    if (refluxTriggers.some(trigger => ingredient.includes(trigger))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'May trigger acid reflux symptoms',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Histamine trigger checking
  private checkHistamineTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const highHistamine = [
      'aged cheese', 'fermented', 'sauerkraut', 'kimchi', 'wine', 'beer',
      'cured meat', 'salami', 'pepperoni', 'anchovies', 'sardines',
      'tomatoes', 'spinach', 'avocado', 'banana', 'citrus'
    ];

    const moderateHistamine = [
      'chocolate', 'nuts', 'seeds', 'legumes', 'soy', 'vinegar'
    ];

    if (highHistamine.some(item => ingredient.includes(item))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'High histamine content may cause allergic-like reactions',
      };
    }

    if (moderateHistamine.some(item => ingredient.includes(item))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Moderate histamine content may cause symptoms in sensitive individuals',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Allergy trigger checking
  private checkAllergyTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const commonAllergens = [
      'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soybeans'
    ];

    if (commonAllergens.some(allergen => ingredient.includes(allergen))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'Contains common allergen that may cause severe reactions',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Additive trigger checking
  private checkAdditiveTriggers(ingredient: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const problematicAdditives = [
      'artificial', 'preservative', 'sweetener', 'emulsifier', 'stabilizer',
      'thickener', 'color', 'flavor', 'msg', 'monosodium glutamate',
      'sulfite', 'nitrate', 'nitrite', 'bht', 'bha', 'tartrazine'
    ];

    if (problematicAdditives.some(additive => ingredient.includes(additive))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Contains additives that may cause digestive discomfort',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Determine overall safety
  private determineOverallSafety(flaggedIngredients: IngredientAnalysis[]): ScanResult {
    if (flaggedIngredients.length === 0) return 'safe';
    
    const severeCount = flaggedIngredients.filter(ing => ing.severity === 'severe').length;
    const moderateCount = flaggedIngredients.filter(ing => ing.severity === 'moderate').length;
    
    if (severeCount > 0) return 'avoid';
    if (moderateCount > 0) return 'caution';
    return 'safe';
  }

  // Generate safe alternatives
  private generateSafeAlternatives(foodItem: FoodItem, flaggedIngredients: IngredientAnalysis[]): string[] {
    const alternatives: string[] = [];
    
    // Generic alternatives based on category
    if (foodItem.category) {
      const categoryAlternatives = this.getCategoryAlternatives(foodItem.category);
      alternatives.push(...categoryAlternatives);
    }
    
    // Specific alternatives for flagged ingredients
    for (const flagged of flaggedIngredients) {
      if (flagged.alternatives) {
        alternatives.push(...flagged.alternatives);
      }
    }
    
    return [...new Set(alternatives)]; // Remove duplicates
  }

  // Get category-specific alternatives
  private getCategoryAlternatives(category: string): string[] {
    const alternativesMap: { [key: string]: string[] } = {
      'Dairy': ['Coconut milk', 'Almond milk', 'Oat milk', 'Rice milk', 'Coconut yogurt'],
      'Bakery': ['Gluten-free bread', 'Rice cakes', 'Oat crackers', 'Almond flour bread'],
      'Beverages': ['Herbal tea', 'Coconut water', 'Sparkling water', 'Green tea'],
      'Snacks': ['Rice crackers', 'Nuts', 'Seeds', 'Dried fruit', 'Vegetable chips'],
      'Condiments': ['Coconut aminos', 'Apple cider vinegar', 'Olive oil', 'Herbs and spices'],
    };
    
    return alternativesMap[category] || [];
  }

  // Get ingredient-specific alternatives
  private getIngredientAlternatives(ingredient: string, conditions: GutCondition[]): string[] {
    const alternatives: string[] = [];
    const lowerIngredient = ingredient.toLowerCase();
    
    // Gluten alternatives
    if (conditions.includes('gluten') && lowerIngredient.includes('wheat')) {
      alternatives.push('Rice flour', 'Almond flour', 'Coconut flour', 'Oat flour');
    }
    
    // Dairy alternatives
    if (conditions.includes('lactose') && lowerIngredient.includes('milk')) {
      alternatives.push('Coconut milk', 'Almond milk', 'Oat milk', 'Rice milk');
    }
    
    // FODMAP alternatives
    if (conditions.includes('ibs-fodmap')) {
      if (lowerIngredient.includes('onion')) alternatives.push('Green onion tops', 'Chives');
      if (lowerIngredient.includes('garlic')) alternatives.push('Garlic-infused oil');
      if (lowerIngredient.includes('wheat')) alternatives.push('Gluten-free flour', 'Rice flour');
    }
    
    return alternatives;
  }

  // Generate explanation
  private generateExplanation(
    foodItem: FoodItem,
    flaggedIngredients: IngredientAnalysis[],
    overallSafety: ScanResult
  ): string {
    if (overallSafety === 'safe') {
      return `This ${foodItem.name} appears to be safe for your gut health conditions. No problematic ingredients were detected.`;
    }
    
    if (overallSafety === 'caution') {
      return `This ${foodItem.name} contains ingredients that may cause mild to moderate digestive symptoms. Consider consuming in small amounts or finding alternatives.`;
    }
    
    return `This ${foodItem.name} contains ingredients that are likely to trigger your digestive symptoms. It's recommended to avoid this product and choose from the suggested alternatives.`;
  }

  // Calculate confidence score
  private calculateConfidence(foodItem: FoodItem, flaggedIngredients: IngredientAnalysis[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data source
    if (foodItem.dataSource === 'OpenFoodFacts') confidence += 0.2;
    if (foodItem.dataSource === 'USDA') confidence += 0.3;
    if (foodItem.dataSource === 'Spoonacular') confidence += 0.1;
    
    // Increase confidence based on ingredient completeness
    if (foodItem.ingredients.length > 0) confidence += 0.1;
    if (foodItem.allergens.length > 0) confidence += 0.1;
    
    // Decrease confidence if many ingredients are flagged (uncertainty)
    if (flaggedIngredients.length > foodItem.ingredients.length * 0.5) {
      confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  async getFoodByBarcode(barcode: string): Promise<FoodItem> {
    // Mock or real API call
    return { 
      id: barcode, 
      name: 'Mock Food', 
      ingredients: [], 
      allergens: [], 
      additives: [], 
      glutenFree: true, 
      lactoseFree: true, 
      histamineLevel: 'low', 
      dataSource: 'Mock', 
      brand: 'Mock Brand', 
      category: 'Mock Category', 
      barcode 
    };
  }
}

// Export singleton instance
export const foodDatabaseService = FoodDatabaseService.getInstance();
