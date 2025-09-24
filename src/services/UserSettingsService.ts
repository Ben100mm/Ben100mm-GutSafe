import { GutCondition, SeverityLevel, GutProfile } from '../types';

// User Settings Types
export interface UserSettings {
  // Profile Settings
  profile: {
    name?: string;
    email?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    gutProfile: GutProfile;
  };
  
  // App Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    units: 'metric' | 'imperial';
    notifications: {
      enabled: boolean;
      mealReminders: boolean;
      newSafeFoods: boolean;
      weeklyReports: boolean;
      scanReminders: boolean;
    };
    haptics: {
      enabled: boolean;
      intensity: 'light' | 'medium' | 'strong';
    };
    accessibility: {
      voiceOver: boolean;
      largeText: boolean;
      highContrast: boolean;
      reducedMotion: boolean;
    };
  };
  
  // Scanning Preferences
  scanning: {
    autoAnalyze: boolean;
    showDetailedAnalysis: boolean;
    includeAlternatives: boolean;
    cacheResults: boolean;
    offlineMode: boolean;
  };
  
  // Privacy Settings
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReporting: boolean;
    personalizedAds: boolean;
  };
  
  // Advanced Settings
  advanced: {
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    apiTimeout: number;
    cacheSize: number;
    autoUpdate: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastBackup?: Date;
}

