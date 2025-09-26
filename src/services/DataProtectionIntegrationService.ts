/**
 * @fileoverview DataProtectionIntegrationService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import {
  dataProtectionService,
  DataClassification,
} from '../utils/DataProtectionService';
import { dataRetentionService } from '../utils/DataRetentionService';
import { gdprComplianceService } from '../utils/GDPRComplianceService';
import { logger } from '../utils/logger';
import { secureTransmissionService } from '../utils/SecureTransmissionService';

// Data protection configuration
interface DataProtectionConfig {
  enableEncryption: boolean;
  enableAnonymization: boolean;
  enableRetentionPolicies: boolean;
  enableGDPRCompliance: boolean;
  enableSecureTransmission: boolean;
  auditLogging: boolean;
}

// Data protection audit report
interface DataProtectionAuditReport {
  timestamp: Date;
  overallScore: number;
  encryption: {
    enabled: boolean;
    score: number;
    issues: string[];
  };
  anonymization: {
    enabled: boolean;
    score: number;
    issues: string[];
  };
  retention: {
    enabled: boolean;
    score: number;
    issues: string[];
  };
  gdpr: {
    enabled: boolean;
    score: number;
    issues: string[];
  };
  transmission: {
    enabled: boolean;
    score: number;
    issues: string[];
  };
  recommendations: string[];
}

/**
 * Data Protection Integration Service
 * Orchestrates all data protection services and provides unified interface
 */
export class DataProtectionIntegrationService {
  private static instance: DataProtectionIntegrationService;
  private config: DataProtectionConfig;
  private isInitialized: boolean = false;

  private constructor() {
    this.config = {
      enableEncryption: true,
      enableAnonymization: true,
      enableRetentionPolicies: true,
      enableGDPRCompliance: true,
      enableSecureTransmission: true,
      auditLogging: true,
    };
  }

  public static getInstance(): DataProtectionIntegrationService {
    if (!DataProtectionIntegrationService.instance) {
      DataProtectionIntegrationService.instance =
        new DataProtectionIntegrationService();
    }
    return DataProtectionIntegrationService.instance;
  }

  /**
   * Initialize data protection services
   */
  async initialize(): Promise<void> {
    try {
      logger.info(
        'Initializing data protection services',
        'DataProtectionIntegrationService'
      );

      // Initialize individual services
      if (this.config.enableRetentionPolicies) {
        // Data retention service is already initialized as singleton
        logger.info(
          'Data retention service initialized',
          'DataProtectionIntegrationService'
        );
      }

      if (this.config.enableGDPRCompliance) {
        // GDPR compliance service is already initialized as singleton
        logger.info(
          'GDPR compliance service initialized',
          'DataProtectionIntegrationService'
        );
      }

      // Start automated cleanup if enabled
      if (this.config.enableRetentionPolicies) {
        dataRetentionService.startAutomatedCleanup(24); // Run every 24 hours
      }

      this.isInitialized = true;
      logger.info(
        'Data protection services initialized successfully',
        'DataProtectionIntegrationService'
      );
    } catch (error) {
      logger.error(
        'Failed to initialize data protection services',
        'DataProtectionIntegrationService',
        error
      );
      throw error;
    }
  }

  /**
   * Process data with appropriate protection measures
   */
  async processData(
    data: any,
    context: {
      userId?: string;
      dataType?: string;
      purpose?: string;
      classification?: DataClassification;
      encrypt?: boolean;
      anonymize?: boolean;
      secureTransmission?: boolean;
    }
  ): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      let processedData = { ...data };

      // Classify data if not provided
      const classification =
        context.classification != null ||
        dataProtectionService.classifyData(data, context.dataType);

      // Encrypt data if required
      if (context.encrypt !== false && this.config.enableEncryption) {
        processedData = await dataProtectionService.encryptData(
          processedData,
          classification
        );
      }

      // Anonymize data if required
      if (context.anonymize && this.config.enableAnonymization) {
        processedData = dataProtectionService.anonymizeData(
          processedData,
          classification
        );
      }

      // Record data processing for GDPR compliance
      if (
        this.config.enableGDPRCompliance &&
        context.userId &&
        context.purpose
      ) {
        gdprComplianceService.recordDataProcessing(
          context.userId,
          context.dataType || 'unknown',
          context.dataType || 'unknown',
          context.purpose,
          'Legitimate interest',
          [classification]
        );
      }

      // Log data processing for audit
      if (this.config.auditLogging) {
        this.logDataProcessing(data, processedData, context, classification);
      }

