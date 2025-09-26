#!/usr/bin/env node

/**
 * Database Health Check Script
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');

class DatabaseHealthCheck {
  constructor() {
    this.checks = [];
    this.results = {
      overall: 'unknown',
      checks: [],
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async addCheck(name, checkFunction) {
    this.checks.push({ name, checkFunction });
  }

  async runChecks() {
    logger.info('Starting database health checks...', 'HealthCheck');

    for (const check of this.checks) {
      try {
        const startTime = Date.now();
        const result = await check.checkFunction();
        const duration = Date.now() - startTime;

        this.results.checks.push({
          name: check.name,
          status: 'pass',
          duration: `${duration}ms`,
          details: result
        });

        logger.info(`Health check '${check.name}' passed`, 'HealthCheck');
      } catch (error) {
        this.results.checks.push({
          name: check.name,
          status: 'fail',
          error: error.message,
          details: null
        });

        logger.error(`Health check '${check.name}' failed`, 'HealthCheck', error);
      }
    }

    // Determine overall status
    const failedChecks = this.results.checks.filter(check => check.status === 'fail');
    this.results.overall = failedChecks.length === 0 ? 'healthy' : 'unhealthy';

    logger.info(`Database health check completed. Overall status: ${this.results.overall}`, 'HealthCheck');
    return this.results;
  }

  async checkConnection() {
    const client = await databaseConnection.getConnection().connect();
    client.release();
    return { message: 'Database connection successful' };
  }

  async checkTables() {
    const tables = await databaseConnection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const expectedTables = [
      'users', 'user_profiles', 'gut_profiles', 'food_items', 
      'scan_history', 'scan_analysis', 'gut_symptoms', 'medications',
      'safe_foods', 'analytics_data', 'food_trends', 'ingredient_analysis',
      'user_sessions', 'api_keys'
    ];

    const existingTables = tables.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }

    return { 
      message: 'All required tables exist',
      tableCount: existingTables.length,
      tables: existingTables
    };
  }

  async checkIndexes() {
    const indexes = await databaseConnection.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    const criticalIndexes = [
      'idx_users_email',
      'idx_scan_history_user_id',
      'idx_food_items_barcode',
      'idx_gut_symptoms_user_id',
      'idx_medications_user_id'
    ];

    const existingIndexes = indexes.map(row => row.indexname);
    const missingIndexes = criticalIndexes.filter(index => !existingIndexes.includes(index));

    if (missingIndexes.length > 0) {
      throw new Error(`Missing critical indexes: ${missingIndexes.join(', ')}`);
    }

    return {
      message: 'Critical indexes exist',
      indexCount: indexes.length,
      criticalIndexes: criticalIndexes.filter(index => existingIndexes.includes(index))
    };
  }

  async checkExtensions() {
    const extensions = await databaseConnection.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'btree_gin')
      ORDER BY extname
    `);

    const requiredExtensions = ['uuid-ossp', 'pgcrypto'];
    const existingExtensions = extensions.map(row => row.extname);
    const missingExtensions = requiredExtensions.filter(ext => !existingExtensions.includes(ext));

    if (missingExtensions.length > 0) {
      throw new Error(`Missing required extensions: ${missingExtensions.join(', ')}`);
    }

    return {
      message: 'Required extensions installed',
      extensions: extensions.map(row => ({ name: row.extname, version: row.extversion }))
    };
  }

  async checkDataIntegrity() {
    // Check for orphaned records
    const orphanedScans = await databaseConnection.query(`
      SELECT COUNT(*) as count
      FROM scan_history sh
      LEFT JOIN users u ON sh.user_id = u.id
      WHERE u.id IS NULL
    `);

    const orphanedAnalyses = await databaseConnection.query(`
      SELECT COUNT(*) as count
      FROM scan_analysis sa
      LEFT JOIN users u ON sa.user_id = u.id
      WHERE u.id IS NULL
    `);

    const orphanedSafeFoods = await databaseConnection.query(`
      SELECT COUNT(*) as count
      FROM safe_foods sf
      LEFT JOIN users u ON sf.user_id = u.id
      WHERE u.id IS NULL
    `);

    const totalOrphaned = 
      parseInt(orphanedScans[0].count) + 
      parseInt(orphanedAnalyses[0].count) + 
      parseInt(orphanedSafeFoods[0].count);

    if (totalOrphaned > 0) {
      throw new Error(`Found ${totalOrphaned} orphaned records`);
    }

    return {
      message: 'Data integrity check passed',
      orphanedRecords: {
        scans: parseInt(orphanedScans[0].count),
        analyses: parseInt(orphanedAnalyses[0].count),
        safeFoods: parseInt(orphanedSafeFoods[0].count)
      }
    };
  }

  async checkPerformance() {
    // Check for slow queries
    const slowQueries = await databaseConnection.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 1000  -- Queries taking more than 1 second on average
      ORDER BY mean_time DESC
      LIMIT 10
    `);

    // Check table sizes
    const tableSizes = await databaseConnection.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return {
      message: 'Performance check completed',
      slowQueries: slowQueries.length,
      slowQueriesList: slowQueries.map(q => ({
        query: q.query.substring(0, 100) + '...',
        calls: q.calls,
        meanTime: `${q.mean_time}ms`,
        rows: q.rows
      })),
      tableSizes: tableSizes.map(t => ({
        table: t.tablename,
        size: t.size
      }))
    };
  }

  async checkConnections() {
    const connectionStats = await databaseConnection.query(`
      SELECT 
        state,
        COUNT(*) as count
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    `);

    const maxConnections = await databaseConnection.query(`
      SELECT setting::int as max_connections
      FROM pg_settings 
      WHERE name = 'max_connections'
    `);

    const activeConnections = connectionStats.find(s => s.state === 'active')?.count || 0;
    const maxConn = maxConnections[0].max_connections;
    const connectionUsage = (activeConnections / maxConn) * 100;

    if (connectionUsage > 80) {
      throw new Error(`High connection usage: ${connectionUsage.toFixed(1)}%`);
    }

    return {
      message: 'Connection usage is healthy',
      activeConnections,
      maxConnections: maxConn,
      usagePercentage: connectionUsage.toFixed(1),
      connectionStates: connectionStats
    };
  }

  async checkDiskSpace() {
    const diskUsage = await databaseConnection.query(`
      SELECT 
        pg_database_size(current_database()) as database_size,
        pg_size_pretty(pg_database_size(current_database())) as database_size_pretty
    `);

    const sizeBytes = parseInt(diskUsage[0].database_size);
    const sizeGB = sizeBytes / (1024 * 1024 * 1024);

    if (sizeGB > 10) { // Alert if database is larger than 10GB
      logger.warn(`Database size is ${diskUsage[0].database_size_pretty}`, 'HealthCheck');
    }

    return {
      message: 'Disk space check completed',
      databaseSize: diskUsage[0].database_size_pretty,
      sizeGB: sizeGB.toFixed(2)
    };
  }

  async checkReplication() {
    // Check if replication is configured
    const replicationStatus = await databaseConnection.query(`
      SELECT 
        CASE 
          WHEN pg_is_in_recovery() THEN 'replica'
          ELSE 'primary'
        END as role
    `);

    return {
      message: 'Replication check completed',
      role: replicationStatus[0].role,
      isReplica: replicationStatus[0].role === 'replica'
    };
  }

  async runAllChecks() {
    // Add all health checks
    await this.addCheck('connection', () => this.checkConnection());
    await this.addCheck('tables', () => this.checkTables());
    await this.addCheck('indexes', () => this.checkIndexes());
    await this.addCheck('extensions', () => this.checkExtensions());
    await this.addCheck('data_integrity', () => this.checkDataIntegrity());
    await this.addCheck('performance', () => this.checkPerformance());
    await this.addCheck('connections', () => this.checkConnections());
    await this.addCheck('disk_space', () => this.checkDiskSpace());
    await this.addCheck('replication', () => this.checkReplication());

    // Run all checks
    return await this.runChecks();
  }
}

// Main execution
async function main() {
  const healthCheck = new DatabaseHealthCheck();
  
  try {
    const results = await healthCheck.runAllChecks();
    
    // Output results
    console.log('\n=== Database Health Check Results ===');
    console.log(`Overall Status: ${results.overall.toUpperCase()}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log('\nCheck Details:');
    
    results.checks.forEach(check => {
      const status = check.status === 'pass' ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.status}`);
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }
      if (check.details && check.details.message) {
        console.log(`   Details: ${check.details.message}`);
      }
    });

    // Exit with appropriate code
    process.exit(results.overall === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error('Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatabaseHealthCheck };
