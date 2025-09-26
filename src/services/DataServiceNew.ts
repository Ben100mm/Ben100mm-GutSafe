/**
 * @fileoverview DataServiceNew.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Updated Data Service for GutSafe App with Real Database
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
  ScanResult,
} from '../types';

// Import database repositories
import { databaseManager } from '../database/connection';
import { ScanHistoryRepository } from '../database/repositories/ScanHistoryRepository';
import { FoodItemRepository } from '../database/repositories/FoodItemRepository';
import { BaseRepository } from '../database/repositories/BaseRepository';
import { 
  UserProfileSchema, 
  GutProfileSchema, 
  FoodItemSchema, 
  ScanAnalysisSchema,
  GutSymptomSchema,
  MedicationSupplementSchema,
  SafeFoodSchema,
  AnalyticsDataSchema
} from '../database/schema';

class DataServiceNew {
  private static instance: DataServiceNew;
  private scanHistoryRepo: ScanHistoryRepository;
  private foodItemRepo: FoodItemRepository;
  private gutProfileRepo: BaseRepository<any>;
  private gutSymptomRepo: BaseRepository<any>;
  private medicationRepo: BaseRepository<any>;
  private safeFoodRepo: BaseRepository<any>;
  private analyticsRepo: BaseRepository<any>;
  private isInitialized = false;

  static getInstance(): DataServiceNew {
    if (!DataServiceNew.instance) {
      DataServiceNew.instance = new DataServiceNew();
    }
    return DataServiceNew.instance;
  }

  constructor() {
    this.scanHistoryRepo = new ScanHistoryRepository();
    this.foodItemRepo = new FoodItemRepository();
    this.gutProfileRepo = new BaseRepository('gut_profiles', GutProfileSchema);
    this.gutSymptomRepo = new BaseRepository('gut_symptoms', GutSymptomSchema);
    this.medicationRepo = new BaseRepository('medications', MedicationSupplementSchema);
    this.safeFoodRepo = new BaseRepository('safe_foods', SafeFoodSchema);
    this.analyticsRepo = new BaseRepository('analytics_data', AnalyticsDataSchema);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await databaseManager.connect();
      await this.runMigrations();
      this.isInitialized = true;
      console.log('DataServiceNew initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DataServiceNew:', error);
      throw error;
    }
  }

  private async runMigrations(): Promise<void> {
    try {
      const connection = databaseManager.getConnection();
      
      // Run the migration SQL
      const migrationSQL = `
        CREATE TABLE IF NOT EXISTS user_profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            email TEXT,
            name TEXT,
            preferences TEXT NOT NULL,
            settings TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS gut_profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            conditions TEXT NOT NULL,
            preferences TEXT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS food_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            barcode TEXT UNIQUE,
            brand TEXT,
            category TEXT,
            ingredients TEXT NOT NULL,
            allergens TEXT NOT NULL,
            additives TEXT NOT NULL,
            nutritional_info TEXT,
            gut_health_info TEXT NOT NULL,
            data_source TEXT NOT NULL,
            image_url TEXT,
            is_verified BOOLEAN NOT NULL DEFAULT 0,
            verification_date DATETIME,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS scan_analysis (
            id TEXT PRIMARY KEY,
            food_item_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            overall_safety TEXT NOT NULL CHECK (overall_safety IN ('safe', 'caution', 'avoid')),
            confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
            flagged_ingredients TEXT NOT NULL,
            condition_warnings TEXT NOT NULL,
            safe_alternatives TEXT NOT NULL,
            explanation TEXT NOT NULL,
            data_source TEXT NOT NULL,
            is_user_verified BOOLEAN NOT NULL DEFAULT 0,
            user_feedback TEXT CHECK (user_feedback IN ('accurate', 'inaccurate')),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS scan_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            food_item_id TEXT NOT NULL,
            analysis_id TEXT NOT NULL,
            timestamp DATETIME NOT NULL,
            location TEXT,
            device_info TEXT,
            is_offline BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS gut_symptoms (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN (
                'bloating', 'cramping', 'diarrhea', 'constipation', 'gas', 'nausea',
                'reflux', 'fatigue', 'headache', 'skin_irritation', 'other'
            )),
            severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
            description TEXT,
            duration INTEGER NOT NULL,
            timestamp DATETIME NOT NULL,
            potential_triggers TEXT NOT NULL,
            location TEXT CHECK (location IN (
                'upper_abdomen', 'lower_abdomen', 'full_abdomen', 'chest', 'general'
            )),
            related_foods TEXT,
            weather TEXT,
            mood INTEGER CHECK (mood >= 1 AND mood <= 10),
            stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS medications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN (
                'medication', 'supplement', 'probiotic', 'enzyme', 'antacid', 'other'
            )),
            dosage TEXT NOT NULL,
            frequency TEXT NOT NULL CHECK (frequency IN (
                'daily', 'twice_daily', 'as_needed', 'weekly', 'monthly'
            )),
            start_date DATETIME NOT NULL,
            end_date DATETIME,
            is_active BOOLEAN NOT NULL,
            notes TEXT,
            gut_related BOOLEAN NOT NULL,
            category TEXT CHECK (category IN (
                'digestive_aid', 'anti_inflammatory', 'probiotic', 'enzyme_support',
                'acid_control', 'immune_support', 'other'
            )),
            side_effects TEXT,
            effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 10),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS safe_foods (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            food_item_id TEXT NOT NULL,
            added_date DATETIME NOT NULL,
            last_used DATETIME,
            usage_count INTEGER NOT NULL DEFAULT 0,
            notes TEXT,
            is_favorite BOOLEAN NOT NULL DEFAULT 0,
            tags TEXT,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS analytics_data (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            date DATE NOT NULL,
            total_scans INTEGER NOT NULL DEFAULT 0,
            safe_scans INTEGER NOT NULL DEFAULT 0,
            caution_scans INTEGER NOT NULL DEFAULT 0,
            avoid_scans INTEGER NOT NULL DEFAULT 0,
            symptoms_reported INTEGER NOT NULL DEFAULT 0,
            energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
            sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
            mood INTEGER CHECK (mood >= 1 AND mood <= 10),
            stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
            water_intake REAL,
            exercise_minutes INTEGER,
            weather TEXT,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, date)
        );
      `;

      await connection.executeQuery(migrationSQL);
      console.log('Database migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Scan History Methods
  async getScanHistory(userId: string, limit?: number, offset?: number): Promise<ScanHistory[]> {
    await this.ensureInitialized();
    return this.scanHistoryRepo.findByUserId(userId, limit, offset);
  }

  async addScanHistory(scan: Omit<ScanHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ScanHistory> {
    await this.ensureInitialized();
    
    // Save food item if it doesn't exist
    let foodItem = await this.foodItemRepo.findByBarcode(scan.foodItem.barcode || '');
    if (!foodItem) {
      foodItem = await this.foodItemRepo.create({
        name: scan.foodItem.name,
        barcode: scan.foodItem.barcode,
        brand: scan.foodItem.brand,
        category: scan.foodItem.category,
        ingredients: JSON.stringify(scan.foodItem.ingredients),
        allergens: JSON.stringify(scan.foodItem.allergens),
        additives: JSON.stringify(scan.foodItem.additives),
        nutritionalInfo: scan.foodItem.nutritionalInfo ? JSON.stringify(scan.foodItem.nutritionalInfo) : undefined,
        gutHealthInfo: JSON.stringify({
          glutenFree: scan.foodItem.glutenFree,
          lactoseFree: scan.foodItem.lactoseFree,
          fodmapLevel: scan.foodItem.fodmapLevel,
          histamineLevel: scan.foodItem.histamineLevel,
          vegan: scan.foodItem.vegan,
          vegetarian: scan.foodItem.vegetarian,
          organic: scan.foodItem.organic,
        }),
        dataSource: scan.foodItem.dataSource || 'User Input',
        imageUrl: scan.foodItem.imageUrl,
        isVerified: scan.foodItem.isVerified || false,
        verificationDate: scan.foodItem.verificationDate,
      });
    }

    // Create scan analysis
    const analysis = await this.createScanAnalysis({
      foodItemId: foodItem.id,
      userId: scan.userId,
      overallSafety: scan.analysis.overallSafety,
      confidence: scan.analysis.confidence || 0.8,
      flaggedIngredients: JSON.stringify(scan.analysis.flaggedIngredients),
      conditionWarnings: JSON.stringify(scan.analysis.conditionWarnings),
      safeAlternatives: JSON.stringify(scan.analysis.safeAlternatives),
      explanation: scan.analysis.explanation,
      dataSource: scan.analysis.dataSource,
      isUserVerified: scan.analysis.isUserVerified || false,
      userFeedback: scan.analysis.userFeedback,
    });

    // Create scan history entry
    const scanHistory = await this.scanHistoryRepo.create({
      userId: scan.userId,
      foodItemId: foodItem.id,
      analysisId: analysis.id,
      timestamp: scan.timestamp,
      location: scan.location ? JSON.stringify(scan.location) : undefined,
      deviceInfo: scan.deviceInfo ? JSON.stringify(scan.deviceInfo) : undefined,
      isOffline: scan.isOffline || false,
    });

    return {
      ...scanHistory,
      foodItem: this.transformFoodItem(foodItem),
      analysis: this.transformScanAnalysis(analysis),
    };
  }

  async getScanById(id: string): Promise<ScanHistory | null> {
    await this.ensureInitialized();
    const scanHistory = await this.scanHistoryRepo.findById(id);
    if (!scanHistory) return null;

    const foodItem = await this.foodItemRepo.findById(scanHistory.foodItemId);
    const analysis = await this.getScanAnalysisById(scanHistory.analysisId);

    if (!foodItem || !analysis) return null;

    return {
      ...scanHistory,
      foodItem: this.transformFoodItem(foodItem),
      analysis: this.transformScanAnalysis(analysis),
    };
  }

  private async createScanAnalysis(data: any): Promise<any> {
    return this.analyticsRepo.create(data);
  }

  private async getScanAnalysisById(id: string): Promise<any> {
    return this.analyticsRepo.findById(id);
  }

  // Gut Profile Methods
  async getGutProfile(userId: string): Promise<GutProfile | null> {
    await this.ensureInitialized();
    const profile = await this.gutProfileRepo.findOneByField('user_id', userId);
    if (!profile) return null;

    return {
      ...profile,
      conditions: JSON.parse(profile.conditions),
      preferences: JSON.parse(profile.preferences),
    };
  }

  async updateGutProfile(profile: GutProfile): Promise<GutProfile> {
    await this.ensureInitialized();
    
    const updated = await this.gutProfileRepo.update(profile.id, {
      userId: profile.userId,
      conditions: JSON.stringify(profile.conditions),
      preferences: JSON.stringify(profile.preferences),
      isActive: profile.isActive,
    });

    return {
      ...updated,
      conditions: JSON.parse(updated.conditions),
      preferences: JSON.parse(updated.preferences),
    };
  }

  async updateCondition(userId: string, condition: GutCondition, enabled: boolean, severity?: SeverityLevel): Promise<void> {
    await this.ensureInitialized();
    
    const profile = await this.getGutProfile(userId);
    if (!profile) {
      throw new Error('Gut profile not found');
    }

    profile.conditions[condition].enabled = enabled;
    if (severity) {
      profile.conditions[condition].severity = severity;
    }
    profile.updatedAt = new Date();

    await this.updateGutProfile(profile);
  }

  // Symptoms Methods
  async getSymptoms(userId: string): Promise<GutSymptom[]> {
    await this.ensureInitialized();
    const symptoms = await this.gutSymptomRepo.findByField('user_id', userId);
    return symptoms.map(symptom => ({
      ...symptom,
      potentialTriggers: JSON.parse(symptom.potential_triggers),
      relatedFoods: symptom.related_foods ? JSON.parse(symptom.related_foods) : undefined,
      weather: symptom.weather ? JSON.parse(symptom.weather) : undefined,
    }));
  }

  async addSymptom(symptom: Omit<GutSymptom, 'id'>): Promise<GutSymptom> {
    await this.ensureInitialized();
    
    const newSymptom = await this.gutSymptomRepo.create({
      userId: symptom.userId,
      type: symptom.type,
      severity: symptom.severity,
      description: symptom.description,
      duration: symptom.duration,
      timestamp: symptom.timestamp,
      potentialTriggers: JSON.stringify(symptom.potentialTriggers),
      location: symptom.location,
      relatedFoods: symptom.relatedFoods ? JSON.stringify(symptom.relatedFoods) : undefined,
      weather: symptom.weather ? JSON.stringify(symptom.weather) : undefined,
      mood: symptom.mood,
      stressLevel: symptom.stressLevel,
    });

    return {
      ...newSymptom,
      potentialTriggers: JSON.parse(newSymptom.potentialTriggers),
      relatedFoods: newSymptom.relatedFoods ? JSON.parse(newSymptom.relatedFoods) : undefined,
      weather: newSymptom.weather ? JSON.parse(newSymptom.weather) : undefined,
    };
  }

  // Medications Methods
  async getMedications(userId: string): Promise<MedicationSupplement[]> {
    await this.ensureInitialized();
    const medications = await this.medicationRepo.findByField('user_id', userId);
    return medications.map(med => ({
      ...med,
      sideEffects: med.side_effects ? JSON.parse(med.side_effects) : undefined,
    }));
  }

  async addMedication(medication: Omit<MedicationSupplement, 'id'>): Promise<MedicationSupplement> {
    await this.ensureInitialized();
    
    const newMedication = await this.medicationRepo.create({
      userId: medication.userId,
      name: medication.name,
      type: medication.type,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate,
      endDate: medication.endDate,
      isActive: medication.isActive,
      notes: medication.notes,
      gutRelated: medication.gutRelated,
      category: medication.category,
      sideEffects: medication.sideEffects ? JSON.stringify(medication.sideEffects) : undefined,
      effectiveness: medication.effectiveness,
    });

    return {
      ...newMedication,
      sideEffects: newMedication.sideEffects ? JSON.parse(newMedication.sideEffects) : undefined,
    };
  }

  async updateMedication(id: string, updates: Partial<MedicationSupplement>): Promise<MedicationSupplement> {
    await this.ensureInitialized();
    
    const updateData: any = { ...updates };
    if (updates.sideEffects) {
      updateData.side_effects = JSON.stringify(updates.sideEffects);
    }

    const updated = await this.medicationRepo.update(id, updateData);
    return {
      ...updated,
      sideEffects: updated.side_effects ? JSON.parse(updated.side_effects) : undefined,
    };
  }

  // Safe Foods Methods
  async getSafeFoods(userId: string): Promise<SafeFood[]> {
    await this.ensureInitialized();
    const safeFoods = await this.safeFoodRepo.findByField('user_id', userId);
    
    const result: SafeFood[] = [];
    for (const safeFood of safeFoods) {
      const foodItem = await this.foodItemRepo.findById(safeFood.food_item_id);
      if (foodItem) {
        result.push({
          ...safeFood,
          foodItem: this.transformFoodItem(foodItem),
          tags: safeFood.tags ? JSON.parse(safeFood.tags) : undefined,
        });
      }
    }
    
    return result;
  }

  async addSafeFood(safeFood: Omit<SafeFood, 'id'>): Promise<SafeFood> {
    await this.ensureInitialized();
    
    const newSafeFood = await this.safeFoodRepo.create({
      userId: safeFood.userId,
      foodItemId: safeFood.foodItem.id,
      addedDate: safeFood.addedDate,
      lastUsed: safeFood.lastUsed,
      usageCount: safeFood.usageCount,
      notes: safeFood.notes,
      isFavorite: safeFood.isFavorite,
      tags: safeFood.tags ? JSON.stringify(safeFood.tags) : undefined,
      rating: safeFood.rating,
    });

    return {
      ...newSafeFood,
      foodItem: safeFood.foodItem,
      tags: newSafeFood.tags ? JSON.parse(newSafeFood.tags) : undefined,
    };
  }

  async removeSafeFood(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.safeFoodRepo.delete(id);
  }

  // Analytics Methods
  async getAnalyticsData(userId: string, startDate?: Date, endDate?: Date) {
    await this.ensureInitialized();
    
    const stats = await this.scanHistoryRepo.getScanStatistics(userId, startDate, endDate);
    const topCategories = await this.scanHistoryRepo.getTopCategories(userId);
    const scanTrends = await this.scanHistoryRepo.getScanTrends(userId, 7);
    const mostProblematic = await this.scanHistoryRepo.getMostProblematicFoods(userId);

    return {
      ...stats,
      topCategories,
      dailyData: scanTrends,
      mostProblematic,
    };
  }

  // Generate scan analysis (keeping for backward compatibility)
  generateScanAnalysis(foodItem: FoodItem, gutProfile?: GutProfile): ScanAnalysis {
    const analysis: ScanAnalysis = {
      overallSafety: 'safe',
      flaggedIngredients: [],
      conditionWarnings: [],
      safeAlternatives: [],
      explanation: 'This product appears to be safe for your gut health conditions.',
      dataSource: 'GutSafe Database',
      lastUpdated: new Date(),
      confidence: 0.8,
    };

    if (!gutProfile) return analysis;

    // Check each condition
    Object.entries(gutProfile.conditions).forEach(([condition, config]) => {
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
    analysis.safeAlternatives = gutProfile.preferences.preferredAlternatives;

    return analysis;
  }

  // Transform methods
  private transformFoodItem(dbItem: any): FoodItem {
    return {
      id: dbItem.id,
      name: dbItem.name,
      barcode: dbItem.barcode,
      brand: dbItem.brand,
      category: dbItem.category,
      ingredients: JSON.parse(dbItem.ingredients),
      allergens: JSON.parse(dbItem.allergens),
      additives: JSON.parse(dbItem.additives),
      nutritionalInfo: dbItem.nutritional_info ? JSON.parse(dbItem.nutritional_info) : undefined,
      gutHealthInfo: JSON.parse(dbItem.gut_health_info),
      dataSource: dbItem.data_source,
      imageUrl: dbItem.image_url,
      isVerified: dbItem.is_verified,
      verificationDate: dbItem.verification_date ? new Date(dbItem.verification_date) : undefined,
      createdAt: new Date(dbItem.created_at),
      updatedAt: new Date(dbItem.updated_at),
    };
  }

  private transformScanAnalysis(dbAnalysis: any): ScanAnalysis {
    return {
      id: dbAnalysis.id,
      foodItemId: dbAnalysis.food_item_id,
      userId: dbAnalysis.user_id,
      overallSafety: dbAnalysis.overall_safety,
      confidence: dbAnalysis.confidence,
      flaggedIngredients: JSON.parse(dbAnalysis.flagged_ingredients),
      conditionWarnings: JSON.parse(dbAnalysis.condition_warnings),
      safeAlternatives: JSON.parse(dbAnalysis.safe_alternatives),
      explanation: dbAnalysis.explanation,
      dataSource: dbAnalysis.data_source,
      isUserVerified: dbAnalysis.is_user_verified,
      userFeedback: dbAnalysis.user_feedback,
      createdAt: new Date(dbAnalysis.created_at),
      updatedAt: new Date(dbAnalysis.updated_at),
    };
  }

  // Utility methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    if (this.isInitialized) {
      await databaseManager.disconnect();
      this.isInitialized = false;
    }
  }
}

export default DataServiceNew;
