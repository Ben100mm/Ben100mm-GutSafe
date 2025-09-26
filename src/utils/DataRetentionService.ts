/**
 * @fileoverview DataRetentionService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';
import { dataProtectionService, DataClassification } from './DataProtectionService';

// Data retention policy types
export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataType: string;
  classification: DataClassification;
  retentionDays: number;
  anonymizeAfterDays?: number;
  autoDelete: boolean;
  legalBasis: string;
  createdAt: Date;
  updatedAt: Date;
}

// Data cleanup result
export interface CleanupResult {
  totalRecords: number;
  deletedRecords: number;
  anonymizedRecords: number;
  retainedRecords: number;
  errors: number;
  processingTime: number;
  details: {
    byClassification: Record<DataClassification, {
      processed: number;
      deleted: number;
      anonymized: number;
      retained: number;
    }>;
  };
}

// Data retention audit
export interface RetentionAudit {
  timestamp: Date;
  totalPolicies: number;
  activePolicies: number;
  totalRecords: number;
  recordsByClassification: Record<DataClassification, number>;
  nextCleanupScheduled: Date;
  complianceScore: number;
  violations: string[];
}

// Cleanup job status
export interface CleanupJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  result?: CleanupResult;
  error?: string;
}

/**
 * Data Retention Service
 * Manages data retention policies, automated cleanup, and compliance monitoring
 */
export class DataRetentionService {
  private static instance: DataRetentionService;
  private retentionPolicies: Map<string, RetentionPolicy>;
  private cleanupJobs: Map<string, CleanupJob>;
  private cleanupInterval: NodeJS.Timeout | null;
  private isRunning: boolean = false;

  private constructor() {
    this.retentionPolicies = new Map();
    this.cleanupJobs = new Map();
    this.initializeDefaultPolicies();
  }

  public static getInstance(): DataRetentionService {
    if (!DataRetentionService.instance) {
      DataRetentionService.instance = new DataRetentionService();
    }
    return DataRetentionService.instance;
  }

  /**
   * Initialize default retention policies
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: RetentionPolicy[] = [
      {
        id: 'user-profiles',
        name: 'User Profile Data',
        description: 'Retention policy for user profile information',
        dataType: 'user_profiles',
        classification: DataClassification.CONFIDENTIAL,
        retentionDays: 365,
        anonymizeAfterDays: 180,
        autoDelete: false,
        legalBasis: 'Legitimate interest for service provision',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'health-data',
        name: 'Health and Medical Data',
        description: 'Retention policy for sensitive health information',
        dataType: 'health_data',
        classification: DataClassification.RESTRICTED,
        retentionDays: 90,
        anonymizeAfterDays: 30,
        autoDelete: true,
        legalBasis: 'Explicit consent and medical necessity',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'scan-history',
        name: 'Food Scan History',
        description: 'Retention policy for food scanning history',
        dataType: 'scan_history',
        classification: DataClassification.INTERNAL,
        retentionDays: 180,
        anonymizeAfterDays: 90,
        autoDelete: true,
        legalBasis: 'Legitimate interest for service improvement',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'analytics-data',
        name: 'Analytics and Usage Data',
        description: 'Retention policy for analytics and usage tracking',
        dataType: 'analytics_data',
        classification: DataClassification.INTERNAL,
        retentionDays: 90,
        anonymizeAfterDays: 30,
        autoDelete: true,
        legalBasis: 'Legitimate interest for service optimization',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'symptom-tracking',
        name: 'Symptom Tracking Data',
        description: 'Retention policy for user symptom tracking',
        dataType: 'symptom_tracking',
        classification: DataClassification.RESTRICTED,
        retentionDays: 120,
        anonymizeAfterDays: 60,
        autoDelete: true,
        legalBasis: 'Explicit consent for health monitoring',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'medication-data',
        name: 'Medication and Supplement Data',
        description: 'Retention policy for medication tracking',
        dataType: 'medication_data',
        classification: DataClassification.RESTRICTED,
        retentionDays: 180,
        anonymizeAfterDays: 90,
        autoDelete: false,
        legalBasis: 'Explicit consent and medical necessity',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'public-food-data',
        name: 'Public Food Database',
        description: 'Retention policy for public food information',
        dataType: 'food_database',
        classification: DataClassification.PUBLIC,
        retentionDays: 3650, // 10 years
        autoDelete: false,
        legalBasis: 'Public domain and service provision',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultPolicies.forEach(policy => {
      this.retentionPolicies.set(policy.id, policy);
    });

    logger.info('Default retention policies initialized', 'DataRetentionService', {
      policyCount: defaultPolicies.length
    });
  }

  /**
   * Create or update retention policy
   */
  createOrUpdatePolicy(policy: Omit<RetentionPolicy, 'createdAt' | 'updatedAt'>): RetentionPolicy {
    const existingPolicy = this.retentionPolicies.get(policy.id);
    const now = new Date();

    const updatedPolicy: RetentionPolicy = {
      ...policy,
      createdAt: existingPolicy?.createdAt || now,
      updatedAt: now
    };

    this.retentionPolicies.set(policy.id, updatedPolicy);
    
    logger.info('Retention policy updated', 'DataRetentionService', {
      policyId: policy.id,
      dataType: policy.dataType,
      retentionDays: policy.retentionDays
    });

    return updatedPolicy;
  }

