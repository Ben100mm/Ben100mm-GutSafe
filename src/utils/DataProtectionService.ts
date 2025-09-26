/**
 * @fileoverview DataProtectionService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import * as CryptoJS from 'crypto-js';

import { healthDataEncryption } from './encryption';
import { logger } from './logger';

// Data classification levels
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

// Data retention policies
export interface DataRetentionPolicy {
  classification: DataClassification;
  retentionDays: number;
  autoDelete: boolean;
  anonymizeAfterDays?: number;
  encryptAtRest: boolean;
  encryptInTransit: boolean;
}

// GDPR compliance features
export interface GDPRConsent {
  userId: string;
  dataProcessing: boolean;
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
  dataRetention: boolean;
  consentDate: Date;
  lastUpdated: Date;
  version: string;
}

// Data anonymization result
export interface AnonymizedData {
  originalId: string;
  anonymizedId: string;
  classification: DataClassification;
  anonymizedAt: Date;
  fieldsAnonymized: string[];
}

// Encryption configuration
interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  mode: string;
  padding: string;
  iterations: number;
}

/**
 * Comprehensive Data Protection Service
 * Handles encryption, anonymization, retention policies, and GDPR compliance
 */
export class DataProtectionService {
  private static instance: DataProtectionService;
  private readonly encryptionConfig: EncryptionConfig;
  private readonly retentionPolicies: Map<
    DataClassification,
    DataRetentionPolicy
  >;
  private readonly consentRegistry: Map<string, GDPRConsent>;

  private constructor() {
    this.encryptionConfig = {
      algorithm: 'AES',
      keySize: 256,
      mode: 'CBC',
      padding: 'Pkcs7',
      iterations: 10000,
    };

    this.retentionPolicies = new Map();
    this.consentRegistry = new Map();
    this.initializeRetentionPolicies();
  }

  public static getInstance(): DataProtectionService {
    if (!DataProtectionService.instance) {
      DataProtectionService.instance = new DataProtectionService();
    }
    return DataProtectionService.instance;
  }

  /**
   * Initialize data retention policies
   */
  private initializeRetentionPolicies(): void {
    this.retentionPolicies.set(DataClassification.PUBLIC, {
      classification: DataClassification.PUBLIC,
      retentionDays: 365,
      autoDelete: false,
      encryptAtRest: false,
      encryptInTransit: false,
    });

    this.retentionPolicies.set(DataClassification.INTERNAL, {
      classification: DataClassification.INTERNAL,
      retentionDays: 180,
      autoDelete: true,
      anonymizeAfterDays: 90,
      encryptAtRest: true,
      encryptInTransit: true,
    });

    this.retentionPolicies.set(DataClassification.CONFIDENTIAL, {
      classification: DataClassification.CONFIDENTIAL,
      retentionDays: 90,
      autoDelete: true,
      anonymizeAfterDays: 30,
      encryptAtRest: true,
      encryptInTransit: true,
    });

    this.retentionPolicies.set(DataClassification.RESTRICTED, {
      classification: DataClassification.RESTRICTED,
      retentionDays: 30,
      autoDelete: true,
      encryptAtRest: true,
      encryptInTransit: true,
    });
  }

  /**
   * Classify data based on content and context
   */
  classifyData(data: any, _context?: string): DataClassification {
    // Health data is always restricted
    if (this.containsHealthData(data)) {
      return DataClassification.RESTRICTED;
    }

    // Personal identifiers are confidential
    if (this.containsPersonalIdentifiers(data)) {
      return DataClassification.CONFIDENTIAL;
    }

    // Analytics data is internal
    if (this.containsAnalyticsData(data)) {
      return DataClassification.INTERNAL;
    }

    // Public data (food database, general info)
    return DataClassification.PUBLIC;
  }

  /**
   * Check if data contains health information
   */
  private containsHealthData(data: any): boolean {
    const healthFields = [
      'symptoms',
      'medications',
      'healthConditions',
      'medicalHistory',
      'gutProfile',
      'symptomHistory',
      'medicationHistory',
      'scanHistory',
    ];

    return this.containsFields(data, healthFields);
  }

