import { GutCondition, SeverityLevel, ScanResult } from '../types';

// Safe Alternatives Types
export interface SafeAlternative {
  id: string;
  name: string;
  category: string;
  description: string;
  whySafe: string[];
  nutritionalInfo: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  preparationTips: string[];
  whereToFind: string[];
  priceRange: 'budget' | 'mid' | 'premium';
  availability: 'common' | 'specialty' | 'online-only';
  userRating?: number; // 1-5 stars
  userReviews?: number;
  tags: string[];
  conditions: GutCondition[];
  allergens: string[];
  certifications: string[]; // e.g., 'gluten-free', 'organic', 'non-GMO'
}

export interface AlternativeSuggestion {
  originalFood: string;
  alternatives: SafeAlternative[];
  reason: string;
  confidence: number; // 0-1
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AlternativeSearchResult {
  query: string;
  suggestions: AlternativeSuggestion[];
  totalResults: number;
  filters: {
    category?: string;
    priceRange?: string;
    availability?: string;
    conditions?: GutCondition[];
  };
  searchTime: number;
}

export interface AlternativeComparison {
  original: {
    name: string;
    category: string;
    problematicIngredients: string[];
    safetyLevel: ScanResult;
  };
  alternatives: Array<{
    alternative: SafeAlternative;
    matchScore: number; // 0-1
    pros: string[];
    cons: string[];
    substitutionRatio?: string; // e.g., "1:1", "2:1"
  }>;
  recommendations: {
    bestOverall: SafeAlternative;
    bestBudget: SafeAlternative;
    bestTaste: SafeAlternative;
    bestNutrition: SafeAlternative;
  };
}

// Safe Alternatives Database
const SAFE_ALTERNATIVES_DATABASE: SafeAlternative[] = [
  // Dairy Alternatives
  {
    id: 'coconut-milk',
    name: 'Coconut Milk',
    category: 'Dairy Alternative',
    description: 'Creamy, rich milk alternative made from coconut flesh',
    whySafe: ['Lactose-free', 'Dairy-free', 'Low FODMAP', 'Natural'],
    nutritionalInfo: {
      calories: 45,
      protein: 0.5,
      carbs: 2,
      fat: 4.5,
      fiber: 0,
      sugar: 1,
    },
    preparationTips: [
      'Shake well before using',
      'Use full-fat for cooking, light for beverages',
      'Can be whipped like cream',
    ],
    whereToFind: ['Grocery stores', 'Health food stores', 'Online'],
    priceRange: 'mid',
    availability: 'common',
    tags: ['vegan', 'paleo', 'keto-friendly'],
    conditions: ['lactose', 'ibs-fodmap'],
    allergens: ['coconut'],
    certifications: ['dairy-free', 'vegan'],
  },
  {
    id: 'almond-milk',
    name: 'Almond Milk',
    category: 'Dairy Alternative',
    description: 'Nutty, mild-flavored milk alternative made from almonds',
    whySafe: ['Lactose-free', 'Dairy-free', 'Low in FODMAPs', 'Fortified with vitamins'],
    nutritionalInfo: {
      calories: 30,
      protein: 1,
      carbs: 1,
      fat: 2.5,
      fiber: 1,
      sugar: 0,
    },
    preparationTips: [
      'Choose unsweetened varieties',
      'Shake well before using',
      'Good for smoothies and cereal',
    ],
    whereToFind: ['Grocery stores', 'Health food stores', 'Online'],
    priceRange: 'mid',
    availability: 'common',
    tags: ['vegan', 'low-calorie', 'vitamin-fortified'],
    conditions: ['lactose', 'ibs-fodmap'],
    allergens: ['tree nuts'],
    certifications: ['dairy-free', 'vegan'],
  },
  {
    id: 'oat-milk',
    name: 'Oat Milk',
    category: 'Dairy Alternative',
    description: 'Creamy, naturally sweet milk alternative made from oats',
    whySafe: ['Lactose-free', 'Dairy-free', 'Naturally sweet', 'Sustainable'],
    nutritionalInfo: {
      calories: 60,
      protein: 2,
      carbs: 7,
      fat: 3,
      fiber: 2,
      sugar: 4,
    },
    preparationTips: [
      'Great for coffee and baking',
      'Choose unsweetened for savory dishes',
      'Froths well for lattes',
    ],
    whereToFind: ['Grocery stores', 'Coffee shops', 'Online'],
    priceRange: 'mid',
    availability: 'common',
    tags: ['vegan', 'sustainable', 'froths-well'],
    conditions: ['lactose'],
    allergens: ['gluten'],
    certifications: ['dairy-free', 'vegan'],
  },
  {
    id: 'coconut-yogurt',
    name: 'Coconut Yogurt',
    category: 'Dairy Alternative',
    description: 'Creamy, tangy yogurt alternative made from coconut milk',
    whySafe: ['Lactose-free', 'Dairy-free', 'Probiotic-rich', 'Natural'],
    nutritionalInfo: {
      calories: 80,
      protein: 1,
      carbs: 6,
      fat: 6,
      fiber: 0,
      sugar: 4,
    },
    preparationTips: [
      'Choose plain varieties',
      'Add your own fruit and sweeteners',
      'Great for smoothies and parfaits',
    ],
    whereToFind: ['Health food stores', 'Grocery stores', 'Online'],
    priceRange: 'premium',
    availability: 'common',
    tags: ['vegan', 'probiotic', 'paleo'],
    conditions: ['lactose', 'ibs-fodmap'],
    allergens: ['coconut'],
    certifications: ['dairy-free', 'vegan'],
  },

  // Gluten-Free Alternatives
  {
    id: 'almond-flour',
    name: 'Almond Flour',
    category: 'Flour Alternative',
    description: 'Nutty, protein-rich flour made from ground almonds',
    whySafe: ['Gluten-free', 'Grain-free', 'High protein', 'Low carb'],
    nutritionalInfo: {
      calories: 160,
      protein: 6,
      carbs: 6,
      fat: 14,
      fiber: 3,
      sugar: 1,
    },
    preparationTips: [
      'Use 1:1 ratio for most recipes',
      'Add extra binding agents',
      'Store in refrigerator',
    ],
    whereToFind: ['Health food stores', 'Online', 'Some grocery stores'],
    priceRange: 'premium',
    availability: 'common',
    tags: ['gluten-free', 'paleo', 'keto', 'high-protein'],
    conditions: ['gluten'],
    allergens: ['tree nuts'],
    certifications: ['gluten-free', 'grain-free'],
  },
  {
    id: 'coconut-flour',
    name: 'Coconut Flour',
    category: 'Flour Alternative',
    description: 'Dense, fiber-rich flour made from dried coconut meat',
    whySafe: ['Gluten-free', 'Grain-free', 'High fiber', 'Low carb'],
    nutritionalInfo: {
      calories: 120,
      protein: 4,
      carbs: 18,
      fat: 4,
      fiber: 10,
      sugar: 6,
    },
    preparationTips: [
      'Use 1/4 cup for every 1 cup regular flour',
      'Add extra liquid',
      'Combine with other flours',
    ],
    whereToFind: ['Health food stores', 'Online', 'Some grocery stores'],
    priceRange: 'premium',
    availability: 'common',
    tags: ['gluten-free', 'paleo', 'keto', 'high-fiber'],
    conditions: ['gluten'],
    allergens: ['coconut'],
    certifications: ['gluten-free', 'grain-free'],
  },
  {
    id: 'rice-flour',
    name: 'Rice Flour',
    category: 'Flour Alternative',
    description: 'Mild, versatile flour made from ground rice',
    whySafe: ['Gluten-free', 'Neutral flavor', 'Easy to digest', 'Widely available'],
    nutritionalInfo: {
      calories: 150,
      protein: 2,
      carbs: 32,
      fat: 0.5,
      fiber: 1,
      sugar: 0,
    },
    preparationTips: [
      'Use 1:1 ratio for most recipes',
      'Combine with other gluten-free flours',
      'Good for thickening sauces',
    ],
    whereToFind: ['Grocery stores', 'Asian markets', 'Online'],
    priceRange: 'budget',
    availability: 'common',
    tags: ['gluten-free', 'neutral-flavor', 'versatile'],
    conditions: ['gluten'],
    allergens: [],
    certifications: ['gluten-free'],
  },

  // Sweetener Alternatives
  {
    id: 'stevia',
    name: 'Stevia',
    category: 'Sweetener Alternative',
    description: 'Natural, zero-calorie sweetener from stevia plant',
    whySafe: ['Zero calories', 'No impact on blood sugar', 'Natural', 'FODMAP-friendly'],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    },
    preparationTips: [
      'Use sparingly - very sweet',
      'Start with small amounts',
      'Can have bitter aftertaste',
    ],
    whereToFind: ['Grocery stores', 'Health food stores', 'Online'],
    priceRange: 'mid',
    availability: 'common',
    tags: ['zero-calorie', 'natural', 'keto-friendly'],
    conditions: ['ibs-fodmap', 'additives'],
    allergens: [],
    certifications: ['natural', 'non-GMO'],
  },
  {
    id: 'monk-fruit',
    name: 'Monk Fruit Sweetener',
    category: 'Sweetener Alternative',
    description: 'Natural, zero-calorie sweetener from monk fruit',
    whySafe: ['Zero calories', 'No impact on blood sugar', 'Natural', 'No bitter aftertaste'],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    },
    preparationTips: [
      'Use 1:1 ratio with sugar',
      'Great for baking',
      'No bitter aftertaste',
    ],
    whereToFind: ['Health food stores', 'Online', 'Some grocery stores'],
    priceRange: 'premium',
    availability: 'specialty',
    tags: ['zero-calorie', 'natural', 'keto-friendly'],
    conditions: ['ibs-fodmap', 'additives'],
    allergens: [],
    certifications: ['natural', 'non-GMO'],
  },
  {
    id: 'erythritol',
    name: 'Erythritol',
    category: 'Sweetener Alternative',
    description: 'Natural sugar alcohol with minimal digestive impact',
    whySafe: ['Low calorie', 'Minimal digestive impact', 'Natural', 'Tooth-friendly'],
    nutritionalInfo: {
      calories: 0.2,
      protein: 0,
      carbs: 4,
      fat: 0,
      fiber: 0,
      sugar: 0,
    },
    preparationTips: [
      'Use 1:1 ratio with sugar',
      'Can cause cooling sensation',
      'Good for baking',
    ],
    whereToFind: ['Health food stores', 'Online', 'Some grocery stores'],
    priceRange: 'premium',
    availability: 'specialty',
    tags: ['low-calorie', 'natural', 'keto-friendly'],
    conditions: ['ibs-fodmap'],
    allergens: [],
    certifications: ['natural'],
  },

  // Sauce Alternatives
  {
    id: 'coconut-aminos',
    name: 'Coconut Aminos',
    category: 'Sauce Alternative',
    description: 'Soy sauce alternative made from coconut sap',
    whySafe: ['Soy-free', 'Gluten-free', 'Natural', 'Low sodium'],
    nutritionalInfo: {
      calories: 5,
      protein: 0,
      carbs: 1,
      fat: 0,
      fiber: 0,
      sugar: 1,
    },
    preparationTips: [
      'Use 1:1 ratio with soy sauce',
      'Great for stir-fries and marinades',
      'Slightly sweeter than soy sauce',
    ],
    whereToFind: ['Health food stores', 'Online', 'Some grocery stores'],
    priceRange: 'premium',
    availability: 'common',
    tags: ['soy-free', 'gluten-free', 'paleo'],
    conditions: ['gluten', 'additives'],
    allergens: ['coconut'],
    certifications: ['gluten-free', 'soy-free'],
  },
  {
    id: 'tahini',
    name: 'Tahini',
    category: 'Sauce Alternative',
    description: 'Creamy paste made from ground sesame seeds',
    whySafe: ['Natural', 'Nutrient-dense', 'Versatile', 'No additives'],
    nutritionalInfo: {
      calories: 89,
      protein: 3,
      carbs: 3,
      fat: 8,
      fiber: 1,
      sugar: 0,
    },
    preparationTips: [
      'Stir well before using',
      'Great for dressings and dips',
      'Can be thinned with water or lemon juice',
    ],
    whereToFind: ['Grocery stores', 'Middle Eastern markets', 'Online'],
    priceRange: 'mid',
    availability: 'common',
    tags: ['natural', 'nutrient-dense', 'versatile'],
    conditions: ['additives'],
    allergens: ['sesame'],
    certifications: ['natural'],
  },

  // Snack Alternatives
  {
    id: 'rice-cakes',
    name: 'Rice Cakes',
    category: 'Snack Alternative',
    description: 'Light, crispy cakes made from puffed rice',
    whySafe: ['Gluten-free', 'Low calorie', 'Simple ingredients', 'Easy to digest'],
    nutritionalInfo: {
      calories: 35,
      protein: 1,
      carbs: 7,
      fat: 0.5,
      fiber: 0.5,
      sugar: 0,
    },
    preparationTips: [
      'Choose plain varieties',
      'Top with nut butter or avocado',
      'Great for quick snacks',
    ],
    whereToFind: ['Grocery stores', 'Health food stores', 'Online'],
    priceRange: 'budget',
    availability: 'common',
    tags: ['gluten-free', 'low-calorie', 'simple'],
    conditions: ['gluten'],
    allergens: [],
    certifications: ['gluten-free'],
  },
  {
    id: 'nuts-mixed',
    name: 'Mixed Nuts',
    category: 'Snack Alternative',
    description: 'Nutritious mix of various nuts and seeds',
    whySafe: ['Natural', 'Nutrient-dense', 'Satisfying', 'No additives'],
    nutritionalInfo: {
      calories: 160,
      protein: 6,
      carbs: 6,
      fat: 14,
      fiber: 3,
      sugar: 1,
    },
    preparationTips: [
      'Choose unsalted varieties',
      'Portion control is important',
      'Great for on-the-go snacks',
    ],
    whereToFind: ['Grocery stores', 'Health food stores', 'Online'],
    priceRange: 'mid',
    availability: 'common',
    tags: ['natural', 'nutrient-dense', 'portable'],
    conditions: ['additives'],
    allergens: ['tree nuts'],
    certifications: ['natural'],
  },
];

