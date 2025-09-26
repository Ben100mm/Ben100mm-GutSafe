/**
 * @fileoverview AuthService.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { GutProfile } from '../types';
import type {
  UserSettings,
  AppError,
  ServiceError,
  Result,
} from '../types/comprehensive';
import { logger } from '../utils/logger';
import { validators } from '../utils/validation';

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: AppError | null;
}

/**
 * AuthService - Handles user authentication and settings management
 * Consolidates user management, authentication, and settings functionality
 */
class AuthService {
  private static instance: AuthService;
  private readonly authState: AuthState = {
    isAuthenticated: false,
    user: null,
    settings: null,
    isLoading: false,
    error: null,
  };
  private readonly listeners: Set<(state: AuthState) => void> = new Set();

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize the auth service
   */
  async initialize(): Promise<void> {
    try {
      this.authState.isLoading = true;
      this.notifyListeners();

      // Load saved settings
      await this.loadUserSettings();

      // Check authentication status
      await this.checkAuthStatus();

      this.authState.isLoading = false;
      this.notifyListeners();

      logger.info('AuthService initialized', 'AuthService');
    } catch (error) {
      this.authState.error =
        error instanceof Error
          ? {
              code: 'AUTH_INIT_ERROR',
              message: error.message,
              timestamp: new Date(),
            }
          : {
              code: 'AUTH_INIT_ERROR',
              message: 'Unknown error',
              timestamp: new Date(),
            };
      this.authState.isLoading = false;
      this.notifyListeners();
      logger.error('Failed to initialize AuthService', 'AuthService', error);
    }
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Sign in user
   */
  async signIn(
    email: string,
    _password: string
  ): Promise<Result<void, ServiceError>> {
    try {
      this.authState.isLoading = true;
      this.authState.error = null;
      this.notifyListeners();

      // Mock authentication - replace with real implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.authState.isAuthenticated = true;
      this.authState.user = {
        id: '1',
        email,
        name: email.split('@')[0] || 'User',
      };
      this.authState.isLoading = false;
      this.notifyListeners();

      logger.info('User signed in', 'AuthService', { email });
      return { success: true, data: undefined };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Sign in failed',
        service: 'AuthService',
        operation: 'signIn',
        timestamp: new Date(),
        details: { email, error },
      };

      this.authState.error = serviceError;
      this.authState.isLoading = false;
      this.notifyListeners();

      return { success: false, error: serviceError };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      this.authState.isAuthenticated = false;
      this.authState.user = null;
      this.authState.settings = null;
      this.notifyListeners();

      logger.info('User signed out', 'AuthService');
    } catch (error) {
      logger.error('Failed to sign out', 'AuthService', error);
      throw error;
    }
  }

  /**
   * Get user settings
   */
  getUserSettings(): UserSettings | null {
    return this.authState.settings;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    updates: Partial<UserSettings>
  ): Promise<Result<void, ServiceError>> {
    try {
      if (!this.authState.settings) {
        this.authState.settings = this.getDefaultSettings();
      }

      // Validate the updated settings
      const validatedSettings = validators.userSettings.validate({
        ...this.authState.settings,
        ...updates,
      });

      this.authState.settings = validatedSettings as UserSettings;
      await this.saveUserSettings();
      this.notifyListeners();

      logger.info('User settings updated', 'AuthService', { updates });
      return { success: true, data: undefined };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'SERVICE_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update user settings',
        service: 'AuthService',
        operation: 'updateUserSettings',
        timestamp: new Date(),
        details: { updates, error },
      };

      logger.error('Failed to update user settings', 'AuthService', error);
      return { success: false, error: serviceError };
    }
  }

  /**
   * Update gut profile
   */
  async updateGutProfile(profile: GutProfile): Promise<void> {
    try {
      if (!this.authState.settings) {
        this.authState.settings = this.getDefaultSettings();
      }

      this.authState.settings.profile.gutProfile = profile;
      await this.saveUserSettings();
      this.notifyListeners();

      logger.info('Gut profile updated', 'AuthService', {
        profileId: profile.id,
      });
    } catch (error) {
      logger.error('Failed to update gut profile', 'AuthService', error);
      throw error;
    }
  }

  /**
   * Get default user settings
   */
  private getDefaultSettings(): UserSettings {
    return {
      profile: {
        name: 'User',
        email: '',
        gutProfile: {
          id: 'default',
          conditions: {
            'ibs-fodmap': {
              enabled: false,
              severity: 'mild',
              knownTriggers: [],
            },
            gluten: { enabled: false, severity: 'mild', knownTriggers: [] },
            lactose: { enabled: false, severity: 'mild', knownTriggers: [] },
            reflux: { enabled: false, severity: 'mild', knownTriggers: [] },
            histamine: { enabled: false, severity: 'mild', knownTriggers: [] },
            allergies: { enabled: false, severity: 'mild', knownTriggers: [] },
            additives: { enabled: false, severity: 'mild', knownTriggers: [] },
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
      privacy: {
        dataSharing: false,
        analytics: true,
        crashReporting: true,
        personalizedAds: false,
      },
      sync: {
        enabled: true,
        frequency: 'daily',
      },
    };
  }

  /**
   * Load user settings from storage
   */
  private async loadUserSettings(): Promise<void> {
    try {
      // This would load from actual storage in a real implementation
      // For now, use default settings
      this.authState.settings = this.getDefaultSettings();
    } catch (error) {
      logger.error('Failed to load user settings', 'AuthService', error);
      this.authState.settings = this.getDefaultSettings();
    }
  }

  /**
   * Save user settings to storage
   */
  private async saveUserSettings(): Promise<void> {
    try {
      // This would save to actual storage in a real implementation
      logger.info('User settings saved', 'AuthService');
    } catch (error) {
      logger.error('Failed to save user settings', 'AuthService', error);
      throw error;
    }
  }

  /**
   * Check authentication status
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      // This would check actual auth status in a real implementation
      // For now, assume not authenticated
      this.authState.isAuthenticated = false;
    } catch (error) {
      logger.error('Failed to check auth status', 'AuthService', error);
    }
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.authState });
      } catch (error) {
        logger.error('Error notifying auth listener', 'AuthService', error);
      }
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.listeners.clear();
    logger.info('AuthService cleaned up', 'AuthService');
  }
}

export default AuthService;
