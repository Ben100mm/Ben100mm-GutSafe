/**
 * @fileoverview UserSettingsService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { logger } from '../utils/logger';
import { UserSettings } from '../types/comprehensive';

/**
 * UserSettingsService - Handles user settings
 */
class UserSettingsService {
  private static instance: UserSettingsService;
  private settings: UserSettings | null = null;
  private listeners: ((settings: UserSettings) => void)[] = [];

  private constructor() {}

  public static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  async initialize(): Promise<void> {
    logger.info('UserSettingsService initialized', 'UserSettingsService');
    // Initialize with default settings
    this.settings = this.getDefaultSettings();
  }

  getSettings(): UserSettings | null {
    return this.settings;
  }

  addListener(listener: (settings: UserSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async updatePreferences(preferences: Partial<UserSettings['preferences']>): Promise<void> {
    if (!this.settings) return;
    this.settings.preferences = { ...this.settings.preferences, ...preferences };
    this.notifyListeners();
  }

  async setSettingValue(section: keyof UserSettings, key: string, value: any): Promise<void> {
    if (!this.settings) return;
    (this.settings[section] as any)[key] = value;
    this.notifyListeners();
  }

  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  async resetSettings(): Promise<void> {
    this.settings = this.getDefaultSettings();
    this.notifyListeners();
  }

  private getDefaultSettings(): UserSettings {
    return {
      profile: {
        gutProfile: {
          id: 'default',
          conditions: {
            'ibs-fodmap': { enabled: false, severity: 'mild', knownTriggers: [] },
            'gluten': { enabled: false, severity: 'mild', knownTriggers: [] },
            'lactose': { enabled: false, severity: 'mild', knownTriggers: [] },
            'reflux': { enabled: false, severity: 'mild', knownTriggers: [] },
            'histamine': { enabled: false, severity: 'mild', knownTriggers: [] },
            'allergies': { enabled: false, severity: 'mild', knownTriggers: [] },
            'additives': { enabled: false, severity: 'mild', knownTriggers: [] },
          },
          preferences: {
            dietaryRestrictions: [],
            preferredAlternatives: [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      preferences: {
        theme: 'system',
        language: 'en',
        units: 'metric',
        notifications: {
          enabled: true,
          mealReminders: true,
          scanReminders: true,
          weeklyReports: true,
        },
      },
      privacy: {
        dataSharing: false,
        analytics: false,
        crashReporting: false,
      },
      sync: {
        enabled: false,
        lastSync: null,
      },
      scanning: {
        autoScan: false,
        hapticFeedback: true,
        soundEffects: true,
        flashOnScan: false,
        showDetailedAnalysis: true,
        includeAlternatives: true,
        cacheResults: true,
        offlineMode: false,
      },
      advanced: {
        debugMode: false,
        experimentalFeatures: false,
        analyticsEnabled: false,
        crashReporting: false,
        performanceMonitoring: false,
        logLevel: 'info',
      },
    };
  }

  private notifyListeners(): void {
    if (this.settings) {
      this.listeners.forEach(listener => listener(this.settings!));
    }
  }

  cleanup(): void {
    logger.info('UserSettingsService cleaned up', 'UserSettingsService');
  }
}

export default UserSettingsService;
