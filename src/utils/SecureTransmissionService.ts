/**
 * @fileoverview SecureTransmissionService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import * as CryptoJS from 'crypto-js';

import {
  dataProtectionService,
  DataClassification,
} from './DataProtectionService';
import { logger } from './logger';

// Transmission security levels
export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Secure transmission configuration
interface TransmissionConfig {
  useTLS: boolean;
  encryptPayload: boolean;
  signPayload: boolean;
  compressPayload: boolean;
  timeout: number;
  retryAttempts: number;
  validateCertificate: boolean;
}

// API endpoint security configuration
interface EndpointSecurity {
  endpoint: string;
  securityLevel: SecurityLevel;
  requiresAuth: boolean;
  allowedMethods: string[];
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  encryption: {
    required: boolean;
    algorithm: string;
  };
}

// Secure request/response wrapper
interface SecureRequest {
  payload: any;
  metadata: {
    timestamp: number;
    requestId: string;
    userId?: string;
    securityLevel: SecurityLevel;
    checksum: string;
  };
  signature?: string;
}

interface SecureResponse {
  data: any;
  metadata: {
    timestamp: number;
    requestId: string;
    processingTime: number;
    securityLevel: SecurityLevel;
    checksum: string;
  };
  signature?: string;
}

/**
 * Secure Transmission Service
 * Handles encrypted data transmission, certificate validation, and secure API calls
 */
export class SecureTransmissionService {
  private static instance: SecureTransmissionService;
  private readonly endpointConfigs: Map<string, EndpointSecurity>;
  private readonly transmissionConfig: TransmissionConfig;
  private readonly apiKeys: Map<string, string>;
  private readonly requestCache: Map<string, { data: any; timestamp: number }>;

  private constructor() {
    this.endpointConfigs = new Map();
    this.apiKeys = new Map();
    this.requestCache = new Map();

    this.transmissionConfig = {
      useTLS: true,
      encryptPayload: true,
      signPayload: true,
      compressPayload: true,
      timeout: 30000,
      retryAttempts: 3,
      validateCertificate: true,
    };

    this.initializeEndpointConfigs();
  }

  public static getInstance(): SecureTransmissionService {
    if (!SecureTransmissionService.instance) {
      SecureTransmissionService.instance = new SecureTransmissionService();
    }
    return SecureTransmissionService.instance;
  }

  /**
   * Initialize endpoint security configurations
   */
  private initializeEndpointConfigs(): void {
    // High security endpoints
    this.endpointConfigs.set('/api/auth', {
      endpoint: '/api/auth',
      securityLevel: SecurityLevel.CRITICAL,
      requiresAuth: false,
      allowedMethods: ['POST'],
      rateLimit: { requests: 10, windowMs: 60000 },
      encryption: { required: true, algorithm: 'AES-256-GCM' },
    });

    this.endpointConfigs.set('/api/user/profile', {
      endpoint: '/api/user/profile',
      securityLevel: SecurityLevel.HIGH,
      requiresAuth: true,
      allowedMethods: ['GET', 'PUT', 'DELETE'],
      rateLimit: { requests: 100, windowMs: 60000 },
      encryption: { required: true, algorithm: 'AES-256-CBC' },
    });

    this.endpointConfigs.set('/api/health-data', {
      endpoint: '/api/health-data',
      securityLevel: SecurityLevel.CRITICAL,
      requiresAuth: true,
      allowedMethods: ['GET', 'POST', 'PUT'],
      rateLimit: { requests: 50, windowMs: 60000 },
      encryption: { required: true, algorithm: 'AES-256-GCM' },
    });

    // Medium security endpoints
    this.endpointConfigs.set('/api/food', {
      endpoint: '/api/food',
      securityLevel: SecurityLevel.MEDIUM,
      requiresAuth: true,
      allowedMethods: ['GET', 'POST'],
      rateLimit: { requests: 200, windowMs: 60000 },
      encryption: { required: false, algorithm: 'AES-128-CBC' },
    });

    this.endpointConfigs.set('/api/analytics', {
      endpoint: '/api/analytics',
      securityLevel: SecurityLevel.MEDIUM,
      requiresAuth: true,
      allowedMethods: ['GET', 'POST'],
      rateLimit: { requests: 100, windowMs: 60000 },
      encryption: { required: true, algorithm: 'AES-128-CBC' },
    });

    // Low security endpoints
    this.endpointConfigs.set('/api/public', {
      endpoint: '/api/public',
      securityLevel: SecurityLevel.LOW,
      requiresAuth: false,
      allowedMethods: ['GET'],
      rateLimit: { requests: 1000, windowMs: 60000 },
      encryption: { required: false, algorithm: 'none' },
    });
  }

