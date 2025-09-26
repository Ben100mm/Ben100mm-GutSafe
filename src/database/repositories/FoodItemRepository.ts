/**
 * Food Item Repository
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Repository for managing food item data.
 */

import { BaseRepository } from './BaseRepository';
import { FoodItem, FoodItemSchema } from '../schema';

export class FoodItemRepository extends BaseRepository<FoodItem> {
  constructor() {
    super('food_items', FoodItemSchema);
  }

  // Find food by barcode
  async findByBarcode(barcode: string): Promise<FoodItem | null> {
    return this.findOneByField('barcode', barcode);
  }

  // Search foods by name
  async searchByName(searchTerm: string, limit: number = 20): Promise<FoodItem[]> {
    const query = `
      SELECT * FROM food_items 
      WHERE name LIKE ? 
      ORDER BY 
        CASE WHEN name = ? THEN 1 ELSE 2 END,
        name
      LIMIT ?
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const results = await this.executeQuery<FoodItem>(query, [searchPattern, searchTerm, limit]);
    return results.map(item => this.schema.parse(item));
  }

  // Find foods by category
  async findByCategory(category: string, limit?: number, offset?: number): Promise<FoodItem[]> {
    let query = `SELECT * FROM food_items WHERE category = ?`;
    const parameters: any[] = [category];
    
    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit);
    }
    
    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset);
    }
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Find foods by brand
  async findByBrand(brand: string, limit?: number, offset?: number): Promise<FoodItem[]> {
    let query = `SELECT * FROM food_items WHERE brand = ?`;
    const parameters: any[] = [brand];
    
    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit);
    }
    
    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset);
    }
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Find gluten-free foods
  async findGlutenFree(limit?: number, offset?: number): Promise<FoodItem[]> {
    let query = `SELECT * FROM food_items WHERE JSON_EXTRACT(gut_health_info, '$.glutenFree') = true`;
    
    if (limit) {
      query += ' LIMIT ?';
    }
    
    if (offset) {
      query += ' OFFSET ?';
    }
    
    const parameters: any[] = [];
    if (limit) parameters.push(limit);
    if (offset) parameters.push(offset);
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Find lactose-free foods
  async findLactoseFree(limit?: number, offset?: number): Promise<FoodItem[]> {
    let query = `SELECT * FROM food_items WHERE JSON_EXTRACT(gut_health_info, '$.lactoseFree') = true`;
    
    if (limit) {
      query += ' LIMIT ?';
    }
    
    if (offset) {
      query += ' OFFSET ?';
    }
    
    const parameters: any[] = [];
    if (limit) parameters.push(limit);
    if (offset) parameters.push(offset);
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Find low FODMAP foods
  async findLowFODMAP(limit?: number, offset?: number): Promise<FoodItem[]> {
    let query = `SELECT * FROM food_items WHERE JSON_EXTRACT(gut_health_info, '$.fodmapLevel') = 'low'`;
    
    if (limit) {
      query += ' LIMIT ?';
    }
    
    if (offset) {
      query += ' OFFSET ?';
    }
    
    const parameters: any[] = [];
    if (limit) parameters.push(limit);
    if (offset) parameters.push(offset);
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Find foods by ingredient
  async findByIngredient(ingredient: string, limit?: number, offset?: number): Promise<FoodItem[]> {
    let query = `SELECT * FROM food_items WHERE JSON_EXTRACT(ingredients, '$') LIKE ?`;
    const parameters: any[] = [`%"${ingredient}"%`];
    
    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit);
    }
    
    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset);
    }
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Find foods without specific allergens
  async findWithoutAllergens(allergens: string[], limit?: number, offset?: number): Promise<FoodItem[]> {
    if (allergens.length === 0) {
      return this.findAll(limit, offset);
    }
    
    const conditions = allergens.map(() => `JSON_EXTRACT(allergens, '$') NOT LIKE ?`).join(' AND ');
    let query = `SELECT * FROM food_items WHERE ${conditions}`;
    
    const parameters = allergens.map(allergen => `%"${allergen}"%`);
    
    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit);
    }
    
    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset);
    }
    
    const results = await this.executeQuery<FoodItem>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  // Get food categories
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const query = `
      SELECT category, COUNT(*) as count 
      FROM food_items 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `;
    
    const results = await this.executeQuery<{ category: string; count: number }>(query);
    return results;
  }

  // Get food brands
  async getBrands(): Promise<Array<{ brand: string; count: number }>> {
    const query = `
      SELECT brand, COUNT(*) as count 
      FROM food_items 
      WHERE brand IS NOT NULL 
      GROUP BY brand 
      ORDER BY count DESC
    `;
    
    const results = await this.executeQuery<{ brand: string; count: number }>(query);
    return results;
  }

  // Get most scanned foods
  async getMostScanned(limit: number = 10): Promise<Array<{
    foodItem: FoodItem;
    scanCount: number;
  }>> {
    const query = `
      SELECT 
        fi.*,
        COUNT(sh.id) as scan_count
      FROM food_items fi
      LEFT JOIN scan_history sh ON fi.id = sh.food_item_id
      GROUP BY fi.id
      ORDER BY scan_count DESC
      LIMIT ?
    `;
    
    const results = await this.executeQuery<FoodItem & { scan_count: number }>(query, [limit]);
    return results.map(row => ({
      foodItem: this.schema.parse(row),
      scanCount: row.scan_count,
    }));
  }

  // Get food safety statistics
  async getSafetyStatistics(foodItemId: string): Promise<{
    totalScans: number;
    safeScans: number;
    cautionScans: number;
    avoidScans: number;
    safetyPercentage: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_scans,
        SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) as safe_scans,
        SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_scans,
        SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_scans
      FROM scan_history sh
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.food_item_id = ?
    `;
    
    const results = await this.executeQuery<{
      total_scans: number;
      safe_scans: number;
      caution_scans: number;
      avoid_scans: number;
    }>(query, [foodItemId]);
    
    const stats = results[0];
    const totalScans = stats?.total_scans || 0;
    const safeScans = stats?.safe_scans || 0;
    
    return {
      totalScans,
      safeScans,
      cautionScans: stats?.caution_scans || 0,
      avoidScans: stats?.avoid_scans || 0,
      safetyPercentage: totalScans > 0 ? Math.round((safeScans / totalScans) * 100) : 0,
    };
  }

