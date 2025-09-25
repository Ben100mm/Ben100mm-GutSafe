/**
 * @fileoverview RecipeImporterService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { FoodItem, GutCondition, ScanResult, SeverityLevel } from '../types';
import { foodDatabaseService } from './FoodDatabaseService';

// Recipe Types
interface RecipeIngredient {
  name: string;
  amount?: string;
  unit?: string;
  notes?: string;
  isOptional?: boolean;
}

interface RecipeStep {
  number: number;
  instruction: string;
  ingredients?: string[];
  time?: string;
  temperature?: string;
}

interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];
  source?: string;
  url?: string;
  confidence: number;
  timestamp: Date;
}

interface RecipeAnalysis {
  overallSafety: ScanResult;
  flaggedIngredients: Array<{
    ingredient: RecipeIngredient;
    flaggedComponents: Array<{
      component: string;
      reason: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }>;
    safeAlternatives: string[];
    modificationSuggestions: string[];
  }>;
  safeIngredients: RecipeIngredient[];
  recipeModifications: string[];
  safeAlternatives: Array<{
    original: string;
    alternative: string;
    reason: string;
  }>;
  confidence: number;
  recommendations: string[];
}

// Web Scraping Configuration
const SCRAPING_CONFIG = {
  timeout: 15000,
  userAgent: 'GutSafe Recipe Importer 1.0',
  maxRetries: 3,
};

// GPT API Configuration
const GPT_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4',
  maxTokens: 3000,
  temperature: 0.2,
  timeout: 30000,
};

export class RecipeImporterService {
  private static instance: RecipeImporterService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

  static getInstance(): RecipeImporterService {
    if (!RecipeImporterService.instance) {
      RecipeImporterService.instance = new RecipeImporterService();
    }
    return RecipeImporterService.instance;
  }

  // Main method to import and analyze recipe
  async importRecipe(
    input: string,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<RecipeAnalysis> {
    try {
      let parsedRecipe: ParsedRecipe;

      // Determine input type and parse accordingly
      if (this.isUrl(input)) {
        parsedRecipe = await this.importFromUrl(input);
      } else {
        parsedRecipe = await this.parseRecipeText(input);
      }

      // Analyze recipe for gut health
      const analysis = await this.analyzeRecipe(parsedRecipe, userConditions, userTriggers);
      
      return analysis;
    } catch (error) {
      console.error('Recipe import error:', error);
      throw new Error(`Failed to import recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if input is a URL
  private isUrl(input: string): boolean {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }

  // Import recipe from URL
  private async importFromUrl(url: string): Promise<ParsedRecipe> {
    const cacheKey = `recipe_url_${url}`;
    const cached = this.getFromCache<ParsedRecipe>(cacheKey);
    if (cached) return cached;

    try {
      // Extract text content from URL
      const textContent = await this.extractTextFromUrl(url);
      
      // Parse recipe using GPT
      const parsedRecipe = await this.parseRecipeText(textContent, url);
      
      this.setCache(cacheKey, parsedRecipe);
      return parsedRecipe;
    } catch (error) {
      console.error('URL import error:', error);
      throw new Error('Failed to import recipe from URL');
    }
  }

  // Extract text content from URL
  private async extractTextFromUrl(url: string): Promise<string> {
    try {
      // Use a CORS proxy or backend service for web scraping
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await this.makeApiCall(proxyUrl, {}, SCRAPING_CONFIG.timeout);
      
      if (!response.contents) {
        throw new Error('No content extracted from URL');
      }

      // Parse HTML and extract text
      const textContent = this.extractTextFromHtml(response.contents);
      return textContent;
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text from URL');
    }
  }

  // Extract text from HTML
  private extractTextFromHtml(html: string): string {
    // Simple HTML text extraction (in production, use a proper HTML parser)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  }

  // Parse recipe text using GPT
  private async parseRecipeText(text: string, sourceUrl?: string): Promise<ParsedRecipe> {
    const cacheKey = `recipe_text_${text.substring(0, 200)}`;
    const cached = this.getFromCache<ParsedRecipe>(cacheKey);
    if (cached) return cached;

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = this.createRecipeParsingPrompt(text);
      
      const url = `${GPT_CONFIG.baseUrl}/chat/completions`;
      const requestBody = {
        model: GPT_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at parsing recipes from text. Extract structured recipe information including ingredients, instructions, and metadata. Return valid JSON only.',
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
      const parsedRecipe = this.parseGPTResponse(content, text, sourceUrl);
      this.setCache(cacheKey, parsedRecipe);
      return parsedRecipe;
    } catch (error) {
      console.error('GPT recipe parsing error:', error);
      throw new Error('Failed to parse recipe with AI');
    }
  }

  // Create prompt for recipe parsing
  private createRecipeParsingPrompt(text: string): string {
    return `
Please parse the following recipe text and extract structured information. Return a JSON object with this exact structure:

{
  "title": "Recipe title",
  "description": "Recipe description if available",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "1 cup",
      "unit": "cup",
      "notes": "optional notes",
      "isOptional": false
    }
  ],
  "instructions": [
    {
      "number": 1,
      "instruction": "Step instruction",
      "ingredients": ["ingredient1", "ingredient2"],
      "time": "10 minutes",
      "temperature": "350°F"
    }
  ],
  "servings": 4,
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "totalTime": "45 minutes",
  "difficulty": "easy",
  "cuisine": "Italian",
  "tags": ["vegetarian", "gluten-free"],
  "source": "Original source if identifiable",
  "confidence": 0.8
}

Guidelines:
- Extract all ingredients with amounts and units when possible
- Parse cooking instructions step by step
- Identify cooking times and temperatures
- Determine difficulty level (easy/medium/hard)
- Extract cuisine type and dietary tags
- Include confidence scores (0-1) based on clarity
- If information is missing, use null or reasonable defaults

Recipe Text:
${text}
    `.trim();
  }

  // Parse GPT response
  private parseGPTResponse(content: string, originalText: string, sourceUrl?: string): ParsedRecipe {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in GPT response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and clean the parsed data
      const validatedRecipe: ParsedRecipe = {
        title: parsed.title || 'Untitled Recipe',
        description: parsed.description || undefined,
        ingredients: this.validateIngredients(parsed.ingredients || []),
        instructions: this.validateInstructions(parsed.instructions || []),
        servings: parsed.servings || undefined,
        prepTime: parsed.prepTime || undefined,
        cookTime: parsed.cookTime || undefined,
        totalTime: parsed.totalTime || undefined,
        difficulty: parsed.difficulty || 'medium',
        cuisine: parsed.cuisine || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        source: parsed.source || undefined,
        url: sourceUrl,
        confidence: typeof parsed.confidence === 'number' 
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.5,
        timestamp: new Date(),
      };

      return validatedRecipe;
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      // Fallback: create a basic recipe structure
      return this.createFallbackRecipe(originalText, sourceUrl);
    }
  }

  // Validate ingredients
  private validateIngredients(ingredients: any[]): RecipeIngredient[] {
    return ingredients
      .filter(ingredient => ingredient && typeof ingredient === 'object' && ingredient.name)
      .map(ingredient => ({
        name: String(ingredient.name).trim(),
        amount: ingredient.amount ? String(ingredient.amount).trim() : undefined,
        unit: ingredient.unit ? String(ingredient.unit).trim() : undefined,
        notes: ingredient.notes ? String(ingredient.notes).trim() : undefined,
        isOptional: Boolean(ingredient.isOptional),
      }));
  }

  // Validate instructions
  private validateInstructions(instructions: any[]): RecipeStep[] {
    return instructions
      .filter(step => step && typeof step === 'object' && step.instruction)
      .map(step => ({
        number: typeof step.number === 'number' ? step.number : 0,
        instruction: String(step.instruction).trim(),
        ingredients: Array.isArray(step.ingredients) 
          ? step.ingredients.map((ing: any) => String(ing).trim()).filter(Boolean)
          : undefined,
        time: step.time ? String(step.time).trim() : undefined,
        temperature: step.temperature ? String(step.temperature).trim() : undefined,
      }))
      .sort((a, b) => a.number - b.number);
  }

  // Create fallback recipe structure
  private createFallbackRecipe(text: string, sourceUrl?: string): ParsedRecipe {
    // Simple text parsing as fallback
    const lines = text.split('\n').filter(line => line.trim());
    const ingredients: RecipeIngredient[] = [];
    const instructions: RecipeStep[] = [];
    
    let currentSection = 'ingredients';
    let stepNumber = 1;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length < 3) return;
      
      // Detect section changes
      if (trimmed.toLowerCase().includes('ingredient')) {
        currentSection = 'ingredients';
        return;
      }
      if (trimmed.toLowerCase().includes('instruction') || trimmed.toLowerCase().includes('step')) {
        currentSection = 'instructions';
        return;
      }
      
      // Parse ingredients
      if (currentSection === 'ingredients') {
        ingredients.push({
          name: trimmed,
          isOptional: false,
        });
      }
      
      // Parse instructions
      if (currentSection === 'instructions') {
        instructions.push({
          number: stepNumber++,
          instruction: trimmed,
        });
      }
    });

    return {
      title: 'Imported Recipe',
      ingredients: ingredients.slice(0, 20), // Limit to 20 ingredients
      instructions: instructions.slice(0, 20), // Limit to 20 steps
      confidence: 0.3,
      timestamp: new Date(),
      url: sourceUrl,
    };
  }

  // Analyze recipe for gut health
  private async analyzeRecipe(
    recipe: ParsedRecipe,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<RecipeAnalysis> {
    const flaggedIngredients: Array<{
      ingredient: RecipeIngredient;
      flaggedComponents: Array<{
        component: string;
        reason: string;
        severity: SeverityLevel;
        condition: GutCondition;
      }>;
      safeAlternatives: string[];
      modificationSuggestions: string[];
    }> = [];

    const safeIngredients: RecipeIngredient[] = [];
    const safeAlternatives: Array<{
      original: string;
      alternative: string;
      reason: string;
    }> = [];

    // Analyze each ingredient
    for (const ingredient of recipe.ingredients) {
      const analysis = await this.analyzeRecipeIngredient(ingredient, userConditions, userTriggers);
      
      if (analysis.flaggedComponents.length > 0) {
        flaggedIngredients.push({
          ingredient,
          flaggedComponents: analysis.flaggedComponents,
          safeAlternatives: analysis.safeAlternatives,
          modificationSuggestions: analysis.modificationSuggestions,
        });
      } else {
        safeIngredients.push(ingredient);
      }
    }

    // Generate recipe modifications
    const recipeModifications = this.generateRecipeModifications(recipe, flaggedIngredients, userConditions);
    
    // Determine overall safety
    const overallSafety = this.determineRecipeSafety(flaggedIngredients);
    
    // Generate recommendations
    const recommendations = this.generateRecipeRecommendations(recipe, flaggedIngredients, safeIngredients, userConditions);

    return {
      overallSafety,
      flaggedIngredients,
      safeIngredients,
      recipeModifications,
      safeAlternatives,
      confidence: recipe.confidence,
      recommendations,
    };
  }

  // Analyze individual recipe ingredient
  private async analyzeRecipeIngredient(
    ingredient: RecipeIngredient,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<{
    flaggedComponents: Array<{
      component: string;
      reason: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }>;
    safeAlternatives: string[];
    modificationSuggestions: string[];
  }> {
    const flaggedComponents: Array<{
      component: string;
      reason: string;
      severity: SeverityLevel;
      condition: GutCondition;
    }> = [];

    const safeAlternatives: string[] = [];
    const modificationSuggestions: string[] = [];

    // Analyze ingredient name and notes
    const textToAnalyze = `${ingredient.name} ${ingredient.notes || ''}`.toLowerCase();

    // Check user-defined triggers first
    for (const [condition, triggers] of Object.entries(userTriggers)) {
      if (triggers.some(trigger => textToAnalyze.includes(trigger.toLowerCase()))) {
        flaggedComponents.push({
          component: ingredient.name,
          reason: `Known trigger for ${condition.replace('-', ' ')}`,
          severity: 'severe',
          condition: condition as GutCondition,
        });
      }
    }

    // Check condition-specific patterns
    for (const condition of userConditions) {
      const analysis = this.checkConditionSpecificTriggers(textToAnalyze, condition);
      if (analysis.isProblematic) {
        flaggedComponents.push({
          component: ingredient.name,
          reason: analysis.reason,
          severity: analysis.severity,
          condition,
        });
      }
    }

    // Generate alternatives and modifications
    if (flaggedComponents.length > 0) {
      const alternatives = this.generateIngredientAlternatives(ingredient, flaggedComponents);
      safeAlternatives.push(...alternatives);
      
      const modifications = this.generateModificationSuggestions(ingredient, flaggedComponents);
      modificationSuggestions.push(...modifications);
    }

    return {
      flaggedComponents,
      safeAlternatives,
      modificationSuggestions,
    };
  }

  // Check condition-specific triggers (reuse from other services)
  private checkConditionSpecificTriggers(
    text: string,
    condition: GutCondition
  ): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    switch (condition) {
      case 'ibs-fodmap':
        return this.checkFODMAPTriggers(text);
      case 'gluten':
        return this.checkGlutenTriggers(text);
      case 'lactose':
        return this.checkLactoseTriggers(text);
      case 'reflux':
        return this.checkRefluxTriggers(text);
      case 'histamine':
        return this.checkHistamineTriggers(text);
      case 'allergies':
        return this.checkAllergyTriggers(text);
      case 'additives':
        return this.checkAdditiveTriggers(text);
      default:
        return { isProblematic: false, severity: 'mild', reason: '' };
    }
  }

  // FODMAP trigger checking
  private checkFODMAPTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
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

    if (highFODMAP.some(item => text.includes(item))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'High FODMAP content may cause bloating and digestive discomfort',
      };
    }

    if (moderateFODMAP.some(item => text.includes(item))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Moderate FODMAP content may cause symptoms in sensitive individuals',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Gluten trigger checking
  private checkGlutenTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const glutenSources = [
      'wheat', 'barley', 'rye', 'oats', 'triticale', 'spelt', 'kamut',
      'flour', 'bread', 'pasta', 'cereal', 'malt', 'brewer'
    ];

    if (glutenSources.some(source => text.includes(source))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'Contains gluten which may trigger digestive symptoms',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Lactose trigger checking
  private checkLactoseTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const lactoseSources = [
      'milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein',
      'lactose', 'dairy'
    ];

    if (lactoseSources.some(source => text.includes(source))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Contains lactose which may cause digestive discomfort',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Reflux trigger checking
  private checkRefluxTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const refluxTriggers = [
      'coffee', 'caffeine', 'chocolate', 'mint', 'peppermint', 'spearmint',
      'citrus', 'orange', 'lemon', 'lime', 'grapefruit', 'tomato',
      'spicy', 'hot', 'pepper', 'alcohol', 'wine', 'beer', 'soda',
      'carbonated', 'fried', 'fatty', 'oily'
    ];

    if (refluxTriggers.some(trigger => text.includes(trigger))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'May trigger acid reflux symptoms',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Histamine trigger checking
  private checkHistamineTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const highHistamine = [
      'aged cheese', 'fermented', 'sauerkraut', 'kimchi', 'wine', 'beer',
      'cured meat', 'salami', 'pepperoni', 'anchovies', 'sardines',
      'tomatoes', 'spinach', 'avocado', 'banana', 'citrus'
    ];

    const moderateHistamine = [
      'chocolate', 'nuts', 'seeds', 'legumes', 'soy', 'vinegar'
    ];

    if (highHistamine.some(item => text.includes(item))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'High histamine content may cause allergic-like reactions',
      };
    }

    if (moderateHistamine.some(item => text.includes(item))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Moderate histamine content may cause symptoms in sensitive individuals',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Allergy trigger checking
  private checkAllergyTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const commonAllergens = [
      'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soybeans'
    ];

    if (commonAllergens.some(allergen => text.includes(allergen))) {
      return {
        isProblematic: true,
        severity: 'severe',
        reason: 'Contains common allergen that may cause severe reactions',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Additive trigger checking
  private checkAdditiveTriggers(text: string): { isProblematic: boolean; severity: SeverityLevel; reason: string } {
    const problematicAdditives = [
      'artificial', 'preservative', 'sweetener', 'emulsifier', 'stabilizer',
      'thickener', 'color', 'flavor', 'msg', 'monosodium glutamate',
      'sulfite', 'nitrate', 'nitrite', 'bht', 'bha', 'tartrazine'
    ];

    if (problematicAdditives.some(additive => text.includes(additive))) {
      return {
        isProblematic: true,
        severity: 'moderate',
        reason: 'Contains additives that may cause digestive discomfort',
      };
    }

    return { isProblematic: false, severity: 'mild', reason: '' };
  }

  // Generate ingredient alternatives
  private generateIngredientAlternatives(
    ingredient: RecipeIngredient,
    flaggedComponents: any[]
  ): string[] {
    const alternatives: string[] = [];
    
    for (const flagged of flaggedComponents) {
      const condition = flagged.condition;
      const component = flagged.component.toLowerCase();
      
      // Gluten alternatives
      if (condition === 'gluten' && component.includes('wheat')) {
        alternatives.push('Gluten-free flour', 'Almond flour', 'Coconut flour', 'Rice flour');
      }
      
      // Dairy alternatives
      if (condition === 'lactose' && component.includes('milk')) {
        alternatives.push('Coconut milk', 'Almond milk', 'Oat milk', 'Rice milk');
      }
      
      // FODMAP alternatives
      if (condition === 'ibs-fodmap') {
        if (component.includes('onion')) alternatives.push('Green onion tops', 'Chives');
        if (component.includes('garlic')) alternatives.push('Garlic-infused oil');
        if (component.includes('wheat')) alternatives.push('Gluten-free flour', 'Rice flour');
      }
    }
    
    return [...new Set(alternatives)]; // Remove duplicates
  }

  // Generate modification suggestions
  private generateModificationSuggestions(
    ingredient: RecipeIngredient,
    flaggedComponents: any[]
  ): string[] {
    const suggestions: string[] = [];
    
    for (const flagged of flaggedComponents) {
      const condition = flagged.condition;
      const component = flagged.component.toLowerCase();
      
      // FODMAP modifications
      if (condition === 'ibs-fodmap') {
        if (component.includes('onion')) {
          suggestions.push('Replace onion with green onion tops or omit entirely');
        }
        if (component.includes('garlic')) {
          suggestions.push('Use garlic-infused oil instead of fresh garlic');
        }
      }
      
      // Gluten modifications
      if (condition === 'gluten' && component.includes('wheat')) {
        suggestions.push('Use gluten-free flour blend as a 1:1 replacement');
      }
      
      // Lactose modifications
      if (condition === 'lactose' && component.includes('milk')) {
        suggestions.push('Replace with dairy-free milk alternative');
      }
    }
    
    return suggestions;
  }

  // Generate recipe modifications
  private generateRecipeModifications(
    recipe: ParsedRecipe,
    flaggedIngredients: any[],
    userConditions: GutCondition[]
  ): string[] {
    const modifications: string[] = [];
    
    if (flaggedIngredients.length === 0) {
      return ['No modifications needed - recipe is safe for your conditions'];
    }
    
    // General modifications
    modifications.push('Consider the following modifications to make this recipe gut-friendly:');
    
    // Condition-specific modifications
    if (userConditions.includes('ibs-fodmap')) {
      modifications.push('• Replace high-FODMAP vegetables with low-FODMAP alternatives');
      modifications.push('• Use garlic-infused oil instead of fresh garlic');
      modifications.push('• Choose gluten-free grains and flours');
    }
    
    if (userConditions.includes('gluten')) {
      modifications.push('• Use gluten-free flour blends for baking');
      modifications.push('• Replace wheat-based ingredients with gluten-free alternatives');
      modifications.push('• Check all sauces and condiments for hidden gluten');
    }
    
    if (userConditions.includes('lactose')) {
      modifications.push('• Replace dairy products with dairy-free alternatives');
      modifications.push('• Use plant-based milk and cheese substitutes');
      modifications.push('• Check for hidden dairy in processed ingredients');
    }
    
    if (userConditions.includes('reflux')) {
      modifications.push('• Reduce or eliminate spicy and acidic ingredients');
      modifications.push('• Choose cooking methods like steaming and baking over frying');
      modifications.push('• Avoid carbonated beverages and alcohol');
    }
    
    return modifications;
  }

  // Determine recipe safety
  private determineRecipeSafety(flaggedIngredients: any[]): ScanResult {
    if (flaggedIngredients.length === 0) return 'safe';
    
    const severeCount = flaggedIngredients.filter(item => 
      item.flaggedComponents.some((comp: any) => comp.severity === 'severe')
    ).length;
    
    const moderateCount = flaggedIngredients.filter(item => 
      item.flaggedComponents.some((comp: any) => comp.severity === 'moderate')
    ).length;
    
    if (severeCount > 0) return 'avoid';
    if (moderateCount > 0) return 'caution';
    return 'safe';
  }

  // Generate recipe recommendations
  private generateRecipeRecommendations(
    recipe: ParsedRecipe,
    flaggedIngredients: any[],
    safeIngredients: RecipeIngredient[],
    userConditions: GutCondition[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (safeIngredients.length > 0) {
      recommendations.push(`✅ ${safeIngredients.length} safe ingredients found in this recipe`);
    }
    
    if (flaggedIngredients.length > 0) {
      recommendations.push(`⚠️ ${flaggedIngredients.length} ingredients may trigger your symptoms`);
    }
    
    // Cooking method recommendations
    if (userConditions.includes('reflux')) {
      recommendations.push('💡 Choose gentle cooking methods like steaming, baking, or poaching');
    }
    
    if (userConditions.includes('ibs-fodmap')) {
      recommendations.push('💡 Start with small portions and gradually increase if well-tolerated');
    }
    
    if (userConditions.includes('histamine')) {
      recommendations.push('💡 Use fresh ingredients and avoid aged or fermented components');
    }
    
    return recommendations;
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
export const recipeImporterService = RecipeImporterService.getInstance();
