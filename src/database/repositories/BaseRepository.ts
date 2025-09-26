/**
 * Base Repository
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Base repository class with common database operations.
 */

import { databaseManager } from '../connection';
import { z } from 'zod';

export abstract class BaseRepository<T> {
  protected tableName: string;
  protected schema: z.ZodSchema<T>;

  constructor(tableName: string, schema: z.ZodSchema<T>) {
    this.tableName = tableName;
    this.schema = schema;
  }

  protected getConnection() {
    return databaseManager.getConnection();
  }

  protected async executeQuery<R>(query: string, parameters: any[] = []): Promise<R[]> {
    const connection = this.getConnection();
    return connection.executeQuery<R>(query, parameters);
  }

  protected async executeTransaction<R>(callback: (connection: any) => Promise<R>): Promise<R> {
    const connection = this.getConnection();
    return connection.executeTransaction(callback);
  }

  // Generic CRUD operations
  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const results = await this.executeQuery<T>(query, [id]);
    return results.length > 0 ? this.schema.parse(results[0]) : null;
  }

  async findAll(limit?: number, offset?: number): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const parameters: any[] = [];

    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit);
    }

    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset);
    }

    const results = await this.executeQuery<T>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  async findByField(field: string, value: any): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = ?`;
    const results = await this.executeQuery<T>(query, [value]);
    return results.map(item => this.schema.parse(item));
  }

  async findOneByField(field: string, value: any): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`;
    const results = await this.executeQuery<T>(query, [value]);
    return results.length > 0 ? this.schema.parse(results[0]) : null;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    const fields = Object.keys(data).concat(['id', 'created_at', 'updated_at']);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data).concat([id, now, now]);

    const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    await this.executeQuery(query, values);
    
    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create record');
    }
    
    return created;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    const now = new Date().toISOString();
    const fields = Object.keys(data).concat(['updated_at']);
    const values = Object.values(data).concat([now]);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    
    await this.executeQuery(query, [...values, id]);
    
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Record not found');
    }
    
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    await this.executeQuery(query, [id]);
    return true; // SQLite doesn't return affected rows count
  }

  async count(): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const results = await this.executeQuery<{ count: number }>(query);
    return results[0]?.count || 0;
  }

  async countByField(field: string, value: any): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${field} = ?`;
    const results = await this.executeQuery<{ count: number }>(query, [value]);
    return results[0]?.count || 0;
  }

  async exists(id: string): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const results = await this.executeQuery(query, [id]);
    return results.length > 0;
  }

  async existsByField(field: string, value: any): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.tableName} WHERE ${field} = ? LIMIT 1`;
    const results = await this.executeQuery(query, [value]);
    return results.length > 0;
  }

  // Batch operations
  async createMany(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    if (data.length === 0) return [];

    // Generate unique ID for each item
    const now = new Date().toISOString();
    
    return this.executeTransaction(async (connection) => {
      const results: T[] = [];
      
      for (const item of data) {
        const itemId = this.generateId();
        const fields = Object.keys(item).concat(['id', 'created_at', 'updated_at']);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(item).concat([itemId, now, now]);

        const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        await connection.executeQuery(query, values);
        
        const created = await this.findById(itemId);
        if (created) {
          results.push(created);
        }
      }
      
      return results;
    });
  }

  async updateMany(updates: { id: string; data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>> }[]): Promise<T[]> {
    if (updates.length === 0) return [];

    return this.executeTransaction(async (connection) => {
      const results: T[] = [];
      
      for (const { id, data } of updates) {
        const now = new Date().toISOString();
        const fields = Object.keys(data).concat(['updated_at']);
        const values = Object.values(data).concat([now]);
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        
        await connection.executeQuery(query, [...values, id]);
        
        const updated = await this.findById(id);
        if (updated) {
          results.push(updated);
        }
      }
      
      return results;
    });
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;

    const placeholders = ids.map(() => '?').join(', ');
    const query = `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`;
    
    await this.executeQuery(query, ids);
    return true;
  }

  // Search and filtering
  async search(searchTerm: string, fields: string[], limit?: number, offset?: number): Promise<T[]> {
    const conditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
    const searchPattern = `%${searchTerm}%`;
    const parameters = fields.map(() => searchPattern);
    
    let query = `SELECT * FROM ${this.tableName} WHERE ${conditions}`;
    
    if (limit) {
      query += ' LIMIT ?';
      parameters.push(limit.toString());
    }
    
    if (offset) {
      query += ' OFFSET ?';
      parameters.push(offset.toString());
    }
    
    const results = await this.executeQuery<T>(query, parameters);
    return results.map(item => this.schema.parse(item));
  }

  async findByDateRange(dateField: string, startDate: Date, endDate: Date): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${dateField} BETWEEN ? AND ?`;
    const results = await this.executeQuery<T>(query, [startDate.toISOString(), endDate.toISOString()]);
    return results.map(item => this.schema.parse(item));
  }

  // Utility methods
  protected generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  protected serializeJson(data: any): string {
    return JSON.stringify(data);
  }

  protected deserializeJson<T>(jsonString: string): T {
    return JSON.parse(jsonString);
  }

  // Validation
  protected validateData(data: any): T {
    return this.schema.parse(data);
  }

  // Error handling
  protected handleError(error: any, operation: string): never {
    console.error(`Database error in ${operation}:`, error);
    throw new Error(`Database operation failed: ${operation}`);
  }
}
