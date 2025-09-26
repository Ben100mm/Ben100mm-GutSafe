/**
 * Scan History Repository
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Repository for managing scan history data.
 */

import { BaseRepository } from './BaseRepository';
import { ScanHistory, ScanHistorySchema } from '../schema';

export class ScanHistoryRepository extends BaseRepository<ScanHistory> {
  constructor() {
    super('scan_history', ScanHistorySchema);
  }

  // Get scan history for a specific user
  async findByUserId(userId: string, limit?: number, offset?: number): Promise<ScanHistory[]> {
    let query = `
      SELECT sh.*, 
             fi.name as food_name,
             fi.brand as food_brand,
             fi.category as food_category,
             fi.barcode as food_barcode,
             sa.overall_safety,
             sa.confidence,
             sa.explanation
      FROM scan_history sh
      JOIN food_items fi ON sh.food_item_id = fi.id
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ?
      ORDER BY sh.timestamp DESC
    `;
    
    const parameters: any[] = [userId];
    
    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit);
    }
    
    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset);
    }
    
    const results = await this.executeQuery(query, parameters);
    return results.map(this.transformResult);
  }

  // Get recent scans for a user
  async findRecentByUserId(userId: string, days: number = 7): Promise<ScanHistory[]> {
    const query = `
      SELECT sh.*, 
             fi.name as food_name,
             fi.brand as food_brand,
             fi.category as food_category,
             fi.barcode as food_barcode,
             sa.overall_safety,
             sa.confidence,
             sa.explanation
      FROM scan_history sh
      JOIN food_items fi ON sh.food_item_id = fi.id
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ? 
        AND sh.timestamp >= datetime('now', '-${days} days')
      ORDER BY sh.timestamp DESC
    `;
    
    const results = await this.executeQuery(query, [userId]);
    return results.map(this.transformResult);
  }

  // Get scans by safety level
  async findBySafetyLevel(userId: string, safetyLevel: 'safe' | 'caution' | 'avoid'): Promise<ScanHistory[]> {
    const query = `
      SELECT sh.*, 
             fi.name as food_name,
             fi.brand as food_brand,
             fi.category as food_category,
             fi.barcode as food_barcode,
             sa.overall_safety,
             sa.confidence,
             sa.explanation
      FROM scan_history sh
      JOIN food_items fi ON sh.food_item_id = fi.id
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ? AND sa.overall_safety = ?
      ORDER BY sh.timestamp DESC
    `;
    
    const results = await this.executeQuery(query, [userId, safetyLevel]);
    return results.map(this.transformResult);
  }

  // Get scan statistics for a user
  async getScanStatistics(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalScans: number;
    safeScans: number;
    cautionScans: number;
    avoidScans: number;
    safetyPercentage: number;
  }> {
    let query = `
      SELECT 
        COUNT(*) as total_scans,
        SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) as safe_scans,
        SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_scans,
        SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_scans
      FROM scan_history sh
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ?
    `;
    
    const parameters: any[] = [userId];
    
    if (startDate && endDate) {
      query += ' AND sh.timestamp BETWEEN ? AND ?';
      parameters.push(startDate.toISOString(), endDate.toISOString());
    }
    
    const results = await this.executeQuery<{
      total_scans: number;
      safe_scans: number;
      caution_scans: number;
      avoid_scans: number;
    }>(query, parameters);
    
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

  // Get top scanned food categories
  async getTopCategories(userId: string, limit: number = 5): Promise<Array<{
    category: string;
    count: number;
    safetyPercentage: number;
  }>> {
    const query = `
      SELECT 
        fi.category,
        COUNT(*) as count,
        ROUND(
          (SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) * 100.0) / COUNT(*)
        ) as safety_percentage
      FROM scan_history sh
      JOIN food_items fi ON sh.food_item_id = fi.id
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ? AND fi.category IS NOT NULL
      GROUP BY fi.category
      ORDER BY count DESC
      LIMIT ?
    `;
    
    const results = await this.executeQuery<{
      category: string;
      count: number;
      safety_percentage: number;
    }>(query, [userId, limit]);
    
    return results.map(row => ({
      category: row.category,
      count: row.count,
      safetyPercentage: row.safety_percentage,
    }));
  }

  // Get scan trends over time
  async getScanTrends(userId: string, days: number = 30): Promise<Array<{
    date: string;
    totalScans: number;
    safeScans: number;
    cautionScans: number;
    avoidScans: number;
  }>> {
    const query = `
      SELECT 
        DATE(sh.timestamp) as date,
        COUNT(*) as total_scans,
        SUM(CASE WHEN sa.overall_safety = 'safe' THEN 1 ELSE 0 END) as safe_scans,
        SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_scans,
        SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_scans
      FROM scan_history sh
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ? 
        AND sh.timestamp >= datetime('now', '-${days} days')
      GROUP BY DATE(sh.timestamp)
      ORDER BY date DESC
    `;
    
    const results = await this.executeQuery<{
      date: string;
      total_scans: number;
      safe_scans: number;
      caution_scans: number;
      avoid_scans: number;
    }>(query, [userId]);
    
    return results.map(row => ({
      date: row.date,
      totalScans: row.total_scans,
      safeScans: row.safe_scans,
      cautionScans: row.caution_scans,
      avoidScans: row.avoid_scans,
    }));
  }

  // Get most problematic foods
  async getMostProblematicFoods(userId: string, limit: number = 10): Promise<Array<{
    foodName: string;
    brand: string;
    category: string;
    avoidCount: number;
    cautionCount: number;
    totalScans: number;
  }>> {
    const query = `
      SELECT 
        fi.name as food_name,
        fi.brand,
        fi.category,
        SUM(CASE WHEN sa.overall_safety = 'avoid' THEN 1 ELSE 0 END) as avoid_count,
        SUM(CASE WHEN sa.overall_safety = 'caution' THEN 1 ELSE 0 END) as caution_count,
        COUNT(*) as total_scans
      FROM scan_history sh
      JOIN food_items fi ON sh.food_item_id = fi.id
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.user_id = ?
      GROUP BY fi.id, fi.name, fi.brand, fi.category
      HAVING avoid_count > 0 OR caution_count > 0
      ORDER BY (avoid_count * 2 + caution_count) DESC
      LIMIT ?
    `;
    
    const results = await this.executeQuery<{
      food_name: string;
      brand: string;
      category: string;
      avoid_count: number;
      caution_count: number;
      total_scans: number;
    }>(query, [userId, limit]);
    
    return results.map(row => ({
      foodName: row.food_name,
      brand: row.brand,
      category: row.category,
      avoidCount: row.avoid_count,
      cautionCount: row.caution_count,
      totalScans: row.total_scans,
    }));
  }

  // Get scan history by food item
  async findByFoodItemId(foodItemId: string, userId?: string): Promise<ScanHistory[]> {
    let query = `
      SELECT sh.*, 
             fi.name as food_name,
             fi.brand as food_brand,
             fi.category as food_category,
             fi.barcode as food_barcode,
             sa.overall_safety,
             sa.confidence,
             sa.explanation
      FROM scan_history sh
      JOIN food_items fi ON sh.food_item_id = fi.id
      JOIN scan_analysis sa ON sh.analysis_id = sa.id
      WHERE sh.food_item_id = ?
    `;
    
    const parameters: any[] = [foodItemId];
    
    if (userId) {
      query += ' AND sh.user_id = ?';
      parameters.push(userId);
    }
    
    query += ' ORDER BY sh.timestamp DESC';
    
    const results = await this.executeQuery(query, parameters);
    return results.map(this.transformResult);
  }

  // Update user feedback for a scan
  async updateUserFeedback(scanId: string, feedback: 'accurate' | 'inaccurate'): Promise<ScanHistory> {
    const query = `
      UPDATE scan_history 
      SET user_feedback = ?, updated_at = ?
      WHERE id = ?
    `;
    
    await this.executeQuery(query, [feedback, new Date().toISOString(), scanId]);
    
    const updated = await this.findById(scanId);
    if (!updated) {
      throw new Error('Scan not found');
    }
    
    return updated;
  }

  // Delete old scans (cleanup)
  async deleteOldScans(userId: string, olderThanDays: number = 365): Promise<number> {
    const query = `
      DELETE FROM scan_history 
      WHERE user_id = ? AND timestamp < datetime('now', '-${olderThanDays} days')
    `;
    
    await this.executeQuery(query, [userId]);
    return 1; // SQLite doesn't return affected rows count
  }

  // Transform database result to ScanHistory object
  private transformResult(result: any): ScanHistory {
    return {
      id: result.id,
      userId: result.user_id,
      foodItemId: result.food_item_id,
      analysisId: result.analysis_id,
      timestamp: new Date(result.timestamp),
      location: result.location ? JSON.parse(result.location) : undefined,
      deviceInfo: result.device_info ? JSON.parse(result.device_info) : undefined,
      isOffline: Boolean(result.is_offline),
      createdAt: new Date(result.created_at),
      updatedAt: new Date(result.updated_at),
    };
  }
}
