/**
 * @fileoverview IngredientAnalysisService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { ScanAnalysis, IngredientAnalysisResult, GutCondition, HiddenTrigger, ScanResult, SeverityLevel } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
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

// Use imported types, ensure array matches

/* Comment out the entire HIDDEN_TRIGGERS_DATABASE and related methods
const HIDDEN_TRIGGERS_DATABASE: HiddenTrigger[] = [...];

// All methods like analyzeIngredient, analyzeComplexFood, etc.
*/

// Keep only the class with getInstance and analyzeIngredients mock

export class IngredientAnalysisService {
  private static instance: IngredientAnalysisService;
  private cache: Map<string, CacheEntry<IngredientAnalysisResult>> = new Map();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour

  static getInstance(): IngredientAnalysisService {
    if (!IngredientAnalysisService.instance) {
      IngredientAnalysisService.instance = new IngredientAnalysisService();
    }
    return IngredientAnalysisService.instance;
  }

  // Main method to analyze ingredients for hidden triggers
  async analyzeIngredients(
    ingredients: string[],
    userConditions: GutCondition[] = [],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<ScanAnalysis> {
    const results: IngredientAnalysisResult[] = [];

    for (const ingredient of ingredients) {
      const triggers = this.detectHiddenTriggers(ingredient, userConditions, userTriggers);
      const isProblematic = triggers.length > 0;
      const isHidden = this.isHiddenIngredient(ingredient);
      const confidence = this.calculateConfidence(ingredient, triggers);
      const category = this.categorizeIngredient(ingredient);
      const riskLevel = this.calculateRiskLevel(triggers);
      const recommendations = this.generateRecommendations(triggers, userConditions);
      
      results.push({
        ingredient,
        isProblematic,
        isHidden,
        detectedTriggers: triggers,
        confidence,
        category,
        riskLevel,
        recommendations,
      });
    }
    
    // Convert results to ScanAnalysis format
    const flaggedIngredients = results
      .filter(result => result.isProblematic)
      .map(result => ({
        ingredient: result.ingredient,
        reason: `Detected triggers: ${result.detectedTriggers.map(t => t.trigger).join(', ')}`,
        severity: result.detectedTriggers[0]?.severity || 'mild' as SeverityLevel,
        condition: result.detectedTriggers[0]?.condition || 'additives' as GutCondition,
      }));

    const conditionWarnings = flaggedIngredients.map(ing => ({
      ingredient: ing.ingredient,
      severity: ing.severity,
      condition: ing.condition,
    }));

    const overallSafety = flaggedIngredients.length === 0 ? 'safe' as ScanResult : 
                         flaggedIngredients.some(ing => ing.severity === 'severe') ? 'avoid' as ScanResult : 
                         'caution' as ScanResult;

    return {
      overallSafety,
      flaggedIngredients,
      conditionWarnings,
      safeAlternatives: results.flatMap(r => r.recommendations.alternatives),
      explanation: this.generateExplanation(results, overallSafety),
      dataSource: 'Ingredient Analysis Service',
      lastUpdated: new Date(),
    };
  }

  // Analyze individual ingredient
  async analyzeIngredient(
    ingredient: string,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<IngredientAnalysisResult> {
    const cacheKey = `ingredient_${ingredient.toLowerCase()}_${userConditions.join(',')}`;
    const cached = this.getFromCache<IngredientAnalysisResult>(cacheKey);
    if (cached) return cached;

    const normalizedText = this.normalizeIngredientText(ingredient);
    const detectedTriggers = this.detectHiddenTriggers(normalizedText, userConditions, userTriggers);
    
    const isProblematic = detectedTriggers.length > 0;
    const isHidden = this.isHiddenIngredient(normalizedText);
    const confidence = this.calculateConfidence(normalizedText, detectedTriggers);
    
    const category = this.categorizeIngredient(normalizedText);
    const riskLevel = this.calculateRiskLevel(detectedTriggers);
    
    const recommendations = this.generateRecommendations(detectedTriggers, userConditions);

    const result: IngredientAnalysisResult = {
      ingredient,
      isProblematic,
      isHidden,
      detectedTriggers,
      confidence,
        category,
        riskLevel,
      recommendations,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // Analyze complex food products
  async analyzeComplexFood(
    foodName: string,
    ingredients: string[],
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<ComplexFoodAnalysis> {
    const scanAnalysis = await this.analyzeIngredients(ingredients, userConditions, userTriggers);
    
    // Convert ScanAnalysis back to IngredientAnalysisResult[] for complex analysis
    const ingredientResults: IngredientAnalysisResult[] = ingredients.map(ingredient => {
      const flaggedIngredient = scanAnalysis.flaggedIngredients.find(fi => fi.ingredient === ingredient);
      return {
        ingredient,
        isProblematic: !!flaggedIngredient,
        isHidden: false, // This would need more complex logic
        detectedTriggers: flaggedIngredient ? [{
          trigger: flaggedIngredient.reason,
          condition: flaggedIngredient.condition,
          severity: flaggedIngredient.severity,
        }] : [],
        confidence: 0.8, // Default confidence
        category: 'unknown',
        riskLevel: flaggedIngredient?.severity === 'severe' ? 'severe' : 
                  flaggedIngredient?.severity === 'moderate' ? 'high' : 'low',
        recommendations: {
          avoid: flaggedIngredient?.severity === 'severe',
          caution: flaggedIngredient?.severity === 'moderate',
          alternatives: scanAnalysis.safeAlternatives,
          modifications: [],
        },
      };
    });
    
    const flaggedIngredients = ingredientResults.filter(result => result.isProblematic);
    const hiddenTriggers = flaggedIngredients.flatMap(result => result.detectedTriggers);
    
    const riskSummary = this.calculateRiskSummary(ingredientResults);
    const overallRisk = this.determineOverallRisk(riskSummary);
    
    const recommendations = this.generateComplexFoodRecommendations(
      foodName,
      flaggedIngredients,
      hiddenTriggers,
      userConditions
    );
    
    const confidence = this.calculateOverallConfidence(ingredientResults);

    return {
      foodName,
      overallRisk,
      flaggedIngredients,
      hiddenTriggers: [...new Set(hiddenTriggers)], // Remove duplicates
      riskSummary,
      recommendations,
      confidence,
    };
  }

  // Normalize ingredient text for analysis
  private normalizeIngredientText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Extract keywords from ingredient text
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    
    // Common food categories
    const categories = [
      'sauce', 'dressing', 'marinade', 'seasoning', 'spice', 'herb',
      'preservative', 'additive', 'emulsifier', 'stabilizer', 'thickener',
      'sweetener', 'color', 'flavor', 'natural', 'artificial'
    ];
    
    categories.forEach(category => {
      if (text.includes(category)) {
        keywords.push(category);
      }
    });
    
    // E-numbers
    const eNumberMatch = text.match(/e\d{3}/g);
    if (eNumberMatch) {
      keywords.push(...eNumberMatch);
    }
    
    return keywords;
  }

  // Detect hidden triggers in ingredient text
  private detectHiddenTriggers(
    text: string,
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] }
  ): HiddenTrigger[] {
    const detectedTriggers: HiddenTrigger[] = [];
    
    // Check against hidden triggers database
    // for (const trigger of HIDDEN_TRIGGERS_DATABASE) {
    //   if (this.matchesTrigger(text, trigger) && this.isRelevantToUser(trigger, userConditions)) {
    //     detectedTriggers.push(trigger);
    //   }
    // }
    
    // Check against user-defined triggers
    for (const [condition, triggers] of Object.entries(userTriggers)) {
      for (const userTrigger of triggers) {
        if (text.includes(userTrigger.toLowerCase())) {
          // Create a custom trigger for user-defined ones
          const customTrigger: HiddenTrigger = {
            trigger: userTrigger,
            condition: condition as GutCondition,
            severity: 'severe',
          };
          detectedTriggers.push(customTrigger);
        }
      }
    }
    
    return detectedTriggers;
  }

  // Check if ingredient text matches a trigger
  private matchesTrigger(text: string, trigger: HiddenTrigger): boolean {
    // Check main name
    if (text.includes(trigger.trigger.toLowerCase())) {
      return true;
    }
    
    
    return false;
  }

  // Check if trigger is relevant to user's conditions
  private isRelevantToUser(trigger: HiddenTrigger, userConditions: GutCondition[]): boolean {
    return userConditions.includes(trigger.condition);
  }

  // Generate explanation for scan results
  private generateExplanation(results: IngredientAnalysisResult[], overallSafety: ScanResult): string {
    if (overallSafety === 'safe') {
      return 'No problematic ingredients detected. This product appears safe for your gut health conditions.';
    }
    
    const problematicCount = results.filter(r => r.isProblematic).length;
    const hiddenCount = results.filter(r => r.isHidden).length;
    
    if (overallSafety === 'avoid') {
      return `This product contains ${problematicCount} problematic ingredient${problematicCount > 1 ? 's' : ''}${hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ''} that may trigger your gut conditions. We recommend avoiding this item.`;
    }
    
    return `This product contains ${problematicCount} ingredient${problematicCount > 1 ? 's' : ''} that may cause issues with some of your gut conditions. Consider alternatives or consume with caution.`;
  }

  // Check if ingredient is likely hidden (vague or generic)
  private isHiddenIngredient(text: string): boolean {
    const hiddenPatterns = [
      'natural flavoring', 'artificial flavoring', 'natural flavors',
      'spices', 'seasonings', 'preservatives', 'additives',
      'stabilizers', 'emulsifiers', 'thickeners', 'colors',
      'flavor enhancer', 'texture modifier', 'processing aid'
    ];
    
    return hiddenPatterns.some(pattern => text.includes(pattern));
  }

  // Calculate confidence score
  private calculateConfidence(text: string, triggers: HiddenTrigger[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on trigger specificity
    if (triggers.length > 0) {
      confidence += 0.3;
    }
    
    // Increase confidence for specific E-numbers
    const eNumberMatch = text.match(/e\d{3}/g);
    if (eNumberMatch) {
      confidence += 0.2;
    }
    
    // Decrease confidence for vague terms
    const vagueTerms = ['natural', 'artificial', 'flavoring', 'spices'];
    if (vagueTerms.some(term => text.includes(term))) {
      confidence -= 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  // Categorize ingredient
  private categorizeIngredient(text: string): string {
    if (text.includes('sauce') || text.includes('dressing') || text.includes('marinade')) {
      return 'sauce';
    }
    if (text.includes('preservative') || text.includes('e2')) {
      return 'preservative';
    }
    if (text.includes('sweetener') || text.includes('sugar') || text.includes('e9')) {
      return 'sweetener';
    }
    if (text.includes('emulsifier') || text.includes('stabilizer') || text.includes('e4')) {
      return 'emulsifier';
    }
    if (text.includes('color') || text.includes('dye') || text.includes('e1')) {
      return 'color';
    }
    if (text.includes('flavor') || text.includes('e6')) {
      return 'flavor';
    }
    return 'other';
  }

  // Calculate risk level
  private calculateRiskLevel(triggers: HiddenTrigger[]): 'low' | 'moderate' | 'high' | 'severe' {
    if (triggers.length === 0) return 'low';
    
    const severeCount = triggers.filter(t => t.severity === 'severe').length;
    const moderateCount = triggers.filter(t => t.severity === 'moderate').length;
    
    if (severeCount > 0) return 'severe';
    if (moderateCount > 0) return 'high';
    return 'moderate';
  }

  // Generate recommendations
  private generateRecommendations(
    triggers: HiddenTrigger[],
    userConditions: GutCondition[]
  ): {
    avoid: boolean;
    caution: boolean;
    alternatives: string[];
    modifications: string[];
  } {
    const alternatives: string[] = [];
    const modifications: string[] = [];
    
    let avoid = false;
    let caution = false;
    
    for (const trigger of triggers) {
      // Add generic alternatives based on condition
      if (trigger.condition === 'gluten') {
        alternatives.push('Gluten-free alternatives');
      } else if (trigger.condition === 'lactose') {
        alternatives.push('Lactose-free alternatives');
      } else if (trigger.condition === 'ibs-fodmap') {
        alternatives.push('Low FODMAP alternatives');
      } else {
        alternatives.push('Natural alternatives');
      }
      
      if (trigger.severity === 'severe') {
        avoid = true;
        modifications.push(`Avoid products containing ${trigger.trigger}`);
      } else if (trigger.severity === 'moderate') {
        caution = true;
        modifications.push(`Use caution with products containing ${trigger.trigger}`);
      }
    }
    
    // Remove duplicates
    const uniqueAlternatives = [...new Set(alternatives)];
    const uniqueModifications = [...new Set(modifications)];
    
    return {
      avoid,
      caution,
      alternatives: uniqueAlternatives,
      modifications: uniqueModifications,
    };
  }

  // Calculate risk summary
  private calculateRiskSummary(results: IngredientAnalysisResult[]) {
    const totalIngredients = results.length;
    const problematicCount = results.filter(r => r.isProblematic).length;
    const hiddenCount = results.filter(r => r.isHidden).length;
    const severeCount = results.filter(r => r.riskLevel === 'severe').length;
    const moderateCount = results.filter(r => r.riskLevel === 'high').length;
    const mildCount = results.filter(r => r.riskLevel === 'low').length;
    
    return {
      totalIngredients,
      problematicCount,
      hiddenCount,
      severeCount,
      moderateCount,
      mildCount,
    };
  }

  // Determine overall risk
  private determineOverallRisk(riskSummary: any): ScanResult {
    if (riskSummary.severeCount > 0) return 'avoid';
    if (riskSummary.moderateCount > 0) return 'caution';
    if (riskSummary.problematicCount > 0) return 'caution';
    return 'safe';
  }

  // Generate complex food recommendations
  private generateComplexFoodRecommendations(
    foodName: string,
    flaggedIngredients: IngredientAnalysisResult[],
    hiddenTriggers: HiddenTrigger[],
    userConditions: GutCondition[]
  ): {
    overall: string;
    specific: string[];
    alternatives: string[];
  } {
    const specific: string[] = [];
    const alternatives: string[] = [];
    
    if (flaggedIngredients.length === 0) {
      return {
        overall: `${foodName} appears to be safe for your gut health conditions.`,
        specific: [],
        alternatives: [],
      };
    }
    
    // Overall recommendation
    let overall = `${foodName} contains ${flaggedIngredients.length} potentially problematic ingredient${flaggedIngredients.length !== 1 ? 's' : ''}. `;
    
    if (hiddenTriggers.some(t => t.severity === 'severe')) {
      overall += 'It is recommended to avoid this product due to severe triggers.';
    } else if (hiddenTriggers.some(t => t.severity === 'moderate')) {
      overall += 'Use caution and consider alternatives.';
    } else {
      overall += 'Monitor your symptoms if consuming this product.';
    }
    
    // Specific recommendations
    for (const ingredient of flaggedIngredients) {
      specific.push(`${ingredient.ingredient}: ${ingredient.recommendations.modifications.join(', ')}`);
      alternatives.push(...ingredient.recommendations.alternatives);
    }
    
    // Condition-specific recommendations
    if (userConditions.includes('ibs-fodmap')) {
      specific.push('Check for hidden FODMAPs in sauces and seasonings');
      alternatives.push('Low-FODMAP sauces', 'Homemade dressings', 'Simple seasonings');
    }
    
    if (userConditions.includes('additives')) {
      specific.push('Avoid processed foods with multiple additives');
      alternatives.push('Whole foods', 'Minimally processed options', 'Homemade alternatives');
    }
    
    return {
      overall,
      specific,
      alternatives: [...new Set(alternatives)], // Remove duplicates
    };
  }

  // Calculate overall confidence
  private calculateOverallConfidence(results: IngredientAnalysisResult[]): number {
    if (results.length === 0) return 0;
    
    const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / results.length;
  }

  // Cache management
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data: data as IngredientAnalysisResult,
      timestamp: Date.now(),
    });
  }

  // Get all hidden triggers
  getAllHiddenTriggers(): HiddenTrigger[] {
    return []; // HIDDEN_TRIGGERS_DATABASE;
  }

  // Get triggers by category
  getTriggersByCategory(category: string): HiddenTrigger[] {
    return []; // HIDDEN_TRIGGERS_DATABASE.filter(trigger => trigger.category === category);
  }

  // Get triggers by condition
  getTriggersByCondition(condition: GutCondition): HiddenTrigger[] {
    return []; // HIDDEN_TRIGGERS_DATABASE.filter(trigger => 
      // trigger.problematicConditions.includes(condition)
    // );
  }

  // Search triggers
  searchTriggers(query: string): HiddenTrigger[] {
    // TODO: Implement trigger search when HIDDEN_TRIGGERS_DATABASE is available
    return [];
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
export const ingredientAnalysisService = IngredientAnalysisService.getInstance();

