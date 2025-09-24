import { GutCondition, SeverityLevel, ScanResult } from '../types';

// Ingredient Analysis Types
export interface HiddenTrigger {
  name: string;
  aliases: string[];
  category: 'additive' | 'preservative' | 'sweetener' | 'emulsifier' | 'stabilizer' | 'thickener' | 'color' | 'flavor' | 'other';
  problematicConditions: GutCondition[];
  severity: SeverityLevel;
  description: string;
  commonSources: string[];
  safeAlternatives: string[];
  detectionKeywords: string[];
}

export interface IngredientAnalysisResult {
  ingredient: string;
  isProblematic: boolean;
  isHidden: boolean;
  detectedTriggers: HiddenTrigger[];
  confidence: number; // 0-1
  analysis: {
    originalText: string;
    normalizedText: string;
    detectedKeywords: string[];
    category: string;
    riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  };
  recommendations: {
    avoid: boolean;
    caution: boolean;
    alternatives: string[];
    modifications: string[];
  };
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

// Hidden Triggers Database
const HIDDEN_TRIGGERS_DATABASE: HiddenTrigger[] = [
  // Artificial Sweeteners
  {
    name: 'Aspartame',
    aliases: ['E951', 'NutraSweet', 'Equal', 'Sugar Twin'],
    category: 'sweetener',
    problematicConditions: ['ibs-fodmap', 'additives'],
    severity: 'moderate',
    description: 'Artificial sweetener that may cause digestive issues and headaches',
    commonSources: ['Diet sodas', 'Sugar-free gum', 'Low-calorie foods', 'Protein bars'],
    safeAlternatives: ['Stevia', 'Monk fruit', 'Erythritol', 'Natural sugars'],
    detectionKeywords: ['aspartame', 'e951', 'nutrasweet', 'equal'],
  },
  {
    name: 'Sucralose',
    aliases: ['E955', 'Splenda'],
    category: 'sweetener',
    problematicConditions: ['ibs-fodmap', 'additives'],
    severity: 'mild',
    description: 'Artificial sweetener that may cause bloating and digestive discomfort',
    commonSources: ['Diet foods', 'Protein powders', 'Sugar-free products'],
    safeAlternatives: ['Stevia', 'Monk fruit', 'Natural sugars'],
    detectionKeywords: ['sucralose', 'e955', 'splenda'],
  },
  {
    name: 'Sorbitol',
    aliases: ['E420', 'Sorbit'],
    category: 'sweetener',
    problematicConditions: ['ibs-fodmap'],
    severity: 'severe',
    description: 'Sugar alcohol that is high in FODMAPs and causes severe digestive symptoms',
    commonSources: ['Sugar-free gum', 'Candies', 'Mouthwash', 'Toothpaste'],
    safeAlternatives: ['Stevia', 'Monk fruit', 'Natural sugars'],
    detectionKeywords: ['sorbitol', 'e420', 'sorbit'],
  },
  {
    name: 'Mannitol',
    aliases: ['E421'],
    category: 'sweetener',
    problematicConditions: ['ibs-fodmap'],
    severity: 'severe',
    description: 'Sugar alcohol that is high in FODMAPs and causes severe digestive symptoms',
    commonSources: ['Sugar-free products', 'Pharmaceuticals', 'Chewing gum'],
    safeAlternatives: ['Stevia', 'Monk fruit', 'Natural sugars'],
    detectionKeywords: ['mannitol', 'e421'],
  },
  {
    name: 'Xylitol',
    aliases: ['E967'],
    category: 'sweetener',
    problematicConditions: ['ibs-fodmap'],
    severity: 'moderate',
    description: 'Sugar alcohol that may cause digestive discomfort in sensitive individuals',
    commonSources: ['Sugar-free gum', 'Candies', 'Toothpaste', 'Mouthwash'],
    safeAlternatives: ['Stevia', 'Monk fruit', 'Natural sugars'],
    detectionKeywords: ['xylitol', 'e967'],
  },
  {
    name: 'Erythritol',
    aliases: ['E968'],
    category: 'sweetener',
    problematicConditions: ['ibs-fodmap'],
    severity: 'mild',
    description: 'Sugar alcohol that may cause mild digestive discomfort',
    commonSources: ['Sugar-free products', 'Protein bars', 'Low-calorie foods'],
    safeAlternatives: ['Stevia', 'Monk fruit', 'Natural sugars'],
    detectionKeywords: ['erythritol', 'e968'],
  },

  // Preservatives
  {
    name: 'Sodium Benzoate',
    aliases: ['E211', 'Benzoic Acid'],
    category: 'preservative',
    problematicConditions: ['additives', 'histamine'],
    severity: 'moderate',
    description: 'Preservative that may cause allergic reactions and digestive issues',
    commonSources: ['Soft drinks', 'Pickles', 'Sauces', 'Salad dressings'],
    safeAlternatives: ['Natural preservatives', 'Refrigeration', 'Freezing'],
    detectionKeywords: ['sodium benzoate', 'e211', 'benzoic acid'],
  },
  {
    name: 'Potassium Sorbate',
    aliases: ['E202'],
    category: 'preservative',
    problematicConditions: ['additives'],
    severity: 'mild',
    description: 'Preservative that may cause mild digestive discomfort',
    commonSources: ['Cheese', 'Wine', 'Dried fruits', 'Baked goods'],
    safeAlternatives: ['Natural preservatives', 'Refrigeration'],
    detectionKeywords: ['potassium sorbate', 'e202'],
  },
  {
    name: 'Sodium Nitrite',
    aliases: ['E250'],
    category: 'preservative',
    problematicConditions: ['additives', 'histamine'],
    severity: 'severe',
    description: 'Preservative that may cause severe allergic reactions and digestive issues',
    commonSources: ['Processed meats', 'Bacon', 'Hot dogs', 'Deli meats'],
    safeAlternatives: ['Uncured meats', 'Fresh meats', 'Natural preservatives'],
    detectionKeywords: ['sodium nitrite', 'e250'],
  },
  {
    name: 'BHT',
    aliases: ['E321', 'Butylated Hydroxytoluene'],
    category: 'preservative',
    problematicConditions: ['additives'],
    severity: 'moderate',
    description: 'Antioxidant preservative that may cause digestive issues',
    commonSources: ['Cereals', 'Gum', 'Oils', 'Snack foods'],
    safeAlternatives: ['Natural antioxidants', 'Vitamin E', 'Rosemary extract'],
    detectionKeywords: ['bht', 'e321', 'butylated hydroxytoluene'],
  },
  {
    name: 'BHA',
    aliases: ['E320', 'Butylated Hydroxyanisole'],
    category: 'preservative',
    problematicConditions: ['additives'],
    severity: 'moderate',
    description: 'Antioxidant preservative that may cause digestive issues',
    commonSources: ['Cereals', 'Gum', 'Oils', 'Snack foods'],
    safeAlternatives: ['Natural antioxidants', 'Vitamin E', 'Rosemary extract'],
    detectionKeywords: ['bha', 'e320', 'butylated hydroxyanisole'],
  },

  // Emulsifiers and Stabilizers
  {
    name: 'Polysorbate 80',
    aliases: ['E433'],
    category: 'emulsifier',
    problematicConditions: ['additives', 'ibs-fodmap'],
    severity: 'moderate',
    description: 'Emulsifier that may disrupt gut bacteria and cause digestive issues',
    commonSources: ['Ice cream', 'Salad dressings', 'Baked goods', 'Cosmetics'],
    safeAlternatives: ['Lecithin', 'Natural emulsifiers', 'Egg yolks'],
    detectionKeywords: ['polysorbate 80', 'e433'],
  },
  {
    name: 'Carrageenan',
    aliases: ['E407'],
    category: 'stabilizer',
    problematicConditions: ['additives', 'ibs-fodmap'],
    severity: 'severe',
    description: 'Seaweed-derived stabilizer that may cause severe digestive inflammation',
    commonSources: ['Almond milk', 'Coconut milk', 'Ice cream', 'Yogurt'],
    safeAlternatives: ['Guar gum', 'Xanthan gum', 'Agar', 'Pectin'],
    detectionKeywords: ['carrageenan', 'e407'],
  },
  {
    name: 'Xanthan Gum',
    aliases: ['E415'],
    category: 'stabilizer',
    problematicConditions: ['ibs-fodmap'],
    severity: 'moderate',
    description: 'Stabilizer that may cause digestive discomfort in sensitive individuals',
    commonSources: ['Gluten-free products', 'Sauces', 'Dressings', 'Baked goods'],
    safeAlternatives: ['Guar gum', 'Agar', 'Pectin', 'Arrowroot'],
    detectionKeywords: ['xanthan gum', 'e415'],
  },
  {
    name: 'Guar Gum',
    aliases: ['E412'],
    category: 'stabilizer',
    problematicConditions: ['ibs-fodmap'],
    severity: 'moderate',
    description: 'Stabilizer that may cause digestive discomfort in sensitive individuals',
    commonSources: ['Gluten-free products', 'Ice cream', 'Sauces', 'Baked goods'],
    safeAlternatives: ['Xanthan gum', 'Agar', 'Pectin', 'Arrowroot'],
    detectionKeywords: ['guar gum', 'e412'],
  },

  // Artificial Colors
  {
    name: 'Tartrazine',
    aliases: ['E102', 'Yellow 5'],
    category: 'color',
    problematicConditions: ['additives', 'allergies'],
    severity: 'moderate',
    description: 'Artificial yellow dye that may cause allergic reactions and hyperactivity',
    commonSources: ['Candies', 'Soft drinks', 'Cereals', 'Snack foods'],
    safeAlternatives: ['Turmeric', 'Annatto', 'Natural yellow dyes'],
    detectionKeywords: ['tartrazine', 'e102', 'yellow 5'],
  },
  {
    name: 'Red 40',
    aliases: ['E129', 'Allura Red'],
    category: 'color',
    problematicConditions: ['additives', 'allergies'],
    severity: 'moderate',
    description: 'Artificial red dye that may cause allergic reactions and hyperactivity',
    commonSources: ['Candies', 'Soft drinks', 'Cereals', 'Snack foods'],
    safeAlternatives: ['Beet juice', 'Paprika', 'Natural red dyes'],
    detectionKeywords: ['red 40', 'e129', 'allura red'],
  },
  {
    name: 'Blue 1',
    aliases: ['E133', 'Brilliant Blue'],
    category: 'color',
    problematicConditions: ['additives', 'allergies'],
    severity: 'mild',
    description: 'Artificial blue dye that may cause mild allergic reactions',
    commonSources: ['Candies', 'Soft drinks', 'Cereals', 'Snack foods'],
    safeAlternatives: ['Spirulina', 'Natural blue dyes'],
    detectionKeywords: ['blue 1', 'e133', 'brilliant blue'],
  },

  // Flavor Enhancers
  {
    name: 'MSG',
    aliases: ['E621', 'Monosodium Glutamate', 'Glutamic Acid'],
    category: 'flavor',
    problematicConditions: ['additives', 'histamine'],
    severity: 'severe',
    description: 'Flavor enhancer that may cause severe headaches and digestive issues',
    commonSources: ['Chinese food', 'Processed foods', 'Snack foods', 'Soups'],
    safeAlternatives: ['Natural flavors', 'Herbs and spices', 'Sea salt'],
    detectionKeywords: ['msg', 'e621', 'monosodium glutamate', 'glutamic acid'],
  },
  {
    name: 'Natural Flavoring',
    aliases: ['Natural Flavors', 'Artificial Flavoring'],
    category: 'flavor',
    problematicConditions: ['additives', 'histamine'],
    severity: 'moderate',
    description: 'Vague flavoring that may contain hidden problematic ingredients',
    commonSources: ['Processed foods', 'Snack foods', 'Beverages', 'Candies'],
    safeAlternatives: ['Real ingredients', 'Herbs and spices', 'Natural extracts'],
    detectionKeywords: ['natural flavoring', 'natural flavors', 'artificial flavoring'],
  },

  // Other Additives
  {
    name: 'Sodium Sulfite',
    aliases: ['E221', 'Sulfites'],
    category: 'preservative',
    problematicConditions: ['additives', 'histamine'],
    severity: 'severe',
    description: 'Preservative that may cause severe allergic reactions and asthma',
    commonSources: ['Wine', 'Dried fruits', 'Processed foods', 'Medications'],
    safeAlternatives: ['Natural preservatives', 'Refrigeration', 'Freezing'],
    detectionKeywords: ['sodium sulfite', 'e221', 'sulfites'],
  },
  {
    name: 'Sodium Phosphate',
    aliases: ['E339', 'Trisodium Phosphate'],
    category: 'additive',
    problematicConditions: ['additives'],
    severity: 'moderate',
    description: 'Additive that may cause digestive issues and kidney problems',
    commonSources: ['Processed meats', 'Cheese', 'Baked goods', 'Cereals'],
    safeAlternatives: ['Natural ingredients', 'Sea salt'],
    detectionKeywords: ['sodium phosphate', 'e339', 'trisodium phosphate'],
  },
  {
    name: 'Calcium Propionate',
    aliases: ['E282'],
    category: 'preservative',
    problematicConditions: ['additives'],
    severity: 'mild',
    description: 'Preservative that may cause mild digestive discomfort',
    commonSources: ['Bread', 'Baked goods', 'Dairy products'],
    safeAlternatives: ['Natural preservatives', 'Refrigeration'],
    detectionKeywords: ['calcium propionate', 'e282'],
  },
];

export class IngredientAnalysisService {
  private static instance: IngredientAnalysisService;
  private cache: Map<string, IngredientAnalysisResult> = new Map();
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
    userConditions: GutCondition[],
    userTriggers: { [key: string]: string[] } = {}
  ): Promise<IngredientAnalysisResult[]> {
    const results: IngredientAnalysisResult[] = [];

    for (const ingredient of ingredients) {
      const result = await this.analyzeIngredient(ingredient, userConditions, userTriggers);
      results.push(result);
    }

    return results;
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
    const detectedKeywords = this.extractKeywords(normalizedText);
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
      analysis: {
        originalText: ingredient,
        normalizedText,
        detectedKeywords,
        category,
        riskLevel,
      },
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
    const ingredientResults = await this.analyzeIngredients(ingredients, userConditions, userTriggers);
    
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
    for (const trigger of HIDDEN_TRIGGERS_DATABASE) {
      if (this.matchesTrigger(text, trigger) && this.isRelevantToUser(trigger, userConditions)) {
        detectedTriggers.push(trigger);
      }
    }
    
    // Check against user-defined triggers
    for (const [condition, triggers] of Object.entries(userTriggers)) {
      for (const userTrigger of triggers) {
        if (text.includes(userTrigger.toLowerCase())) {
          // Create a custom trigger for user-defined ones
          const customTrigger: HiddenTrigger = {
            name: userTrigger,
            aliases: [],
            category: 'other',
            problematicConditions: [condition as GutCondition],
            severity: 'severe',
            description: `User-defined trigger for ${condition.replace('-', ' ')}`,
            commonSources: [],
            safeAlternatives: [],
            detectionKeywords: [userTrigger.toLowerCase()],
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
    if (text.includes(trigger.name.toLowerCase())) {
      return true;
    }
    
    // Check aliases
    for (const alias of trigger.aliases) {
      if (text.includes(alias.toLowerCase())) {
        return true;
      }
    }
    
    // Check detection keywords
    for (const keyword of trigger.detectionKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  // Check if trigger is relevant to user's conditions
  private isRelevantToUser(trigger: HiddenTrigger, userConditions: GutCondition[]): boolean {
    return trigger.problematicConditions.some(condition => userConditions.includes(condition));
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
      alternatives.push(...trigger.safeAlternatives);
      
      if (trigger.severity === 'severe') {
        avoid = true;
        modifications.push(`Avoid products containing ${trigger.name}`);
      } else if (trigger.severity === 'moderate') {
        caution = true;
        modifications.push(`Use caution with products containing ${trigger.name}`);
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
    const severeCount = results.filter(r => r.analysis.riskLevel === 'severe').length;
    const moderateCount = results.filter(r => r.analysis.riskLevel === 'moderate').length;
    const mildCount = results.filter(r => r.analysis.riskLevel === 'low').length;
    
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

  // Get all hidden triggers
  getAllHiddenTriggers(): HiddenTrigger[] {
    return [...HIDDEN_TRIGGERS_DATABASE];
  }

  // Get triggers by category
  getTriggersByCategory(category: string): HiddenTrigger[] {
    return HIDDEN_TRIGGERS_DATABASE.filter(trigger => trigger.category === category);
  }

  // Get triggers by condition
  getTriggersByCondition(condition: GutCondition): HiddenTrigger[] {
    return HIDDEN_TRIGGERS_DATABASE.filter(trigger => 
      trigger.problematicConditions.includes(condition)
    );
  }

  // Search triggers
  searchTriggers(query: string): HiddenTrigger[] {
    const lowerQuery = query.toLowerCase();
    return HIDDEN_TRIGGERS_DATABASE.filter(trigger =>
      trigger.name.toLowerCase().includes(lowerQuery) ||
      trigger.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
      trigger.description.toLowerCase().includes(lowerQuery)
    );
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
