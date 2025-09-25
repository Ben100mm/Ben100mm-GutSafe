/**
 * @fileoverview DataService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Data Service for GutSafe App
import { 
  ScanHistory, 
  ScanAnalysis, 
  FoodItem, 
  GutProfile, 
  GutCondition, 
  SeverityLevel,
  GutSymptom,
  MedicationSupplement,
  SafeFood,
  // ShareableContent
} from '../types';

class DataService {
  private static instance: DataService;
  private scanHistory: ScanHistory[] = [];
  private gutProfile: GutProfile | null = null;
  private symptoms: GutSymptom[] = [];
  private medications: MedicationSupplement[] = [];
  private safeFoods: SafeFood[] = [];

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  initialize() {
    // Initialization logic
  }

  private loadMockData(): void {
    // Mock scan history
    this.scanHistory = [
      {
        id: '1',
        foodItem: {
          id: '1',
          name: 'Organic Quinoa',
          brand: 'Bob\'s Red Mill',
          category: 'Grains',
          barcode: '123456789012',
          ingredients: ['Organic Quinoa'],
          allergens: [],
          additives: [],
          glutenFree: true,
          lactoseFree: true,
          fodmapLevel: 'low',
          histamineLevel: 'low',
          dataSource: 'USDA Database'
        },
        analysis: {
          overallSafety: 'safe',
          flaggedIngredients: [],
          conditionWarnings: [],
          safeAlternatives: [],
          explanation: 'This product is safe for most gut conditions. Quinoa is naturally gluten-free and low FODMAP.',
          dataSource: 'GutSafe Database',
          lastUpdated: new Date()
        },
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: '2',
        foodItem: {
          id: '2',
          name: 'Wheat Crackers',
          brand: 'Nabisco',
          category: 'Snacks',
          barcode: '987654321098',
          ingredients: ['Wheat Flour', 'Vegetable Oil', 'Salt', 'Yeast'],
          allergens: ['Wheat', 'Gluten'],
          additives: [],
          glutenFree: false,
          lactoseFree: true,
          fodmapLevel: 'high',
          histamineLevel: 'low',
          dataSource: 'Product Database'
        },
        analysis: {
          overallSafety: 'caution',
          flaggedIngredients: [{
            ingredient: 'Wheat Flour',
            reason: 'Contains wheat which may trigger gluten sensitivity and IBS symptoms',
            severity: 'severe',
            condition: 'gluten'
          }],
          conditionWarnings: [
            {
              ingredient: 'Wheat Flour',
              severity: 'severe',
              condition: 'gluten'
            },
            {
              ingredient: 'Wheat Flour',
              severity: 'moderate',
              condition: 'ibs-fodmap'
            }
          ],
          safeAlternatives: ['Rice Crackers', 'Quinoa Crackers', 'Almond Flour Crackers'],
          explanation: 'Contains wheat which is problematic for gluten sensitivity and IBS/FODMAP conditions.',
          dataSource: 'GutSafe Database',
          lastUpdated: new Date()
        },
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];

    // Mock gut profile
    this.gutProfile = {
      id: 'user-1',
      conditions: {
        'ibs-fodmap': {
          enabled: true,
          severity: 'moderate',
          knownTriggers: ['Onions', 'Garlic', 'Wheat', 'Dairy']
        },
        'gluten': {
          enabled: true,
          severity: 'severe',
          knownTriggers: ['Wheat', 'Barley', 'Rye', 'Bread', 'Pasta']
        },
        'lactose': {
          enabled: false,
          severity: 'mild',
          knownTriggers: []
        },
        'reflux': {
          enabled: true,
          severity: 'mild',
          knownTriggers: ['Spicy Foods', 'Citrus', 'Tomatoes']
        },
        'histamine': {
          enabled: false,
          severity: 'mild',
          knownTriggers: []
        },
        'allergies': {
          enabled: false,
          severity: 'mild',
          knownTriggers: []
        },
        'additives': {
          enabled: false,
          severity: 'mild',
          knownTriggers: []
        }
      },
      preferences: {
        dietaryRestrictions: ['Gluten-free', 'Low FODMAP'],
        preferredAlternatives: ['Quinoa', 'Rice', 'Almond Flour', 'Coconut Milk']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock symptoms
    this.symptoms = [
      {
        id: '1',
        type: 'bloating',
        severity: 6,
        description: 'Mild bloating after dinner',
        duration: 45,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        location: 'lower_abdomen',
        potentialTriggers: ['Dairy', 'Wheat']
      },
      {
        id: '2',
        type: 'cramping',
        severity: 4,
        description: 'Stomach cramps',
        duration: 30,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        location: 'upper_abdomen'
      }
    ];

    // Mock medications
    this.medications = [
      {
        id: '1',
        name: 'Probiotics',
        type: 'supplement',
        dosage: '1 capsule',
        frequency: 'daily',
        startDate: new Date(Date.now() - 2592000000), // 30 days ago
        isActive: true,
        gutRelated: true,
        category: 'probiotic',
        notes: 'Helps with gut health'
      },
      {
        id: '2',
        name: 'Digestive Enzymes',
        type: 'supplement',
        dosage: '2 capsules',
        frequency: 'as_needed',
        startDate: new Date(Date.now() - 1296000000), // 15 days ago
        isActive: true,
        gutRelated: true,
        category: 'enzyme_support'
      }
    ];

    // Mock safe foods
    this.safeFoods = [
      {
        id: '1',
        foodItem: {
          id: '1',
          name: 'Organic Quinoa',
          brand: 'Bob\'s Red Mill',
          category: 'Grains',
          barcode: '123456789012',
          ingredients: ['Organic Quinoa'],
          allergens: [],
          additives: [],
          glutenFree: true,
          lactoseFree: true,
          fodmapLevel: 'low',
          histamineLevel: 'low',
          isSafeFood: true,
          addedToSafeFoods: new Date()
        },
        notes: 'Always safe for me',
        addedDate: new Date(),
        usageCount: 5
      }
    ];
  }

  // Scan History Methods
  getScanHistory(): ScanHistory[] {
    return this.scanHistory;
  }

  addScanHistory(scan: ScanHistory): void {
    this.scanHistory.unshift(scan);
  }

  getScanById(id: string): ScanHistory | undefined {
    return this.scanHistory.find(scan => scan.id === id);
  }

  // Gut Profile Methods
  getGutProfile(): GutProfile | null {
    return this.gutProfile;
  }

  updateGutProfile(profile: GutProfile): void {
    this.gutProfile = { ...profile, updatedAt: new Date() };
  }

  updateCondition(condition: GutCondition, enabled: boolean, severity?: SeverityLevel): void {
    if (this.gutProfile) {
      this.gutProfile.conditions[condition].enabled = enabled;
      if (severity) {
        this.gutProfile.conditions[condition].severity = severity;
      }
      this.gutProfile.updatedAt = new Date();
    }
  }

  // Symptoms Methods
  getSymptoms(): GutSymptom[] {
    return this.symptoms;
  }

  addSymptom(symptom: Omit<GutSymptom, 'id'>): void {
    const newSymptom: GutSymptom = {
      ...symptom,
      id: Date.now().toString()
    };
    this.symptoms.unshift(newSymptom);
  }

  // Medications Methods
  getMedications(): MedicationSupplement[] {
    return this.medications;
  }

  addMedication(medication: Omit<MedicationSupplement, 'id'>): void {
    const newMedication: MedicationSupplement = {
      ...medication,
      id: Date.now().toString()
    };
    this.medications.unshift(newMedication);
  }

  updateMedication(id: string, updates: Partial<MedicationSupplement>): void {
    const index = this.medications.findIndex(med => med.id === id);
    if (index !== -1) {
      this.medications[index] = { ...this.medications[index], ...updates };
    }
  }

  // Safe Foods Methods
  getSafeFoods(): SafeFood[] {
    return this.safeFoods;
  }

  addSafeFood(food: Omit<SafeFood, 'id'>): void {
    const newSafeFood: SafeFood = {
      ...food,
      id: Date.now().toString()
    };
    this.safeFoods.unshift(newSafeFood);
  }

  removeSafeFood(id: string): void {
    this.safeFoods = this.safeFoods.filter(food => food.id !== id);
  }

  // Analytics Methods
  getAnalyticsData() {
    const totalScans = this.scanHistory.length;
    const safeScans = this.scanHistory.filter(scan => scan.analysis.overallSafety === 'safe').length;
    const cautionScans = this.scanHistory.filter(scan => scan.analysis.overallSafety === 'caution').length;
    const avoidScans = this.scanHistory.filter(scan => scan.analysis.overallSafety === 'avoid').length;

    const recentScans = this.scanHistory.slice(0, 7);
    const dailyData = recentScans.map(scan => ({
      date: scan.timestamp.toISOString().split('T')[0],
      safe: scan.analysis.overallSafety === 'safe' ? 1 : 0,
      caution: scan.analysis.overallSafety === 'caution' ? 1 : 0,
      avoid: scan.analysis.overallSafety === 'avoid' ? 1 : 0
    }));

    return {
      totalScans,
      safeScans,
      cautionScans,
      avoidScans,
      safetyPercentage: totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 0,
      dailyData,
      topCategories: this.getTopCategories(),
      conditionStats: this.getConditionStats()
    };
  }

  private getTopCategories(): { category: string; count: number; safety: string }[] {
    const categoryMap = new Map<string, { count: number; safe: number }>();
    
    this.scanHistory.forEach(scan => {
      const category = scan.foodItem.category || 'Unknown';
      const current = categoryMap.get(category) || { count: 0, safe: 0 };
      current.count++;
      if (scan.analysis.overallSafety === 'safe') {
        current.safe++;
      }
      categoryMap.set(category, current);
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        safety: data.count > 0 ? Math.round((data.safe / data.count) * 100) + '%' : '0%'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getConditionStats(): { condition: string; triggered: number; total: number }[] {
    const conditionMap = new Map<string, { triggered: number; total: number }>();
    
    this.scanHistory.forEach(scan => {
      scan.analysis.conditionWarnings.forEach(warning => {
        const condition = warning.condition;
        const current = conditionMap.get(condition) || { triggered: 0, total: 0 };
        current.total++;
        current.triggered++;
        conditionMap.set(condition, current);
      });
      
      // Also count total scans for each condition
      Object.keys(this.gutProfile?.conditions || {}).forEach(condition => {
        const current = conditionMap.get(condition) || { triggered: 0, total: 0 };
        current.total++;
        conditionMap.set(condition, current);
      });
    });

    return Array.from(conditionMap.entries())
      .map(([condition, data]) => ({
        condition: condition.replace('-', ' ').toUpperCase(),
        triggered: data.triggered,
        total: data.total
      }))
      .sort((a, b) => b.triggered - a.triggered);
  }

  // Mock scan analysis
  generateScanAnalysis(foodItem: FoodItem): ScanAnalysis {
    const analysis: ScanAnalysis = {
      overallSafety: 'safe',
      flaggedIngredients: [],
      conditionWarnings: [],
      safeAlternatives: [],
      explanation: 'This product appears to be safe for your gut health conditions.',
      dataSource: 'GutSafe Database',
      lastUpdated: new Date()
    };

    if (!this.gutProfile) return analysis;

    // Check each condition
    Object.entries(this.gutProfile.conditions).forEach(([condition, config]) => {
      if (!config.enabled) return;

      // Check for gluten
      if (condition === 'gluten' && !foodItem.glutenFree) {
        analysis.overallSafety = 'caution';
        analysis.flaggedIngredients.push({
          ingredient: 'Gluten',
          reason: 'Contains gluten which may trigger gluten sensitivity',
          severity: config.severity,
          condition: condition as GutCondition
        });
        analysis.conditionWarnings.push({
          ingredient: 'Gluten',
          severity: config.severity,
          condition: condition as GutCondition
        });
      }

      // Check for lactose
      if (condition === 'lactose' && !foodItem.lactoseFree) {
        analysis.overallSafety = 'caution';
        analysis.flaggedIngredients.push({
          ingredient: 'Lactose',
          reason: 'Contains dairy which may trigger lactose intolerance',
          severity: config.severity,
          condition: condition as GutCondition
        });
        analysis.conditionWarnings.push({
          ingredient: 'Lactose',
          severity: config.severity,
          condition: condition as GutCondition
        });
      }

      // Check for FODMAP
      if (condition === 'ibs-fodmap' && foodItem.fodmapLevel === 'high') {
        analysis.overallSafety = 'caution';
        analysis.flaggedIngredients.push({
          ingredient: 'High FODMAP',
          reason: 'Contains high FODMAP ingredients which may trigger IBS symptoms',
          severity: config.severity,
          condition: condition as GutCondition
        });
        analysis.conditionWarnings.push({
          ingredient: 'High FODMAP',
          severity: config.severity,
          condition: condition as GutCondition
        });
      }

      // Check for allergens
      foodItem.allergens.forEach(allergen => {
        if (config.knownTriggers.includes(allergen)) {
          analysis.overallSafety = 'avoid';
          analysis.flaggedIngredients.push({
            ingredient: allergen,
            reason: `Contains ${allergen} which is a known trigger`,
            severity: 'severe',
            condition: condition as GutCondition
          });
          analysis.conditionWarnings.push({
            ingredient: allergen,
            severity: 'severe',
            condition: condition as GutCondition
          });
        }
      });
    });

    // Generate explanation
    if (analysis.conditionWarnings.length === 0) {
      analysis.explanation = 'This product appears to be safe for your current gut health conditions.';
    } else if (analysis.overallSafety === 'caution') {
      analysis.explanation = 'This product may cause issues with some of your gut conditions. Consider alternatives.';
    } else {
      analysis.explanation = 'This product contains ingredients that may trigger your gut conditions. We recommend avoiding this item.';
    }

    // Add safe alternatives
    analysis.safeAlternatives = this.gutProfile.preferences.preferredAlternatives;

    return analysis;
  }
}

export default DataService;
