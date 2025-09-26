/**
 * Migration Runner
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 *
 * Handles database migrations for the GutSafe application.
 */

import fs from 'fs';
import path from 'path';

import { databaseManager } from '../connection';

export interface Migration {
  version: string;
  name: string;
  up: string;
  down: string;
  executedAt?: Date;
}

export class MigrationRunner {
  private static instance: MigrationRunner;
  private readonly migrations: Migration[] = [];

  static getInstance(): MigrationRunner {
    if (!MigrationRunner.instance) {
      MigrationRunner.instance = new MigrationRunner();
    }
    return MigrationRunner.instance;
  }

  constructor() {
    this.loadMigrations();
  }

  private loadMigrations(): void {
    // Load migration files from the migrations directory
    const migrationsDir = path.join(__dirname, '..', 'migrations');

    try {
      const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Extract version from filename (e.g., 001_initial_schema.sql -> 001)
        const version = file.split('_')[0] || '000';
        const name = file.replace('.sql', '').replace(`${version}_`, '');

        this.migrations.push({
          version,
          name,
          up: content,
          down: this.generateDownMigration(content),
        });
      }
    } catch (error) {
      console.warn('Could not load migration files:', error);
    }
  }

  private generateDownMigration(upContent: string): string {
    // Generate a basic down migration by reversing CREATE statements
    return upContent
      .replace(/CREATE TABLE IF NOT EXISTS/g, 'DROP TABLE IF EXISTS')
      .replace(/CREATE INDEX IF NOT EXISTS/g, 'DROP INDEX IF EXISTS')
      .split('\n')
      .reverse()
      .join('\n');
  }

  async runMigrations(): Promise<void> {
    try {
      await databaseManager.connect();
      const connection = databaseManager.getConnection();

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable(connection);

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations(connection);

      // Find pending migrations
      const pendingMigrations = this.migrations.filter(
        (migration) => !executedMigrations.includes(migration.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('No pending migrations');
        return;
      }

      console.log(`Running ${pendingMigrations.length} pending migrations...`);

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        try {
          console.log(
            `Executing migration ${migration.version}: ${migration.name}`
          );

          // Split migration into individual statements
          const statements = migration.up
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

          // Execute each statement
          for (const statement of statements) {
            if (statement.trim()) {
              await connection.executeQuery(statement);
            }
          }

          // Record migration as executed
          await this.recordMigrationExecuted(connection, migration);

          console.log(`✓ Migration ${migration.version} completed`);
        } catch (error) {
          console.error(`✗ Migration ${migration.version} failed:`, error);
          throw error;
        }
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration runner failed:', error);
      throw error;
    }
  }

  async rollbackMigrations(versions: string[]): Promise<void> {
    try {
      await databaseManager.connect();
      const connection = databaseManager.getConnection();

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations(connection);

      // Find migrations to rollback (in reverse order)
      const migrationsToRollback = this.migrations
        .filter(
          (migration) =>
            versions.includes(migration.version) &&
            executedMigrations.includes(migration.version)
        )
        .reverse();

      if (migrationsToRollback.length === 0) {
        console.log('No migrations to rollback');
        return;
      }

      console.log(`Rolling back ${migrationsToRollback.length} migrations...`);

      // Execute rollback migrations
      for (const migration of migrationsToRollback) {
        try {
          console.log(
            `Rolling back migration ${migration.version}: ${migration.name}`
          );

          // Split down migration into individual statements
          const statements = migration.down
            .split(';')
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

          // Execute each statement
          for (const statement of statements) {
            if (statement.trim()) {
              await connection.executeQuery(statement);
            }
          }

          // Remove migration from executed list
          await this.removeMigrationExecuted(connection, migration.version);

          console.log(`✓ Migration ${migration.version} rolled back`);
        } catch (error) {
          console.error(
            `✗ Rollback of migration ${migration.version} failed:`,
            error
          );
          throw error;
        }
      }

      console.log('All rollbacks completed successfully');
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    migrations: Array<{
      version: string;
      name: string;
      executed: boolean;
      executedAt?: Date;
    }>;
  }> {
    try {
      await databaseManager.connect();
      const connection = databaseManager.getConnection();

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable(connection);

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations(connection);

      const migrations = this.migrations.map((migration) => ({
        version: migration.version,
        name: migration.name,
        executed: executedMigrations.includes(migration.version),
        ...(migration.executedAt && { executedAt: migration.executedAt }),
      }));

      return {
        total: this.migrations.length,
        executed: executedMigrations.length,
        pending: this.migrations.length - executedMigrations.length,
        migrations,
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      throw error;
    }
  }

  private async createMigrationsTable(connection: any): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        version TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.executeQuery(createTableQuery);
  }

  private async getExecutedMigrations(connection: any): Promise<string[]> {
    try {
      const query = 'SELECT version FROM migrations ORDER BY version';
      const results = await connection.executeQuery(query);
      return results.map((row: any) => row.version);
    } catch (error) {
      // If table doesn't exist or query fails, return empty array
      return [];
    }
  }

  private async recordMigrationExecuted(
    connection: any,
    migration: Migration
  ): Promise<void> {
    const query = `
      INSERT INTO migrations (id, version, name, executed_at) 
      VALUES (?, ?, ?, ?)
    `;

    const id = `${migration.version}_${Date.now()}`;
    const executedAt = new Date().toISOString();

    await connection.executeQuery(query, [
      id,
      migration.version,
      migration.name,
      executedAt,
    ]);
  }

  private async removeMigrationExecuted(
    connection: any,
    version: string
  ): Promise<void> {
    const query = 'DELETE FROM migrations WHERE version = ?';
    await connection.executeQuery(query, [version]);
  }

  // Utility method to check if migrations are needed
  async needsMigration(): Promise<boolean> {
    try {
      const status = await this.getMigrationStatus();
      return status.pending > 0;
    } catch (error) {
      console.error('Failed to check migration status:', error);
      return true; // Assume migration is needed if we can't check
    }
  }

  // Get the latest migration version
  getLatestVersion(): string | null {
    if (this.migrations.length === 0) {
      return null;
    }

    return this.migrations[this.migrations.length - 1]?.version || '000';
  }

  // Get migration by version
  getMigration(version: string): Migration | undefined {
    return this.migrations.find((migration) => migration.version === version);
  }

  // List all available migrations
  listMigrations(): Migration[] {
    return [...this.migrations];
  }
}

export default MigrationRunner;
