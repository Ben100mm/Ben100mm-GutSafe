#!/usr/bin/env node

/**
 * Database Optimization Script
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');

class DatabaseOptimizer {
  constructor() {
    this.optimizations = [];
    this.results = {
      overall: 'unknown',
      optimizations: [],
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async addOptimization(name, optimizationFunction) {
    this.optimizations.push({ name, optimizationFunction });
  }

  async runOptimizations() {
    logger.info('Starting database optimizations...', 'DatabaseOptimizer');

    for (const optimization of this.optimizations) {
      try {
        const startTime = Date.now();
        const result = await optimization.optimizationFunction();
        const duration = Date.now() - startTime;

        this.results.optimizations.push({
          name: optimization.name,
          status: 'completed',
          duration: `${duration}ms`,
          details: result
        });

        logger.info(`Optimization '${optimization.name}' completed`, 'DatabaseOptimizer');
      } catch (error) {
        this.results.optimizations.push({
          name: optimization.name,
          status: 'failed',
          error: error.message,
          details: null
        });

        logger.error(`Optimization '${optimization.name}' failed`, 'DatabaseOptimizer', error);
      }
    }

    // Determine overall status
    const failedOptimizations = this.results.optimizations.filter(opt => opt.status === 'failed');
    this.results.overall = failedOptimizations.length === 0 ? 'success' : 'partial';

    logger.info(`Database optimization completed. Overall status: ${this.results.overall}`, 'DatabaseOptimizer');
    return this.results;
  }

  async analyzeTables() {
    const tables = await databaseConnection.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return {
      message: 'Table analysis completed',
      tableCount: tables.length,
      tables: tables.map(t => ({
        name: t.tablename,
        totalSize: t.size,
        tableSize: t.table_size,
        indexSize: t.index_size,
        sizeBytes: parseInt(t.size_bytes)
      }))
    };
  }

  async analyzeIndexes() {
    const indexes = await databaseConnection.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as size,
        pg_relation_size(indexrelid) as size_bytes,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes 
      JOIN pg_class ON pg_stat_user_indexes.indexrelid = pg_class.oid
      WHERE schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC
    `);

    // Find unused indexes
    const unusedIndexes = indexes.filter(idx => idx.scans === '0');
    
    // Find duplicate indexes
    const duplicateIndexes = await databaseConnection.query(`
      SELECT 
        schemaname,
        tablename,
        array_agg(indexname) as indexes,
        array_agg(pg_get_indexdef(indexrelid)) as definitions
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename, indexrelid
      HAVING COUNT(*) > 1
    `);

    return {
      message: 'Index analysis completed',
      indexCount: indexes.length,
      unusedIndexes: unusedIndexes.length,
      duplicateIndexes: duplicateIndexes.length,
      indexes: indexes.map(idx => ({
        name: idx.indexname,
        table: idx.tablename,
        size: idx.size,
        scans: idx.scans,
        tuplesRead: idx.tuples_read,
        tuplesFetched: idx.tuples_fetched
      })),
      unused: unusedIndexes.map(idx => ({
        name: idx.indexname,
        table: idx.tablename,
        size: idx.size
      })),
      duplicates: duplicateIndexes.map(dup => ({
        table: dup.tablename,
        indexes: dup.indexes
      }))
    };
  }

  async analyzeQueries() {
    const queries = await databaseConnection.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements 
      ORDER BY mean_time DESC
      LIMIT 20
    `);

    const slowQueries = queries.filter(q => q.mean_time > 1000);
    const lowHitQueries = queries.filter(q => q.hit_percent < 80);

    return {
      message: 'Query analysis completed',
      totalQueries: queries.length,
      slowQueries: slowQueries.length,
      lowHitQueries: lowHitQueries.length,
      queries: queries.map(q => ({
        query: q.query.substring(0, 100) + '...',
        calls: q.calls,
        meanTime: `${q.mean_time}ms`,
        rows: q.rows,
        hitPercent: q.hit_percent ? `${q.hit_percent.toFixed(1)}%` : 'N/A'
      }))
    };
  }

  async vacuumTables() {
    const tables = await databaseConnection.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    const vacuumResults = [];
    
    for (const table of tables) {
      try {
        await databaseConnection.execute(`VACUUM ANALYZE ${table.tablename}`);
        vacuumResults.push({ table: table.tablename, status: 'success' });
      } catch (error) {
        vacuumResults.push({ table: table.tablename, status: 'failed', error: error.message });
      }
    }

    return {
      message: 'Table vacuum completed',
      tablesProcessed: tables.length,
      results: vacuumResults
    };
  }

  async reindexTables() {
    const tables = await databaseConnection.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    const reindexResults = [];
    
    for (const table of tables) {
      try {
        await databaseConnection.execute(`REINDEX TABLE ${table.tablename}`);
        reindexResults.push({ table: table.tablename, status: 'success' });
      } catch (error) {
        reindexResults.push({ table: table.tablename, status: 'failed', error: error.message });
      }
    }

    return {
      message: 'Table reindexing completed',
      tablesProcessed: tables.length,
      results: reindexResults
    };
  }

  async updateStatistics() {
    await databaseConnection.execute('ANALYZE');
    
    return {
      message: 'Database statistics updated'
    };
  }

  async optimizeIndexes() {
    // Find and drop unused indexes
    const unusedIndexes = await databaseConnection.query(`
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public' 
        AND idx_scan = 0
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE '%_unique_%'
    `);

    const droppedIndexes = [];
    
    for (const index of unusedIndexes) {
      try {
        await databaseConnection.execute(`DROP INDEX IF EXISTS ${index.indexname}`);
        droppedIndexes.push({ name: index.indexname, table: index.tablename });
      } catch (error) {
        logger.warn(`Failed to drop index ${index.indexname}: ${error.message}`, 'DatabaseOptimizer');
      }
    }

    return {
      message: 'Index optimization completed',
      unusedIndexesFound: unusedIndexes.length,
      droppedIndexes: droppedIndexes.length,
      dropped: droppedIndexes
    };
  }

  async checkConnections() {
    const connections = await databaseConnection.query(`
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

    const activeConnections = connections.find(c => c.state === 'active')?.count || 0;
    const maxConn = maxConnections[0].max_connections;
    const usagePercent = (activeConnections / maxConn) * 100;

    return {
      message: 'Connection analysis completed',
      activeConnections,
      maxConnections: maxConn,
      usagePercent: usagePercent.toFixed(1),
      connections: connections
    };
  }

  async checkLocks() {
    const locks = await databaseConnection.query(`
      SELECT 
        mode,
        COUNT(*) as count
      FROM pg_locks 
      WHERE database = (SELECT oid FROM pg_database WHERE datname = current_database())
      GROUP BY mode
    `);

    const blockedQueries = await databaseConnection.query(`
      SELECT 
        blocked_locks.pid AS blocked_pid,
        blocked_activity.usename AS blocked_user,
        blocking_locks.pid AS blocking_pid,
        blocking_activity.usename AS blocking_user,
        blocked_activity.query AS blocked_statement,
        blocking_activity.query AS current_statement_in_blocking_process
      FROM pg_catalog.pg_locks blocked_locks
      JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
      JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
        AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
        AND blocking_locks.pid != blocked_locks.pid
      JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
      WHERE NOT blocked_locks.granted
    `);

    return {
      message: 'Lock analysis completed',
      lockCount: locks.length,
      blockedQueries: blockedQueries.length,
      locks: locks,
      blocked: blockedQueries
    };
  }

  async runAllOptimizations() {
    // Add all optimizations
    await this.addOptimization('analyze_tables', () => this.analyzeTables());
    await this.addOptimization('analyze_indexes', () => this.analyzeIndexes());
    await this.addOptimization('analyze_queries', () => this.analyzeQueries());
    await this.addOptimization('vacuum_tables', () => this.vacuumTables());
    await this.addOptimization('reindex_tables', () => this.reindexTables());
    await this.addOptimization('update_statistics', () => this.updateStatistics());
    await this.addOptimization('optimize_indexes', () => this.optimizeIndexes());
    await this.addOptimization('check_connections', () => this.checkConnections());
    await this.addOptimization('check_locks', () => this.checkLocks());

    // Run all optimizations
    return await this.runOptimizations();
  }
}

// Main execution
async function main() {
  const optimizer = new DatabaseOptimizer();
  
  try {
    const results = await optimizer.runAllOptimizations();
    
    // Output results
    console.log('\n=== Database Optimization Results ===');
    console.log(`Overall Status: ${results.overall.toUpperCase()}`);
    console.log(`Timestamp: ${results.timestamp}`);
    console.log('\nOptimization Details:');
    
    results.optimizations.forEach(opt => {
      const status = opt.status === 'completed' ? '✅' : '❌';
      console.log(`${status} ${opt.name}: ${opt.status}`);
      if (opt.error) {
        console.log(`   Error: ${opt.error}`);
      }
      if (opt.details && opt.details.message) {
        console.log(`   Details: ${opt.details.message}`);
      }
    });

    // Exit with appropriate code
    process.exit(results.overall === 'success' ? 0 : 1);
  } catch (error) {
    console.error('Database optimization failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DatabaseOptimizer };