export class SafeAlternativesService {
  private static instance: SafeAlternativesService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

  static getInstance(): SafeAlternativesService {
    if (!SafeAlternativesService.instance) {
      SafeAlternativesService.instance = new SafeAlternativesService();
    }
    return SafeAlternativesService.instance;
  }

  // Search for alternatives
  async searchAlternatives(
    query: string,
    userConditions: GutCondition[] = [],
    filters: {
      category?: string;
      priceRange?: string;
      availability?: string;
      maxResults?: number;
    } = {}
  ): Promise<AlternativeSearchResult> {
    const startTime = Date.now();
    const cacheKey = `search_${query}_${userConditions.join(',')}_${JSON.stringify(filters)}`;
    const cached = this.getFromCache<AlternativeSearchResult>(cacheKey);
    if (cached) return cached;

    let results = SAFE_ALTERNATIVES_DATABASE;

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(alternative =>
        alternative.name.toLowerCase().includes(lowerQuery) ||
        alternative.description.toLowerCase().includes(lowerQuery) ||
        alternative.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        alternative.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by user conditions
    if (userConditions.length > 0) {
      results = results.filter(alternative =>
        userConditions.some(condition => alternative.conditions.includes(condition))
      );
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(alt => alt.category === filters.category);
    }
    if (filters.priceRange) {
      results = results.filter(alt => alt.priceRange === filters.priceRange);
    }
    if (filters.availability) {
      results = results.filter(alt => alt.availability === filters.availability);
    }

    // Limit results
    if (filters.maxResults) {
      results = results.slice(0, filters.maxResults);
    }

    // Group by category and create suggestions
    const suggestions = this.groupAlternativesByCategory(results, query);

    const searchResult: AlternativeSearchResult = {
      query,
      suggestions,
      totalResults: results.length,
      filters,
      searchTime: Date.now() - startTime,
    };

    this.setCache(cacheKey, searchResult);
    return searchResult;
  }

  // Get alternatives for specific food
  async getAlternativesForFood(
    foodName: string,
    problematicIngredients: string[],
    userConditions: GutCondition[] = []
  ): Promise<AlternativeSuggestion[]> {
    const cacheKey = `alternatives_${foodName}_${problematicIngredients.join(',')}_${userConditions.join(',')}`;
    const cached = this.getFromCache<AlternativeSuggestion[]>(cacheKey);
    if (cached) return cached;

    const suggestions: AlternativeSuggestion[] = [];
    
    // Determine food category
    const category = this.categorizeFood(foodName);
    
    // Get alternatives for this category
    const categoryAlternatives = SAFE_ALTERNATIVES_DATABASE.filter(alt => 
      alt.category === category && 
      userConditions.some(condition => alt.conditions.includes(condition))
    );

    if (categoryAlternatives.length > 0) {
      suggestions.push({
        originalFood: foodName,
        alternatives: categoryAlternatives,
        reason: `Safe alternatives for ${category.toLowerCase()}`,
        confidence: 0.8,
        category,
        priority: 'high',
      });
    }

    // Get alternatives based on problematic ingredients
    for (const ingredient of problematicIngredients) {
      const ingredientAlternatives = this.getAlternativesForIngredient(ingredient, userConditions);
      if (ingredientAlternatives.length > 0) {
        suggestions.push({
          originalFood: foodName,
          alternatives: ingredientAlternatives,
          reason: `Alternatives to avoid ${ingredient}`,
          confidence: 0.9,
          category: 'Ingredient Alternative',
          priority: 'high',
        });
      }
    }

    this.setCache(cacheKey, suggestions);
    return suggestions;
  }

  // Compare alternatives
  async compareAlternatives(
    originalFood: string,
    problematicIngredients: string[],
    userConditions: GutCondition[] = []
  ): Promise<AlternativeComparison> {
    const alternatives = await this.getAlternativesForFood(originalFood, problematicIngredients, userConditions);
    const allAlternatives = alternatives.flatMap(s => s.alternatives);
    
    const comparison: AlternativeComparison = {
      original: {
        name: originalFood,
        category: this.categorizeFood(originalFood),
        problematicIngredients,
        safetyLevel: 'avoid' as ScanResult,
      },
      alternatives: allAlternatives.map(alt => ({
        alternative: alt,
        matchScore: this.calculateMatchScore(alt, originalFood, userConditions),
        pros: this.getPros(alt),
        cons: this.getCons(alt),
        substitutionRatio: this.getSubstitutionRatio(alt, originalFood),
      })),
      recommendations: {
        bestOverall: this.getBestOverall(allAlternatives, userConditions),
        bestBudget: this.getBestBudget(allAlternatives),
        bestTaste: this.getBestTaste(allAlternatives),
        bestNutrition: this.getBestNutrition(allAlternatives),
      },
    };

    return comparison;
  }

  // Get alternatives for specific ingredient
  private getAlternativesForIngredient(
    ingredient: string,
    userConditions: GutCondition[]
  ): SafeAlternative[] {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Map common problematic ingredients to alternatives
    const ingredientMap: { [key: string]: string[] } = {
      'wheat': ['almond-flour', 'coconut-flour', 'rice-flour'],
      'milk': ['coconut-milk', 'almond-milk', 'oat-milk'],
      'soy sauce': ['coconut-aminos'],
      'sugar': ['stevia', 'monk-fruit', 'erythritol'],
      'cheese': ['coconut-yogurt'],
      'bread': ['rice-cakes'],
    };

    const alternativeIds = ingredientMap[lowerIngredient] || [];
    return SAFE_ALTERNATIVES_DATABASE.filter(alt => 
      alternativeIds.includes(alt.id) &&
      userConditions.some(condition => alt.conditions.includes(condition))
    );
  }

  // Categorize food
  private categorizeFood(foodName: string): string {
    const lowerName = foodName.toLowerCase();
    
    if (lowerName.includes('milk') || lowerName.includes('dairy')) {
      return 'Dairy Alternative';
    }
    if (lowerName.includes('flour') || lowerName.includes('bread') || lowerName.includes('pasta')) {
      return 'Flour Alternative';
    }
    if (lowerName.includes('sugar') || lowerName.includes('sweet')) {
      return 'Sweetener Alternative';
    }
    if (lowerName.includes('sauce') || lowerName.includes('dressing')) {
      return 'Sauce Alternative';
    }
    if (lowerName.includes('snack') || lowerName.includes('cracker')) {
      return 'Snack Alternative';
    }
    
    return 'General Alternative';
  }

  // Group alternatives by category
  private groupAlternativesByCategory(
    alternatives: SafeAlternative[],
    query: string
  ): AlternativeSuggestion[] {
    const categoryMap = new Map<string, SafeAlternative[]>();
    
    alternatives.forEach(alt => {
      if (!categoryMap.has(alt.category)) {
        categoryMap.set(alt.category, []);
      }
      categoryMap.get(alt.category)!.push(alt);
    });

    return Array.from(categoryMap.entries()).map(([category, alts]) => ({
      originalFood: query || 'Search Results',
      alternatives: alts,
      reason: `Safe alternatives in ${category}`,
      confidence: 0.7,
      category,
      priority: 'medium' as const,
    }));
  }

  // Calculate match score
  private calculateMatchScore(
    alternative: SafeAlternative,
    originalFood: string,
    userConditions: GutCondition[]
  ): number {
    let score = 0.5; // Base score
    
    // Category match
    const originalCategory = this.categorizeFood(originalFood);
    if (alternative.category === originalCategory) {
      score += 0.3;
    }
    
    // Condition match
    const conditionMatch = userConditions.filter(condition => 
      alternative.conditions.includes(condition)
    ).length / Math.max(1, userConditions.length);
    score += conditionMatch * 0.2;
    
    // Availability
    if (alternative.availability === 'common') score += 0.1;
    else if (alternative.availability === 'specialty') score += 0.05;
    
    return Math.min(1, score);
  }

  // Get pros
  private getPros(alternative: SafeAlternative): string[] {
    const pros: string[] = [];
    
    if (alternative.whySafe.length > 0) {
      pros.push(...alternative.whySafe);
    }
    
    if (alternative.certifications.length > 0) {
      pros.push(`Certified: ${alternative.certifications.join(', ')}`);
    }
    
    if (alternative.priceRange === 'budget') {
      pros.push('Budget-friendly');
    }
    
    if (alternative.availability === 'common') {
      pros.push('Widely available');
    }
    
    return pros;
  }

  // Get cons
  private getCons(alternative: SafeAlternative): string[] {
    const cons: string[] = [];
    
    if (alternative.priceRange === 'premium') {
      cons.push('Higher cost');
    }
    
    if (alternative.availability === 'online-only') {
      cons.push('Online purchase required');
    }
    
    if (alternative.allergens.length > 0) {
      cons.push(`Contains: ${alternative.allergens.join(', ')}`);
    }
    
    if (alternative.tags.includes('keto-friendly') && !alternative.tags.includes('paleo')) {
      cons.push('May not be suitable for all diets');
    }
    
    return cons;
  }

  // Get substitution ratio
  private getSubstitutionRatio(alternative: SafeAlternative, originalFood: string): string | undefined {
    const lowerOriginal = originalFood.toLowerCase();
    
    if (lowerOriginal.includes('flour') && alternative.category === 'Flour Alternative') {
      if (alternative.id === 'coconut-flour') return '1/4 cup : 1 cup';
      if (alternative.id === 'almond-flour') return '1:1';
      if (alternative.id === 'rice-flour') return '1:1';
    }
    
    if (lowerOriginal.includes('milk') && alternative.category === 'Dairy Alternative') {
      return '1:1';
    }
    
    if (lowerOriginal.includes('sugar') && alternative.category === 'Sweetener Alternative') {
      if (alternative.id === 'stevia') return '1/8 tsp : 1 tsp';
      if (alternative.id === 'monk-fruit') return '1:1';
      if (alternative.id === 'erythritol') return '1:1';
    }
    
    return undefined;
  }

  // Get best overall
  private getBestOverall(
    alternatives: SafeAlternative[],
    userConditions: GutCondition[]
  ): SafeAlternative {
    return alternatives.reduce((best, current) => {
      const bestScore = this.calculateMatchScore(best, '', userConditions);
      const currentScore = this.calculateMatchScore(current, '', userConditions);
      return currentScore > bestScore ? current : best;
    });
  }

  // Get best budget
  private getBestBudget(alternatives: SafeAlternative[]): SafeAlternative {
    const budgetAlternatives = alternatives.filter(alt => alt.priceRange === 'budget');
    if (budgetAlternatives.length === 0) {
      return alternatives.find(alt => alt.priceRange === 'mid') || alternatives[0];
    }
    return budgetAlternatives[0];
  }

  // Get best taste
  private getBestTaste(alternatives: SafeAlternative[]): SafeAlternative {
    // This would ideally use user ratings, but for now we'll use availability and price as proxies
    return alternatives.find(alt => 
      alt.availability === 'common' && alt.priceRange !== 'premium'
    ) || alternatives[0];
  }

  // Get best nutrition
  private getBestNutrition(alternatives: SafeAlternative[]): SafeAlternative {
    return alternatives.reduce((best, current) => {
      const bestProtein = best.nutritionalInfo.protein || 0;
      const currentProtein = current.nutritionalInfo.protein || 0;
      return currentProtein > bestProtein ? current : best;
    });
  }

  // Get all alternatives
  getAllAlternatives(): SafeAlternative[] {
    return [...SAFE_ALTERNATIVES_DATABASE];
  }

  // Get alternatives by category
  getAlternativesByCategory(category: string): SafeAlternative[] {
    return SAFE_ALTERNATIVES_DATABASE.filter(alt => alt.category === category);
  }

  // Get alternatives by condition
  getAlternativesByCondition(condition: GutCondition): SafeAlternative[] {
    return SAFE_ALTERNATIVES_DATABASE.filter(alt => alt.conditions.includes(condition));
  }

  // Cache methods
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
export const safeAlternativesService = SafeAlternativesService.getInstance();
