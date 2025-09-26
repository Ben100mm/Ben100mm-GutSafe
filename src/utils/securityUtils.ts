/**
 * @fileoverview securityUtils.ts - Enhanced Security Utilities
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';

// Security configuration interface
export interface SecurityConfig {
  encryption: {
    algorithm: string;
    keyLength: number;
    iterations: number;
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  cors: {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  headers: {
    [key: string]: string;
  };
}

// Enhanced security utilities class
export class SecurityUtils {
  private static instance: SecurityUtils;
  private config: SecurityConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {
    this.config = this.initializeSecurityConfig();
  }

  static getInstance(): SecurityUtils {
    if (!SecurityUtils.instance) {
      SecurityUtils.instance = new SecurityUtils();
    }
    return SecurityUtils.instance;
  }

  private initializeSecurityConfig(): SecurityConfig {
    return {
      encryption: {
        algorithm: 'AES-256-GCM',
        keyLength: 32,
        iterations: 100000,
      },
      rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false,
      },
      session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
      },
      cors: {
        origin: this.getAllowedOrigins(),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'X-API-Key',
          'X-Request-ID',
        ],
      },
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Resource-Policy': 'same-origin',
      },
    };
  }

  private getAllowedOrigins(): string[] {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    
    const origins = [
      'https://gutsafe.app',
      'https://www.gutsafe.app',
      'https://api.gutsafe.app',
    ];
    
    if (isDevelopment) {
      origins.push(
        'http://localhost:3000',
        'http://localhost:9001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:9001',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
      );
    }
    
    // Add environment-specific origins
    if (process.env.REACT_APP_ALLOWED_ORIGINS) {
      const envOrigins = process.env.REACT_APP_ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
      origins.push(...envOrigins);
    }
    
    return origins;
  }

  // Enhanced input validation
  validateInput(input: any, type: 'string' | 'email' | 'password' | 'uuid' | 'number' | 'boolean'): {
    isValid: boolean;
    sanitized?: any;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = input;

    try {
      switch (type) {
        case 'string':
          if (typeof input !== 'string') {
            errors.push('Input must be a string');
            return { isValid: false, errors };
          }
          sanitized = this.sanitizeString(input);
          if (sanitized.length === 0) {
            errors.push('Input cannot be empty');
          }
          break;

        case 'email':
          if (typeof input !== 'string') {
            errors.push('Email must be a string');
            return { isValid: false, errors };
          }
          sanitized = this.sanitizeString(input).toLowerCase();
          if (!this.isValidEmail(sanitized)) {
            errors.push('Invalid email format');
          }
          break;

        case 'password':
          if (typeof input !== 'string') {
            errors.push('Password must be a string');
            return { isValid: false, errors };
          }
          const passwordValidation = this.validatePasswordStrength(input);
          if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.feedback);
          }
          sanitized = input; // Don't sanitize passwords
          break;

        case 'uuid':
          if (typeof input !== 'string') {
            errors.push('UUID must be a string');
            return { isValid: false, errors };
          }
          sanitized = this.sanitizeString(input);
          if (!this.isValidUUID(sanitized)) {
            errors.push('Invalid UUID format');
          }
          break;

        case 'number':
          if (typeof input === 'string') {
            const parsed = parseFloat(input);
            if (isNaN(parsed)) {
              errors.push('Invalid number format');
            } else {
              sanitized = parsed;
            }
          } else if (typeof input !== 'number') {
            errors.push('Input must be a number');
            return { isValid: false, errors };
          }
          break;

        case 'boolean':
          if (typeof input === 'string') {
            sanitized = input.toLowerCase() === 'true';
          } else if (typeof input !== 'boolean') {
            errors.push('Input must be a boolean');
            return { isValid: false, errors };
          }
          break;

        default:
          errors.push('Invalid validation type');
          return { isValid: false, errors };
      }

      return {
        isValid: errors.length === 0,
        sanitized,
        errors,
      };
    } catch (error) {
      logger.error('Input validation error', 'SecurityUtils', error);
      return {
        isValid: false,
        errors: ['Validation failed'],
      };
    }
  }

  // Enhanced string sanitization
  private sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/[\\]/g, '') // Remove backslashes
      .replace(/[/]/g, '') // Remove forward slashes
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/[[\]]/g, '') // Remove brackets
      .replace(/[{}]/g, '') // Remove braces
      .replace(/[|]/g, '') // Remove pipes
      .replace(/[`]/g, '') // Remove backticks
      .replace(/[~]/g, '') // Remove tildes
      .replace(/[!]/g, '') // Remove exclamation marks
      .replace(/[@]/g, '') // Remove at symbols
      .replace(/[#]/g, '') // Remove hash symbols
      .replace(/[$]/g, '') // Remove dollar signs
      .replace(/[%]/g, '') // Remove percent signs
      .replace(/[\^]/g, '') // Remove carets
      .replace(/[+]/g, '') // Remove plus signs
      .replace(/[=]/g, '') // Remove equals signs
      .replace(/[?]/g, '') // Remove question marks
      .replace(/[,]/g, '') // Remove commas
      .replace(/[.]/g, '') // Remove periods
      .trim();
  }

  // Enhanced email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Enhanced UUID validation
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Enhanced password validation
  private validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Password should not contain repeated characters');
      score -= 1;
    }

    if (/123|abc|qwe|asd|zxc/i.test(password)) {
      feedback.push('Password should not contain common sequences');
      score -= 1;
    }

    return {
      isValid: score >= 4,
      score: Math.max(0, score),
      feedback,
    };
  }

  // Enhanced rate limiting
  checkRateLimit(identifier: string, customLimit?: number): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const limit = customLimit || this.config.rateLimiting.maxRequests;
    const windowMs = this.config.rateLimiting.windowMs;
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    const rateLimit = this.rateLimitStore.get(key);

    if (!rateLimit || now > rateLimit.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    if (rateLimit.count >= limit) {
      logger.warn('Rate limit exceeded', 'SecurityUtils', { identifier, count: rateLimit.count, limit });
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimit.resetTime,
      };
    }

    rateLimit.count++;
    return {
      allowed: true,
      remaining: limit - rateLimit.count,
      resetTime: rateLimit.resetTime,
    };
  }

  // Enhanced encryption utilities
  async encryptData(data: string, key?: string): Promise<string> {
    try {
      const encryptionKey = key || this.getEncryptionKey();
      const iv = this.generateRandomBytes(16);
      
      // Use Web Crypto API if available
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const keyBuffer = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(encryptionKey),
          { name: 'AES-GCM' },
          false,
          ['encrypt']
        );

        const encrypted = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          keyBuffer,
          new TextEncoder().encode(data)
        );

        const encryptedArray = new Uint8Array(encrypted);
        const result = new Uint8Array(iv.length + encryptedArray.length);
        result.set(iv);
        result.set(encryptedArray, iv.length);

        return btoa(String.fromCharCode(...result));
      } else {
        // Fallback to crypto-js
        const CryptoJS = require('crypto-js');
        const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
          iv: CryptoJS.lib.WordArray.create(iv),
          mode: CryptoJS.mode.GCM,
        });
        return encrypted.toString();
      }
    } catch (error) {
      logger.error('Encryption failed', 'SecurityUtils', error);
      throw new Error('Encryption failed');
    }
  }

  async decryptData(encryptedData: string, key?: string): Promise<string> {
    try {
      const encryptionKey = key || this.getEncryptionKey();
      
      // Use Web Crypto API if available
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        const iv = dataBuffer.slice(0, 16);
        const encrypted = dataBuffer.slice(16);

        const keyBuffer = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(encryptionKey),
          { name: 'AES-GCM' },
          false,
          ['decrypt']
        );

        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          keyBuffer,
          encrypted
        );

        return new TextDecoder().decode(decrypted);
      } else {
        // Fallback to crypto-js
        const CryptoJS = require('crypto-js');
        const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey, {
          mode: CryptoJS.mode.GCM,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
      }
    } catch (error) {
      logger.error('Decryption failed', 'SecurityUtils', error);
      throw new Error('Decryption failed');
    }
  }

  private getEncryptionKey(): string {
    const key = process.env.REACT_APP_ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('Encryption key not properly configured');
    }
    return key;
  }

  private generateRandomBytes(length: number): Uint8Array {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return array;
    } else {
      // Fallback for environments without crypto support
      const array = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }
  }

  // Security headers
  getSecurityHeaders(): Record<string, string> {
    return { ...this.config.headers };
  }

  // CORS configuration
  getCorsConfig() {
    return { ...this.config.cors };
  }

  // Session configuration
  getSessionConfig() {
    return { ...this.config.session };
  }

  // Generate secure token
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Content Security Policy
  generateCSP(nonce?: string): string {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + (nonce ? ` 'nonce-${nonce}'` : ''),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "worker-src 'self'",
    ].join('; ');

    return csp;
  }

  // Security audit
  performSecurityAudit(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check environment variables
    const requiredEnvVars = [
      'REACT_APP_ENCRYPTION_KEY',
      'REACT_APP_JWT_SECRET',
      'REACT_APP_SESSION_SECRET',
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
      score -= 20;
    }

    // Check encryption key strength
    const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
    if (encryptionKey && encryptionKey.length < 32) {
      issues.push('Encryption key is too short (minimum 32 characters)');
      score -= 15;
    }

    // Check CORS configuration
    if (this.config.cors.origin.length === 0) {
      issues.push('No CORS origins configured');
      score -= 10;
    }

    // Check security headers
    if (Object.keys(this.config.headers).length < 8) {
      issues.push('Insufficient security headers');
      score -= 10;
    }

    // Generate recommendations
    if (score < 80) {
      recommendations.push('Implement comprehensive security headers');
    }
    if (score < 70) {
      recommendations.push('Add rate limiting for API endpoints');
    }
    if (score < 60) {
      recommendations.push('Implement input validation and sanitization');
    }
    if (score < 50) {
      recommendations.push('Review and strengthen encryption implementation');
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  // Clear rate limits (for testing)
  clearRateLimits(): void {
    this.rateLimitStore.clear();
    logger.info('Rate limits cleared', 'SecurityUtils');
  }
}

// Export singleton instance
export const securityUtils = SecurityUtils.getInstance();
export default securityUtils;
