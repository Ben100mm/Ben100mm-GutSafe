/**
 * @fileoverview DataProtectionExample.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useEffect } from 'react';
import { 
  dataProtectionIntegrationService
} from '../services/DataProtectionIntegrationService';
import { DataClassification } from '../utils/DataProtectionService';
import { gdprComplianceService } from '../utils/GDPRComplianceService';

/**
 * Example component demonstrating data protection features
 */
const DataProtectionExample: React.FC = () => {
  const [auditReport, setAuditReport] = useState<any>(null);
  const [consentStatus, setConsentStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeDataProtection();
  }, []);

  const initializeDataProtection = async () => {
    try {
      setIsLoading(true);
      
      // Initialize data protection services
      await dataProtectionIntegrationService.initialize();
      
      // Generate initial audit report
      const report = await dataProtectionIntegrationService.generateAuditReport();
      setAuditReport(report);
      
      // Check consent status (example user ID)
      const consent = gdprComplianceService.getConsent('example-user-123');
      setConsentStatus(consent);
      
    } catch (error) {
      console.error('Failed to initialize data protection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsentUpdate = async () => {
    try {
      const consent = await dataProtectionIntegrationService.handleUserConsent('example-user-123', {
        dataProcessing: true,
        analytics: true,
        marketing: false,
        dataSharing: false,
        dataRetention: true,
        profiling: false,
        automatedDecisionMaking: false,
        thirdPartySharing: false,
        dataPortability: true,
        rightToErasure: true
      });
      
      setConsentStatus(consent);
      alert('Consent updated successfully!');
    } catch (error) {
      console.error('Failed to update consent:', error);
      alert('Failed to update consent');
    }
  };

  const handleDataAccessRequest = async () => {
    try {
      const accessData = await dataProtectionIntegrationService.handleDataSubjectRightsRequest(
        'example-user-123',
        'access'
      );
      
      console.log('Data access response:', accessData);
      alert('Data access request processed. Check console for details.');
    } catch (error) {
      console.error('Failed to process data access request:', error);
      alert('Failed to process data access request');
    }
  };

  const handleDataPortabilityRequest = async () => {
    try {
      const portableData = await dataProtectionIntegrationService.handleDataSubjectRightsRequest(
        'example-user-123',
        'portability'
      );
      
      console.log('Portable data:', portableData);
      alert('Data portability request processed. Check console for details.');
    } catch (error) {
      console.error('Failed to process data portability request:', error);
      alert('Failed to process data portability request');
    }
  };

  const handleDataCleanup = async () => {
    try {
      const result = await dataProtectionIntegrationService.runDataCleanup();
      
      console.log('Data cleanup result:', result);
      alert(`Data cleanup completed: ${result.deletedRecords} deleted, ${result.anonymizedRecords} anonymized`);
    } catch (error) {
      console.error('Failed to run data cleanup:', error);
      alert('Failed to run data cleanup');
    }
  };

  const handleSecureRequest = async () => {
    try {
      const testData = {
        userId: 'example-user-123',
        symptoms: ['bloating', 'cramping'],
        timestamp: new Date()
      };

      const response = await dataProtectionIntegrationService.makeSecureRequest(
        '/api/health-data',
        'POST',
        testData,
        {
          userId: 'example-user-123',
          dataType: 'health_data',
          purpose: 'symptom_tracking',
          encryptPayload: true,
          anonymizeResponse: false
        }
      );

      console.log('Secure request response:', response);
      alert('Secure request completed. Check console for details.');
    } catch (error) {
      console.error('Failed to make secure request:', error);
      alert('Failed to make secure request');
    }
  };

  const handleDataProcessing = async () => {
    try {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        symptoms: ['bloating', 'cramping'],
        medications: ['probiotics'],
        location: { latitude: 40.7128, longitude: -74.0060 }
      };

      const processedData = await dataProtectionIntegrationService.processData(
        userData,
        {
          userId: 'example-user-123',
          dataType: 'health_data',
          purpose: 'symptom_tracking',
          classification: DataClassification.RESTRICTED,
          encrypt: true,
          anonymize: false
        }
      );

      console.log('Original data:', userData);
      console.log('Processed data:', processedData);
      alert('Data processing completed. Check console for details.');
    } catch (error) {
      console.error('Failed to process data:', error);
      alert('Failed to process data');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Initializing Data Protection Services...</h2>
        <p>Please wait while we set up data protection features.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Data Protection Example</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Audit Report</h2>
        {auditReport ? (
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Overall Score:</strong> {auditReport.overallScore}/100</p>
            <p><strong>Encryption Score:</strong> {auditReport.encryption.score}/100</p>
            <p><strong>GDPR Score:</strong> {auditReport.gdpr.score}/100</p>
            <p><strong>Retention Score:</strong> {auditReport.retention.score}/100</p>
            <p><strong>Transmission Score:</strong> {auditReport.transmission.score}/100</p>
            
            {auditReport.recommendations.length > 0 && (
              <div>
                <strong>Recommendations:</strong>
                <ul>
                  {auditReport.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>No audit report available</p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Consent Management</h2>
        {consentStatus ? (
          <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Data Processing:</strong> {consentStatus.dataProcessing ? '✅' : '❌'}</p>
            <p><strong>Analytics:</strong> {consentStatus.analytics ? '✅' : '❌'}</p>
            <p><strong>Marketing:</strong> {consentStatus.marketing ? '✅' : '❌'}</p>
            <p><strong>Data Sharing:</strong> {consentStatus.dataSharing ? '✅' : '❌'}</p>
            <p><strong>Data Retention:</strong> {consentStatus.dataRetention ? '✅' : '❌'}</p>
            <p><strong>Last Updated:</strong> {new Date(consentStatus.lastUpdated).toLocaleString()}</p>
          </div>
        ) : (
          <p>No consent data available</p>
        )}
        <button onClick={handleConsentUpdate} style={{ marginTop: '10px' }}>
          Update Consent
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Data Subject Rights</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleDataAccessRequest}>
            Request Data Access
          </button>
          <button onClick={handleDataPortabilityRequest}>
            Request Data Portability
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Data Processing</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleDataProcessing}>
            Process Sample Data
          </button>
          <button onClick={handleSecureRequest}>
            Make Secure Request
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Data Management</h2>
        <button onClick={handleDataCleanup}>
          Run Data Cleanup
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h3>Instructions</h3>
        <ol>
          <li>Click "Update Consent" to set your privacy preferences</li>
          <li>Use "Process Sample Data" to see encryption in action</li>
          <li>Try "Make Secure Request" to test secure transmission</li>
          <li>Use data subject rights buttons to test GDPR compliance</li>
          <li>Check the browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default DataProtectionExample;
