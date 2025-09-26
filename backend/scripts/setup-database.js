#!/usr/bin/env node

/**
 * Database Setup Script
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { config } = require('../config');
const { logger } = require('../utils/logger');

class DatabaseSetup {
  constructor() {
    this.config = config.database;
    this.adminPool = null;
    this.appPool = null;
  }

  async connectAsAdmin() {
    // Connect as superuser to create database and user
    this.adminPool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: process.env.DB_ADMIN_USER || 'postgres',
      password: process.env.DB_ADMIN_PASSWORD || '',
      database: 'postgres', // Connect to default postgres database
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      const client = await this.adminPool.connect();
      client.release();
      logger.info('Connected to PostgreSQL as admin', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to connect as admin', 'DatabaseSetup', error);
      throw error;
    }
  }

  async connectAsApp() {
    // Connect as application user
    this.appPool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      const client = await this.appPool.connect();
      client.release();
      logger.info('Connected to PostgreSQL as app user', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to connect as app user', 'DatabaseSetup', error);
      throw error;
    }
  }

  async createDatabase() {
    try {
      // Check if database exists
      const result = await this.adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [this.config.database]
      );

      if (result.rows.length > 0) {
        logger.info(`Database '${this.config.database}' already exists`, 'DatabaseSetup');
        return;
      }

      // Create database
      await this.adminPool.query(`CREATE DATABASE "${this.config.database}"`);
      logger.info(`Database '${this.config.database}' created successfully`, 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to create database', 'DatabaseSetup', error);
      throw error;
    }
  }

  async createUser() {
    try {
      // Check if user exists
      const result = await this.adminPool.query(
        'SELECT 1 FROM pg_roles WHERE rolname = $1',
        [this.config.username]
      );

      if (result.rows.length > 0) {
        logger.info(`User '${this.config.username}' already exists`, 'DatabaseSetup');
        return;
      }

      // Create user
      await this.adminPool.query(
        `CREATE USER "${this.config.username}" WITH PASSWORD $1`,
        [this.config.password]
      );

      // Grant privileges
      await this.adminPool.query(
        `GRANT ALL PRIVILEGES ON DATABASE "${this.config.database}" TO "${this.config.username}"`
      );

      logger.info(`User '${this.config.username}' created successfully`, 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to create user', 'DatabaseSetup', error);
      throw error;
    }
  }

  async runMigrations() {
    try {
      const migrationPath = path.join(__dirname, '../database/migrations/001_initial_schema.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await this.appPool.query(statement);
        }
      }

      logger.info('Database migrations completed successfully', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to run migrations', 'DatabaseSetup', error);
      throw error;
    }
  }

  async createExtensions() {
    try {
      // Enable required extensions
      const extensions = [
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
        'CREATE EXTENSION IF NOT EXISTS "pgcrypto";',
        'CREATE EXTENSION IF NOT EXISTS "pg_trgm";', // For text search
        'CREATE EXTENSION IF NOT EXISTS "btree_gin";', // For JSONB indexes
      ];

      for (const extension of extensions) {
        await this.appPool.query(extension);
      }

      logger.info('Database extensions created successfully', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to create extensions', 'DatabaseSetup', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Additional performance indexes
      const indexes = [
        // Composite indexes for common queries
        'CREATE INDEX IF NOT EXISTS idx_scan_history_user_timestamp ON scan_history(user_id, timestamp DESC);',
        'CREATE INDEX IF NOT EXISTS idx_gut_symptoms_user_timestamp ON gut_symptoms(user_id, timestamp DESC);',
        'CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, is_active) WHERE is_active = true;',
        'CREATE INDEX IF NOT EXISTS idx_safe_foods_user_favorite ON safe_foods(user_id, is_favorite) WHERE is_favorite = true;',
        
        // JSONB indexes for efficient querying
        'CREATE INDEX IF NOT EXISTS idx_food_items_ingredients_gin ON food_items USING GIN (ingredients);',
        'CREATE INDEX IF NOT EXISTS idx_food_items_allergens_gin ON food_items USING GIN (allergens);',
        'CREATE INDEX IF NOT EXISTS idx_gut_profiles_conditions_gin ON gut_profiles USING GIN (conditions);',
        'CREATE INDEX IF NOT EXISTS idx_scan_analysis_flagged_ingredients_gin ON scan_analysis USING GIN (flagged_ingredients);',
        
        // Text search indexes
        'CREATE INDEX IF NOT EXISTS idx_food_items_name_trgm ON food_items USING GIN (name gin_trgm_ops);',
        'CREATE INDEX IF NOT EXISTS idx_food_items_brand_trgm ON food_items USING GIN (brand gin_trgm_ops);',
        'CREATE INDEX IF NOT EXISTS idx_ingredient_analysis_ingredient_trgm ON ingredient_analysis USING GIN (ingredient gin_trgm_ops);',
      ];

      for (const index of indexes) {
        await this.appPool.query(index);
      }

      logger.info('Additional indexes created successfully', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to create additional indexes', 'DatabaseSetup', error);
      throw error;
    }
  }

  async createViews() {
    try {
      // Useful views for common queries
      const views = [
        // User dashboard view
        `CREATE OR REPLACE VIEW user_dashboard AS
         SELECT 
           u.id,
           u.email,
           u.first_name,
           u.last_name,
           u.created_at,
           up.preferences,
           up.settings,
           gp.conditions as gut_conditions,
           gp.preferences as gut_preferences,
           COUNT(DISTINCT sh.id) as total_scans,
           COUNT(DISTINCT sf.id) as safe_foods_count,
           COUNT(DISTINCT m.id) as medications_count,
           COUNT(DISTINCT gs.id) as symptoms_count
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         LEFT JOIN gut_profiles gp ON u.id = gp.user_id
         LEFT JOIN scan_history sh ON u.id = sh.user_id
         LEFT JOIN safe_foods sf ON u.id = sf.user_id
         LEFT JOIN medications m ON u.id = m.user_id
         LEFT JOIN gut_symptoms gs ON u.id = gs.user_id
         GROUP BY u.id, up.preferences, up.settings, gp.conditions, gp.preferences;`,

        // Food safety summary view
        `CREATE OR REPLACE VIEW food_safety_summary AS
         SELECT 
           fi.id,
           fi.name,
           fi.brand,
           fi.category,
           COUNT(sh.id) as total_scans,
           COUNT(CASE WHEN sa.overall_safety = 'safe' THEN 1 END) as safe_count,
           COUNT(CASE WHEN sa.overall_safety = 'caution' THEN 1 END) as caution_count,
           COUNT(CASE WHEN sa.overall_safety = 'avoid' THEN 1 END) as avoid_count,
           ROUND(AVG(sa.confidence), 2) as avg_confidence,
           MAX(sh.timestamp) as last_scanned
         FROM food_items fi
         LEFT JOIN scan_history sh ON fi.id = sh.food_item_id
         LEFT JOIN scan_analysis sa ON sh.analysis_id = sa.id
         GROUP BY fi.id, fi.name, fi.brand, fi.category;`,

        // User health trends view
        `CREATE OR REPLACE VIEW user_health_trends AS
         SELECT 
           u.id as user_id,
           DATE(gs.timestamp) as date,
           COUNT(gs.id) as symptoms_count,
           AVG(gs.severity) as avg_severity,
           COUNT(DISTINCT gs.type) as unique_symptom_types,
           COUNT(sh.id) as scans_count,
           COUNT(CASE WHEN sa.overall_safety = 'safe' THEN 1 END) as safe_scans,
           COUNT(CASE WHEN sa.overall_safety = 'caution' THEN 1 END) as caution_scans,
           COUNT(CASE WHEN sa.overall_safety = 'avoid' THEN 1 END) as avoid_scans
         FROM users u
         LEFT JOIN gut_symptoms gs ON u.id = gs.user_id
         LEFT JOIN scan_history sh ON u.id = sh.user_id
         LEFT JOIN scan_analysis sa ON sh.analysis_id = sa.id
         GROUP BY u.id, DATE(gs.timestamp);`,
      ];

      for (const view of views) {
        await this.appPool.query(view);
      }

      logger.info('Database views created successfully', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to create views', 'DatabaseSetup', error);
      throw error;
    }
  }

  async createFunctions() {
    try {
      // Useful database functions
      const functions = [
        // Function to get user's safe foods with details
        `CREATE OR REPLACE FUNCTION get_user_safe_foods(user_uuid UUID, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
         RETURNS TABLE (
           id UUID,
           food_name VARCHAR,
           brand VARCHAR,
           category VARCHAR,
           image_url TEXT,
           added_date TIMESTAMP,
           last_used TIMESTAMP,
           usage_count INTEGER,
           is_favorite BOOLEAN,
           rating INTEGER,
           notes TEXT
         ) AS $$
         BEGIN
           RETURN QUERY
           SELECT 
             sf.id,
             fi.name as food_name,
             fi.brand,
             fi.category,
             fi.image_url,
             sf.added_date,
             sf.last_used,
             sf.usage_count,
             sf.is_favorite,
             sf.rating,
             sf.notes
           FROM safe_foods sf
           JOIN food_items fi ON sf.food_item_id = fi.id
           WHERE sf.user_id = user_uuid
           ORDER BY sf.last_used DESC NULLS LAST, sf.added_date DESC
           LIMIT limit_count OFFSET offset_count;
         END;
         $$ LANGUAGE plpgsql;`,

        // Function to get user's scan history with analysis
        `CREATE OR REPLACE FUNCTION get_user_scan_history(user_uuid UUID, limit_count INTEGER DEFAULT 20, offset_count INTEGER DEFAULT 0)
         RETURNS TABLE (
           id UUID,
           food_name VARCHAR,
           brand VARCHAR,
           overall_safety VARCHAR,
           confidence DECIMAL,
           timestamp TIMESTAMP,
           explanation TEXT
         ) AS $$
         BEGIN
           RETURN QUERY
           SELECT 
             sh.id,
             fi.name as food_name,
             fi.brand,
             sa.overall_safety,
             sa.confidence,
             sh.timestamp,
             sa.explanation
           FROM scan_history sh
           JOIN food_items fi ON sh.food_item_id = fi.id
           JOIN scan_analysis sa ON sh.analysis_id = sa.id
           WHERE sh.user_id = user_uuid
           ORDER BY sh.timestamp DESC
           LIMIT limit_count OFFSET offset_count;
         END;
         $$ LANGUAGE plpgsql;`,

        // Function to search foods by name or barcode
        `CREATE OR REPLACE FUNCTION search_foods(search_term TEXT, limit_count INTEGER DEFAULT 20)
         RETURNS TABLE (
           id UUID,
           name VARCHAR,
           brand VARCHAR,
           category VARCHAR,
           barcode VARCHAR,
           image_url TEXT,
           similarity REAL
         ) AS $$
         BEGIN
           RETURN QUERY
           SELECT 
             fi.id,
             fi.name,
             fi.brand,
             fi.category,
             fi.barcode,
             fi.image_url,
             similarity(fi.name, search_term) as similarity
           FROM food_items fi
           WHERE 
             fi.name ILIKE '%' || search_term || '%' OR
             fi.brand ILIKE '%' || search_term || '%' OR
             fi.barcode = search_term
           ORDER BY similarity DESC, fi.name
           LIMIT limit_count;
         END;
         $$ LANGUAGE plpgsql;`,
      ];

      for (const function of functions) {
        await this.appPool.query(function);
      }

      logger.info('Database functions created successfully', 'DatabaseSetup');
    } catch (error) {
      logger.error('Failed to create functions', 'DatabaseSetup', error);
      throw error;
    }
  }

  async setupDatabase() {
    try {
      logger.info('Starting database setup...', 'DatabaseSetup');

      // Step 1: Connect as admin
      await this.connectAsAdmin();

      // Step 2: Create database
      await this.createDatabase();

      // Step 3: Create user
      await this.createUser();

      // Step 4: Connect as app user
      await this.connectAsApp();

      // Step 5: Create extensions
      await this.createExtensions();

      // Step 6: Run migrations
      await this.runMigrations();

      // Step 7: Create additional indexes
      await this.createIndexes();

      // Step 8: Create views
      await this.createViews();

      // Step 9: Create functions
      await this.createFunctions();

      logger.info('Database setup completed successfully!', 'DatabaseSetup');
    } catch (error) {
      logger.error('Database setup failed', 'DatabaseSetup', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.adminPool) {
      await this.adminPool.end();
    }
    if (this.appPool) {
      await this.appPool.end();
    }
  }
}

// Main execution
async function main() {
  const setup = new DatabaseSetup();
  
  try {
    await setup.setupDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await setup.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatabaseSetup };
