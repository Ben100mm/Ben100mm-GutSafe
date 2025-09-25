/**
 * @fileoverview MenuOCRService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { FoodItem, GutCondition, ScanResult, SeverityLevel } from '../types';
import { foodDatabaseService } from './FoodDatabaseService';

// Menu OCR Types
interface MenuItem {
  name: string;
  description?: string;
  ingredients?: string[];
  allergens?: string[];
  price?: string;
  category?: string;
  confidence: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface ParsedMenu {
  restaurant: string;
  sections: MenuSection[];
  extractedText: string;
  confidence: number;
  timestamp: Date;
}

interface MenuAnalysis {
  overallSafety: ScanResult;
  flaggedItems: Array<{
    item: MenuItem;
    flaggedIngredients: Array<{
      ingredient: string;
      reason: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }>;
    safeAlternatives: string[];
    explanation: string;
  }>;
  safeItems: MenuItem[];
  recommendations: string[];
  confidence: number;
}

// GPT API Configuration
const GPT_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  maxTokens: 2000,
  temperature: 0.3,
  timeout: 30000,
};

// Google Vision API Configuration
const VISION_CONFIG = {
  baseUrl: 'https://vision.googleapis.com/v1',
  timeout: 15000,
};

export class MenuOCRService {
  private static instance: MenuOCRService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  static getInstance(): MenuOCRService {
    if (!MenuOCRService.instance) {
      MenuOCRService.instance = new MenuOCRService();
    }
    return MenuOCRService.instance;
  }

  // Main method to scan and analyze menu
  async scanMenu(
    imageBase64: string,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<MenuAnalysis> {
    try {
      // Step 1: Extract text from image using Google Vision API
      const extractedText = await this.extractTextFromImage(imageBase64);
      
      if (!extractedText.trim()) {
        throw new Error('No text could be extracted from the image');
      }

      // Step 2: Parse menu using GPT
      const parsedMenu = await this.parseMenuWithGPT(extractedText);
      
      // Step 3: Analyze menu items for gut health
      const analysis = await this.analyzeMenuItems(parsedMenu, userConditions, userTriggers);
      
      return analysis;
    } catch (error) {
      console.error('Menu OCR error:', error);
      throw new Error(`Failed to scan menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Extract text from image using Google Vision API
  private async extractTextFromImage(imageBase64: string): Promise<string> {
    const cacheKey = `vision_ocr_${imageBase64.substring(0, 100)}`;
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
      if (!apiKey) {
        throw new Error('Google Vision API key not configured');
      }

      const url = `${VISION_CONFIG.baseUrl}/images:annotate?key=${apiKey}`;
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
            imageContext: {
              languageHints: ['en'],
            },
          },
        ],
      };

      const response = await this.makeApiCall(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, VISION_CONFIG.timeout);

      const extractedText = response.responses[0]?.fullTextAnnotation?.text || '';
      this.setCache(cacheKey, extractedText);
      return extractedText;
    } catch (error) {
      console.error('Google Vision API error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  // Parse menu using GPT
  private async parseMenuWithGPT(extractedText: string): Promise<ParsedMenu> {
    const cacheKey = `gpt_menu_${extractedText.substring(0, 200)}`;
    const cached = this.getFromCache<ParsedMenu>(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = this.createMenuParsingPrompt(extractedText);
      
      const url = `${GPT_CONFIG.baseUrl}/chat/completions`;
      const requestBody = {
        model: GPT_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at parsing restaurant menus from OCR text. Extract menu items, ingredients, allergens, and organize them into sections. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: GPT_CONFIG.maxTokens,
        temperature: GPT_CONFIG.temperature,
      };

      const response = await this.makeApiCall(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }, GPT_CONFIG.timeout);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from GPT');
      }

      // Parse JSON response
      const parsedMenu = this.parseGPTResponse(content, extractedText);
      this.setCache(cacheKey, parsedMenu);
      return parsedMenu;
    } catch (error) {
      console.error('GPT API error:', error);
      throw new Error('Failed to parse menu with AI');
    }
  }

  // Create prompt for menu parsing
  private createMenuParsingPrompt(extractedText: string): string {
    return `
Please parse the following OCR text from a restaurant menu and extract structured information. Return a JSON object with this exact structure:

{
  "restaurant": "Restaurant name if identifiable",
  "sections": [
    {
      "title": "Section name (e.g., Appetizers, Main Courses, Desserts)",
      "items": [
        {
          "name": "Item name",
          "description": "Item description if available",
          "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
          "allergens": ["allergen1", "allergen2"],
          "price": "Price if available",
          "category": "Item category",
          "confidence": 0.8
        }
      ]
    }
  ]
}

Guidelines:
- Extract all menu items with their ingredients when possible
- Identify common allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans)
- Include confidence scores (0-1) based on how clear the information is
- Group items into logical sections
- If ingredients aren't explicitly listed, infer common ingredients for that dish type
- Be conservative with confidence scores

OCR Text:
${extractedText}
    `.trim();
  }

  // Parse GPT response
  private parseGPTResponse(content: string, originalText: string): ParsedMenu {
    try {
      // Extract JSON from response (handle cases where GPT adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in GPT response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the parsed data
      const validatedMenu: ParsedMenu = {
        restaurant: parsed.restaurant || 'Unknown Restaurant',
        sections: this.validateSections(parsed.sections || []),
        extractedText: originalText,
        confidence: this.calculateOverallConfidence(parsed.sections || []),
        timestamp: new Date(),
      };

      return validatedMenu;
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      // Fallback: create a basic menu structure
      return this.createFallbackMenu(originalText);
    }
  }

  // Validate menu sections
  private validateSections(sections: any[]): MenuSection[] {
    return sections
      .filter(section => section && typeof section === 'object')
      .map(section => ({
        title: section.title || 'Unknown Section',
        items: this.validateItems(section.items || []),
      }))
      .filter(section => section.items.length > 0);
  }

  // Validate menu items
  private validateItems(items: any[]): MenuItem[] {
    return items
      .filter(item => item && typeof item === 'object' && item.name)
      .map(item => ({
        name: String(item.name).trim(),
        description: item.description ? String(item.description).trim() : undefined,
        ingredients: Array.isArray(item.ingredients) 
          ? item.ingredients.map((ing: any) => String(ing).trim()).filter(Boolean)
          : [],
        allergens: Array.isArray(item.allergens)
          ? item.allergens.map((all: any) => String(all).trim()).filter(Boolean)
          : [],
        price: item.price ? String(item.price).trim() : undefined,
        category: item.category ? String(item.category).trim() : undefined,
        confidence: typeof item.confidence === 'number' 
          ? Math.max(0, Math.min(1, item.confidence))
          : 0.5,
      }));
  }

  // Calculate overall confidence
  private calculateOverallConfidence(sections: any[]): number {
    if (sections.length === 0) return 0;
    
    const allItems = sections.flatMap(section => section.items || []);
    if (allItems.length === 0) return 0;
    
    const totalConfidence = allItems.reduce((sum, item) => sum + (item.confidence || 0.5), 0);
    return totalConfidence / allItems.length;
  }

  // Create fallback menu structure
  private createFallbackMenu(extractedText: string): ParsedMenu {
    // Simple text parsing as fallback
    const lines = extractedText.split('\n').filter(line => line.trim());
    const items: MenuItem[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 100) {
        items.push({
          name: trimmed,
          ingredients: [],
          allergens: [],
          confidence: 0.3,
        });
      }
    });

    return {
      restaurant: 'Unknown Restaurant',
      sections: [{
        title: 'Menu Items',
        items: items.slice(0, 20), // Limit to 20 items
      }],
      extractedText,
      confidence: 0.3,
      timestamp: new Date(),
    };
  }

  // Analyze menu items for gut health
  private async analyzeMenuItems(
    parsedMenu: ParsedMenu,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] }
  ): Promise<MenuAnalysis> {
    const flaggedItems: Array<{
      item: MenuItem;
      flaggedIngredients: Array<{
        ingredient: string;
        reason: string;
        severity: SeverityLevel;
        condition: GutCondition;
      }>;
      safeAlternatives: string[];
      explanation: string;
    }> = [];

    const safeItems: MenuItem[] = [];

    // Analyze each menu item
    for (const section of parsedMenu.sections) {
      for (const item of section.items) {
        const analysis = await this.analyzeMenuItem(item, userConditions, userTriggers);
        
        if (analysis.flaggedIngredients.length > 0) {
          flaggedItems.push({
            item,
            flaggedIngredients: analysis.flaggedIngredients,
            safeAlternatives: analysis.safeAlternatives,
            explanation: analysis.explanation,
          });
        } else {
          safeItems.push(item);
        }
      }
    }

    // Determine overall safety
    const overallSafety = this.determineMenuSafety(flaggedItems);
    
    // Generate recommendations
    const recommendations = this.generateMenuRecommendations(flaggedItems, safeItems, userConditions);

    return {
      overallSafety,
      flaggedItems,
      safeItems,
      recommendations,
      confidence: parsedMenu.confidence,
    };
  }

  // Analyze individual menu item
  private async analyzeMenuItem(
    item: MenuItem,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] }
  ): Promise<{
    flaggedIngredients: Array<{
      ingredient: string;
      reason: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }>;
    safeAlternatives: string[];
    explanation: string;
  }> {
    const flaggedIngredients: Array<{
      ingredient: string;
      reason: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }> = [];

    const safeAlternatives: string[] = [];

    // Analyze each ingredient
    for (const ingredient of item.ingredients || []) {
      const analysis = this.analyzeIngredientForConditions(ingredient, userConditions, userTriggers);
      if (analysis.isProblematic) {
        flaggedIngredients.push({
          ingredient: analysis.ingredient,
          reason: analysis.reason,
          severity: analysis.severity,
          condition: analysis.condition,
        });
      }
    }

    // Generate safe alternatives
    if (flaggedIngredients.length > 0) {
      const alternatives = this.generateItemAlternatives(item, flaggedIngredients);
      safeAlternatives.push(...alternatives);
    }

    // Generate explanation
    const explanation = this.generateItemExplanation(item, flaggedIngredients);

    return {
      flaggedIngredients,
      safeAlternatives,
      explanation,
    };
  }

  // Analyze ingredient for specific conditions
  private analyzeIngredientForConditions(
    ingredient: string,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] }
  ): {
    isProblematic: boolean;
    ingredient: string;
    reason: string;
    severity: SeverityLevel;
    condition: GutCondition;
  } {
    const lowerIngredient = ingredient.toLowerCase();

    // Check user-defined triggers first
    for (const [condition, triggers] of Object.entries(userTriggers)) {
      if (triggers.some(trigger => lowerIngredient.includes(trigger.toLowerCase()))) {
        return {
          isProblematic: true,
          ingredient,
          reason: `Known trigger for ${condition.replace('-', ' ')}`,
          severity: 'severe',
          condition: condition as GutCondition,
        };
      }
    }

    // Check condition-specific patterns
    for (const condition of userConditions) {
      const analysis = this.checkConditionSpecificTriggers(lowerIngredient, condition);
      if (analysis.isProblematic) {
        return {
          isProblematic: true,
          ingredient,
          reason: analysis.reason,
          severity: analysis.severity,
          condition,
        };
      }
    }

    return {
      isProblematic: false,
      ingredient,
      reason: '',
      severity: 'mild',
      condition: 'additives' as GutCondition,
    };
  }

  // Check condition-specific triggers (reuse from FoodDatabaseService)
  private checkConditionSpecificTriggers(
    ingredient: string,
    condition: GutCondition
  ): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
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

  // Determine overall menu safety
  private determineMenuSafety(flaggedItems: any[]): ScanResult {
    if (flaggedItems.length === 0) return 'safe';
    
    const severeCount = flaggedItems.filter(item => 
      item.flaggedIngredients.some((ing: any) => ing.severity === 'severe')
    ).length;
    
    const moderateCount = flaggedItems.filter(item => 
      item.flaggedIngredients.some((ing: any) => ing.severity === 'moderate')
    ).length;
    
    if (severeCount > 0) return 'avoid';
    if (moderateCount > 0) return 'caution';
    return 'safe';
  }

  // Generate menu recommendations
  private generateMenuRecommendations(
    flaggedItems: any[],
    safeItems: MenuItem[],
    userConditions: GutCondition[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (safeItems.length > 0) {
      recommendations.push(`✅ ${safeItems.length} safe items found on this menu`);
    }
    
    if (flaggedItems.length > 0) {
      recommendations.push(`⚠️ ${flaggedItems.length} items may trigger your symptoms`);
    }
    
    // Condition-specific recommendations
    if (userConditions.includes('ibs-fodmap')) {
      recommendations.push('💡 Ask for modifications: no onion, no garlic, no high-FODMAP vegetables');
    }
    
    if (userConditions.includes('gluten')) {
      recommendations.push('💡 Request gluten-free options and ask about cross-contamination');
    }
    
    if (userConditions.includes('lactose')) {
      recommendations.push('💡 Ask for dairy-free alternatives and check for hidden dairy in sauces');
    }
    
    if (userConditions.includes('reflux')) {
      recommendations.push('💡 Avoid spicy, acidic, and fried foods. Choose grilled or steamed options');
    }
    
    if (userConditions.includes('histamine')) {
      recommendations.push('💡 Avoid aged, fermented, and processed foods. Choose fresh options');
    }
    
    return recommendations;
  }

  // Generate item alternatives
  private generateItemAlternatives(item: MenuItem, flaggedIngredients: any[]): string[] {
    const alternatives: string[] = [];
    
    // Generic alternatives based on item category
    if (item.category) {
      const categoryAlternatives = this.getCategoryAlternatives(item.category);
      alternatives.push(...categoryAlternatives);
    }
    
    // Specific alternatives for flagged ingredients
    for (const flagged of flaggedIngredients) {
      const ingredientAlternatives = this.getIngredientAlternatives(flagged.ingredient, flagged.condition);
      alternatives.push(...ingredientAlternatives);
    }
    
    return [...new Set(alternatives)]; // Remove duplicates
  }

  // Get category-specific alternatives
  private getCategoryAlternatives(category: string): string[] {
    const alternativesMap: { [key: string]: string[] } = {
      'Appetizer': ['Fresh salad', 'Grilled vegetables', 'Hummus with vegetables'],
      'Main Course': ['Grilled fish', 'Steamed vegetables', 'Quinoa bowl'],
      'Dessert': ['Fresh fruit', 'Sorbet', 'Coconut yogurt'],
      'Beverage': ['Herbal tea', 'Sparkling water', 'Fresh juice'],
    };
    
    return alternativesMap[category] || [];
  }

  // Get ingredient-specific alternatives
  private getIngredientAlternatives(ingredient: string, condition: GutCondition): string[] {
    const alternatives: string[] = [];
    const lowerIngredient = ingredient.toLowerCase();
    
    // Gluten alternatives
    if (condition === 'gluten' && lowerIngredient.includes('wheat')) {
      alternatives.push('Rice', 'Quinoa', 'Gluten-free pasta', 'Cauliflower rice');
    }
    
    // Dairy alternatives
    if (condition === 'lactose' && lowerIngredient.includes('milk')) {
      alternatives.push('Coconut milk', 'Almond milk', 'Oat milk', 'Dairy-free cheese');
    }
    
    // FODMAP alternatives
    if (condition === 'ibs-fodmap') {
      if (lowerIngredient.includes('onion')) alternatives.push('Green onion tops', 'Chives');
      if (lowerIngredient.includes('garlic')) alternatives.push('Garlic-infused oil');
      if (lowerIngredient.includes('wheat')) alternatives.push('Gluten-free flour', 'Rice flour');
    }
    
    return alternatives;
  }

  // Generate item explanation
  private generateItemExplanation(item: MenuItem, flaggedIngredients: any[]): string {
    if (flaggedIngredients.length === 0) {
      return `${item.name} appears to be safe for your gut health conditions.`;
    }
    
    const conditions = [...new Set(flaggedIngredients.map((ing: any) => ing.condition))];
    const conditionNames = conditions.map(cond => cond.replace('-', ' ')).join(', ');
    
    return `${item.name} contains ingredients that may trigger your ${conditionNames} symptoms. Consider asking for modifications or choosing an alternative.`;
  }

  // Generic API call method
  private async makeApiCall(
    url: string,
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<any> {
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
}

// Export singleton instance
export const menuOCRService = MenuOCRService.getInstance();