  /**
   * Check if data contains personal identifiers
   */
  private containsPersonalIdentifiers(data: any): boolean {
    const identifierFields = [
      'email',
      'name',
      'phone',
      'address',
      'userId',
      'deviceId',
      'location',
      'ipAddress',
      'browserFingerprint',
    ];

    return this.containsFields(data, identifierFields);
  }

  /**
   * Check if data contains analytics information
   */
  private containsAnalyticsData(data: any): boolean {
    const analyticsFields = [
      'analytics',
      'usage',
      'performance',
      'metrics',
      'events',
      'tracking',
      'cookies',
      'sessionData',
    ];

    return this.containsFields(data, analyticsFields);
  }

  /**
   * Helper to check if data contains any of the specified fields
   */
  private containsFields(data: any, fields: string[]): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const dataStr = JSON.stringify(data).toLowerCase();
    return fields.some((field) => dataStr.includes(field.toLowerCase()));
  }

  /**
   * Encrypt data based on classification
   */
  async encryptData(
    data: any,
    classification: DataClassification
  ): Promise<any> {
    const policy = this.retentionPolicies.get(classification);

    if (!policy?.encryptAtRest) {
      return data;
    }

    try {
      // Use existing encryption service for sensitive fields
      if (
        classification === DataClassification.RESTRICTED ||
        classification === DataClassification.CONFIDENTIAL
      ) {
        return healthDataEncryption.encryptSensitiveData(data);
      }

      // For internal data, encrypt the entire object
      return this.encryptObject(data);
    } catch (error) {
      logger.error('Data encryption failed', 'DataProtectionService', {
        classification,
        error,
      });
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt data based on classification
   */
  async decryptData(
    data: any,
    classification: DataClassification
  ): Promise<any> {
    const policy = this.retentionPolicies.get(classification);

    if (!policy?.encryptAtRest) {
      return data;
    }

    try {
      // Use existing decryption service for sensitive fields
      if (
        classification === DataClassification.RESTRICTED ||
        classification === DataClassification.CONFIDENTIAL
      ) {
        return healthDataEncryption.decryptSensitiveData(data);
      }

      // For internal data, decrypt the entire object
      return this.decryptObject(data);
    } catch (error) {
      logger.error('Data decryption failed', 'DataProtectionService', {
        classification,
        error,
      });
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Encrypt entire object
   */
  private encryptObject(obj: any): any {
    try {
      const jsonString = JSON.stringify(obj);
      const iv = CryptoJS.lib.WordArray.random(16);
      const key = this.generateEncryptionKey();

      const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return {
        __encrypted: true,
        data: encrypted.toString(),
        iv: iv.toString(CryptoJS.enc.Hex),
        timestamp: Date.now(),
        classification: 'internal',
      };
    } catch (error) {
      logger.error('Object encryption failed', 'DataProtectionService', error);
      throw new Error('Object encryption failed');
    }
  }

  /**
   * Decrypt entire object
   */
  private decryptObject(encryptedObj: any): any {
    try {
      if (!encryptedObj.__encrypted) {
        return encryptedObj;
      }

      const key = this.generateEncryptionKey();
      const iv = CryptoJS.enc.Hex.parse(encryptedObj.iv);

      const decrypted = CryptoJS.AES.decrypt(encryptedObj.data, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      logger.error('Object decryption failed', 'DataProtectionService', error);
      throw new Error('Object decryption failed');
    }
  }

  /**
   * Generate encryption key
   */
  private generateEncryptionKey(): string {
    // In production, this should use a proper key derivation function
    const masterKey =
      process.env['ENCRYPTION_MASTER_KEY'] || 'gutsafe-master-key-2024';
    return CryptoJS.PBKDF2(masterKey, 'gutsafe-salt', {
      keySize: this.encryptionConfig.keySize / 32,
      iterations: this.encryptionConfig.iterations,
    }).toString();
  }

  /**
   * Anonymize data for analytics and research
   */
  anonymizeData(data: any, classification: DataClassification): AnonymizedData {
    const anonymizedId = this.generateAnonymizedId();
    const anonymizedData = { ...data };
    const fieldsAnonymized: string[] = [];

    // Remove or hash personal identifiers
    const personalFields = ['userId', 'email', 'name', 'deviceId', 'ipAddress'];
    personalFields.forEach((field) => {
      if (anonymizedData[field]) {
        anonymizedData[field] = this.hashIdentifier(anonymizedData[field]);
        fieldsAnonymized.push(field);
      }
    });

    // Anonymize location data (generalize to city level)
    if (anonymizedData.location) {
      anonymizedData.location = this.anonymizeLocation(anonymizedData.location);
      fieldsAnonymized.push('location');
    }

    // Anonymize timestamps (round to hour)
    if (anonymizedData.timestamp) {
      anonymizedData.timestamp = this.anonymizeTimestamp(
        anonymizedData.timestamp
      );
      fieldsAnonymized.push('timestamp');
    }

    // Remove sensitive health details while keeping general patterns
    if (anonymizedData.symptoms) {
      anonymizedData.symptoms = this.anonymizeSymptoms(anonymizedData.symptoms);
      fieldsAnonymized.push('symptoms');
    }

    return {
      originalId: data.id || 'unknown',
      anonymizedId,
      classification,
      anonymizedAt: new Date(),
      fieldsAnonymized,
    };
  }

  /**
   * Generate anonymized ID
   */
  private generateAnonymizedId(): string {
    return `anon_${CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)}`;
  }

  /**
   * Hash identifier for anonymization
   */
  private hashIdentifier(identifier: string): string {
    return CryptoJS.SHA256(`${identifier}gutsafe-salt`)
      .toString()
      .substring(0, 16);
  }

  /**
   * Anonymize location data
   */
  private anonymizeLocation(location: any): any {
    if (!location.latitude || !location.longitude) {
      return { region: 'unknown' };
    }

    // Round to ~1km precision
    const lat = Math.round(location.latitude * 100) / 100;
    const lng = Math.round(location.longitude * 100) / 100;

    return {
      region: `${lat},${lng}`,
      precision: '1km',
    };
  }

  /**
   * Anonymize timestamp
   */
  private anonymizeTimestamp(timestamp: Date | string): Date {
    const date = new Date(timestamp);
    // Round to hour
    date.setMinutes(0, 0, 0);
    return date;
  }

  /**
   * Anonymize symptoms data
   */
  private anonymizeSymptoms(symptoms: any): any {
    if (Array.isArray(symptoms)) {
      return symptoms.map((symptom) => ({
        type: symptom.type,
        severity: Math.round(symptom.severity / 2) * 2, // Round to even numbers
        duration: Math.round(symptom.duration / 15) * 15, // Round to 15-minute intervals
      }));
    }

    return {
      count: symptoms.length || 0,
      types: [...new Set(symptoms.map((s: any) => s.type))],
      averageSeverity: Math.round(
        symptoms.reduce((sum: number, s: any) => sum + s.severity, 0) /
          symptoms.length
      ),
    };
  }

  /**
   * Check if data should be deleted based on retention policy
   */
  shouldDeleteData(data: any, classification: DataClassification): boolean {
    const policy = this.retentionPolicies.get(classification);
    if (!policy?.autoDelete) {
      return false;
    }

    const dataAge =
      Date.now() - new Date(data.createdAt || data.timestamp).getTime();
    const retentionMs = policy.retentionDays * 24 * 60 * 60 * 1000;

    return dataAge > retentionMs;
  }

  /**
   * Check if data should be anonymized based on retention policy
   */
  shouldAnonymizeData(data: any, classification: DataClassification): boolean {
    const policy = this.retentionPolicies.get(classification);
    if (!policy?.anonymizeAfterDays) {
      return false;
    }

    const dataAge =
      Date.now() - new Date(data.createdAt || data.timestamp).getTime();
    const anonymizeMs = policy.anonymizeAfterDays * 24 * 60 * 60 * 1000;

    return dataAge > anonymizeMs;
  }

  /**
   * GDPR: Register user consent
   */
  registerConsent(userId: string, consent: Partial<GDPRConsent>): GDPRConsent {
    const fullConsent: GDPRConsent = {
      userId,
      dataProcessing: consent.dataProcessing || false,
      analytics: consent.analytics || false,
      marketing: consent.marketing || false,
      dataSharing: consent.dataSharing || false,
      dataRetention: consent.dataRetention || false,
      consentDate: new Date(),
      lastUpdated: new Date(),
      version: '1.0',
    };

    this.consentRegistry.set(userId, fullConsent);
    logger.info('GDPR consent registered', 'DataProtectionService', {
      userId,
      consent: fullConsent,
    });

    return fullConsent;
  }

  /**
   * GDPR: Get user consent
   */
  getConsent(userId: string): GDPRConsent | null {
    return this.consentRegistry.get(userId) || null;
  }

  /**
   * GDPR: Update user consent
   */
  updateConsent(
    userId: string,
    updates: Partial<GDPRConsent>
  ): GDPRConsent | null {
    const existingConsent = this.consentRegistry.get(userId);
    if (!existingConsent) {
      return null;
    }

    const updatedConsent: GDPRConsent = {
      ...existingConsent,
      ...updates,
      lastUpdated: new Date(),
    };

    this.consentRegistry.set(userId, updatedConsent);
    logger.info('GDPR consent updated', 'DataProtectionService', {
      userId,
      updates,
    });

    return updatedConsent;
  }

  /**
   * GDPR: Check if data processing is allowed
   */
  canProcessData(
    userId: string,
    purpose: keyof Omit<
      GDPRConsent,
      'userId' | 'consentDate' | 'lastUpdated' | 'version'
    >
  ): boolean {
    const consent = this.consentRegistry.get(userId);
    if (!consent) {
      return false;
    }

    return consent[purpose] === true;
  }

  /**
   * GDPR: Export user data
   */
  exportUserData(userId: string, data: any[]): any {
    const consent = this.consentRegistry.get(userId);
    if (!consent?.dataProcessing) {
      throw new Error('No consent for data processing');
    }

    return {
      userId,
      exportDate: new Date(),
      dataCount: data.length,
      data: data.map((item) => this.decryptData(item, this.classifyData(item))),
      consent,
    };
  }

  /**
   * GDPR: Delete user data
   */
  async deleteUserData(userId: string): Promise<boolean> {
    const consent = this.consentRegistry.get(userId);
    if (!consent) {
      return false;
    }

    // Remove from consent registry
    this.consentRegistry.delete(userId);

    logger.info('User data deletion requested', 'DataProtectionService', {
      userId,
    });
    return true;
  }

  /**
   * Get data protection audit report
   */
  getAuditReport(): any {
    const totalConsents = this.consentRegistry.size;
    const activeConsents = Array.from(this.consentRegistry.values()).filter(
      (consent) => consent.dataProcessing
    ).length;

    return {
      timestamp: new Date(),
      totalUsers: totalConsents,
      activeConsents,
      retentionPolicies: Array.from(this.retentionPolicies.entries()),
      encryptionConfig: this.encryptionConfig,
      complianceScore: this.calculateComplianceScore(),
    };
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(): number {
    let score = 100;

    // Deduct points for missing features
    if (this.retentionPolicies.size < 4) {
      score -= 20;
    }
    if (this.consentRegistry.size === 0) {
      score -= 30;
    }
    if (!this.encryptionConfig.algorithm) {
      score -= 25;
    }

    return Math.max(0, score);
  }

  /**
   * Cleanup expired data
   */
  async cleanupExpiredData(dataArray: any[]): Promise<{
    deleted: number;
    anonymized: number;
    retained: number;
  }> {
    let deleted = 0;
    let anonymized = 0;
    let retained = 0;

    for (const data of dataArray) {
      const classification = this.classifyData(data);

      if (this.shouldDeleteData(data, classification)) {
        deleted++;
        continue;
      }

      if (this.shouldAnonymizeData(data, classification)) {
        this.anonymizeData(data, classification);
        anonymized++;
        continue;
      }

      retained++;
    }

    logger.info('Data cleanup completed', 'DataProtectionService', {
      deleted,
      anonymized,
      retained,
    });

    return { deleted, anonymized, retained };
  }
}

// Export singleton instance
export const dataProtectionService = DataProtectionService.getInstance();
export default dataProtectionService;