// Default Settings
const DEFAULT_SETTINGS: UserSettings = {
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
      newSafeFoods: true,
      weeklyReports: true,
      scanReminders: false,
    },
    haptics: {
      enabled: true,
      intensity: 'medium',
    },
    accessibility: {
      voiceOver: false,
      largeText: false,
      highContrast: false,
      reducedMotion: false,
    },
  },
  scanning: {
    autoAnalyze: true,
    showDetailedAnalysis: true,
    includeAlternatives: true,
    cacheResults: true,
    offlineMode: false,
  },
  privacy: {
    dataSharing: false,
    analytics: true,
    crashReporting: true,
    personalizedAds: false,
  },
  advanced: {
    debugMode: false,
    logLevel: 'warn',
    apiTimeout: 10000,
    cacheSize: 100,
    autoUpdate: true,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class UserSettingsService {
  private static instance: UserSettingsService;
  private settings: UserSettings = DEFAULT_SETTINGS;
  private listeners: Set<(settings: UserSettings) => void> = new Set();

  static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  // Initialize settings from storage
  async initialize(): Promise<void> {
    try {
      const storedSettings = await this.loadFromStorage();
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...storedSettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default settings
    }
  }

  // Get current settings
  getSettings(): UserSettings {
    return { ...this.settings };
  }

  // Update settings
  async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    try {
      this.settings = {
        ...this.settings,
        ...updates,
        updatedAt: new Date(),
      };
      
      await this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  // Update specific section
  async updateSection<K extends keyof UserSettings>(
    section: K,
    updates: Partial<UserSettings[K]>
  ): Promise<void> {
    await this.updateSettings({
      [section]: {
        ...this.settings[section],
        ...updates,
      },
    });
  }

  // Update gut profile
  async updateGutProfile(gutProfile: Partial<GutProfile>): Promise<void> {
    await this.updateSection('profile', {
      gutProfile: {
        ...this.settings.profile.gutProfile,
        ...gutProfile,
        updatedAt: new Date(),
      },
    });
  }

  // Update preferences
  async updatePreferences(preferences: Partial<UserSettings['preferences']>): Promise<void> {
    await this.updateSection('preferences', preferences);
  }

  // Update scanning settings
  async updateScanningSettings(scanning: Partial<UserSettings['scanning']>): Promise<void> {
    await this.updateSection('scanning', scanning);
  }

  // Update privacy settings
  async updatePrivacySettings(privacy: Partial<UserSettings['privacy']>): Promise<void> {
    await this.updateSection('privacy', privacy);
  }

  // Update advanced settings
  async updateAdvancedSettings(advanced: Partial<UserSettings['advanced']>): Promise<void> {
    await this.updateSection('advanced', advanced);
  }

  // Reset settings to default
  async resetSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };
    await this.saveToStorage();
    this.notifyListeners();
  }

  // Export settings
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings
  async importSettings(settingsJson: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate imported settings
      const validatedSettings = this.validateSettings(importedSettings);
      
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...validatedSettings,
        updatedAt: new Date(),
      };
      
      await this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  // Validate settings
  private validateSettings(settings: any): Partial<UserSettings> {
    const validated: Partial<UserSettings> = {};
    
    // Validate profile
    if (settings.profile && typeof settings.profile === 'object') {
      validated.profile = {
        name: typeof settings.profile.name === 'string' ? settings.profile.name : undefined,
        email: typeof settings.profile.email === 'string' ? settings.profile.email : undefined,
        age: typeof settings.profile.age === 'number' ? settings.profile.age : undefined,
        gender: ['male', 'female', 'other', 'prefer-not-to-say'].includes(settings.profile.gender) 
          ? settings.profile.gender : undefined,
        gutProfile: this.validateGutProfile(settings.profile.gutProfile),
      };
    }
    
    // Validate preferences
    if (settings.preferences && typeof settings.preferences === 'object') {
      validated.preferences = {
        theme: ['light', 'dark', 'system'].includes(settings.preferences.theme) 
          ? settings.preferences.theme : 'system',
        language: typeof settings.preferences.language === 'string' 
          ? settings.preferences.language : 'en',
        units: ['metric', 'imperial'].includes(settings.preferences.units) 
          ? settings.preferences.units : 'metric',
        notifications: this.validateNotifications(settings.preferences.notifications),
        haptics: this.validateHaptics(settings.preferences.haptics),
        accessibility: this.validateAccessibility(settings.preferences.accessibility),
      };
    }
    
    // Validate scanning
    if (settings.scanning && typeof settings.scanning === 'object') {
      validated.scanning = {
        autoAnalyze: typeof settings.scanning.autoAnalyze === 'boolean' 
          ? settings.scanning.autoAnalyze : true,
        showDetailedAnalysis: typeof settings.scanning.showDetailedAnalysis === 'boolean' 
          ? settings.scanning.showDetailedAnalysis : true,
        includeAlternatives: typeof settings.scanning.includeAlternatives === 'boolean' 
          ? settings.scanning.includeAlternatives : true,
        cacheResults: typeof settings.scanning.cacheResults === 'boolean' 
          ? settings.scanning.cacheResults : true,
        offlineMode: typeof settings.scanning.offlineMode === 'boolean' 
          ? settings.scanning.offlineMode : false,
      };
    }
    
    // Validate privacy
    if (settings.privacy && typeof settings.privacy === 'object') {
      validated.privacy = {
        dataSharing: typeof settings.privacy.dataSharing === 'boolean' 
          ? settings.privacy.dataSharing : false,
        analytics: typeof settings.privacy.analytics === 'boolean' 
          ? settings.privacy.analytics : true,
        crashReporting: typeof settings.privacy.crashReporting === 'boolean' 
          ? settings.privacy.crashReporting : true,
        personalizedAds: typeof settings.privacy.personalizedAds === 'boolean' 
          ? settings.privacy.personalizedAds : false,
      };
    }
    
    // Validate advanced
    if (settings.advanced && typeof settings.advanced === 'object') {
      validated.advanced = {
        debugMode: typeof settings.advanced.debugMode === 'boolean' 
          ? settings.advanced.debugMode : false,
        logLevel: ['error', 'warn', 'info', 'debug'].includes(settings.advanced.logLevel) 
          ? settings.advanced.logLevel : 'warn',
        apiTimeout: typeof settings.advanced.apiTimeout === 'number' 
          ? Math.max(1000, Math.min(60000, settings.advanced.apiTimeout)) : 10000,
        cacheSize: typeof settings.advanced.cacheSize === 'number' 
          ? Math.max(10, Math.min(1000, settings.advanced.cacheSize)) : 100,
        autoUpdate: typeof settings.advanced.autoUpdate === 'boolean' 
          ? settings.advanced.autoUpdate : true,
      };
    }
    
    return validated;
  }

  // Validate gut profile
  private validateGutProfile(gutProfile: any): GutProfile {
    if (!gutProfile || typeof gutProfile !== 'object') {
      return DEFAULT_SETTINGS.profile.gutProfile;
    }
    
    const validatedConditions: any = {};
    const defaultConditions = DEFAULT_SETTINGS.profile.gutProfile.conditions;
    
    for (const [condition, config] of Object.entries(defaultConditions)) {
      if (gutProfile.conditions && gutProfile.conditions[condition]) {
        const conditionConfig = gutProfile.conditions[condition];
        validatedConditions[condition] = {
          enabled: typeof conditionConfig.enabled === 'boolean' ? conditionConfig.enabled : false,
          severity: ['mild', 'moderate', 'severe'].includes(conditionConfig.severity) 
            ? conditionConfig.severity : 'mild',
          knownTriggers: Array.isArray(conditionConfig.knownTriggers) 
            ? conditionConfig.knownTriggers.filter((t: any) => typeof t === 'string')
            : [],
        };
      } else {
        validatedConditions[condition] = config;
      }
    }
    
    return {
      id: typeof gutProfile.id === 'string' ? gutProfile.id : 'default',
      conditions: validatedConditions,
      preferences: {
        dietaryRestrictions: Array.isArray(gutProfile.preferences?.dietaryRestrictions) 
          ? gutProfile.preferences.dietaryRestrictions.filter((r: any) => typeof r === 'string')
          : [],
        preferredAlternatives: Array.isArray(gutProfile.preferences?.preferredAlternatives) 
          ? gutProfile.preferences.preferredAlternatives.filter((a: any) => typeof a === 'string')
          : [],
      },
      createdAt: gutProfile.createdAt ? new Date(gutProfile.createdAt) : new Date(),
      updatedAt: new Date(),
    };
  }

  // Validate notifications
  private validateNotifications(notifications: any): UserSettings['preferences']['notifications'] {
    if (!notifications || typeof notifications !== 'object') {
      return DEFAULT_SETTINGS.preferences.notifications;
    }
    
    return {
      enabled: typeof notifications.enabled === 'boolean' ? notifications.enabled : true,
      mealReminders: typeof notifications.mealReminders === 'boolean' ? notifications.mealReminders : true,
      newSafeFoods: typeof notifications.newSafeFoods === 'boolean' ? notifications.newSafeFoods : true,
      weeklyReports: typeof notifications.weeklyReports === 'boolean' ? notifications.weeklyReports : true,
      scanReminders: typeof notifications.scanReminders === 'boolean' ? notifications.scanReminders : false,
    };
  }

  // Validate haptics
  private validateHaptics(haptics: any): UserSettings['preferences']['haptics'] {
    if (!haptics || typeof haptics !== 'object') {
      return DEFAULT_SETTINGS.preferences.haptics;
    }
    
    return {
      enabled: typeof haptics.enabled === 'boolean' ? haptics.enabled : true,
      intensity: ['light', 'medium', 'strong'].includes(haptics.intensity) 
        ? haptics.intensity : 'medium',
    };
  }

  // Validate accessibility
  private validateAccessibility(accessibility: any): UserSettings['preferences']['accessibility'] {
    if (!accessibility || typeof accessibility !== 'object') {
      return DEFAULT_SETTINGS.preferences.accessibility;
    }
    
    return {
      voiceOver: typeof accessibility.voiceOver === 'boolean' ? accessibility.voiceOver : false,
      largeText: typeof accessibility.largeText === 'boolean' ? accessibility.largeText : false,
      highContrast: typeof accessibility.highContrast === 'boolean' ? accessibility.highContrast : false,
      reducedMotion: typeof accessibility.reducedMotion === 'boolean' ? accessibility.reducedMotion : false,
    };
  }

  // Add settings listener
  addListener(listener: (settings: UserSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.settings);
      } catch (error) {
        console.error('Settings listener error:', error);
      }
    });
  }

  // Load from storage (localStorage for web)
  private async loadFromStorage(): Promise<UserSettings | null> {
    try {
      const stored = localStorage.getItem('gutsafe_user_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
    }
    return null;
  }

  // Save to storage
  private async saveToStorage(): Promise<void> {
    try {
      localStorage.setItem('gutsafe_user_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
      throw error;
    }
  }

  // Get specific setting value
  getSettingValue<K extends keyof UserSettings>(
    section: K,
    key: keyof UserSettings[K]
  ): any {
    return this.settings[section][key];
  }

  // Set specific setting value
  async setSettingValue<K extends keyof UserSettings>(
    section: K,
    key: keyof UserSettings[K],
    value: any
  ): Promise<void> {
    await this.updateSection(section, { [key]: value } as any);
  }

  // Check if user has completed onboarding
  hasCompletedOnboarding(): boolean {
    const enabledConditions = Object.values(this.settings.profile.gutProfile.conditions)
      .filter(condition => condition.enabled);
    return enabledConditions.length > 0;
  }

  // Get user's enabled conditions
  getEnabledConditions(): GutCondition[] {
    return Object.entries(this.settings.profile.gutProfile.conditions)
      .filter(([_, condition]) => condition.enabled)
      .map(([condition, _]) => condition as GutCondition);
  }

  // Get user's known triggers
  getKnownTriggers(): { [key: string]: string[] } {
    const triggers: { [key: string]: string[] } = {};
    Object.entries(this.settings.profile.gutProfile.conditions).forEach(([condition, config]) => {
      if (config.enabled && config.knownTriggers.length > 0) {
        triggers[condition] = config.knownTriggers;
      }
    });
    return triggers;
  }

  // Get dietary restrictions
  getDietaryRestrictions(): string[] {
    return this.settings.profile.gutProfile.preferences.dietaryRestrictions;
  }

  // Get preferred alternatives
  getPreferredAlternatives(): string[] {
    return this.settings.profile.gutProfile.preferences.preferredAlternatives;
  }

  // Check if notifications are enabled
  areNotificationsEnabled(): boolean {
    return this.settings.preferences.notifications.enabled;
  }

  // Check if specific notification is enabled
  isNotificationEnabled(type: keyof UserSettings['preferences']['notifications']): boolean {
    return this.settings.preferences.notifications.enabled && 
           this.settings.preferences.notifications[type];
  }

  // Get theme preference
  getTheme(): 'light' | 'dark' | 'system' {
    return this.settings.preferences.theme;
  }

  // Get language preference
  getLanguage(): string {
    return this.settings.preferences.language;
  }

  // Get units preference
  getUnits(): 'metric' | 'imperial' {
    return this.settings.preferences.units;
  }

  // Check if haptics are enabled
  areHapticsEnabled(): boolean {
    return this.settings.preferences.haptics.enabled;
  }

  // Get haptic intensity
  getHapticIntensity(): 'light' | 'medium' | 'strong' {
    return this.settings.preferences.haptics.intensity;
  }

  // Check accessibility features
  isAccessibilityFeatureEnabled(feature: keyof UserSettings['preferences']['accessibility']): boolean {
    return this.settings.preferences.accessibility[feature];
  }

  // Get scanning preferences
  getScanningPreferences(): UserSettings['scanning'] {
    return { ...this.settings.scanning };
  }

  // Get privacy preferences
  getPrivacyPreferences(): UserSettings['privacy'] {
    return { ...this.settings.privacy };
  }

  // Get advanced preferences
  getAdvancedPreferences(): UserSettings['advanced'] {
    return { ...this.settings.advanced };
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem('gutsafe_user_settings');
      this.settings = { ...DEFAULT_SETTINGS };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw error;
    }
  }

  // Backup settings
  async backupSettings(): Promise<string> {
    const backup = {
      settings: this.settings,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    
    await this.updateSection('profile', {
      lastBackup: new Date(),
    });
    
    return JSON.stringify(backup, null, 2);
  }

  // Restore from backup
  async restoreFromBackup(backupJson: string): Promise<void> {
    try {
      const backup = JSON.parse(backupJson);
      
      if (!backup.settings || !backup.timestamp) {
        throw new Error('Invalid backup format');
      }
      
      const validatedSettings = this.validateSettings(backup.settings);
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...validatedSettings,
        updatedAt: new Date(),
      };
      
      await this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error('Invalid backup format');
    }
  }
}

// Export singleton instance
export const userSettingsService = UserSettingsService.getInstance();
