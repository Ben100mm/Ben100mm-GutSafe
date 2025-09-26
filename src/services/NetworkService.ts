/**
 * @fileoverview NetworkService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { EventEmitter } from 'events';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { SafeFood } from '../types';
import { retryUtils } from '../utils/retryUtils';

// Notification types
export interface NotificationSettings {
  mealReminders: boolean;
  newSafeFoods: boolean;
  scanReminders: boolean;
  weeklyReports: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledFor: Date;
  type: 'meal_reminder' | 'scan_reminder' | 'weekly_report' | 'safe_food_alert';
  data?: any;
}

/**
 * NetworkService - Handles network connectivity, API calls, and notifications
 * Consolidates network monitoring, API communication, and notification functionality
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
  private statusCheckInterval: NodeJS.Timeout | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;
  
  // Notification properties
  private notificationPermission: boolean = false;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private notificationSettings: NotificationSettings = {
    mealReminders: true,
    newSafeFoods: true,
    scanReminders: false,
    weeklyReports: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  };
  
  // Storage keys
  private readonly KEYS = {
    NOTIFICATION_SETTINGS: 'gut_safe_notification_settings',
    SCHEDULED_NOTIFICATIONS: 'gut_safe_scheduled_notifications',
    NOTIFICATION_HISTORY: 'gut_safe_notification_history',
  };

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

  public async initialize(): Promise<void> {
    this.setupListeners();
    this.checkInitialStatus();
    this.statusCheckInterval = setInterval(() => this.getNetworkStatus(), 30000); // Check every 30 seconds
    
    // Initialize notifications
    await this.initializeNotifications();
    
    logger.info('NetworkService initialized', 'NetworkService');
  }

  public cleanup(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
    
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    if (Platform.OS === 'web') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
    
    logger.info('NetworkService cleaned up', 'NetworkService');
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
    
    logger.info('Network connected', 'NetworkService');
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
    
    logger.warn('Network disconnected', 'NetworkService');
  }

  /**
   * Simulate network status for development
   */
  private simulateNetworkStatus(): void {
    // Simulate network changes every 30 seconds for testing
    this.simulationInterval = setInterval(() => {
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
    
    const result = await retryUtils.retryApiCall(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
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
        clearTimeout(timeoutId);
        this.handleOffline();
        throw error;
      }
    }, {
      maxAttempts: 2,
      baseDelay: 1000,
      maxDelay: 3000,
      backoffMultiplier: 2,
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR'],
    }, 'NetworkService.testConnectivity');

    if (result.success) {
      return result.data;
    } else {
      // Fallback response on failure
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

  // ===== NOTIFICATION METHODS =====

  /**
   * Initialize notification service
   */
  private async initializeNotifications(): Promise<void> {
    try {
      await this.loadNotificationSettings();
      await this.loadScheduledNotifications();
      await this.requestNotificationPermission();
      
      logger.info('Notifications initialized', 'NetworkService');
    } catch (error) {
      logger.error('Failed to initialize notifications', 'NetworkService', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          this.notificationPermission = permission === 'granted';
        }
      } else {
        // For React Native, you would use a library like @react-native-async-storage/async-storage
        // or react-native-push-notification
        this.notificationPermission = true; // Mock for now
      }
      
      logger.info('Notification permission requested', 'NetworkService', { 
        granted: this.notificationPermission 
      });
      
      return this.notificationPermission;
    } catch (error) {
      logger.error('Failed to request notification permission', 'NetworkService', error);
      return false;
    }
  }

  /**
   * Send local notification
   */
  async sendNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      if (!this.notificationPermission) {
        logger.warn('Notification permission not granted', 'NetworkService');
        return;
      }

      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            data,
          });
          
          // Auto-close after 5 seconds
          setTimeout(() => notification.close(), 5000);
        }
      } else {
        // For React Native, use push notification library
        // This would be implemented with react-native-push-notification
        console.log('Notification:', { title, body, data });
      }
      
      logger.info('Notification sent', 'NetworkService', { title });
    } catch (error) {
      logger.error('Failed to send notification', 'NetworkService', { title, error });
    }
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(notification: Omit<ScheduledNotification, 'id'>): Promise<string> {
    try {
      const id = this.generateNotificationId();
      const scheduledNotification: ScheduledNotification = {
        ...notification,
        id,
      };

      this.scheduledNotifications.set(id, scheduledNotification);
      await this.saveScheduledNotifications();

      // Schedule the actual notification
      const delay = notification.scheduledFor.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          this.sendNotification(notification.title, notification.body, notification.data);
          this.scheduledNotifications.delete(id);
          this.saveScheduledNotifications();
        }, delay);
      }

      logger.info('Notification scheduled', 'NetworkService', { id, scheduledFor: notification.scheduledFor });
      return id;
    } catch (error) {
      logger.error('Failed to schedule notification', 'NetworkService', { notification, error });
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(id: string): Promise<void> {
    try {
      this.scheduledNotifications.delete(id);
      await this.saveScheduledNotifications();
      
      logger.info('Notification cancelled', 'NetworkService', { id });
    } catch (error) {
      logger.error('Failed to cancel notification', 'NetworkService', { id, error });
      throw error;
    }
  }

  /**
   * Send meal reminder notification
   */
  async sendMealReminder(): Promise<void> {
    if (!this.notificationSettings.mealReminders) return;

    await this.sendNotification(
      'Meal Time! 🍽️',
      'Don\'t forget to log your meal and check for gut-friendly options.',
      { type: 'meal_reminder' }
    );
  }

  /**
   * Send new safe food notification
   */
  async sendNewSafeFoodNotification(safeFood: SafeFood): Promise<void> {
    if (!this.notificationSettings.newSafeFoods) return;

    await this.sendNotification(
      'New Safe Food! ✅',
      `${safeFood.foodName || 'Unknown food'} has been added to your safe foods list.`,
      { type: 'safe_food_alert', foodId: safeFood.id }
    );
  }

  /**
   * Send scan reminder notification
   */
  async sendScanReminder(): Promise<void> {
    if (!this.notificationSettings.scanReminders) return;

    await this.sendNotification(
      'Scan Reminder 📱',
      'Remember to scan your food before eating to check for triggers.',
      { type: 'scan_reminder' }
    );
  }

  /**
   * Send weekly report notification
   */
  async sendWeeklyReport(): Promise<void> {
    if (!this.notificationSettings.weeklyReports) return;

    await this.sendNotification(
      'Weekly Report 📊',
      'Your weekly gut health report is ready. Check your insights!',
      { type: 'weekly_report' }
    );
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.notificationSettings = {
        ...this.notificationSettings,
        ...settings,
      };
      
      await this.saveNotificationSettings();
      
      logger.info('Notification settings updated', 'NetworkService', { settings });
    } catch (error) {
      logger.error('Failed to update notification settings', 'NetworkService', { settings, error });
      throw error;
    }
  }

  /**
   * Get notification settings
   */
  getNotificationSettings(): NotificationSettings {
    return { ...this.notificationSettings };
  }

  /**
   * Check if in quiet hours
   */
  private isInQuietHours(): boolean {
    if (!this.notificationSettings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startParts = this.notificationSettings.quietHours.start.split(':').map(Number);
    const endParts = this.notificationSettings.quietHours.end.split(':').map(Number);
    
    const startHour = startParts[0] || 0;
    const startMin = startParts[1] || 0;
    const endHour = endParts[0] || 0;
    const endMin = endParts[1] || 0;
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Load notification settings from storage
   */
  private async loadNotificationSettings(): Promise<void> {
    try {
      // This would load from actual storage in a real implementation
      // For now, use default settings
      logger.info('Notification settings loaded', 'NetworkService');
    } catch (error) {
      logger.error('Failed to load notification settings', 'NetworkService', error);
    }
  }

  /**
   * Save notification settings to storage
   */
  private async saveNotificationSettings(): Promise<void> {
    try {
      // This would save to actual storage in a real implementation
      logger.info('Notification settings saved', 'NetworkService');
    } catch (error) {
      logger.error('Failed to save notification settings', 'NetworkService', error);
    }
  }

  /**
   * Load scheduled notifications from storage
   */
  private async loadScheduledNotifications(): Promise<void> {
    try {
      // This would load from actual storage in a real implementation
      this.scheduledNotifications.clear();
      logger.info('Scheduled notifications loaded', 'NetworkService');
    } catch (error) {
      logger.error('Failed to load scheduled notifications', 'NetworkService', error);
    }
  }

  /**
   * Save scheduled notifications to storage
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      // This would save to actual storage in a real implementation
      logger.info('Scheduled notifications saved', 'NetworkService');
    } catch (error) {
      logger.error('Failed to save scheduled notifications', 'NetworkService', error);
    }
  }

  /**
   * Generate unique notification ID
   */
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default NetworkService;
