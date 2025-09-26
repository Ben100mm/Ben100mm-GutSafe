/**
 * @fileoverview dataProtection.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

// Data classification levels
const DATA_CLASSIFICATION = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted'
};

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16
};

// Sensitive data fields that require encryption
const SENSITIVE_FIELDS = [
  'name', 'email', 'phone', 'address', 'symptoms', 'medications',
  'healthConditions', 'medicalHistory', 'personalNotes', 'location',
  'deviceId', 'ipAddress', 'userId'
];

/**
 * Data Protection Middleware
 * Handles encryption, anonymization, and data classification for API requests/responses
 */
class DataProtectionMiddleware {
  constructor() {
    this.encryptionKey = this.getEncryptionKey();
    this.retentionPolicies = this.initializeRetentionPolicies();
  }

  /**
   * Get encryption key from environment or generate one
   */
  getEncryptionKey() {
    const key = process.env.ENCRYPTION_MASTER_KEY;
    if (!key) {
      logger.warn('No encryption key found in environment, using default (not secure for production)');
      return crypto.scryptSync('default-key', 'salt', 32);
    }
    return Buffer.from(key, 'hex');
  }

  /**
   * Initialize data retention policies
   */
  initializeRetentionPolicies() {
    return {
      [DATA_CLASSIFICATION.PUBLIC]: { retentionDays: 365, encrypt: false },
      [DATA_CLASSIFICATION.INTERNAL]: { retentionDays: 180, encrypt: true },
      [DATA_CLASSIFICATION.CONFIDENTIAL]: { retentionDays: 90, encrypt: true },
      [DATA_CLASSIFICATION.RESTRICTED]: { retentionDays: 30, encrypt: true }
    };
  }

  /**
   * Main middleware function
   */
  middleware() {
    return (req, res, next) => {
      // Add data protection methods to request/response
      req.dataProtection = {
        classifyData: this.classifyData.bind(this),
        encryptData: this.encryptData.bind(this),
        decryptData: this.decryptData.bind(this),
        anonymizeData: this.anonymizeData.bind(this),
        shouldEncrypt: this.shouldEncrypt.bind(this)
      };

      res.dataProtection = {
        encryptResponse: this.encryptResponse.bind(this),
        anonymizeResponse: this.anonymizeResponse.bind(this),
        addSecurityHeaders: this.addSecurityHeaders.bind(this)
      };

      // Add security headers to all responses
      this.addSecurityHeaders(res);

      // Log data processing for compliance
      this.logDataProcessing(req);

      next();
    };
  }

  /**
   * Classify data based on content and context
   */
  classifyData(data, context = {}) {
    if (!data || typeof data !== 'object') {
      return DATA_CLASSIFICATION.PUBLIC;
    }

    const dataStr = JSON.stringify(data).toLowerCase();

    // Health data is always restricted
    if (this.containsHealthData(dataStr)) {
      return DATA_CLASSIFICATION.RESTRICTED;
    }

    // Personal identifiers are confidential
    if (this.containsPersonalIdentifiers(dataStr)) {
      return DATA_CLASSIFICATION.CONFIDENTIAL;
    }

    // Analytics data is internal
    if (this.containsAnalyticsData(dataStr)) {
      return DATA_CLASSIFICATION.INTERNAL;
    }

    // API endpoint context
    if (context.endpoint) {
      if (context.endpoint.includes('/health') || context.endpoint.includes('/symptoms')) {
        return DATA_CLASSIFICATION.RESTRICTED;
      }
      if (context.endpoint.includes('/user') || context.endpoint.includes('/profile')) {
        return DATA_CLASSIFICATION.CONFIDENTIAL;
      }
      if (context.endpoint.includes('/analytics') || context.endpoint.includes('/metrics')) {
        return DATA_CLASSIFICATION.INTERNAL;
      }
    }

    return DATA_CLASSIFICATION.PUBLIC;
  }

  /**
   * Check if data contains health information
   */
  containsHealthData(dataStr) {
    const healthKeywords = [
      'symptom', 'medication', 'health', 'medical', 'diagnosis',
      'treatment', 'condition', 'disease', 'illness', 'pain'
    ];
    return healthKeywords.some(keyword => dataStr.includes(keyword));
  }

  /**
   * Check if data contains personal identifiers
   */
  containsPersonalIdentifiers(dataStr) {
    const identifierKeywords = [
      'email', 'phone', 'address', 'name', 'ssn', 'passport',
      'driver', 'license', 'id', 'dateofbirth', 'birthdate'
    ];
    return identifierKeywords.some(keyword => dataStr.includes(keyword));
  }

  /**
   * Check if data contains analytics information
   */
  containsAnalyticsData(dataStr) {
    const analyticsKeywords = [
      'analytics', 'metrics', 'usage', 'tracking', 'performance',
      'statistics', 'logs', 'events', 'sessions'
    ];
    return analyticsKeywords.some(keyword => dataStr.includes(keyword));
  }

