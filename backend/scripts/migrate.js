/**
 * Database Migration Runner
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const fs = require('fs');
const path = require('path');
const { databaseConnection } = require('../database/connection');
const { logger } = require('../utils/logger');

async function runMigrations() {
  try {
    logger.info('Starting database migrations...', 'Migration');

    // Connect to database
    await databaseConnection.connect();

    // Create migrations table if it doesn't exist
    await databaseConnection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const executedMigrations = await databaseConnection.query(
      'SELECT filename FROM migrations ORDER BY id'
    );
    const executedFilenames = executedMigrations.map(m => m.filename);

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (executedFilenames.includes(filename)) {
        logger.info(`Migration ${filename} already executed, skipping`, 'Migration');
        continue;
      }

      logger.info(`Running migration: ${filename}`, 'Migration');

      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Split SQL by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await databaseConnection.execute(statement);
        }
      }

      // Record migration as executed
      await databaseConnection.execute(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );

      logger.info(`Migration ${filename} completed successfully`, 'Migration');
    }

    logger.info('All migrations completed successfully', 'Migration');
  } catch (error) {
    logger.error('Migration failed', 'Migration', error);
    process.exit(1);
  } finally {
    await databaseConnection.disconnect();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
