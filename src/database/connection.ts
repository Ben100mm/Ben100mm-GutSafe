/**
 * Database Connection Management
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * 
 * Handles database connections and configuration for different environments.
 */

import { config } from '../config/environment';
import { DatabaseIndexes, DatabaseConstraints } from './schema';

// Database configuration interface
export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };
  logging?: boolean;
  synchronize?: boolean;
  migrations?: {
    run: boolean;
    path: string;
  };
}

// Database connection interface
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnection(): any;
  executeQuery<T>(query: string, parameters?: any[]): Promise<T[]>;
  executeTransaction<T>(callback: (connection: any) => Promise<T>): Promise<T>;
  createTable(tableName: string, schema: any): Promise<void>;
  dropTable(tableName: string): Promise<void>;
  createIndex(indexName: string, tableName: string, columns: string[]): Promise<void>;
  createConstraint(constraintName: string, tableName: string, constraint: any): Promise<void>;
}

// SQLite implementation
class SQLiteConnection implements DatabaseConnection {
  private db: any = null;
  private isConnectedFlag = false;

  constructor(private config: DatabaseConfig) {}

  async connect(): Promise<void> {
    try {
      // For React Native, we'll use SQLite from expo-sqlite
      const SQLite = require('expo-sqlite');
      this.db = SQLite.openDatabase(this.config.database);
      this.isConnectedFlag = true;
      console.log('SQLite database connected successfully');
    } catch (error) {
      console.error('Failed to connect to SQLite database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isConnectedFlag = false;
      console.log('SQLite database disconnected');
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  getConnection(): any {
    return this.db;
  }

  async executeQuery<T>(query: string, parameters: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.transaction(tx => {
        tx.executeSql(
          query,
          parameters,
          (_, result) => {
            const rows = [];
            for (let i = 0; i < result.rows.length; i++) {
              rows.push(result.rows.item(i));
            }
            resolve(rows);
          },
          (_, error) => {
            console.error('SQLite query error:', error);
            reject(error);
          }
        );
      });
    });
  }

  async executeTransaction<T>(callback: (connection: any) => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.transaction(async tx => {
        try {
          const result = await callback(tx);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async createTable(tableName: string, schema: any): Promise<void> {
    const query = this.generateCreateTableQuery(tableName, schema);
    await this.executeQuery(query);
  }

  async dropTable(tableName: string): Promise<void> {
    const query = `DROP TABLE IF EXISTS ${tableName}`;
    await this.executeQuery(query);
  }

  async createIndex(indexName: string, tableName: string, columns: string[]): Promise<void> {
    const query = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')})`;
    await this.executeQuery(query);
  }

  async createConstraint(constraintName: string, tableName: string, constraint: any): Promise<void> {
    // SQLite doesn't support named constraints in the same way as PostgreSQL
    // This would be handled in the table creation
    console.log(`Constraint ${constraintName} would be created for table ${tableName}`);
  }

  private generateCreateTableQuery(tableName: string, schema: any): string {
    // This is a simplified version - in production, you'd want a more robust schema generator
    const columns = Object.entries(schema).map(([key, value]) => {
      let columnDef = `${key} `;
      
      if (typeof value === 'string') {
        if (value.includes('uuid')) columnDef += 'TEXT PRIMARY KEY';
        else if (value.includes('varchar')) columnDef += 'TEXT';
        else if (value.includes('int')) columnDef += 'INTEGER';
        else if (value.includes('bool')) columnDef += 'BOOLEAN';
        else if (value.includes('date')) columnDef += 'DATETIME';
        else if (value.includes('json')) columnDef += 'TEXT';
        else columnDef += 'TEXT';
      } else {
        columnDef += 'TEXT';
      }
      
      return columnDef;
    }).join(', ');
    
    return `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
  }
}

// PostgreSQL implementation
class PostgreSQLConnection implements DatabaseConnection {
  private client: any = null;
  private isConnectedFlag = false;

  constructor(private config: DatabaseConfig) {}

  async connect(): Promise<void> {
    try {
      const { Client } = require('pg');
      this.client = new Client({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
      });
      
      await this.client.connect();
      this.isConnectedFlag = true;
      console.log('PostgreSQL database connected successfully');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
      this.isConnectedFlag = false;
      console.log('PostgreSQL database disconnected');
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  getConnection(): any {
    return this.client;
  }

  async executeQuery<T>(query: string, parameters: any[] = []): Promise<T[]> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    const result = await this.client.query(query, parameters);
    return result.rows;
  }

  async executeTransaction<T>(callback: (connection: any) => Promise<T>): Promise<T> {
    if (!this.client) {
      throw new Error('Database not connected');
    }

    await this.client.query('BEGIN');
    try {
      const result = await callback(this.client);
      await this.client.query('COMMIT');
      return result;
    } catch (error) {
      await this.client.query('ROLLBACK');
      throw error;
    }
  }

  async createTable(tableName: string, schema: any): Promise<void> {
    const query = this.generateCreateTableQuery(tableName, schema);
    await this.executeQuery(query);
  }

  async dropTable(tableName: string): Promise<void> {
    const query = `DROP TABLE IF EXISTS ${tableName} CASCADE`;
    await this.executeQuery(query);
  }

  async createIndex(indexName: string, tableName: string, columns: string[]): Promise<void> {
    const query = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')})`;
    await this.executeQuery(query);
  }

  async createConstraint(constraintName: string, tableName: string, constraint: any): Promise<void> {
    const query = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} ${constraint}`;
    await this.executeQuery(query);
  }

  private generateCreateTableQuery(tableName: string, schema: any): string {
    // This is a simplified version - in production, you'd want a more robust schema generator
    const columns = Object.entries(schema).map(([key, value]) => {
      let columnDef = `${key} `;
      
      if (typeof value === 'string') {
        if (value.includes('uuid')) columnDef += 'UUID PRIMARY KEY';
        else if (value.includes('varchar')) columnDef += 'VARCHAR(255)';
        else if (value.includes('int')) columnDef += 'INTEGER';
        else if (value.includes('bool')) columnDef += 'BOOLEAN';
        else if (value.includes('date')) columnDef += 'TIMESTAMP';
        else if (value.includes('json')) columnDef += 'JSONB';
        else columnDef += 'TEXT';
      } else {
        columnDef += 'TEXT';
      }
      
      return columnDef;
    }).join(', ');
    
    return `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
  }
}

// Database factory
export class DatabaseFactory {
  static createConnection(config: DatabaseConfig): DatabaseConnection {
    switch (config.type) {
      case 'sqlite':
        return new SQLiteConnection(config);
      case 'postgresql':
        return new PostgreSQLConnection(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

// Database configuration based on environment
export const getDatabaseConfig = (): DatabaseConfig => {
  const environment = config.app.environment;
  
  switch (environment) {
    case 'development':
      return {
        type: 'sqlite',
        database: 'gutsafe_dev.db',
        logging: true,
        synchronize: true,
        migrations: {
          run: true,
          path: './src/database/migrations',
        },
      };
      
    case 'test':
      return {
        type: 'sqlite',
        database: ':memory:',
        logging: false,
        synchronize: true,
        migrations: {
          run: false,
          path: './src/database/migrations',
        },
      };
      
    case 'production':
      return {
        type: 'postgresql',
        host: config.database.url?.split('://')[1]?.split('@')[1]?.split(':')[0] || 'localhost',
        port: parseInt(config.database.url?.split(':')[3]?.split('/')[0] || '5432'),
        database: config.database.url?.split('/')[3] || 'gutsafe_prod',
        username: config.database.url?.split('://')[1]?.split(':')[0] || 'gutsafe',
        password: config.database.url?.split('://')[1]?.split(':')[1]?.split('@')[0] || '',
        ssl: true,
        pool: {
          min: 5,
          max: 20,
          acquireTimeoutMillis: 60000,
          createTimeoutMillis: 30000,
          destroyTimeoutMillis: 5000,
          idleTimeoutMillis: 600000,
          reapIntervalMillis: 1000,
          createRetryIntervalMillis: 200,
        },
        logging: false,
        synchronize: false,
        migrations: {
          run: true,
          path: './src/database/migrations',
        },
      };
      
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
};

// Singleton database connection
class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: DatabaseConnection | null = null;
  private config: DatabaseConfig;

  private constructor() {
    this.config = getDatabaseConfig();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(): Promise<void> {
    if (this.connection && this.connection.isConnected()) {
      return;
    }

    this.connection = DatabaseFactory.createConnection(this.config);
    await this.connection.connect();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = null;
    }
  }

  getConnection(): DatabaseConnection {
    if (!this.connection || !this.connection.isConnected()) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection?.isConnected() || false;
  }

  getConfig(): DatabaseConfig {
    return this.config;
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export types
export type { DatabaseConfig, DatabaseConnection };
