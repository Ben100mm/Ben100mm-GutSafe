/**
 * @fileoverview GDPRComplianceService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from './logger';

// GDPR consent types
export interface GDPRConsent {
  id: string;
  userId: string;
  version: string;
  consentDate: Date;
  lastUpdated: Date;
  dataProcessing: boolean;
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
  dataRetention: boolean;
  profiling: boolean;
  automatedDecisionMaking: boolean;
  thirdPartySharing: boolean;
  dataPortability: boolean;
  rightToErasure: boolean;
  legalBasis: string;
  purpose: string[];
  retentionPeriod: number;
  withdrawalMethod: string;
  contactInfo: {
    email: string;
    phone?: string;
  };
}

// Data subject rights
export interface DataSubjectRights {
  rightToAccess: boolean;
  rightToRectification: boolean;
  rightToErasure: boolean;
  rightToRestrictProcessing: boolean;
  rightToDataPortability: boolean;
  rightToObject: boolean;
  rightToWithdrawConsent: boolean;
  rightToLodgeComplaint: boolean;
}

// Data processing activity
export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  transfers: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Privacy impact assessment
export interface PrivacyImpactAssessment {
  id: string;
  activityId: string;
  assessmentDate: Date;
  riskLevel: 'low' | 'medium' | 'high';
  dataSubjects: number;
  dataCategories: string[];
  processingPurposes: string[];
  risks: string[];
  mitigationMeasures: string[];
  residualRisks: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}

// Data breach record
export interface DataBreachRecord {
  id: string;
  breachDate: Date;
  discoveryDate: Date;
  notificationDate?: Date;
  affectedSubjects: number;
  dataCategories: string[];
  breachType: 'confidentiality' | 'integrity' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cause: string;
  measures: string[];
  status: 'investigating' | 'contained' | 'resolved' | 'reported';
  regulatoryNotification: boolean;
  subjectNotification: boolean;
  reportedTo?: string;
  reportedAt?: Date;
}

// Data processing record
export interface DataProcessingRecord {
  id: string;
  userId: string;
  activityId: string;
  dataType: string;
  purpose: string;
  legalBasis: string;
  processedAt: Date;
  dataCategories: string[];
  retentionPeriod: number;
  consentId?: string;
  automatedDecision?: boolean;
  profiling?: boolean;
}

/**
 * GDPR Compliance Service
 * Manages consent, data subject rights, privacy impact assessments, and compliance monitoring
 */
export class GDPRComplianceService {
  private static instance: GDPRComplianceService;
  private readonly consents: Map<string, GDPRConsent>;
  private readonly processingActivities: Map<string, DataProcessingActivity>;
  private readonly privacyAssessments: Map<string, PrivacyImpactAssessment>;
  private readonly dataBreaches: Map<string, DataBreachRecord>;
  private readonly processingRecords: Map<string, DataProcessingRecord>;
  private readonly dataSubjectRights: Map<string, DataSubjectRights>;

  private constructor() {
    this.consents = new Map();
    this.processingActivities = new Map();
    this.privacyAssessments = new Map();
    this.dataBreaches = new Map();
    this.processingRecords = new Map();
    this.dataSubjectRights = new Map();

    this.initializeDefaultActivities();
  }

  public static getInstance(): GDPRComplianceService {
    if (!GDPRComplianceService.instance) {
      GDPRComplianceService.instance = new GDPRComplianceService();
    }
    return GDPRComplianceService.instance;
  }

