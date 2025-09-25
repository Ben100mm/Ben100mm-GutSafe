/**
 * @fileoverview NetworkService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { EventEmitter } from 'events';
import { Platform } from 'react-native';

/**
 * NetworkService - Handles network connectivity monitoring and status
 * Provides real-time network status updates and connection management
 */
class NetworkService extends EventEmitter {
  private static instance: NetworkService;
  private isConnected: boolean = true;
  private isOnlineStatus: boolean = true;
  private connectionType: string = 'unknown';
  private lastOnlineTime: number = Date.now();
  private lastOfflineTime: number = 0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // 1 second

  private constructor() {
    super();
    this.initializeNetworkMonitoring();
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  public initialize(): void {
    this.setupListeners();
    this.checkInitialStatus();
    setInterval(() => this.getNetworkStatus(), 30000); // Check every 30 seconds
    console.log('NetworkService: Initialized.');
  }

  private setupListeners(): void {
    if (Platform.OS === 'web') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
    // For native, a more robust solution like @react-native-community/netinfo would be used
  }

  private checkInitialStatus(): void {
    if (Platform.OS === 'web') {
      this.isOnlineStatus = navigator.onLine;
      this.isConnected = navigator.onLine; // Set isConnected for web
      if (navigator.onLine) {
        this.handleOnline();
      } else {
        this.handleOffline();
      }
    } else {
      // For native, perform an initial check
      this.getNetworkStatus();
    }
  }

  /**
   * Initialize network monitoring
   */
  private initializeNetworkMonitoring(): void {
    // In a real React Native app, you would use @react-native-community/netinfo
    // For web, we use the navigator.onLine API
    if (typeof window !== 'undefined') {
      // Web implementation
      this.isConnected = navigator.onLine;
      
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    } else {
      // React Native implementation would go here
      // For now, we'll simulate network status
      this.simulateNetworkStatus();
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isConnected = true;
    this.lastOnlineTime = Date.now();
    this.reconnectAttempts = 0;
    
    this.emit('online', {
      connectionType: this.connectionType,
      timestamp: this.lastOnlineTime,
    });
    
    console.log('Network: Connected');
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isConnected = false;
    this.lastOfflineTime = Date.now();
    
    this.emit('offline', {
      connectionType: this.connectionType,
      timestamp: this.lastOfflineTime,
    });
    
    console.log('Network: Disconnected');
  }

  /**
   * Simulate network status for development
   */
  private simulateNetworkStatus(): void {
    // Simulate network changes every 30 seconds for testing
    setInterval(() => {
      const shouldGoOffline = Math.random() < 0.1; // 10% chance to go offline
      
      if (shouldGoOffline && this.isConnected) {
        this.handleOffline();
        
        // Simulate reconnection after 5-15 seconds
        setTimeout(() => {
          this.handleOnline();
        }, Math.random() * 10000 + 5000);
      }
    }, 30000);
  }

  /**
   * Check if device is currently online
   */
  isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Get current connection type
   */
  getConnectionType(): string {
    return this.connectionType;
  }

  /**
   * Get network status information
   */
  getNetworkStatus(): {
    isConnected: boolean;
    connectionType: string;
    lastOnlineTime: number;
    lastOfflineTime: number;
    uptime: number;
  } {
    return {
      isConnected: this.isConnected,
      connectionType: this.connectionType,
      lastOnlineTime: this.lastOnlineTime,
      lastOfflineTime: this.lastOfflineTime,
      uptime: this.isConnected ? Date.now() - this.lastOnlineTime : 0,
    };
  }

  /**
   * Test network connectivity with a ping
   */
  async testConnectivity(): Promise<{
    isConnected: boolean;
    latency: number;
    timestamp: number;
  }> {
    const startTime = Date.now();
    
    try {
      // In a real app, you would ping your API endpoint
      // For now, we'll simulate a network test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const latency = Date.now() - startTime;
      const isConnected = response.ok;
      
      if (isConnected) {
        this.handleOnline();
      } else {
        this.handleOffline();
      }
      
      return {
        isConnected,
        latency,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.handleOffline();
      return {
        isConnected: false,
        latency: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Wait for network connection
   */
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isConnected) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        this.removeListener('online', onOnline);
        resolve(false);
      }, timeout);

      const onOnline = () => {
        clearTimeout(timeoutId);
        this.removeListener('online', onOnline);
        resolve(true);
      };

      this.on('online', onOnline);
    });
  }

  /**
   * Retry a function when connection is restored
   */
  async retryWhenOnline<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        if (this.isConnected) {
          return await fn();
        } else {
          await this.waitForConnection(10000); // Wait up to 10 seconds
          attempts++;
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        const delay = 1000 * attempts;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  /**
   * Get network quality score (0-100)
   */
  async getNetworkQuality(): Promise<{
    score: number;
    latency: number;
    reliability: number;
    timestamp: number;
  }> {
    const testResult = await this.testConnectivity();
    
    // Calculate quality score based on latency and reliability
    let score = 100;
    
    // Penalize high latency
    if (testResult.latency > 1000) {
      score -= 30;
    } else if (testResult.latency > 500) {
      score -= 15;
    } else if (testResult.latency > 200) {
      score -= 5;
    }
    
    // Penalize connection failures
    if (!testResult.isConnected) {
      score = 0;
    }
    
    // Calculate reliability based on recent connection history
    const uptime = this.isConnected ? Date.now() - this.lastOnlineTime : 0;
    const reliability = Math.min(100, (uptime / (60 * 1000)) * 10); // 10 points per minute uptime
    
    return {
      score: Math.max(0, Math.min(100, score)),
      latency: testResult.latency,
      reliability,
      timestamp: Date.now(),
    };
  }

  /**
   * Check if network is suitable for data sync
   */
  async isSuitableForSync(): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }
    
    const quality = await this.getNetworkQuality();
    
    // Require at least 50% quality score for sync operations
    return quality.score >= 50;
  }

  /**
   * Get network usage statistics
   */
  getNetworkStats(): {
    totalUptime: number;
    totalDowntime: number;
    connectionCount: number;
    averageUptime: number;
  } {
    const now = Date.now();
    const totalUptime = this.isConnected 
      ? now - this.lastOnlineTime 
      : this.lastOnlineTime - this.lastOfflineTime;
    
    const totalDowntime = this.isConnected 
      ? this.lastOfflineTime - this.lastOnlineTime 
      : now - this.lastOfflineTime;
    
    return {
      totalUptime,
      totalDowntime,
      connectionCount: this.reconnectAttempts,
      averageUptime: totalUptime / (totalUptime + totalDowntime) * 100,
    };
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
    this.removeAllListeners();
  }
}

export default NetworkService;
