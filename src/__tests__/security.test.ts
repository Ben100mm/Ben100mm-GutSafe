/**
 * @fileoverview security.test.ts - Security Test Suite
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { securityUtils } from '../utils/securityUtils';
import { apiKeyManager } from '../utils/apiKeyManager';
import { rateLimiter } from '../utils/rateLimiter';
import { sessionManager } from '../utils/sessionManager';
import { inputValidator } from '../utils/inputValidator';
import { encryptionUtils } from '../utils/encryptionUtils';

describe('Security Utils', () => {
  test('should validate email correctly', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
    ];

    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'test@',
      'test.example.com',
    ];

    validEmails.forEach((email) => {
      expect(securityUtils.validateInput(email, 'email').isValid).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(securityUtils.validateInput(email, 'email').isValid).toBe(false);
    });
  });

  test('should validate password strength', () => {
    const strongPassword = 'StrongP@ssw0rd123';
    const weakPassword = 'weak';

    const strongResult = securityUtils.validateInput(
      strongPassword,
      'password'
    );
    const weakResult = securityUtils.validateInput(weakPassword, 'password');

    expect(strongResult.isValid).toBe(true);
    expect(weakResult.isValid).toBe(false);
  });

  test('should sanitize input correctly', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = securityUtils.sanitizeInput(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });

  test('should detect suspicious patterns', () => {
    const suspiciousInput = '<script>alert("xss")</script>';
    const normalInput = 'This is normal text';

    const suspiciousResult =
      securityUtils.detectSuspiciousActivity(suspiciousInput);
    const normalResult = securityUtils.detectSuspiciousActivity(normalInput);

    expect(suspiciousResult.isSuspicious).toBe(true);
    expect(normalResult.isSuspicious).toBe(false);
  });

  test('should perform security audit', () => {
    const audit = securityUtils.performSecurityAudit();

    expect(audit).toHaveProperty('score');
    expect(audit).toHaveProperty('issues');
    expect(audit).toHaveProperty('recommendations');
    expect(typeof audit.score).toBe('number');
    expect(Array.isArray(audit.issues)).toBe(true);
    expect(Array.isArray(audit.recommendations)).toBe(true);
  });
});

describe('API Key Manager', () => {
  test('should validate API keys', () => {
    const validation = apiKeyManager.validateApiKey('USDA_API_KEY');

    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('key');
    expect(validation).toHaveProperty('environment');
    expect(validation).toHaveProperty('errors');
  });

  test('should check required keys', () => {
    const requiredCheck = apiKeyManager.checkRequiredKeys();

    expect(requiredCheck).toHaveProperty('allPresent');
    expect(requiredCheck).toHaveProperty('missing');
    expect(typeof requiredCheck.allPresent).toBe('boolean');
    expect(Array.isArray(requiredCheck.missing)).toBe(true);
  });

  test('should list API keys', () => {
    const keys = apiKeyManager.listApiKeys();

    expect(Array.isArray(keys)).toBe(true);
    keys.forEach((key) => {
      expect(key).toHaveProperty('name');
      expect(key).toHaveProperty('required');
      expect(key).toHaveProperty('encrypted');
      expect(key).toHaveProperty('present');
    });
  });

  test('should perform security audit', () => {
    const audit = apiKeyManager.performSecurityAudit();

    expect(audit).toHaveProperty('score');
    expect(audit).toHaveProperty('issues');
    expect(audit).toHaveProperty('recommendations');
  });
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
  });

  test('should allow requests within limit', () => {
    const result = rateLimiter.checkLimit('test-user', {
      maxRequests: 5,
      windowMs: 60000,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  test('should block requests exceeding limit', () => {
    const identifier = 'test-user';
    const config = { maxRequests: 2, windowMs: 60000 };

    // Make requests within limit
    rateLimiter.checkLimit(identifier, config);
    rateLimiter.checkLimit(identifier, config);

    // This should be blocked
    const result = rateLimiter.checkLimit(identifier, config);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  test('should reset limits after window expires', () => {
    const identifier = 'test-user';
    const config = { maxRequests: 1, windowMs: 100 }; // Very short window

    // Make request
    rateLimiter.checkLimit(identifier, config);

    // Wait for window to expire
    setTimeout(() => {
      const result = rateLimiter.checkLimit(identifier, config);
      expect(result.allowed).toBe(true);
    }, 150);
  });

  test('should get statistics', () => {
    rateLimiter.checkLimit('user1', { maxRequests: 10, windowMs: 60000 });
    rateLimiter.checkLimit('user2', { maxRequests: 10, windowMs: 60000 });

    const stats = rateLimiter.getStats();

    expect(stats).toHaveProperty('totalEntries');
    expect(stats).toHaveProperty('activeEntries');
    expect(stats).toHaveProperty('totalRequests');
    expect(stats.totalEntries).toBe(2);
  });
});

describe('Session Manager', () => {
  beforeEach(() => {
    // Clear any existing sessions
    sessionManager.destroySession('test-session');
  });

  test('should create and validate session', () => {
    const userId = 'test-user';
    const userData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const sessionId = sessionManager.createSession(userId, userData);
    expect(sessionId).toBeDefined();

    const session = sessionManager.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session?.userId).toBe(userId);
    expect(session?.email).toBe(userData.email);
  });

  test('should validate session correctly', () => {
    const userId = 'test-user';
    const sessionId = sessionManager.createSession(userId, {
      email: 'test@example.com',
    });

    const validation = sessionManager.validateSession(sessionId);
    expect(validation.isValid).toBe(true);
    expect(validation.userId).toBe(userId);
  });

  test('should destroy session', () => {
    const userId = 'test-user';
    const sessionId = sessionManager.createSession(userId, {
      email: 'test@example.com',
    });

    const destroyed = sessionManager.destroySession(sessionId);
    expect(destroyed).toBe(true);

    const session = sessionManager.getSession(sessionId);
    expect(session).toBeNull();
  });

  test('should get user sessions', () => {
    const userId = 'test-user';
    sessionManager.createSession(userId, { email: 'test@example.com' });
    sessionManager.createSession(userId, { email: 'test@example.com' });

    const userSessions = sessionManager.getUserSessions(userId);
    expect(userSessions).toHaveLength(2);
  });

  test('should get statistics', () => {
    sessionManager.createSession('user1', { email: 'user1@example.com' });
    sessionManager.createSession('user2', { email: 'user2@example.com' });

    const stats = sessionManager.getStats();
    expect(stats).toHaveProperty('totalSessions');
    expect(stats).toHaveProperty('activeSessions');
    expect(stats.totalSessions).toBe(2);
  });
});

describe('Input Validator', () => {
  test('should validate user registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'StrongP@ssw0rd123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = inputValidator.validate(validData, 'userRegistration');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData).toBeDefined();
  });

  test('should reject invalid user registration data', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'weak',
      firstName: '',
      lastName: '',
    };

    const result = inputValidator.validate(invalidData, 'userRegistration');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should validate gut profile data', () => {
    const validData = {
      conditions: { ibs: true, lactose_intolerant: false },
      preferences: { spicy_food: false },
      isActive: true,
    };

    const result = inputValidator.validate(validData, 'gutProfile');
    expect(result.isValid).toBe(true);
  });

  test('should validate food item data', () => {
    const validData = {
      name: 'Test Food',
      barcode: '1234567890123',
      brand: 'Test Brand',
      category: 'Snacks',
      ingredients: ['flour', 'sugar'],
      allergens: ['gluten'],
      additives: [],
      nutritionalInfo: { calories: 100 },
      gutHealthInfo: { safety: 'safe' },
      dataSource: 'manual',
    };

    const result = inputValidator.validate(validData, 'foodItem');
    expect(result.isValid).toBe(true);
  });

  test('should add custom validator', () => {
    const customValidator = (value: string) => ({
      isValid: value === 'valid',
      error: value !== 'valid' ? 'Must be "valid"' : undefined,
    });

    inputValidator.addCustomValidator('testValidator', customValidator);

    const rule = inputValidator.getRuleSet('userRegistration');
    expect(rule).toBeDefined();
  });
});

describe('Encryption Utils', () => {
  test('should encrypt and decrypt data', async () => {
    const testData = 'This is test data';

    const encrypted = await encryptionUtils.encrypt(testData);
    expect(encrypted).toHaveProperty('encrypted');
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('salt');
    expect(encrypted).toHaveProperty('algorithm');

    const decrypted = await encryptionUtils.decrypt(encrypted);
    expect(decrypted.success).toBe(true);
    expect(decrypted.decrypted).toBe(testData);
  });

  test('should encrypt and decrypt sensitive data', async () => {
    const testData = 'This is sensitive data';

    const encrypted = await encryptionUtils.encryptSensitive(testData);
    expect(encrypted).toHaveProperty('encrypted');
    expect(encrypted).toHaveProperty('iv');
    expect(encrypted).toHaveProperty('salt');

    const decrypted = await encryptionUtils.decryptSensitive(encrypted);
    expect(decrypted.success).toBe(true);
    expect(decrypted.decrypted).toBe(testData);
  });

  test('should hash data', async () => {
    const testData = 'This is test data';
    const hash = await encryptionUtils.hash(testData);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  test('should verify data integrity', async () => {
    const testData = 'This is test data';
    const hash = await encryptionUtils.hash(testData);

    const isValid = await encryptionUtils.verifyIntegrity(testData, hash);
    expect(isValid).toBe(true);

    const invalidData = 'This is different data';
    const isInvalid = await encryptionUtils.verifyIntegrity(invalidData, hash);
    expect(isInvalid).toBe(false);
  });

  test('should generate secure strings', () => {
    const secureString = encryptionUtils.generateSecureString(32);
    const secureToken = encryptionUtils.generateSecureToken(32);

    expect(secureString).toBeDefined();
    expect(secureToken).toBeDefined();
    expect(secureString.length).toBeGreaterThan(0);
    expect(secureToken.length).toBe(64); // 32 bytes = 64 hex characters
  });

  test('should test encryption', async () => {
    const testResult = await encryptionUtils.testEncryption();
    expect(testResult).toBe(true);
  });

  test('should get statistics', () => {
    const stats = encryptionUtils.getStats();

    expect(stats).toHaveProperty('algorithm');
    expect(stats).toHaveProperty('keyLength');
    expect(stats).toHaveProperty('iterations');
    expect(stats).toHaveProperty('cachedKeys');
  });
});

describe('Security Integration', () => {
  test('should perform comprehensive security audit', () => {
    const securityAudit = securityUtils.performSecurityAudit();
    const apiKeyAudit = apiKeyManager.performSecurityAudit();

    expect(securityAudit.score).toBeGreaterThan(0);
    expect(apiKeyAudit.score).toBeGreaterThan(0);
  });

  test('should handle rate limiting with session management', () => {
    const userId = 'test-user';
    const sessionId = sessionManager.createSession(userId, {
      email: 'test@example.com',
    });

    // Check rate limit
    const rateLimitResult = rateLimiter.checkLimit(`user:${userId}`, {
      maxRequests: 5,
      windowMs: 60000,
    });
    expect(rateLimitResult.allowed).toBe(true);

    // Validate session
    const sessionValidation = sessionManager.validateSession(sessionId);
    expect(sessionValidation.isValid).toBe(true);
  });

  test('should validate input with encryption', async () => {
    const testData = 'Test input data';

    // Validate input
    const validation = inputValidator.validateInput(testData, 'string');
    expect(validation.isValid).toBe(true);

    // Encrypt validated data
    const encrypted = await encryptionUtils.encrypt(validation.sanitized!);
    expect(encrypted).toHaveProperty('encrypted');

    // Decrypt and verify
    const decrypted = await encryptionUtils.decrypt(encrypted);
    expect(decrypted.success).toBe(true);
    expect(decrypted.decrypted).toBe(validation.sanitized);
  });
});