  /**
   * Initialize default data processing activities
   */
  private initializeDefaultActivities(): void {
    const defaultActivities: DataProcessingActivity[] = [
      {
        id: 'user-registration',
        name: 'User Registration and Authentication',
        purpose: 'User account creation and authentication',
        legalBasis: 'Consent and contract performance',
        dataCategories: [
          'personal_data',
          'contact_information',
          'authentication_data',
        ],
        dataSubjects: ['users'],
        recipients: ['internal_systems'],
        transfers: ['eu_only'],
        retentionPeriod: 365,
        securityMeasures: ['encryption', 'access_controls', 'audit_logging'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'health-data-processing',
        name: 'Health Data Processing',
        purpose: 'Gut health monitoring and recommendations',
        legalBasis: 'Explicit consent',
        dataCategories: ['health_data', 'symptom_data', 'medication_data'],
        dataSubjects: ['users'],
        recipients: ['internal_systems', 'healthcare_providers'],
        transfers: ['eu_only'],
        retentionPeriod: 90,
        securityMeasures: ['encryption', 'pseudonymization', 'access_controls'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'analytics-processing',
        name: 'Analytics and Usage Data',
        purpose: 'Service improvement and analytics',
        legalBasis: 'Legitimate interest',
        dataCategories: ['usage_data', 'analytics_data', 'performance_data'],
        dataSubjects: ['users'],
        recipients: ['internal_systems', 'analytics_providers'],
        transfers: ['eu_only'],
        retentionPeriod: 90,
        securityMeasures: ['anonymization', 'pseudonymization'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultActivities.forEach((activity) => {
      this.processingActivities.set(activity.id, activity);
    });

    logger.info(
      'Default processing activities initialized',
      'GDPRComplianceService',
      {
        activityCount: defaultActivities.length,
      }
    );
  }

  /**
   * Register or update user consent
   */
  registerConsent(
    userId: string,
    consentData: Partial<GDPRConsent>
  ): GDPRConsent {
    const existingConsent = this.consents.get(userId);
    const now = new Date();

    const consent: GDPRConsent = {
      id: existingConsent?.id || this.generateConsentId(),
      userId,
      version: '1.0',
      consentDate: existingConsent?.consentDate || now,
      lastUpdated: now,
      dataProcessing: consentData.dataProcessing || false,
      analytics: consentData.analytics || false,
      marketing: consentData.marketing || false,
      dataSharing: consentData.dataSharing || false,
      dataRetention: consentData.dataRetention || false,
      profiling: consentData.profiling || false,
      automatedDecisionMaking: consentData.automatedDecisionMaking || false,
      thirdPartySharing: consentData.thirdPartySharing || false,
      dataPortability: consentData.dataPortability || false,
      rightToErasure: consentData.rightToErasure || false,
      legalBasis: consentData.legalBasis || 'Consent',
      purpose: consentData.purpose || ['service_provision'],
      retentionPeriod: consentData.retentionPeriod || 365,
      withdrawalMethod: consentData.withdrawalMethod || 'email',
      contactInfo: consentData.contactInfo || {
        email: 'privacy@gutsafe.app',
      },
    };

    this.consents.set(userId, consent);

    // Initialize data subject rights
    this.initializeDataSubjectRights(userId);

    logger.info('GDPR consent registered/updated', 'GDPRComplianceService', {
      userId,
      consentId: consent.id,
      version: consent.version,
    });

    return consent;
  }

  /**
   * Initialize data subject rights for user
   */
  private initializeDataSubjectRights(userId: string): void {
    const rights: DataSubjectRights = {
      rightToAccess: true,
      rightToRectification: true,
      rightToErasure: true,
      rightToRestrictProcessing: true,
      rightToDataPortability: true,
      rightToObject: true,
      rightToWithdrawConsent: true,
      rightToLodgeComplaint: true,
    };

    this.dataSubjectRights.set(userId, rights);
  }

  /**
   * Get user consent
   */
  getConsent(userId: string): GDPRConsent | null {
    return this.consents.get(userId) || null;
  }

  /**
   * Check if user has given specific consent
   */
  hasConsent(
    userId: string,
    consentType: keyof Omit<
      GDPRConsent,
      | 'id'
      | 'userId'
      | 'version'
      | 'consentDate'
      | 'lastUpdated'
      | 'legalBasis'
      | 'purpose'
      | 'retentionPeriod'
      | 'withdrawalMethod'
      | 'contactInfo'
    >
  ): boolean {
    const consent = this.consents.get(userId);
    return consent ? consent[consentType] : false;
  }

  /**
   * Withdraw user consent
   */
  withdrawConsent(userId: string, consentTypes: string[]): GDPRConsent | null {
    const consent = this.consents.get(userId);
    if (!consent) {
      return null;
    }

    const updatedConsent = { ...consent };
    consentTypes.forEach((type) => {
      if (type in updatedConsent) {
        (updatedConsent as any)[type] = false;
      }
    });
    updatedConsent.lastUpdated = new Date();

    this.consents.set(userId, updatedConsent);

    logger.info('Consent withdrawn', 'GDPRComplianceService', {
      userId,
      withdrawnTypes: consentTypes,
    });

    return updatedConsent;
  }

  /**
   * Process data subject access request
   */
  async processAccessRequest(
    userId: string,
    requestType: 'full' | 'specific' = 'full'
  ): Promise<any> {
    const consent = this.consents.get(userId);
    if (!consent) {
      throw new Error('No consent found for user');
    }

    if (!consent.dataProcessing) {
      throw new Error('User has not consented to data processing');
    }

    // In a real implementation, this would gather data from all systems
    const userData = await this.gatherUserData(userId, requestType);

    const accessResponse = {
      requestId: this.generateRequestId(),
      userId,
      requestDate: new Date(),
      dataProvided: userData,
      consent,
      rights: this.dataSubjectRights.get(userId),
      contactInfo: consent.contactInfo,
    };

    logger.info('Data access request processed', 'GDPRComplianceService', {
      userId,
      requestId: accessResponse.requestId,
      dataTypes: Object.keys(userData),
    });

    return accessResponse;
  }

  /**
   * Process data portability request
   */
  async processPortabilityRequest(userId: string): Promise<any> {
    const consent = this.consents.get(userId);
    if (!consent?.dataPortability) {
      throw new Error('User has not consented to data portability');
    }

    const userData = await this.gatherUserData(userId, 'full');

    // Format data for portability (machine-readable format)
    const portableData = {
      format: 'JSON',
      version: '1.0',
      exportDate: new Date(),
      userId,
      data: userData,
      schema: this.getDataSchema(),
    };

    logger.info('Data portability request processed', 'GDPRComplianceService', {
      userId,
      dataSize: JSON.stringify(portableData).length,
    });

    return portableData;
  }

  /**
   * Process right to erasure request
   */
  async processErasureRequest(
    userId: string,
    reason: string
  ): Promise<boolean> {
    const consent = this.consents.get(userId);
    if (!consent?.rightToErasure) {
      throw new Error('User has not consented to right to erasure');
    }

    try {
      // Delete user data from all systems
      await this.deleteUserData(userId);

      // Remove consent record
      this.consents.delete(userId);
      this.dataSubjectRights.delete(userId);

      logger.info('Data erasure request processed', 'GDPRComplianceService', {
        userId,
        reason,
      });

      return true;
    } catch (error) {
      logger.error('Data erasure failed', 'GDPRComplianceService', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Record data processing activity
   */
  recordDataProcessing(
    userId: string,
    activityId: string,
    dataType: string,
    purpose: string,
    legalBasis: string,
    dataCategories: string[]
  ): DataProcessingRecord {
    const processingRecord: DataProcessingRecord = {
      id: this.generateRecordId(),
      userId,
      activityId,
      dataType,
      purpose,
      legalBasis,
      processedAt: new Date(),
      dataCategories,
      retentionPeriod: 90, // Default retention period
      consentId: this.consents.get(userId)?.id || '',
    };

    this.processingRecords.set(processingRecord.id, processingRecord);

    logger.info('Data processing recorded', 'GDPRComplianceService', {
      userId,
      activityId,
      dataType,
      purpose,
    });

    return processingRecord;
  }

  /**
   * Create privacy impact assessment
   */
  createPrivacyImpactAssessment(
    activityId: string,
    assessmentData: Omit<
      PrivacyImpactAssessment,
      'id' | 'activityId' | 'assessmentDate'
    >
  ): PrivacyImpactAssessment {
    const assessment: PrivacyImpactAssessment = {
      id: this.generateAssessmentId(),
      activityId,
      assessmentDate: new Date(),
      ...assessmentData,
    };

    this.privacyAssessments.set(assessment.id, assessment);

    logger.info('Privacy impact assessment created', 'GDPRComplianceService', {
      assessmentId: assessment.id,
      activityId,
      riskLevel: assessment.riskLevel,
    });

    return assessment;
  }

  /**
   * Record data breach
   */
  recordDataBreach(
    breachData: Omit<DataBreachRecord, 'id' | 'breachDate' | 'discoveryDate'>
  ): DataBreachRecord {
    const breach: DataBreachRecord = {
      id: this.generateBreachId(),
      breachDate: new Date(),
      discoveryDate: new Date(),
      ...breachData,
    };

    this.dataBreaches.set(breach.id, breach);

    // Check if regulatory notification is required
    if (breach.severity === 'high' || breach.severity === 'critical') {
      this.scheduleRegulatoryNotification(breach);
    }

    logger.warn('Data breach recorded', 'GDPRComplianceService', {
      breachId: breach.id,
      severity: breach.severity,
      affectedSubjects: breach.affectedSubjects,
    });

    return breach;
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(): any {
    const now = new Date();
    const consents = Array.from(this.consents.values());
    const activities = Array.from(this.processingActivities.values());
    const assessments = Array.from(this.privacyAssessments.values());
    const breaches = Array.from(this.dataBreaches.values());

    return {
      reportDate: now,
      summary: {
        totalUsers: consents.length,
        activeConsents: consents.filter((c) => c.dataProcessing).length,
        processingActivities: activities.length,
        privacyAssessments: assessments.length,
        dataBreaches: breaches.length,
        complianceScore: this.calculateComplianceScore(),
      },
      consentBreakdown: {
        dataProcessing: consents.filter((c) => c.dataProcessing).length,
        analytics: consents.filter((c) => c.analytics).length,
        marketing: consents.filter((c) => c.marketing).length,
        dataSharing: consents.filter((c) => c.dataSharing).length,
      },
      riskAssessment: {
        highRiskActivities: activities.filter((a) =>
          assessments.some(
            (ass) => ass.activityId === a.id && ass.riskLevel === 'high'
          )
        ).length,
        recentBreaches: breaches.filter(
          (b) =>
            now.getTime() - b.discoveryDate.getTime() < 30 * 24 * 60 * 60 * 1000
        ).length,
      },
      recommendations: this.generateComplianceRecommendations(),
    };
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(): number {
    let score = 100;
    const consents = Array.from(this.consents.values());
    const activities = Array.from(this.processingActivities.values());
    const assessments = Array.from(this.privacyAssessments.values());

    // Deduct points for missing elements
    if (consents.length === 0) {
      score -= 30;
    }
    if (activities.length < 3) {
      score -= 20;
    }
    if (assessments.length === 0) {
      score -= 25;
    }

    // Check for high-risk activities without assessments
    const highRiskActivities = activities.filter(
      (a) => !assessments.some((ass) => ass.activityId === a.id)
    );
    score -= highRiskActivities.length * 10;

    // Check for recent breaches
    const recentBreaches = Array.from(this.dataBreaches.values()).filter(
      (b) => Date.now() - b.discoveryDate.getTime() < 30 * 24 * 60 * 60 * 1000
    );
    score -= recentBreaches.length * 15;

    return Math.max(0, score);
  }

  /**
   * Generate compliance recommendations
   */
  private generateComplianceRecommendations(): string[] {
    const recommendations: string[] = [];
    const consents = Array.from(this.consents.values());
    const activities = Array.from(this.processingActivities.values());
    const assessments = Array.from(this.privacyAssessments.values());

    if (consents.length === 0) {
      recommendations.push('Implement user consent management system');
    }

    if (activities.length < 3) {
      recommendations.push('Document all data processing activities');
    }

    if (assessments.length === 0) {
      recommendations.push(
        'Conduct privacy impact assessments for high-risk activities'
      );
    }

    const recentBreaches = Array.from(this.dataBreaches.values()).filter(
      (b) => Date.now() - b.discoveryDate.getTime() < 30 * 24 * 60 * 60 * 1000
    );

    if (recentBreaches.length > 0) {
      recommendations.push('Review and strengthen data security measures');
    }

    return recommendations;
  }

  /**
   * Gather user data (placeholder - would integrate with actual data sources)
   */
  private async gatherUserData(
    userId: string,
    _requestType: string
  ): Promise<any> {
    // In a real implementation, this would query all data sources
    return {
      profile: { userId, email: 'user@example.com' },
      healthData: { symptoms: [], medications: [] },
      scanHistory: [],
      preferences: {},
    };
  }

  /**
   * Delete user data (placeholder - would integrate with actual data sources)
   */
  private async deleteUserData(userId: string): Promise<void> {
    // In a real implementation, this would delete from all data sources
    logger.info('User data deleted', 'GDPRComplianceService', { userId });
  }

  /**
   * Get data schema for portability
   */
  private getDataSchema(): any {
    return {
      version: '1.0',
      types: {
        profile: {
          userId: 'string',
          email: 'string',
          preferences: 'object',
        },
        healthData: {
          symptoms: 'array',
          medications: 'array',
          scanHistory: 'array',
        },
      },
    };
  }

  /**
   * Schedule regulatory notification
   */
  private scheduleRegulatoryNotification(breach: DataBreachRecord): void {
    // In a real implementation, this would schedule notification to authorities
    logger.warn('Regulatory notification scheduled', 'GDPRComplianceService', {
      breachId: breach.id,
      severity: breach.severity,
    });
  }

  /**
   * Generate unique IDs
   */
  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecordId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAssessmentId(): string {
    return `pia_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBreachId(): string {
    return `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const gdprComplianceService = GDPRComplianceService.getInstance();
export default gdprComplianceService;
