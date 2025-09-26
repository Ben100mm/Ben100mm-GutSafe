/**
 * @fileoverview logger.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// import { Platform } from 'react-native';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel =
    typeof __DEV__ !== 'undefined' && __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private constructor() {
    // Initialize logger
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private addLog(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      ...(context !== undefined && { context }),
      ...(data !== undefined && { data }),
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (__DEV__) {
      const prefix = `[${LogLevel[level]}] ${context ? `[${context}] ` : ''}`;
      const fullMessage = `${prefix}${message}`;

      switch (level) {
        case LogLevel.DEBUG:
          console.log(fullMessage, data || '');
          break;
        case LogLevel.INFO:
          console.info(fullMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(fullMessage, data || '');
          break;
        case LogLevel.ERROR:
          console.error(fullMessage, data || '');
          break;
      }
    }
  }

  debug(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.addLog(LogLevel.DEBUG, message, context, data);
    }
  }

  info(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.addLog(LogLevel.INFO, message, context, data);
    }
  }

  warn(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.addLog(LogLevel.WARN, message, context, data);
    }
  }

  error(message: string, context?: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.addLog(LogLevel.ERROR, message, context, data);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();
export default logger;