  /**
   * Get retention policy by ID
   */
  getPolicy(policyId: string): RetentionPolicy | null {
    return this.retentionPolicies.get(policyId) || null;
  }

  /**
   * Get all retention policies
   */
  getAllPolicies(): RetentionPolicy[] {
    return Array.from(this.retentionPolicies.values());
  }

  /**
   * Get policies by data type
   */
  getPoliciesByDataType(dataType: string): RetentionPolicy[] {
    return Array.from(this.retentionPolicies.values())
      .filter(policy => policy.dataType === dataType);
  }

  /**
   * Get policies by classification
   */
  getPoliciesByClassification(classification: DataClassification): RetentionPolicy[] {
    return Array.from(this.retentionPolicies.values())
      .filter(policy => policy.classification === classification);
  }

  /**
   * Delete retention policy
   */
  deletePolicy(policyId: string): boolean {
    const deleted = this.retentionPolicies.delete(policyId);
    if (deleted) {
      logger.info('Retention policy deleted', 'DataRetentionService', { policyId });
    }
    return deleted;
  }

  /**
   * Start automated cleanup process
   */
  startAutomatedCleanup(intervalHours: number = 24): void {
    if (this.isRunning) {
      logger.warn('Automated cleanup already running', 'DataRetentionService');
      return;
    }

    this.isRunning = true;
    this.cleanupInterval = setInterval(() => {
      this.runCleanupJob();
    }, intervalHours * 60 * 60 * 1000);

    logger.info('Automated cleanup started', 'DataRetentionService', {
      intervalHours
    });
  }

