/**
 * @fileoverview ServiceManager.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from '../utils/logger';
import AuthService from './AuthService';
import FoodService from './FoodService';
import HealthService from './HealthService';
import StorageService from './StorageService';
import NetworkService from './NetworkService';
import ErrorReportingService from './ErrorReportingService';

/**
 * ServiceManager - Simple service management without dependency injection
 * Replaces the complex ServiceContainer with a straightforward singleton pattern
 */
class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<string, any> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('Services already initialized', 'ServiceManager');
      return;
    }

    try {
      logger.info('Initializing services', 'ServiceManager');

      // Initialize error reporting service first
      const errorReportingService = ErrorReportingService.getInstance();
      await errorReportingService.initialize();
      this.services.set('errorReporting', errorReportingService);

      // Initialize services in dependency order
      const storageService = StorageService.getInstance();
      await storageService.initialize();
      this.services.set('storage', storageService);

      const networkService = NetworkService.getInstance();
      await networkService.initialize();
      this.services.set('network', networkService);

      const authService = AuthService.getInstance();
      await authService.initialize();
      this.services.set('auth', authService);

      const foodService = FoodService.getInstance();
      await foodService.initialize();
      this.services.set('food', foodService);

      const healthService = HealthService.getInstance();
      await healthService.initialize();
      this.services.set('health', healthService);

      this.initialized = true;
      logger.info('All services initialized successfully', 'ServiceManager');
    } catch (error) {
      logger.error('Failed to initialize services', 'ServiceManager', error);
      throw error;
    }
  }

  /**
   * Get a service instance
   */
  getService<T>(serviceName: string): T {
    if (!this.initialized) {
      throw new Error('Services not initialized. Call initialize() first.');
    }

    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    return service as T;
  }

  /**
   * Get all service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if service exists
   */
  hasService(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  /**
   * Get service status
   */
  getServiceStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [name, service] of this.services.entries()) {
      status[name] = !!service;
    }
    return status;
  }

  /**
   * Cleanup all services
   */
  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up services', 'ServiceManager');

      // Cleanup services in reverse order
      const serviceNames = Array.from(this.services.keys()).reverse();
      
      for (const serviceName of serviceNames) {
        const service = this.services.get(serviceName);
        if (service && typeof service.cleanup === 'function') {
          try {
            await service.cleanup();
            logger.info(`Service cleaned up: ${serviceName}`, 'ServiceManager');
          } catch (error) {
            logger.error(`Failed to cleanup service: ${serviceName}`, 'ServiceManager', error);
          }
        }
      }

      this.services.clear();
      this.initialized = false;
      
      logger.info('All services cleaned up', 'ServiceManager');
    } catch (error) {
      logger.error('Failed to cleanup services', 'ServiceManager', error);
      throw error;
    }
  }

  /**
   * Reset services (for testing)
   */
  async reset(): Promise<void> {
    await this.cleanup();
    this.initialized = false;
    logger.info('Services reset', 'ServiceManager');
  }
}

// Convenience functions for direct service access
export const getAuthService = () => ServiceManager.getInstance().getService<AuthService>('auth');
export const getFoodService = () => ServiceManager.getInstance().getService<FoodService>('food');
export const getHealthService = () => ServiceManager.getInstance().getService<HealthService>('health');
export const getStorageService = () => ServiceManager.getInstance().getService<StorageService>('storage');
export const getNetworkService = () => ServiceManager.getInstance().getService<NetworkService>('network');

// Initialize services function
export const initializeServices = async () => {
  const serviceManager = ServiceManager.getInstance();
  await serviceManager.initialize();
  return serviceManager;
};

// Cleanup services function
export const cleanupServices = async () => {
  const serviceManager = ServiceManager.getInstance();
  await serviceManager.cleanup();
};

export default ServiceManager;
