/**
 * @fileoverview ServiceContainer.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect } from 'react';
import { logger } from '../utils/logger';

// Service container for dependency injection
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  // Register a service instance
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
    logger.info(`Service registered: ${name}`, 'ServiceContainer');
  }

  // Register a service factory
  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
    logger.info(`Service factory registered: ${name}`, 'ServiceContainer');
  }

  // Get a service instance
  get<T>(name: string): T {
    // Check if service is already instantiated
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Check if factory exists
    if (this.factories.has(name)) {
      const factory = this.factories.get(name)!;
      const service = factory();
      this.services.set(name, service);
      logger.info(`Service instantiated: ${name}`, 'ServiceContainer');
      return service;
    }

    throw new Error(`Service not found: ${name}`);
  }

  // Check if service is registered
  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }

  // Remove a service
  remove(name: string): void {
    this.services.delete(name);
    this.factories.delete(name);
    logger.info(`Service removed: ${name}`, 'ServiceContainer');
  }

  // Clear all services
  clear(): void {
    this.services.clear();
    this.factories.clear();
    logger.info('All services cleared', 'ServiceContainer');
  }

  // Get all registered service names
  getServiceNames(): string[] {
    return [...this.services.keys(), ...this.factories.keys()];
  }

  // Initialize all services
  async initializeAll(): Promise<void> {
    const serviceNames = this.getServiceNames();
    const initPromises = serviceNames.map(async (name) => {
      try {
        const service = this.get(name);
        if (service && typeof (service as any).initialize === 'function') {
          await (service as any).initialize();
          logger.info(`Service initialized: ${name}`, 'ServiceContainer');
        }
      } catch (error) {
        logger.error(`Failed to initialize service: ${name}`, 'ServiceContainer', error);
      }
    });

    await Promise.all(initPromises);
  }

  // Cleanup all services
  async cleanupAll(): Promise<void> {
    const serviceNames = this.getServiceNames();
    const cleanupPromises = serviceNames.map(async (name) => {
      try {
        const service = this.get(name);
        if (service && typeof (service as any).cleanup === 'function') {
          await (service as any).cleanup();
          logger.info(`Service cleaned up: ${name}`, 'ServiceContainer');
        }
      } catch (error) {
        logger.error(`Failed to cleanup service: ${name}`, 'ServiceContainer', error);
      }
    });

    await Promise.all(cleanupPromises);
  }
}

// Service decorator for automatic registration
export function Injectable(name: string) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    const container = ServiceContainer.getInstance();
    container.registerFactory(name, () => new constructor());
    return constructor;
  };
}

// Service injection decorator
export function Inject(serviceName: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const container = ServiceContainer.getInstance();
    const service = container.get(serviceName);
    
    if (propertyKey) {
      target[propertyKey] = service;
    }
    
    return service;
  };
}

// Service provider hook for React components
export const useService = <T>(serviceName: string): T => {
  const container = ServiceContainer.getInstance();
  return container.get<T>(serviceName);
};

// Service provider component
export const ServiceProvider: React.FC<{
  children: React.ReactNode;
  services: Array<{ name: string; service: any }>;
}> = ({ children, services }) => {
  const container = ServiceContainer.getInstance();

  useEffect(() => {
    // Register all services
    services.forEach(({ name, service }) => {
      container.register(name, service);
    });

    // Initialize all services
    container.initializeAll();

    // Cleanup on unmount
    return () => {
      container.cleanupAll();
    };
  }, [container, services]);

  return React.createElement(React.Fragment, null, children);
};

export default ServiceContainer;