  /**
   * Stop automated cleanup process
   */
  stopAutomatedCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    
    logger.info('Automated cleanup stopped', 'DataRetentionService');
  }

  /**
   * Run cleanup job for all data
   */
  async runCleanupJob(data?: any[]): Promise<CleanupJob> {
    const jobId = this.generateJobId();
    const job: CleanupJob = {
      id: jobId,
      status: 'running',
      startedAt: new Date()
    };

    this.cleanupJobs.set(jobId, job);

    try {
      logger.info('Cleanup job started', 'DataRetentionService', { jobId });

      // If no data provided, this would typically fetch from database
      const dataToProcess = data || [];
      
      const result = await this.processDataCleanup(dataToProcess);
      
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;

      logger.info('Cleanup job completed', 'DataRetentionService', {
        jobId,
        result: {
          totalRecords: result.totalRecords,
          deletedRecords: result.deletedRecords,
          anonymizedRecords: result.anonymizedRecords,
          retainedRecords: result.retainedRecords
        }
      });

    } catch (error) {
      job.status = 'failed';
      job.completedAt = new Date();
      job.error = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Cleanup job failed', 'DataRetentionService', {
        jobId,
        error: job.error
      });
    }

    this.cleanupJobs.set(jobId, job);
    return job;
  }

  /**
   * Process data cleanup based on retention policies
   */
  private async processDataCleanup(data: any[]): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      totalRecords: data.length,
      deletedRecords: 0,
      anonymizedRecords: 0,
      retainedRecords: 0,
      errors: 0,
      processingTime: 0,
      details: {
        byClassification: {} as Record<DataClassification, any>
      }
    };

    // Initialize classification counters
    Object.values(DataClassification).forEach(classification => {
      result.details.byClassification[classification] = {
        processed: 0,
        deleted: 0,
        anonymized: 0,
        retained: 0
      };
    });

    for (const record of data) {
      try {
        const classification = dataProtectionService.classifyData(record);
        const policy = this.getPolicyForData(record, classification);
        
        if (!policy) {
          result.retainedRecords++;
          result.details.byClassification[classification].retained++;
          continue;
        }

        result.details.byClassification[classification].processed++;

        const recordAge = this.calculateRecordAge(record);
        const ageInDays = recordAge / (1000 * 60 * 60 * 24);

        if (ageInDays > policy.retentionDays && policy.autoDelete) {
          // Delete record
          result.deletedRecords++;
          result.details.byClassification[classification].deleted++;
          await this.deleteRecord(record);
        } else if (policy.anonymizeAfterDays && ageInDays > policy.anonymizeAfterDays) {
          // Anonymize record
          result.anonymizedRecords++;
          result.details.byClassification[classification].anonymized++;
          await this.anonymizeRecord(record, classification);
        } else {
          // Retain record
          result.retainedRecords++;
          result.details.byClassification[classification].retained++;
        }
      } catch (error) {
        result.errors++;
        logger.error('Error processing record in cleanup', 'DataRetentionService', {
          recordId: record.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    result.processingTime = Date.now() - startTime;
    return result;
  }

  /**
   * Get retention policy for specific data
   */
  private getPolicyForData(record: any, classification: DataClassification): RetentionPolicy | null {
    // Try to find policy by data type first
    if (record.dataType) {
      const policy = this.getPoliciesByDataType(record.dataType)[0];
      if (policy) return policy;
    }

    // Fall back to classification-based policy
    const policies = this.getPoliciesByClassification(classification);
    return policies[0] || null;
  }

  /**
   * Calculate record age in milliseconds
   */
  private calculateRecordAge(record: any): number {
    const recordDate = new Date(record.createdAt || record.timestamp || record.date);
    return Date.now() - recordDate.getTime();
  }

  /**
   * Delete record (placeholder - would integrate with database)
   */
  private async deleteRecord(record: any): Promise<void> {
    // In a real implementation, this would delete from the database
    logger.info('Record deleted', 'DataRetentionService', {
      recordId: record.id,
      recordType: record.dataType || 'unknown'
    });
  }

  /**
   * Anonymize record (placeholder - would integrate with database)
   */
  private async anonymizeRecord(record: any, classification: DataClassification): Promise<void> {
    // Use data protection service to anonymize
    const anonymized = dataProtectionService.anonymizeData(record, classification);
    
    // In a real implementation, this would update the database
    logger.info('Record anonymized', 'DataRetentionService', {
      recordId: record.id,
      originalId: anonymized.originalId,
      anonymizedId: anonymized.anonymizedId,
      fieldsAnonymized: anonymized.fieldsAnonymized
    });
  }

  /**
   * Generate cleanup job ID
   */
  private generateJobId(): string {
    return `cleanup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get cleanup job status
   */
  getCleanupJob(jobId: string): CleanupJob | null {
    return this.cleanupJobs.get(jobId) || null;
  }

  /**
   * Get all cleanup jobs
   */
  getAllCleanupJobs(): CleanupJob[] {
    return Array.from(this.cleanupJobs.values());
  }

  /**
   * Get recent cleanup jobs
   */
  getRecentCleanupJobs(limit: number = 10): CleanupJob[] {
    return Array.from(this.cleanupJobs.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Generate retention audit report
   */
  generateAuditReport(): RetentionAudit {
    const now = new Date();
    const policies = Array.from(this.retentionPolicies.values());
    const activePolicies = policies.filter(policy => 
      policy.retentionDays > 0 || policy.autoDelete
    );

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore();
    
    // Check for violations
    const violations = this.checkComplianceViolations();

    // Calculate next cleanup time
    const nextCleanup = this.isRunning && this.cleanupInterval 
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next day
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week

    return {
      timestamp: now,
      totalPolicies: policies.length,
      activePolicies: activePolicies.length,
      totalRecords: 0, // Would be calculated from actual data
      recordsByClassification: this.getRecordsByClassification(),
      nextCleanupScheduled: nextCleanup,
      complianceScore,
      violations
    };
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(): number {
    let score = 100;
    const policies = Array.from(this.retentionPolicies.values());

    // Check for missing policies
    const requiredDataTypes = ['user_profiles', 'health_data', 'scan_history', 'analytics_data'];
    const coveredTypes = new Set(policies.map(p => p.dataType));
    const missingTypes = requiredDataTypes.filter(type => !coveredTypes.has(type));
    
    score -= missingTypes.length * 15;

    // Check for overly long retention periods
    const longRetentionPolicies = policies.filter(p => p.retentionDays > 365);
    score -= longRetentionPolicies.length * 5;

    // Check for missing anonymization
    const policiesWithoutAnonymization = policies.filter(p => 
      p.classification === DataClassification.INTERNAL && !p.anonymizeAfterDays
    );
    score -= policiesWithoutAnonymization.length * 10;

    return Math.max(0, score);
  }

  /**
   * Check for compliance violations
   */
  private checkComplianceViolations(): string[] {
    const violations: string[] = [];
    const policies = Array.from(this.retentionPolicies.values());

    // Check for missing critical policies
    const criticalDataTypes = ['health_data', 'user_profiles'];
    criticalDataTypes.forEach(dataType => {
      if (!policies.some(p => p.dataType === dataType)) {
        violations.push(`Missing retention policy for critical data type: ${dataType}`);
      }
    });

    // Check for excessive retention periods
    policies.forEach(policy => {
      if (policy.retentionDays > 365 && policy.classification === DataClassification.RESTRICTED) {
        violations.push(`Excessive retention period for restricted data: ${policy.name} (${policy.retentionDays} days)`);
      }
    });

    // Check for missing anonymization for internal data
    policies.forEach(policy => {
      if (policy.classification === DataClassification.INTERNAL && 
          policy.retentionDays > 90 && 
          !policy.anonymizeAfterDays) {
        violations.push(`Missing anonymization for internal data: ${policy.name}`);
      }
    });

    return violations;
  }

  /**
   * Get records count by classification (placeholder)
   */
  private getRecordsByClassification(): Record<DataClassification, number> {
    // In a real implementation, this would query the database
    return {
      [DataClassification.PUBLIC]: 0,
      [DataClassification.INTERNAL]: 0,
      [DataClassification.CONFIDENTIAL]: 0,
      [DataClassification.RESTRICTED]: 0
    };
  }

  /**
   * Export retention policies for compliance reporting
   */
  exportPoliciesForCompliance(): any {
    const policies = Array.from(this.retentionPolicies.values());
    
    return {
      exportDate: new Date(),
      totalPolicies: policies.length,
      policies: policies.map(policy => ({
        id: policy.id,
        name: policy.name,
        dataType: policy.dataType,
        classification: policy.classification,
        retentionDays: policy.retentionDays,
        anonymizeAfterDays: policy.anonymizeAfterDays,
        autoDelete: policy.autoDelete,
        legalBasis: policy.legalBasis,
        lastUpdated: policy.updatedAt
      }))
    };
  }

  /**
   * Cleanup old cleanup jobs
   */
  cleanupOldJobs(retentionDays: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const jobsToDelete: string[] = [];
    
    this.cleanupJobs.forEach((job, jobId) => {
      if (job.completedAt && job.completedAt < cutoffDate) {
        jobsToDelete.push(jobId);
      }
    });

    jobsToDelete.forEach(jobId => {
      this.cleanupJobs.delete(jobId);
    });

    if (jobsToDelete.length > 0) {
      logger.info('Old cleanup jobs removed', 'DataRetentionService', {
        deletedCount: jobsToDelete.length
      });
    }
  }
}

// Export singleton instance
export const dataRetentionService = DataRetentionService.getInstance();
export default dataRetentionService;