  // Verify food item
  async verifyFoodItem(id: string, isVerified: boolean = true): Promise<FoodItem> {
    const query = `
      UPDATE food_items 
      SET is_verified = ?, verification_date = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const now = new Date().toISOString();
    await this.executeQuery(query, [isVerified, now, now, id]);
    
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Food item not found');
    }
    
    return updated;
  }

  // Update nutritional information
  async updateNutritionalInfo(id: string, nutritionalInfo: any): Promise<FoodItem> {
    const query = `
      UPDATE food_items 
      SET nutritional_info = ?, updated_at = ?
      WHERE id = ?
    `;
    
    await this.executeQuery(query, [JSON.stringify(nutritionalInfo), new Date().toISOString(), id]);
    
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Food item not found');
    }
    
    return updated;
  }

  // Update gut health information
  async updateGutHealthInfo(id: string, gutHealthInfo: any): Promise<FoodItem> {
    const query = `
      UPDATE food_items 
      SET gut_health_info = ?, updated_at = ?
      WHERE id = ?
    `;
    
    await this.executeQuery(query, [JSON.stringify(gutHealthInfo), new Date().toISOString(), id]);
    
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Food item not found');
    }
    
    return updated;
  }

  // Find similar foods
  async findSimilar(foodItemId: string, limit: number = 5): Promise<FoodItem[]> {
    const foodItem = await this.findById(foodItemId);
    if (!foodItem) {
      return [];
    }
    
    const query = `
      SELECT * FROM food_items 
      WHERE id != ? 
        AND (category = ? OR brand = ?)
      ORDER BY 
        CASE WHEN category = ? AND brand = ? THEN 1
             WHEN category = ? THEN 2
             WHEN brand = ? THEN 3
             ELSE 4 END,
        name
      LIMIT ?
    `;
    
    const results = await this.executeQuery<FoodItem>(query, [
      foodItemId,
      foodItem.category,
      foodItem.brand,
      foodItem.category,
      foodItem.brand,
      foodItem.category,
      foodItem.brand,
      limit
    ]);
    
    return results.map(item => this.schema.parse(item));
  }

  // Get food trends
  async getFoodTrends(days: number = 30): Promise<Array<{
    foodName: string;
    brand: string;
    category: string;
    scanCount: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>> {
    const query = `
      SELECT 
        fi.name as food_name,
        fi.brand,
        fi.category,
        COUNT(sh.id) as scan_count,
        CASE 
          WHEN COUNT(sh.id) > 10 THEN 'increasing'
          WHEN COUNT(sh.id) > 5 THEN 'stable'
          ELSE 'decreasing'
        END as trend
      FROM food_items fi
      LEFT JOIN scan_history sh ON fi.id = sh.food_item_id 
        AND sh.timestamp >= datetime('now', '-${days} days')
      GROUP BY fi.id, fi.name, fi.brand, fi.category
      HAVING scan_count > 0
      ORDER BY scan_count DESC
      LIMIT 20
    `;
    
    const results = await this.executeQuery<{
      food_name: string;
      brand: string;
      category: string;
      scan_count: number;
      trend: string;
    }>(query);
    
    return results.map(row => ({
      foodName: row.food_name,
      brand: row.brand,
      category: row.category,
      scanCount: row.scan_count,
      trend: row.trend as 'increasing' | 'stable' | 'decreasing',
    }));
  }
}
