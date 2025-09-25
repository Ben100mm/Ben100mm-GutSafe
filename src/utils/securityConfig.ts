/**
 * @fileoverview securityConfig.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';

// Security configuration and utilities
export class SecurityConfig {
  private static instance: SecurityConfig;
  private securityHeaders: Record<string, string> = {};
  private allowedOrigins: string[] = [];
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): SecurityConfig {
    if (!SecurityConfig.instance) {
      SecurityConfig.instance = new SecurityConfig();
    }
    return SecurityConfig.instance;
  }

  constructor() {
    this.initializeSecurityHeaders();
    this.initializeAllowedOrigins();
  }

  // Initialize security headers
  private initializeSecurityHeaders(): void {
    this.securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
  }

  // Initialize allowed origins
  private initializeAllowedOrigins(): void {
    this.allowedOrigins = [
      'https://gutsafe.app',
      'https://www.gutsafe.app',
      'https://api.gutsafe.app',
      'http://localhost:3000',
      'http://localhost:9001',
    ];
  }

  // Get security headers
  getSecurityHeaders(): Record<string, string> {
    return { ...this.securityHeaders };
  }

  // Add custom security header
  addSecurityHeader(name: string, value: string): void {
    this.securityHeaders[name] = value;
    logger.info('Security header added', 'SecurityConfig', { name, value });
  }

  // Check if origin is allowed
  isOriginAllowed(origin: string): boolean {
    return this.allowedOrigins.includes(origin);
  }

  // Add allowed origin
  addAllowedOrigin(origin: string): void {
    if (!this.allowedOrigins.includes(origin)) {
      this.allowedOrigins.push(origin);
      logger.info('Allowed origin added', 'SecurityConfig', { origin });
    }
  }

  // Rate limiting
  isRateLimited(key: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const rateLimit = this.rateLimits.get(key);

    if (!rateLimit || now > rateLimit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (rateLimit.count >= limit) {
      logger.warn('Rate limit exceeded', 'SecurityConfig', { key, count: rateLimit.count, limit });
      return true;
    }

    rateLimit.count++;
    return false;
  }

  // Clear rate limits
  clearRateLimits(): void {
    this.rateLimits.clear();
    logger.info('Rate limits cleared', 'SecurityConfig');
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim();
  }

  // Validate email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
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

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  // Generate secure random string
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Hash sensitive data
  hashSensitiveData(data: string): string {
    // In a real app, use a proper hashing library like bcrypt
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Check for suspicious patterns
  detectSuspiciousActivity(data: string): {
    isSuspicious: boolean;
    patterns: string[];
  } {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
      /alert\s*\(/i,
      /confirm\s*\(/i,
      /prompt\s*\(/i,
    ];

    const detectedPatterns: string[] = [];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(data)) {
        detectedPatterns.push(pattern.source);
      }
    }

    return {
      isSuspicious: detectedPatterns.length > 0,
      patterns: detectedPatterns,
    };
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

    // Check for common security issues
    if (this.allowedOrigins.length === 0) {
      issues.push('No allowed origins configured');
      score -= 20;
    }

    if (Object.keys(this.securityHeaders).length < 5) {
      issues.push('Insufficient security headers');
      score -= 15;
    }

    if (this.rateLimits.size === 0) {
      issues.push('No rate limiting configured');
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

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}

// Export singleton instance
export const securityConfig = SecurityConfig.getInstance();
export default securityConfig;