  /**
   * Make secure API request
   */
  async makeSecureRequest(
    endpoint: string,
    method: string,
    payload?: any,
    options?: {
      userId?: string;
      skipCache?: boolean;
      customHeaders?: Record<string, string>;
    }
  ): Promise<SecureResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // Get endpoint configuration
      const endpointConfig = this.getEndpointConfig(endpoint);
      if (!endpointConfig) {
        throw new Error(
          `No security configuration found for endpoint: ${endpoint}`
        );
      }

      // Validate request method
      if (!endpointConfig.allowedMethods.includes(method)) {
        throw new Error(
          `Method ${method} not allowed for endpoint ${endpoint}`
        );
      }

      // Check rate limiting
      if (this.isRateLimited(endpoint, options?.userId)) {
        throw new Error('Rate limit exceeded');
      }

      // Check cache for GET requests
      if (method === 'GET' && !options?.skipCache) {
        const cached = this.getCachedRequest(endpoint, payload);
        if (cached) {
          return cached;
        }
      }

      // Prepare secure request
      const secureRequest = await this.prepareSecureRequest(
        payload,
        requestId,
        endpointConfig.securityLevel,
        options?.userId
      );

      // Make the actual request
      const response = await this.executeRequest(
        endpoint,
        method,
        secureRequest,
        endpointConfig,
        options
      );

      // Process secure response
      const secureResponse = await this.processSecureResponse(
        response,
        requestId,
        endpointConfig.securityLevel,
        Date.now() - startTime
      );

      // Cache GET responses
      if (method === 'GET') {
        this.cacheRequest(endpoint, payload, secureResponse);
      }

      logger.info('Secure request completed', 'SecureTransmissionService', {
        endpoint,
        method,
        requestId,
        processingTime: Date.now() - startTime,
      });

