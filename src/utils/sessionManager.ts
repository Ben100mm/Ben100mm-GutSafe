/**
 * @fileoverview sessionManager.ts - Enhanced Session Management
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';
import { securityUtils } from './securityUtils';

// Session configuration
export interface SessionConfig {
  maxAge: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  rolling: boolean;
  resave: boolean;
  saveUninitialized: boolean;
  name: string;
  secret: string;
}

// Session data interface
export interface SessionData {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  loginTime?: number;
  lastActivity?: number;
  ipAddress?: string;
  userAgent?: string;
  csrfToken?: string;
  permissions?: string[];
  preferences?: Record<string, any>;
  [key: string]: any;
}

// Session validation result
export interface SessionValidation {
  isValid: boolean;
  sessionId: string;
  userId?: string;
  errors: string[];
  warnings: string[];
}

// Session manager class
export class SessionManager {
  private static instance: SessionManager;
  private config: SessionConfig;
  private sessions: Map<string, SessionData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.startCleanupInterval();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private getDefaultConfig(): SessionConfig {
    return {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      rolling: true,
      resave: false,
      saveUninitialized: false,
      name: 'gutsafe.sid',
      secret: process.env.REACT_APP_SESSION_SECRET || 'default-secret-change-in-production',
    };
  }

  // Configure session manager
  configure(config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Session manager configured', 'SessionManager', {
      maxAge: this.config.maxAge,
      secure: this.config.secure,
      sameSite: this.config.sameSite,
    });
  }

  // Create new session
  createSession(userId: string, userData: Partial<SessionData>, req?: any): string {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const sessionData: SessionData = {
      userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: userData.isActive ?? true,
      emailVerified: userData.emailVerified ?? false,
      loginTime: now,
      lastActivity: now,
      ipAddress: this.getClientIP(req),
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      csrfToken: this.generateCSRFToken(),
      permissions: userData.permissions || [],
      preferences: userData.preferences || {},
      ...userData,
    };

    this.sessions.set(sessionId, sessionData);
    
    logger.info('Session created', 'SessionManager', {
      sessionId,
      userId,
      ipAddress: sessionData.ipAddress,
    });

    return sessionId;
  }

  // Get session data
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    const now = Date.now();
    const sessionAge = now - (session.loginTime || 0);
    
    if (sessionAge > this.config.maxAge) {
      this.destroySession(sessionId);
      return null;
    }

    // Update last activity if rolling is enabled
    if (this.config.rolling) {
      session.lastActivity = now;
    }

    return session;
  }

  // Update session data
  updateSession(sessionId: string, updates: Partial<SessionData>): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    // Update session data
    Object.assign(session, updates);
    session.lastActivity = Date.now();

    logger.debug('Session updated', 'SessionManager', {
      sessionId,
      updates: Object.keys(updates),
    });

    return true;
  }

  // Destroy session
  destroySession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    
    if (deleted) {
      logger.info('Session destroyed', 'SessionManager', { sessionId });
    }

    return deleted;
  }

  // Validate session
  validateSession(sessionId: string, req?: any): SessionValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!sessionId) {
      return {
        isValid: false,
        sessionId: '',
        errors: ['Session ID is required'],
        warnings: [],
      };
    }

    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        isValid: false,
        sessionId,
        errors: ['Session not found'],
        warnings: [],
      };
    }

    // Check session age
    const now = Date.now();
    const sessionAge = now - (session.loginTime || 0);
    
    if (sessionAge > this.config.maxAge) {
      this.destroySession(sessionId);
      return {
        isValid: false,
        sessionId,
        errors: ['Session expired'],
        warnings: [],
      };
    }

    // Check IP address (if provided)
    if (req) {
      const currentIP = this.getClientIP(req);
      if (session.ipAddress && session.ipAddress !== currentIP) {
        warnings.push('Session IP address changed');
      }
    }

    // Check user agent (if provided)
    if (req) {
      const currentUserAgent = req.headers?.['user-agent'] || 'unknown';
      if (session.userAgent && session.userAgent !== currentUserAgent) {
        warnings.push('Session user agent changed');
      }
    }

    // Check if user is still active
    if (session.isActive === false) {
      this.destroySession(sessionId);
      return {
        isValid: false,
        sessionId,
        errors: ['User account is deactivated'],
        warnings: [],
      };
    }

    return {
      isValid: true,
      sessionId,
      userId: session.userId,
      errors,
      warnings,
    };
  }

  // Refresh session (extend expiration)
  refreshSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    session.lastActivity = Date.now();
    
    logger.debug('Session refreshed', 'SessionManager', { sessionId });
    return true;
  }

  // Get all sessions for a user
  getUserSessions(userId: string): Array<{ sessionId: string; data: SessionData }> {
    const userSessions: Array<{ sessionId: string; data: SessionData }> = [];
    
    this.sessions.forEach((data, sessionId) => {
      if (data.userId === userId) {
        userSessions.push({ sessionId, data });
      }
    });

    return userSessions;
  }

  // Destroy all sessions for a user
  destroyUserSessions(userId: string): number {
    let destroyedCount = 0;
    
    this.sessions.forEach((data, sessionId) => {
      if (data.userId === userId) {
        this.sessions.delete(sessionId);
        destroyedCount++;
      }
    });

    if (destroyedCount > 0) {
      logger.info('User sessions destroyed', 'SessionManager', {
        userId,
        count: destroyedCount,
      });
    }

    return destroyedCount;
  }

  // Generate session ID
  private generateSessionId(): string {
    return securityUtils.generateSecureToken(32);
  }

  // Generate CSRF token
  private generateCSRFToken(): string {
    return securityUtils.generateSecureToken(32);
  }

  // Get client IP address
  private getClientIP(req?: any): string {
    if (!req) return 'unknown';
    
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers?.['x-real-ip'] ||
           'unknown';
  }

  // Start cleanup interval to remove expired sessions
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.sessions.forEach((session, sessionId) => {
      const sessionAge = now - (session.loginTime || 0);
      
      if (sessionAge > this.config.maxAge) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      logger.debug('Cleaned up expired sessions', 'SessionManager', { count: cleanedCount });
    }
  }

  // Stop cleanup interval
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get session statistics
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    averageSessionAge: number;
  } {
    const now = Date.now();
    let activeSessions = 0;
    let expiredSessions = 0;
    let totalAge = 0;

    this.sessions.forEach((session) => {
      const sessionAge = now - (session.loginTime || 0);
      
      if (sessionAge > this.config.maxAge) {
        expiredSessions++;
      } else {
        activeSessions++;
        totalAge += sessionAge;
      }
    });

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      expiredSessions,
      averageSessionAge: activeSessions > 0 ? totalAge / activeSessions : 0,
    };
  }

  // Create session middleware for Express.js
  createMiddleware() {
    return (req: any, res: any, next: any) => {
      try {
        const sessionId = req.cookies?.[this.config.name] || req.headers?.['x-session-id'];
        
        if (sessionId) {
          const validation = this.validateSession(sessionId, req);
          
          if (validation.isValid) {
            req.session = this.getSession(sessionId);
            req.sessionId = sessionId;
            
            // Log warnings
            if (validation.warnings.length > 0) {
              logger.warn('Session validation warnings', 'SessionManager', {
                sessionId,
                warnings: validation.warnings,
              });
            }
          } else {
            // Clear invalid session
            res.clearCookie(this.config.name);
            req.session = null;
            req.sessionId = null;
            
            if (validation.errors.length > 0) {
              logger.warn('Session validation failed', 'SessionManager', {
                sessionId,
                errors: validation.errors,
              });
            }
          }
        }

        next();
      } catch (error) {
        logger.error('Session middleware error', 'SessionManager', error);
        next();
      }
    };
  }

  // Create session creation middleware
  createSessionCreationMiddleware() {
    return (req: any, res: any, next: any) => {
      try {
        if (req.user && !req.session) {
          const sessionId = this.createSession(req.user.id, {
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            isActive: req.user.isActive,
            emailVerified: req.user.emailVerified,
          }, req);

          // Set session cookie
          res.cookie(this.config.name, sessionId, {
            maxAge: this.config.maxAge,
            secure: this.config.secure,
            httpOnly: this.config.httpOnly,
            sameSite: this.config.sameSite,
          });

          req.sessionId = sessionId;
          req.session = this.getSession(sessionId);
        }

        next();
      } catch (error) {
        logger.error('Session creation middleware error', 'SessionManager', error);
        next();
      }
    };
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
export default sessionManager;
