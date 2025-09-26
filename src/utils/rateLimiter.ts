/**
 * @fileoverview rateLimiter.ts - Advanced Rate Limiting System
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';

// Rate limit configuration
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any) => void;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
  retryAfter?: number;
}

// Rate limit store entry
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
  lastRequest: number;
}

// Rate limiter class
export class RateLimiter {
  private static instance: RateLimiter;
  private readonly store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.startCleanupInterval();
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private getDefaultConfig(): RateLimitConfig {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
    };
  }

  // Configure rate limiter
  configure(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Rate limiter configured', 'RateLimiter', this.config);
  }

  // Check rate limit
  checkLimit(
    identifier: string,
    customConfig?: Partial<RateLimitConfig>
  ): RateLimitResult {
    const config = { ...this.config, ...customConfig };
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    let entry = this.store.get(key);

    // Create new entry if it doesn't exist or window has expired
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        firstRequest: now,
        lastRequest: now,
      };
      this.store.set(key, entry);
    }

    // Update entry
    entry.count++;
    entry.lastRequest = now;

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const retryAfter =
      entry.count >= config.maxRequests
        ? Math.ceil((entry.resetTime - now) / 1000)
        : undefined;

    const allowed = entry.count <= config.maxRequests;

    if (!allowed) {
      logger.warn('Rate limit exceeded', 'RateLimiter', {
        identifier,
        count: entry.count,
        limit: config.maxRequests,
        resetTime: entry.resetTime,
      });
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      totalHits: entry.count,
      retryAfter,
    };
  }

  // Check rate limit with custom key generator
  checkLimitWithKey(
    req: any,
    customConfig?: Partial<RateLimitConfig>
  ): RateLimitResult {
    const config = { ...this.config, ...customConfig };
    const keyGenerator = config.keyGenerator || this.defaultKeyGenerator;
    const identifier = keyGenerator(req);
    return this.checkLimit(identifier, config);
  }

  // Default key generator (IP-based)
  private defaultKeyGenerator(req: any): string {
    const ip = this.getClientIP(req);
    const userAgent = req.headers?.['user-agent'] || 'unknown';
    return `${ip}:${userAgent}`;
  }

  // Get client IP address
  private getClientIP(req: any): string {
    return (
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers?.['x-real-ip'] ||
      'unknown'
    );
  }

  // Reset rate limit for identifier
  resetLimit(identifier: string): boolean {
    const key = `rate_limit:${identifier}`;
    const deleted = this.store.delete(key);
    if (deleted) {
      logger.info('Rate limit reset', 'RateLimiter', { identifier });
    }
    return deleted;
  }

  // Get current rate limit status
  getStatus(identifier: string): RateLimitResult | null {
    const key = `rate_limit:${identifier}`;
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const retryAfter =
      entry.count >= this.config.maxRequests
        ? Math.ceil((entry.resetTime - now) / 1000)
        : undefined;

    return {
      allowed: entry.count <= this.config.maxRequests,
      remaining,
      resetTime: entry.resetTime,
      totalHits: entry.count,
      retryAfter,
    };
  }

  // Get all rate limit entries (for monitoring)
  getAllEntries(): Array<{ identifier: string; entry: RateLimitEntry }> {
    const entries: Array<{ identifier: string; entry: RateLimitEntry }> = [];

    this.store.forEach((entry, key) => {
      const identifier = key.replace('rate_limit:', '');
      entries.push({ identifier, entry });
    });

    return entries;
  }

  // Clear all rate limits
  clearAll(): void {
    this.store.clear();
    logger.info('All rate limits cleared', 'RateLimiter');
  }

  // Start cleanup interval to remove expired entries
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredEntries();
      },
      5 * 60 * 1000
    ); // Clean up every 5 minutes
  }

  // Clean up expired entries
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      logger.debug('Cleaned up expired rate limit entries', 'RateLimiter', {
        count: cleanedCount,
      });
    }
  }

  // Stop cleanup interval
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get rate limiter statistics
  getStats(): {
    totalEntries: number;
    activeEntries: number;
    expiredEntries: number;
    totalRequests: number;
    averageRequestsPerEntry: number;
  } {
    const now = Date.now();
    let activeEntries = 0;
    let expiredEntries = 0;
    let totalRequests = 0;

    this.store.forEach((entry) => {
      if (now > entry.resetTime) {
        expiredEntries++;
      } else {
        activeEntries++;
        totalRequests += entry.count;
      }
    });

    return {
      totalEntries: this.store.size,
      activeEntries,
      expiredEntries,
      totalRequests,
      averageRequestsPerEntry:
        activeEntries > 0 ? totalRequests / activeEntries : 0,
    };
  }

  // Create middleware for Express.js
  createMiddleware(customConfig?: Partial<RateLimitConfig>) {
    return (req: any, res: any, next: any) => {
      try {
        const result = this.checkLimitWithKey(req, customConfig);

        // Set headers
        if (this.config.standardHeaders) {
          res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          });
        }

        if (this.config.legacyHeaders) {
          res.set({
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          });
        }

        if (!result.allowed) {
          if (this.config.onLimitReached) {
            this.config.onLimitReached(req, res);
          }

          res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: result.retryAfter,
            requestId: req.id,
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Rate limiter middleware error', 'RateLimiter', error);
        next();
      }
    };
  }

  // Create specific rate limiters for different endpoints
  createLoginRateLimiter() {
    return this.createMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
      keyGenerator: (req) => `login:${this.getClientIP(req)}`,
      onLimitReached: (req, res) => {
        logger.warn('Login rate limit exceeded', 'RateLimiter', {
          ip: this.getClientIP(req),
          userAgent: req.headers?.['user-agent'],
        });
      },
    });
  }

  createApiRateLimiter() {
    return this.createMiddleware({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 API calls per 15 minutes
      keyGenerator: (req) => {
        const ip = this.getClientIP(req);
        const userId = req.user?.id || 'anonymous';
        return `api:${userId}:${ip}`;
      },
    });
  }

  createScanRateLimiter() {
    return this.createMiddleware({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 scans per minute
      keyGenerator: (req) => {
        const userId = req.user?.id || 'anonymous';
        return `scan:${userId}`;
      },
    });
  }

  createUploadRateLimiter() {
    return this.createMiddleware({
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 50, // 50 uploads per hour
      keyGenerator: (req) => {
        const userId = req.user?.id || 'anonymous';
        return `upload:${userId}`;
      },
    });
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();
export default rateLimiter;