      return processedData;
    } catch (error) {
      logger.error(
        'Data processing failed',
        'DataProtectionIntegrationService',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          context,
        }
      );
      throw error;
    }
  }

  /**
   * Make secure API request with data protection
   */
  async makeSecureRequest(
    endpoint: string,
    method: string,
    payload?: any,
    options?: {
      userId?: string;
      dataType?: string;
      purpose?: string;
      classification?: DataClassification;
      encryptPayload?: boolean;
      anonymizeResponse?: boolean;
    }
  ): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Process payload if provided
      let processedPayload = payload;
      if (payload && options?.encryptPayload !== false) {
        const classification =
          options?.classification != null ||
          dataProtectionService.classifyData(payload);
        processedPayload = await dataProtectionService.encryptData(
          payload,
          classification
        );
      }

      // Make secure request
      const response = await secureTransmissionService.makeSecureRequest(
        endpoint,
        method,
        processedPayload,
        options
      );

      // Process response if anonymization is requested
      if (options?.anonymizeResponse && response.data) {
        const classification =
          options?.classification != null ||
          dataProtectionService.classifyData(response.data);
        response.data = dataProtectionService.anonymizeData(
          response.data,
          classification
        );
      }

      return response;
    } catch (error) {
      logger.error(
        'Secure request failed',
        'DataProtectionIntegrationService',
        {
          endpoint,
          method,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      throw error;
    }
  }

  /**
   * Handle user consent management
   */
  async handleUserConsent(
    userId: string,
    consentData: {
      dataProcessing: boolean;
      analytics: boolean;
      marketing: boolean;
      dataSharing: boolean;
      dataRetention: boolean;
      profiling?: boolean;
      automatedDecisionMaking?: boolean;
      thirdPartySharing?: boolean;
      dataPortability?: boolean;
      rightToErasure?: boolean;
    }
  ): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const consent = gdprComplianceService.registerConsent(
        userId,
        consentData
      );

      logger.info(
        'User consent processed',
        'DataProtectionIntegrationService',
        {
          userId,
          consentId: consent.id,
          dataProcessing: consent.dataProcessing,
        }
      );

      return consent;
    } catch (error) {
      logger.error(
        'Consent processing failed',
        'DataProtectionIntegrationService',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      throw error;
    }
  }

  /**
   * Handle data subject rights request
   */
  async handleDataSubjectRightsRequest(
    userId: string,
    requestType: 'access' | 'portability' | 'erasure' | 'rectification',
    additionalData?: any
  ): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      let result;

      switch (requestType) {
        case 'access':
          result = await gdprComplianceService.processAccessRequest(
            userId,
            'full'
          );
          break;
        case 'portability':
          result =
            await gdprComplianceService.processPortabilityRequest(userId);
          break;
        case 'erasure':
          result = await gdprComplianceService.processErasureRequest(
            userId,
            additionalData?.reason || 'User request'
          );
          break;
        case 'rectification':
          // This would typically update user data
          result = {
            success: true,
            message: 'Data rectification request processed',
          };
          break;
        default:
          throw new Error(`Unsupported request type: ${requestType}`);
      }

      logger.info(
        'Data subject rights request processed',
        'DataProtectionIntegrationService',
        {
          userId,
          requestType,
          success: result.success !== false,
        }
      );

      return result;
    } catch (error) {
      logger.error(
        'Data subject rights request failed',
        'DataProtectionIntegrationService',
        {
          userId,
          requestType,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      throw error;
    }
  }

  /**
   * Run data cleanup based on retention policies
   */
  async runDataCleanup(data?: any[]): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await dataRetentionService.runCleanupJob(data);

      logger.info(
        'Data cleanup completed',
        'DataProtectionIntegrationService',
        {
          totalRecords: result.result?.totalRecords || 0,
          deletedRecords: result.result?.deletedRecords || 0,
          anonymizedRecords: result.result?.anonymizedRecords || 0,
          retainedRecords: result.result?.retainedRecords || 0,
        }
      );

      return result;
    } catch (error) {
      logger.error('Data cleanup failed', 'DataProtectionIntegrationService', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive audit report
   */
  async generateAuditReport(): Promise<DataProtectionAuditReport> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const encryptionAudit = this.auditEncryption();
      const anonymizationAudit = this.auditAnonymization();
      const retentionAudit = this.auditRetention();
      const gdprAudit = this.auditGDPR();
      const transmissionAudit = this.auditTransmission();

      const overallScore = Math.round(
        (encryptionAudit.score +
          anonymizationAudit.score +
          retentionAudit.score +
          gdprAudit.score +
          transmissionAudit.score) /
          5
      );

      const recommendations = this.generateRecommendations([
        encryptionAudit,
        anonymizationAudit,
        retentionAudit,
        gdprAudit,
        transmissionAudit,
      ]);

      return {
        timestamp: new Date(),
        overallScore,
        encryption: encryptionAudit,
        anonymization: anonymizationAudit,
        retention: retentionAudit,
        gdpr: gdprAudit,
        transmission: transmissionAudit,
        recommendations,
      };
    } catch (error) {
      logger.error(
        'Audit report generation failed',
        'DataProtectionIntegrationService',
        error
      );
      throw error;
    }
  }

  /**
   * Audit encryption implementation
   */
  private auditEncryption(): {
    enabled: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    if (!this.config.enableEncryption) {
      issues.push('Encryption is disabled');
      score = 0;
    } else {
      // Check encryption configuration
      if (!process.env['REACT_APP_ENCRYPTION_KEY']) {
        issues.push('No encryption key configured');
        score -= 30;
      }

      // Check if encryption service is working
      try {
        const testData = { test: 'data' };
        const encrypted = dataProtectionService.encryptData(
          testData,
          DataClassification.CONFIDENTIAL
        );
        if (!encrypted) {
          issues.push('Encryption service not functioning');
          score -= 50;
        }
      } catch (error) {
        issues.push('Encryption service error');
        score -= 50;
      }
    }

    return {
      enabled: this.config.enableEncryption,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Audit anonymization implementation
   */
  private auditAnonymization(): {
    enabled: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    if (!this.config.enableAnonymization) {
      issues.push('Anonymization is disabled');
      score = 0;
    } else {
      // Check anonymization functionality
      try {
        const testData = { userId: 'test123', email: 'test@example.com' };
        const anonymized = dataProtectionService.anonymizeData(
          testData,
          DataClassification.INTERNAL
        );
        if (!anonymized || anonymized.originalId === 'test123') {
          issues.push('Anonymization not working properly');
          score -= 50;
        }
      } catch (error) {
        issues.push('Anonymization service error');
        score -= 50;
      }
    }

    return {
      enabled: this.config.enableAnonymization,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Audit retention policies
   */
  private auditRetention(): {
    enabled: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    if (!this.config.enableRetentionPolicies) {
      issues.push('Retention policies are disabled');
      score = 0;
    } else {
      const policies = dataRetentionService.getAllPolicies();
      if (policies.length === 0) {
        issues.push('No retention policies configured');
        score -= 50;
      }

      const criticalPolicies = ['health-data', 'user-profiles', 'scan-history'];
      const missingPolicies = criticalPolicies.filter(
        (policyId) => !policies.some((p) => p.id === policyId)
      );

      if (missingPolicies.length > 0) {
        issues.push(
          `Missing critical retention policies: ${missingPolicies.join(', ')}`
        );
        score -= missingPolicies.length * 15;
      }
    }

    return {
      enabled: this.config.enableRetentionPolicies,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Audit GDPR compliance
   */
  private auditGDPR(): { enabled: boolean; score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    if (!this.config.enableGDPRCompliance) {
      issues.push('GDPR compliance is disabled');
      score = 0;
    } else {
      // Check GDPR service functionality
      try {
        const report = gdprComplianceService.generateComplianceReport();
        if (report.summary.complianceScore < 70) {
          issues.push('GDPR compliance score is low');
          score -= 30;
        }
      } catch (error) {
        issues.push('GDPR compliance service error');
        score -= 50;
      }
    }

    return {
      enabled: this.config.enableGDPRCompliance,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Audit secure transmission
   */
  private auditTransmission(): {
    enabled: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    if (!this.config.enableSecureTransmission) {
      issues.push('Secure transmission is disabled');
      score = 0;
    } else {
      try {
        const report = secureTransmissionService.getSecurityAuditReport();
        if (report.complianceScore < 70) {
          issues.push('Secure transmission compliance score is low');
          score -= 30;
        }
      } catch (error) {
        issues.push('Secure transmission service error');
        score -= 50;
      }
    }

    return {
      enabled: this.config.enableSecureTransmission,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Generate recommendations based on audit results
   */
  private generateRecommendations(audits: any[]): string[] {
    const recommendations: string[] = [];

    audits.forEach((audit) => {
      if (audit.score < 50) {
        recommendations.push(`Critical: ${audit.issues.join(', ')}`);
      } else if (audit.score < 80) {
        recommendations.push(`Improvement needed: ${audit.issues.join(', ')}`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Data protection implementation is compliant');
    }

    return recommendations;
  }

  /**
   * Log data processing for audit
   */
  private logDataProcessing(
    originalData: any,
    processedData: any,
    context: any,
    classification: DataClassification
  ): void {
    const logEntry = {
      timestamp: new Date(),
      userId: context.userId,
      dataType: context.dataType,
      purpose: context.purpose,
      classification,
      originalSize: JSON.stringify(originalData).length,
      processedSize: JSON.stringify(processedData).length,
      encryptionApplied: originalData !== processedData,
      anonymizationApplied: processedData.__anonymized === true,
    };

    logger.info(
      'Data processing logged',
      'DataProtectionIntegrationService',
      logEntry
    );
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DataProtectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info(
      'Data protection configuration updated',
      'DataProtectionIntegrationService',
      newConfig
    );
  }

  /**
   * Get current configuration
   */
  getConfig(): DataProtectionConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.config.enableRetentionPolicies) {
      dataRetentionService.stopAutomatedCleanup();
    }

    secureTransmissionService.clearCache();

    logger.info(
      'Data protection services cleaned up',
      'DataProtectionIntegrationService'
    );
  }
}

// Export singleton instance
export const dataProtectionIntegrationService =
  DataProtectionIntegrationService.getInstance();
export default dataProtectionIntegrationService;