  /**
   * Determine if data should be encrypted
   */
  shouldEncrypt(data, classification) {
    const policy = this.retentionPolicies[classification];
    return policy ? policy.encrypt : false;
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data, classification = null) {
    if (!data) return data;

    const dataClassification = classification || this.classifyData(data);
    
    if (!this.shouldEncrypt(data, dataClassification)) {
      return data;
    }

    try {
      if (typeof data === 'object') {
        return this.encryptObject(data, dataClassification);
      } else {
        return this.encryptString(data);
      }
    } catch (error) {
      logger.error('Encryption failed', { error: error.message, classification: dataClassification });
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Encrypt object by encrypting sensitive fields
   */
  encryptObject(obj, classification) {
    const encrypted = { ...obj };

    Object.keys(encrypted).forEach(key => {
      if (SENSITIVE_FIELDS.includes(key) && encrypted[key] !== null && encrypted[key] !== undefined) {
        try {
          const encryptedValue = this.encryptString(JSON.stringify(encrypted[key]));
          encrypted[key] = {
            __encrypted: true,
            data: encryptedValue.encrypted,
            iv: encryptedValue.iv,
            tag: encryptedValue.tag,
            timestamp: Date.now()
          };
        } catch (error) {
          logger.error('Failed to encrypt field', { field: key, error: error.message });
        }
      }
    });

    return encrypted;
  }

  /**
   * Encrypt string using AES-256-GCM
   */
  encryptString(text) {
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('gutsafe-aad', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      timestamp: Date.now()
    };
  }

  /**
   * Decrypt data
   */
  decryptData(data, classification = null) {
    if (!data) return data;

    const dataClassification = classification || this.classifyData(data);
    
    if (!this.shouldEncrypt(data, dataClassification)) {
      return data;
    }

    try {
      if (typeof data === 'object') {
        return this.decryptObject(data);
      } else {
        return this.decryptString(data);
      }
    } catch (error) {
      logger.error('Decryption failed', { error: error.message, classification: dataClassification });
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Decrypt object by decrypting encrypted fields
   */
  decryptObject(obj) {
    const decrypted = { ...obj };

    Object.keys(decrypted).forEach(key => {
      if (decrypted[key] && typeof decrypted[key] === 'object' && decrypted[key].__encrypted) {
        try {
          const decryptedValue = this.decryptString(decrypted[key]);
          decrypted[key] = JSON.parse(decryptedValue);
        } catch (error) {
          logger.error('Failed to decrypt field', { field: key, error: error.message });
        }
      }
    });

    return decrypted;
  }

  /**
   * Decrypt string using AES-256-GCM
   */
  decryptString(encryptedData) {
    if (typeof encryptedData === 'string') {
      // Handle simple encrypted strings
      const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    // Handle encrypted object with metadata
    const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('gutsafe-aad', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Anonymize data for analytics
   */
  anonymizeData(data, classification) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const anonymized = { ...data };
    const anonymizedId = this.generateAnonymizedId();

    // Anonymize personal identifiers
    const personalFields = ['userId', 'email', 'name', 'deviceId', 'ipAddress'];
    personalFields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.hashIdentifier(anonymized[field]);
      }
    });

    // Anonymize location data
    if (anonymized.location) {
      anonymized.location = this.anonymizeLocation(anonymized.location);
    }

    // Anonymize timestamps
    if (anonymized.timestamp || anonymized.createdAt) {
      anonymized.timestamp = this.anonymizeTimestamp(anonymized.timestamp || anonymized.createdAt);
    }

    return {
      ...anonymized,
      __anonymized: true,
      originalId: data.id || 'unknown',
      anonymizedId,
      anonymizedAt: new Date(),
      classification
    };
  }

  /**
   * Generate anonymized ID
   */
  generateAnonymizedId() {
    return `anon_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Hash identifier for anonymization
   */
  hashIdentifier(identifier) {
    return crypto.createHash('sha256')
      .update(identifier + 'gutsafe-salt')
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Anonymize location data
   */
  anonymizeLocation(location) {
    if (!location.latitude || !location.longitude) {
      return { region: 'unknown' };
    }

    // Round to ~1km precision
    const lat = Math.round(location.latitude * 100) / 100;
    const lng = Math.round(location.longitude * 100) / 100;
    
    return {
      region: `${lat},${lng}`,
      precision: '1km'
    };
  }

  /**
   * Anonymize timestamp
   */
  anonymizeTimestamp(timestamp) {
    const date = new Date(timestamp);
    // Round to hour
    date.setMinutes(0, 0, 0);
    return date.toISOString();
  }

  /**
   * Encrypt response data
   */
  encryptResponse(data, classification) {
    return this.encryptData(data, classification);
  }

  /**
   * Anonymize response data
   */
  anonymizeResponse(data, classification) {
    return this.anonymizeData(data, classification);
  }

  /**
   * Add security headers to response
   */
  addSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Data-Protection', 'enabled');
  }

  /**
   * Log data processing for compliance
   */
  logDataProcessing(req) {
    const processingRecord = {
      timestamp: new Date(),
      method: req.method,
      endpoint: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      dataClassification: this.classifyData(req.body)
    };

    logger.info('Data processing logged', processingRecord);
  }

  /**
   * Get data protection audit report
   */
  getAuditReport() {
    return {
      timestamp: new Date(),
      encryptionConfig: ENCRYPTION_CONFIG,
      retentionPolicies: this.retentionPolicies,
      sensitiveFields: SENSITIVE_FIELDS,
      complianceScore: this.calculateComplianceScore()
    };
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore() {
    let score = 100;
    
    // Check encryption configuration
    if (!this.encryptionKey) score -= 30;
    if (ENCRYPTION_CONFIG.algorithm !== 'aes-256-gcm') score -= 10;
    
    // Check retention policies
    const policyCount = Object.keys(this.retentionPolicies).length;
    if (policyCount < 4) score -= 20;
    
    // Check sensitive fields coverage
    if (SENSITIVE_FIELDS.length < 10) score -= 15;
    
    return Math.max(0, score);
  }
}

// Export middleware instance
const dataProtectionMiddleware = new DataProtectionMiddleware();
module.exports = dataProtectionMiddleware;
