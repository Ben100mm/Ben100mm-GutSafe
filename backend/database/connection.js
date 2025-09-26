/**
 * Backend Database Connection
 * Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const { config } = require('../config');
const { logger } = require('../utils/logger');

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.type = config.database.type;
    this.config = config.database;
  }

  async connect() {
    try {
      switch (this.type) {
        case 'postgresql':
          await this.connectPostgreSQL();
          break;
        case 'mysql':
          await this.connectMySQL();
          break;
        case 'sqlite':
          await this.connectSQLite();
          break;
        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
      
      logger.info(`Connected to ${this.type} database`, 'Database');
    } catch (error) {
      logger.error('Database connection failed', 'Database', error);
      throw error;
    }
  }

  async connectPostgreSQL() {
    this.connection = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
      max: this.config.pool.max,
      min: this.config.pool.min,
      acquireTimeoutMillis: this.config.pool.acquireTimeoutMillis,
      createTimeoutMillis: this.config.pool.createTimeoutMillis,
      destroyTimeoutMillis: this.config.pool.destroyTimeoutMillis,
      idleTimeoutMillis: this.config.pool.idleTimeoutMillis,
    });

    // Test connection
    const client = await this.connection.connect();
    client.release();
  }

  async connectMySQL() {
    this.connection = await mysql.createPool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl,
      connectionLimit: this.config.pool.max,
      acquireTimeout: this.config.pool.acquireTimeoutMillis,
      timeout: this.config.pool.createTimeoutMillis,
    });

    // Test connection
    await this.connection.execute('SELECT 1');
  }

  async connectSQLite() {
    return new Promise((resolve, reject) => {
      this.connection = new sqlite3.Database(
        this.config.database === ':memory:' ? ':memory:' : `./${this.config.database}`,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async disconnect() {
    if (!this.connection) return;

    try {
      switch (this.type) {
        case 'postgresql':
          await this.connection.end();
          break;
        case 'mysql':
          await this.connection.end();
          break;
        case 'sqlite':
          this.connection.close();
          break;
      }
      
      this.connection = null;
      logger.info('Database disconnected', 'Database');
    } catch (error) {
      logger.error('Error disconnecting from database', 'Database', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    try {
      switch (this.type) {
        case 'postgresql':
          const pgResult = await this.connection.query(sql, params);
          return pgResult.rows;
        case 'mysql':
          const [mysqlRows] = await this.connection.execute(sql, params);
          return mysqlRows;
        case 'sqlite':
          return new Promise((resolve, reject) => {
            this.connection.all(sql, params, (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });
        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
    } catch (error) {
      logger.error('Database query failed', 'Database', { sql, params, error });
      throw error;
    }
  }

  async queryOne(sql, params = []) {
    const results = await this.query(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(sql, params = []) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    try {
      switch (this.type) {
        case 'postgresql':
          const pgResult = await this.connection.query(sql, params);
          return { affectedRows: pgResult.rowCount, insertId: pgResult.rows[0]?.id };
        case 'mysql':
          const [mysqlResult] = await this.connection.execute(sql, params);
          return { affectedRows: mysqlResult.affectedRows, insertId: mysqlResult.insertId };
        case 'sqlite':
          return new Promise((resolve, reject) => {
            this.connection.run(sql, params, function(err) {
              if (err) reject(err);
              else resolve({ affectedRows: this.changes, insertId: this.lastID });
            });
          });
        default:
          throw new Error(`Unsupported database type: ${this.type}`);
      }
    } catch (error) {
      logger.error('Database execute failed', 'Database', { sql, params, error });
      throw error;
    }
  }

  async transaction(callback) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    switch (this.type) {
      case 'postgresql':
        const client = await this.connection.connect();
        try {
          await client.query('BEGIN');
          const result = await callback(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      case 'mysql':
        const connection = await this.connection.getConnection();
        try {
          await connection.beginTransaction();
          const result = await callback(connection);
          await connection.commit();
          return result;
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      case 'sqlite':
        return new Promise((resolve, reject) => {
          this.connection.serialize(() => {
            this.connection.run('BEGIN TRANSACTION');
            callback(this.connection)
              .then(result => {
                this.connection.run('COMMIT');
                resolve(result);
              })
              .catch(error => {
                this.connection.run('ROLLBACK');
                reject(error);
              });
          });
        });
      default:
        throw new Error(`Unsupported database type: ${this.type}`);
    }
  }

  isConnected() {
    return this.connection !== null;
  }

  getConnection() {
    return this.connection;
  }
}

// Singleton instance
const databaseConnection = new DatabaseConnection();

module.exports = { databaseConnection };
