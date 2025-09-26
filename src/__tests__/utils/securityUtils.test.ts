/**
 * @fileoverview securityUtils.test.ts - Tests for security utilities
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { securityUtils } from '../../utils/securityUtils';
import { apiKeyManager } from '../../utils/apiKeyManager';
import { rateLimiter } from '../../utils/rateLimiter';
import { sessionManager } from '../../utils/sessionManager';
import { inputValidator } from '../../utils/inputValidator';
import { encryptionUtils } from '../../utils/encryptionUtils';

describe('Security Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate email correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        '',
        'test@.com',
        'test@domain.',
      ];

      validEmails.forEach((email) => {
        const result = securityUtils.validateInput(email, 'email');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      invalidEmails.forEach((email) => {
        const result = securityUtils.validateInput(email, 'email');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate password strength', () => {
      const strongPasswords = [
        'StrongP@ssw0rd123',
        'MySecure123!',
        'ComplexP@ss1',
        'VeryStrongP@ssw0rd!',
      ];

      const weakPasswords = [
        'weak',
        '123456',
        'password',
        'qwerty',
        'abc123',
        'P@ssw0rd', // Too short
        'StrongPassword123', // No special characters
        'StrongP@ssw0rd', // No numbers
      ];

      strongPasswords.forEach((password) => {
        const result = securityUtils.validateInput(password, 'password');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      weakPasswords.forEach((password) => {
        const result = securityUtils.validateInput(password, 'password');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '123.456.7890',
        '+1 123 456 7890',
      ];

      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '',
        '123-456-789',
        '123-456-78901',
      ];

      validPhones.forEach((phone) => {
        const result = securityUtils.validateInput(phone, 'phone');
        expect(result.isValid).toBe(true);
      });

      invalidPhones.forEach((phone) => {
        const result = securityUtils.validateInput(phone, 'phone');
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://subdomain.example.com/path',
        'https://example.com:8080/path?query=value',
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        '',
      ];

      validUrls.forEach((url) => {
        const result = securityUtils.validateInput(url, 'url');
        expect(result.isValid).toBe(true);
      });

      invalidUrls.forEach((url) => {
        const result = securityUtils.validateInput(url, 'url');
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML content', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(\'xss\')">',
        '<iframe src="javascript:alert(\'xss\')"></iframe>',
        '<svg onload="alert(\'xss\')"></svg>',
        '<a href="javascript:alert(\'xss\')">Click me</a>',
      ];

      maliciousInputs.forEach((input) => {
        const sanitized = securityUtils.sanitizeInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
      });
    });

    it('should preserve safe HTML content', () => {
      const safeInputs = [
        '<p>This is safe content</p>',
        '<strong>Bold text</strong>',
        '<em>Italic text</em>',
        '<ul><li>List item</li></ul>',
        '<a href="https://example.com">Safe link</a>',
      ];

      safeInputs.forEach((input) => {
        const sanitized = securityUtils.sanitizeInput(input);
        expect(sanitized).toContain('safe content');
        expect(sanitized).toContain('Bold text');
        expect(sanitized).toContain('Italic text');
      });
    });

    it('should handle empty and null inputs', () => {
      expect(securityUtils.sanitizeInput('')).toBe('');
      expect(securityUtils.sanitizeInput(null as any)).toBe('');
      expect(securityUtils.sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '<svg onload="alert(\'xss\')"></svg>',
        '"><script>alert("xss")</script>',
      ];

      xssAttempts.forEach((attempt) => {
        const result = securityUtils.detectSuspiciousActivity(attempt);
        expect(result.isSuspicious).toBe(true);
        expect(result.reason).toContain('XSS');
      });
    });

    it('should detect SQL injection attempts', () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1' UNION SELECT * FROM users--",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      ];

      sqlInjectionAttempts.forEach((attempt) => {
        const result = securityUtils.detectSuspiciousActivity(attempt);
        expect(result.isSuspicious).toBe(true);
        expect(result.reason).toContain('SQL injection');
      });
    });

    it('should detect path traversal attempts', () => {
      const pathTraversalAttempts = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '....//....//....//etc/passwd',
      ];

      pathTraversalAttempts.forEach((attempt) => {
        const result = securityUtils.detectSuspiciousActivity(attempt);
        expect(result.isSuspicious).toBe(true);
        expect(result.reason).toContain('Path traversal');
      });
    });

    it('should not flag normal content as suspicious', () => {
      const normalContent = [
        'This is normal text',
        'user@example.com',
        'https://example.com',
        'Hello, world!',
        'Product name: Test Product',
        'Price: $19.99',
      ];

      normalContent.forEach((content) => {
        const result = securityUtils.detectSuspiciousActivity(content);
        expect(result.isSuspicious).toBe(false);
      });
    });
  });

  describe('Security Audit', () => {
    it('should perform comprehensive security audit', () => {
      const audit = securityUtils.performSecurityAudit();

      expect(audit).toHaveProperty('score');
      expect(audit).toHaveProperty('issues');
      expect(audit).toHaveProperty('recommendations');
      expect(audit).toHaveProperty('timestamp');

      expect(typeof audit.score).toBe('number');
      expect(audit.score).toBeGreaterThanOrEqual(0);
      expect(audit.score).toBeLessThanOrEqual(100);

      expect(Array.isArray(audit.issues)).toBe(true);
      expect(Array.isArray(audit.recommendations)).toBe(true);

      expect(typeof audit.timestamp).toBe('number');
    });

    it('should identify security issues', () => {
      const audit = securityUtils.performSecurityAudit();

      audit.issues.forEach((issue) => {
        expect(issue).toHaveProperty('type');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('description');
        expect(issue).toHaveProperty('recommendation');

        expect(['low', 'medium', 'high', 'critical']).toContain(issue.severity);
      });
    });

    it('should provide actionable recommendations', () => {
      const audit = securityUtils.performSecurityAudit();

      audit.recommendations.forEach((recommendation) => {
        expect(recommendation).toHaveProperty('category');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('priority');

        expect(['low', 'medium', 'high']).toContain(recommendation.priority);
      });
    });
  });
});

describe('API Key Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Key Validation', () => {
    it('should validate API keys', () => {
      const validation = apiKeyManager.validateApiKey('USDA_API_KEY');

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('key');
      expect(validation).toHaveProperty('environment');
      expect(validation).toHaveProperty('errors');

      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });

    it('should check required keys', () => {
      const requiredCheck = apiKeyManager.checkRequiredKeys();

      expect(requiredCheck).toHaveProperty('allPresent');
      expect(requiredCheck).toHaveProperty('missing');
      expect(requiredCheck).toHaveProperty('present');

      expect(typeof requiredCheck.allPresent).toBe('boolean');
      expect(Array.isArray(requiredCheck.missing)).toBe(true);
      expect(Array.isArray(requiredCheck.present)).toBe(true);
    });

    it('should list API keys', () => {
      const keys = apiKeyManager.listApiKeys();

      expect(Array.isArray(keys)).toBe(true);

      keys.forEach((key) => {
        expect(key).toHaveProperty('name');
        expect(key).toHaveProperty('required');
        expect(key).toHaveProperty('encrypted');
        expect(key).toHaveProperty('present');

        expect(typeof key.required).toBe('boolean');
        expect(typeof key.encrypted).toBe('boolean');
        expect(typeof key.present).toBe('boolean');
      });
    });

    it('should perform security audit', () => {
      const audit = apiKeyManager.performSecurityAudit();

      expect(audit).toHaveProperty('score');
      expect(audit).toHaveProperty('issues');
      expect(audit).toHaveProperty('recommendations');

      expect(typeof audit.score).toBe('number');
      expect(Array.isArray(audit.issues)).toBe(true);
      expect(Array.isArray(audit.recommendations)).toBe(true);
    });
  });
});

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimiter.clearAll();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const result = rateLimiter.checkLimit('test-user', {
        maxRequests: 5,
        windowMs: 60000,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeDefined();
    });

    it('should block requests exceeding limit', () => {
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

    it('should reset limits after window expires', (done) => {
      const identifier = 'test-user';
      const config = { maxRequests: 1, windowMs: 100 }; // Very short window

      // Make request
      rateLimiter.checkLimit(identifier, config);

      // Wait for window to expire
      setTimeout(() => {
        const result = rateLimiter.checkLimit(identifier, config);
        expect(result.allowed).toBe(true);
        done();
      }, 150);
    });

    it('should handle different identifiers separately', () => {
      const config = { maxRequests: 1, windowMs: 60000 };

      const result1 = rateLimiter.checkLimit('user1', config);
      const result2 = rateLimiter.checkLimit('user2', config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
    });

    it('should get statistics', () => {
      rateLimiter.checkLimit('user1', { maxRequests: 10, windowMs: 60000 });
      rateLimiter.checkLimit('user2', { maxRequests: 10, windowMs: 60000 });

      const stats = rateLimiter.getStats();

      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('activeEntries');
      expect(stats).toHaveProperty('totalRequests');
      expect(stats.totalEntries).toBe(2);
    });
  });
});

describe('Session Manager', () => {
  beforeEach(() => {
    sessionManager.destroySession('test-session');
  });

  describe('Session Management', () => {
    it('should create and validate session', () => {
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

    it('should validate session correctly', () => {
      const userId = 'test-user';
      const sessionId = sessionManager.createSession(userId, {
        email: 'test@example.com',
      });

      const validation = sessionManager.validateSession(sessionId);
      expect(validation.isValid).toBe(true);
      expect(validation.userId).toBe(userId);
    });

    it('should destroy session', () => {
      const userId = 'test-user';
      const sessionId = sessionManager.createSession(userId, {
        email: 'test@example.com',
      });

      const destroyed = sessionManager.destroySession(sessionId);
      expect(destroyed).toBe(true);

      const session = sessionManager.getSession(sessionId);
      expect(session).toBeNull();
    });

    it('should get user sessions', () => {
      const userId = 'test-user';
      sessionManager.createSession(userId, { email: 'test@example.com' });
      sessionManager.createSession(userId, { email: 'test@example.com' });

      const userSessions = sessionManager.getUserSessions(userId);
      expect(userSessions).toHaveLength(2);
    });

    it('should handle expired sessions', () => {
      const userId = 'test-user';
      const sessionId = sessionManager.createSession(userId, {
        email: 'test@example.com',
      });

      // Simulate session expiration
      const session = sessionManager.getSession(sessionId);
      if (session) {
        session.expiresAt = Date.now() - 1000; // Expired 1 second ago
      }

      const validation = sessionManager.validateSession(sessionId);
      expect(validation.isValid).toBe(false);
    });

    it('should get statistics', () => {
      sessionManager.createSession('user1', { email: 'user1@example.com' });
      sessionManager.createSession('user2', { email: 'user2@example.com' });

      const stats = sessionManager.getStats();
      expect(stats).toHaveProperty('totalSessions');
      expect(stats).toHaveProperty('activeSessions');
      expect(stats.totalSessions).toBe(2);
    });
  });
});

describe('Input Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation Rules', () => {
    it('should validate user registration data', () => {
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

    it('should reject invalid user registration data', () => {
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

    it('should validate gut profile data', () => {
      const validData = {
        conditions: { ibs: true, lactose_intolerant: false },
        preferences: { spicy_food: false },
        isActive: true,
      };

      const result = inputValidator.validate(validData, 'gutProfile');
      expect(result.isValid).toBe(true);
    });

    it('should validate food item data', () => {
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

    it('should add custom validator', () => {
      const customValidator = (value: string) => ({
        isValid: value === 'valid',
        error: value !== 'valid' ? 'Must be "valid"' : undefined,
      });

      inputValidator.addCustomValidator('testValidator', customValidator);

      const rule = inputValidator.getRuleSet('userRegistration');
      expect(rule).toBeDefined();
    });
  });
});

describe('Encryption Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Encryption and Decryption', () => {
    it('should encrypt and decrypt data', async () => {
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

    it('should encrypt and decrypt sensitive data', async () => {
      const testData = 'This is sensitive data';

      const encrypted = await encryptionUtils.encryptSensitive(testData);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('salt');

      const decrypted = await encryptionUtils.decryptSensitive(encrypted);
      expect(decrypted.success).toBe(true);
      expect(decrypted.decrypted).toBe(testData);
    });

    it('should hash data', async () => {
      const testData = 'This is test data';
      const hash = await encryptionUtils.hash(testData);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify data integrity', async () => {
      const testData = 'This is test data';
      const hash = await encryptionUtils.hash(testData);

      const isValid = await encryptionUtils.verifyIntegrity(testData, hash);
      expect(isValid).toBe(true);

      const invalidData = 'This is different data';
      const isInvalid = await encryptionUtils.verifyIntegrity(
        invalidData,
        hash
      );
      expect(isInvalid).toBe(false);
    });

    it('should generate secure strings', () => {
      const secureString = encryptionUtils.generateSecureString(32);
      const secureToken = encryptionUtils.generateSecureToken(32);

      expect(secureString).toBeDefined();
      expect(secureToken).toBeDefined();
      expect(secureString.length).toBeGreaterThan(0);
      expect(secureToken.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should test encryption', async () => {
      const testResult = await encryptionUtils.testEncryption();
      expect(testResult).toBe(true);
    });

    it('should get statistics', () => {
      const stats = encryptionUtils.getStats();

      expect(stats).toHaveProperty('algorithm');
      expect(stats).toHaveProperty('keyLength');
      expect(stats).toHaveProperty('iterations');
      expect(stats).toHaveProperty('cachedKeys');
    });
  });
});

describe('Security Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Comprehensive Security', () => {
    it('should perform comprehensive security audit', () => {
      const securityAudit = securityUtils.performSecurityAudit();
      const apiKeyAudit = apiKeyManager.performSecurityAudit();

      expect(securityAudit.score).toBeGreaterThan(0);
      expect(apiKeyAudit.score).toBeGreaterThan(0);
    });

    it('should handle rate limiting with session management', () => {
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

    it('should validate input with encryption', async () => {
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
});