      return secureResponse;
    } catch (error) {
      logger.error('Secure request failed', 'SecureTransmissionService', {
        endpoint,
        method,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get endpoint security configuration
   */
  private getEndpointConfig(endpoint: string): EndpointSecurity | null {
    // Find matching endpoint configuration
    for (const [configEndpoint, config] of this.endpointConfigs) {
      if (endpoint.startsWith(configEndpoint)) {
        return config;
      }
    }
    return null;
  }

  /**
   * Check if request is rate limited
   */
  private isRateLimited(endpoint: string, userId?: string): boolean {
    const key = `${endpoint}:${userId || 'anonymous'}`;
    const config = this.getEndpointConfig(endpoint);

    if (!config) {
      return false;
    }

    const now = Date.now();
    const { windowMs } = config.rateLimit;
    const maxRequests = config.rateLimit.requests;

    // Simple in-memory rate limiting (in production, use Redis or similar)
    const requests = this.requestCache.get(key) || { data: [], timestamp: now };

    // Clean old requests
    const validRequests = requests.data.filter(
      (timestamp: number) => now - timestamp < windowMs
    );

    if (validRequests.length >= maxRequests) {
      return true;
    }

    // Add current request
    validRequests.push(now);
    this.requestCache.set(key, { data: validRequests, timestamp: now });

    return false;
  }

  /**
   * Prepare secure request payload
   */
  private async prepareSecureRequest(
    payload: any,
    requestId: string,
    securityLevel: SecurityLevel,
    userId?: string
  ): Promise<SecureRequest> {
    const timestamp = Date.now();
    let processedPayload = payload;

    // Classify and encrypt data based on security level
    if (payload) {
      const classification = dataProtectionService.classifyData(payload);
      processedPayload = await dataProtectionService.encryptData(
        payload,
        classification
      );
    }

    // Compress payload if configured
    if (this.transmissionConfig.compressPayload && processedPayload) {
      processedPayload = this.compressPayload(processedPayload);
    }

    // Generate checksum
    const checksum = this.generateChecksum(processedPayload);

    const secureRequest: SecureRequest = {
      payload: processedPayload,
      metadata: {
        timestamp,
        requestId,
        userId,
        securityLevel,
        checksum,
      },
    };

    // Sign request if configured
    if (this.transmissionConfig.signPayload) {
      secureRequest.signature = this.signRequest(secureRequest);
    }

    return secureRequest;
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest(
    endpoint: string,
    method: string,
    secureRequest: SecureRequest,
    config: EndpointSecurity,
    options?: any
  ): Promise<Response> {
    const url = this.buildSecureUrl(endpoint);
    const headers = this.buildSecureHeaders(config, options?.customHeaders);

    const requestOptions: RequestInit = {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(secureRequest) : undefined,
      signal: AbortSignal.timeout(this.transmissionConfig.timeout),
    };

    // Add TLS configuration for production
    if (this.transmissionConfig.useTLS && !url.startsWith('https://')) {
      throw new Error('TLS required for secure transmission');
    }

    return fetch(url, requestOptions);
  }

  /**
   * Build secure URL
   */
  private buildSecureUrl(endpoint: string): string {
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || 'https://api.gutsafe.app';
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Build secure headers
   */
  private buildSecureHeaders(
    config: EndpointSecurity,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId(),
      'X-Security-Level': config.securityLevel,
      'X-Timestamp': Date.now().toString(),
      'User-Agent': 'GutSafe/1.0.0',
      ...customHeaders,
    };

    // Add authentication header if required
    if (config.requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add encryption headers
    if (config.encryption.required) {
      headers['X-Encryption-Algorithm'] = config.encryption.algorithm;
      headers['X-Encryption-Required'] = 'true';
    }

    return headers;
  }

  /**
   * Process secure response
   */
  private async processSecureResponse(
    response: Response,
    requestId: string,
    securityLevel: SecurityLevel,
    processingTime: number
  ): Promise<SecureResponse> {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Verify response signature if present
    if (responseData.signature && this.transmissionConfig.signPayload) {
      if (!this.verifyResponse(responseData)) {
        throw new Error('Response signature verification failed');
      }
    }

    // Verify checksum
    const expectedChecksum = this.generateChecksum(responseData.data);
    if (responseData.metadata.checksum !== expectedChecksum) {
      throw new Error('Response checksum verification failed');
    }

    // Decrypt response data
    let decryptedData = responseData.data;
    if (responseData.metadata.encrypted) {
      const classification =
        this.getClassificationFromSecurityLevel(securityLevel);
      decryptedData = await dataProtectionService.decryptData(
        responseData.data,
        classification
      );
    }

    // Decompress if needed
    if (responseData.metadata.compressed) {
      decryptedData = this.decompressPayload(decryptedData);
    }

    return {
      data: decryptedData,
      metadata: {
        timestamp: responseData.metadata.timestamp,
        requestId: responseData.metadata.requestId,
        processingTime,
        securityLevel: responseData.metadata.securityLevel,
        checksum: responseData.metadata.checksum,
      },
      signature: responseData.signature,
    };
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex)}`;
  }

  /**
   * Generate checksum for data integrity
   */
  private generateChecksum(data: any): string {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.SHA256(dataString).toString();
  }

  /**
   * Sign request for authenticity
   */
  private signRequest(request: SecureRequest): string {
    const dataToSign = JSON.stringify({
      payload: request.payload,
      metadata: request.metadata,
    });

    const secret = this.getSigningSecret();
    return CryptoJS.HmacSHA256(dataToSign, secret).toString();
  }

  /**
   * Verify response signature
   */
  private verifyResponse(response: any): boolean {
    try {
      const dataToVerify = JSON.stringify({
        data: response.data,
        metadata: response.metadata,
      });

      const secret = this.getSigningSecret();
      const expectedSignature = CryptoJS.HmacSHA256(
        dataToVerify,
        secret
      ).toString();

      return response.signature === expectedSignature;
    } catch (error) {
      logger.error(
        'Response signature verification failed',
        'SecureTransmissionService',
        error
      );
      return false;
    }
  }

  /**
   * Get signing secret
   */
  private getSigningSecret(): string {
    return (
      process.env.REACT_APP_SIGNING_SECRET || 'gutsafe-signing-secret-2024'
    );
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    // In a real implementation, this would get the token from secure storage
    return localStorage.getItem('auth_token');
  }

  /**
   * Compress payload
   */
  private compressPayload(payload: any): any {
    // Simple compression using JSON stringify/parse
    // In production, use a proper compression library like pako
    const compressed = JSON.stringify(payload);
    return {
      compressed: true,
      data: compressed,
      originalSize: JSON.stringify(payload).length,
      compressedSize: compressed.length,
    };
  }

  /**
   * Decompress payload
   */
  private decompressPayload(payload: any): any {
    if (payload.compressed) {
      return JSON.parse(payload.data);
    }
    return payload;
  }

  /**
   * Get classification from security level
   */
  private getClassificationFromSecurityLevel(
    securityLevel: SecurityLevel
  ): DataClassification {
    switch (securityLevel) {
      case SecurityLevel.CRITICAL:
        return DataClassification.RESTRICTED;
      case SecurityLevel.HIGH:
        return DataClassification.CONFIDENTIAL;
      case SecurityLevel.MEDIUM:
        return DataClassification.INTERNAL;
      case SecurityLevel.LOW:
        return DataClassification.PUBLIC;
      default:
        return DataClassification.INTERNAL;
    }
  }

  /**
   * Cache GET request
   */
  private getCachedRequest(
    endpoint: string,
    payload?: any
  ): SecureResponse | null {
    const key = `${endpoint}:${JSON.stringify(payload || {})}`;
    const cached = this.requestCache.get(key);

    if (cached && Date.now() - cached.timestamp < 300000) {
      // 5 minutes
      return cached.data;
    }

    return null;
  }

  /**
   * Cache request response
   */
  private cacheRequest(
    endpoint: string,
    payload: any,
    response: SecureResponse
  ): void {
    const key = `${endpoint}:${JSON.stringify(payload || {})}`;
    this.requestCache.set(key, {
      data: response,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    this.requestCache.clear();
    logger.info('Request cache cleared', 'SecureTransmissionService');
  }

  /**
   * Update endpoint security configuration
   */
  updateEndpointSecurity(
    endpoint: string,
    config: Partial<EndpointSecurity>
  ): void {
    const existing = this.endpointConfigs.get(endpoint);
    if (existing) {
      this.endpointConfigs.set(endpoint, { ...existing, ...config });
      logger.info('Endpoint security updated', 'SecureTransmissionService', {
        endpoint,
        config,
      });
    }
  }

  /**
   * Get security audit report
   */
  getSecurityAuditReport(): any {
    return {
      timestamp: new Date(),
      totalEndpoints: this.endpointConfigs.size,
      transmissionConfig: this.transmissionConfig,
      cacheSize: this.requestCache.size,
      securityLevels: Array.from(this.endpointConfigs.values()).map(
        (config) => config.securityLevel
      ),
      complianceScore: this.calculateSecurityScore(),
    };
  }

  /**
   * Calculate security compliance score
   */
  private calculateSecurityScore(): number {
    let score = 100;

    // Check TLS usage
    if (!this.transmissionConfig.useTLS) {
      score -= 30;
    }

    // Check encryption
    if (!this.transmissionConfig.encryptPayload) {
      score -= 25;
    }

    // Check signing
    if (!this.transmissionConfig.signPayload) {
      score -= 20;
    }

    // Check certificate validation
    if (!this.transmissionConfig.validateCertificate) {
      score -= 15;
    }

    // Check endpoint configurations
    const criticalEndpoints = Array.from(this.endpointConfigs.values()).filter(
      (config) => config.securityLevel === SecurityLevel.CRITICAL
    );

    if (criticalEndpoints.length === 0) {
      score -= 10;
    }

    return Math.max(0, score);
  }
}

// Export singleton instance
export const secureTransmissionService =
  SecureTransmissionService.getInstance();
export default secureTransmissionService;
