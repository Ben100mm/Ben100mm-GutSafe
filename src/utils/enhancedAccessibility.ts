/**
 * @fileoverview enhancedAccessibility.ts - Enhanced Accessibility System
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { responsiveDesign } from './responsiveDesign';
import { logger } from './logger';

export interface EnhancedAccessibilityConfig {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: {
    nativeEvent: { actionName: string };
  }) => void;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  testID?: string;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

export interface AccessibilityFeatures {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  isLargeTextEnabled: boolean;
  isVoiceControlEnabled: boolean;
  isSwitchControlEnabled: boolean;
  fontSizeScale: number;
  colorScheme: 'light' | 'dark' | 'auto';
}

class EnhancedAccessibilitySystem {
  private static instance: EnhancedAccessibilitySystem;
  private features: AccessibilityFeatures;
  private listeners: Array<(features: AccessibilityFeatures) => void> = [];
  private isInitialized = false;

  private constructor() {
    this.features = {
      isScreenReaderEnabled: false,
      isReduceMotionEnabled: false,
      isHighContrastEnabled: false,
      isLargeTextEnabled: false,
      isVoiceControlEnabled: false,
      isSwitchControlEnabled: false,
      fontSizeScale: 1.0,
      colorScheme: 'auto',
    };
  }

  public static getInstance(): EnhancedAccessibilitySystem {
    if (!EnhancedAccessibilitySystem.instance) {
      EnhancedAccessibilitySystem.instance = new EnhancedAccessibilitySystem();
    }
    return EnhancedAccessibilitySystem.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.detectAccessibilityFeatures();
      this.setupListeners();
      this.isInitialized = true;
      logger.info('Enhanced accessibility system initialized', 'Accessibility');
    } catch (error) {
      logger.error('Failed to initialize accessibility system', 'Accessibility', error);
    }
  }

  private async detectAccessibilityFeatures(): Promise<void> {
    try {
      // Screen reader detection
      if (Platform.OS !== 'web') {
        this.features.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      }

      // Reduce motion detection
      if (Platform.OS !== 'web') {
        this.features.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      }

      // High contrast detection (web only)
      if (Platform.OS === 'web') {
        this.features.isHighContrastEnabled = window.matchMedia('(prefers-contrast: high)').matches;
      }

      // Large text detection
      this.features.isLargeTextEnabled = this.detectLargeText();

      // Voice control detection (iOS only)
      if (Platform.OS === 'ios') {
        this.features.isVoiceControlEnabled = await this.detectVoiceControl();
      }

      // Switch control detection (iOS only)
      if (Platform.OS === 'ios') {
        this.features.isSwitchControlEnabled = await this.detectSwitchControl();
      }

      // Font size scale detection
      this.features.fontSizeScale = this.detectFontSizeScale();

      // Color scheme detection
      this.features.colorScheme = this.detectColorScheme();

      logger.info('Accessibility features detected', 'Accessibility', this.features);
    } catch (error) {
      logger.error('Failed to detect accessibility features', 'Accessibility', error);
    }
  }

  private detectLargeText(): boolean {
    if (Platform.OS === 'web') {
      const fontSize = parseFloat(getComputedStyle(document.body).fontSize);
      return fontSize > 16; // Base font size is typically 16px
    }
    return false;
  }

  private async detectVoiceControl(): Promise<boolean> {
    // This would need to be implemented with native modules
    // For now, return false
    return false;
  }

  private async detectSwitchControl(): Promise<boolean> {
    // This would need to be implemented with native modules
    // For now, return false
    return false;
  }

  private detectFontSizeScale(): number {
    if (Platform.OS === 'web') {
      const fontSize = parseFloat(getComputedStyle(document.body).fontSize);
      return fontSize / 16; // 16px is the base font size
    }
    return 1.0;
  }

  private detectColorScheme(): 'light' | 'dark' | 'auto' {
    if (Platform.OS === 'web') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'auto';
  }

  private setupListeners(): void {
    if (Platform.OS !== 'web') {
      // Screen reader changes
      AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
        this.features.isScreenReaderEnabled = isEnabled;
        this.notifyListeners();
      });

      // Reduce motion changes
      AccessibilityInfo.addEventListener('reduceMotionChanged', (isEnabled) => {
        this.features.isReduceMotionEnabled = isEnabled;
        this.notifyListeners();
      });
    }

    if (Platform.OS === 'web') {
      // High contrast changes
      const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
      highContrastMedia.addEventListener('change', (e) => {
        this.features.isHighContrastEnabled = e.matches;
        this.notifyListeners();
      });

      // Color scheme changes
      const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeMedia.addEventListener('change', (e) => {
        this.features.colorScheme = e.matches ? 'dark' : 'light';
        this.notifyListeners();
      });
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.features));
  }

  public getFeatures(): AccessibilityFeatures {
    return { ...this.features };
  }

  public subscribe(listener: (features: AccessibilityFeatures) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Enhanced accessibility config creation
  public createButtonConfig(
    label: string,
    hint?: string,
    disabled: boolean = false,
    loading: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: label,
      accessibilityHint: hint || 'Double tap to activate',
      accessibilityState: {
        disabled: disabled || loading,
        busy: loading,
      },
      testID: `button-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createInputConfig(
    label: string,
    hint?: string,
    disabled: boolean = false,
    required: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: `${label}${required ? ' (required)' : ''}`,
      accessibilityHint: hint || 'Enter text',
      accessibilityState: {
        disabled,
      },
      testID: `input-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createCardConfig(
    title: string,
    subtitle?: string,
    clickable: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: clickable ? 'button' : 'none',
      accessibilityLabel: subtitle ? `${title}, ${subtitle}` : title,
      accessibilityHint: clickable ? 'Double tap to activate' : undefined,
      testID: `card-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createListConfig(
    label: string,
    itemCount: number
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'list',
      accessibilityLabel: `${label}, ${itemCount} items`,
      testID: `list-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createImageConfig(
    label: string,
    decorative: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: !decorative,
      accessibilityRole: decorative ? 'none' : 'image',
      accessibilityLabel: decorative ? undefined : label,
      testID: `image-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createProgressConfig(
    label: string,
    value: number,
    max: number = 100
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'progressbar',
      accessibilityLabel: label,
      accessibilityValue: {
        min: 0,
        max,
        now: value,
        text: `${Math.round((value / max) * 100)}%`,
      },
      testID: `progress-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createSwitchConfig(
    label: string,
    checked: boolean,
    disabled: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'switch',
      accessibilityLabel: label,
      accessibilityHint: 'Double tap to toggle',
      accessibilityState: {
        disabled,
        checked,
      },
      testID: `switch-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createSliderConfig(
    label: string,
    value: number,
    min: number = 0,
    max: number = 100,
    disabled: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'slider',
      accessibilityLabel: label,
      accessibilityHint: 'Swipe left or right to adjust value',
      accessibilityValue: {
        min,
        max,
        now: value,
        text: value.toString(),
      },
      accessibilityState: {
        disabled,
      },
      testID: `slider-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createTabConfig(
    label: string,
    selected: boolean,
    disabled: boolean = false
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'tab',
      accessibilityLabel: label,
      accessibilityHint: 'Double tap to select',
      accessibilityState: {
        disabled,
        selected,
      },
      testID: `tab-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  public createModalConfig(
    title: string,
    dismissible: boolean = true
  ): EnhancedAccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'dialog',
      accessibilityLabel: title,
      accessibilityHint: dismissible ? 'Double tap outside to dismiss' : undefined,
      accessibilityViewIsModal: true,
      testID: `modal-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  // Accessibility announcements
  public announceForAccessibility(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Web implementation
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }

  // Accessibility testing utilities
  public validateAccessibilityConfig(config: EnhancedAccessibilityConfig): string[] {
    const errors: string[] = [];

    if (!config.accessible && config.accessibilityRole) {
      errors.push('Component has accessibility role but is not accessible');
    }

    if (config.accessible && !config.accessibilityLabel && !config.accessibilityRole) {
      errors.push('Accessible component missing label or role');
    }

    if (config.accessibilityRole === 'button' && !config.accessibilityHint) {
      errors.push('Button missing accessibility hint');
    }

    if (config.accessibilityRole === 'text' && !config.accessibilityLabel) {
      errors.push('Text input missing accessibility label');
    }

    if (config.accessibilityValue && !config.accessibilityLabel) {
      errors.push('Component with value missing accessibility label');
    }

    return errors;
  }

  // Responsive accessibility adjustments
  public getResponsiveAccessibilityConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    const responsiveConfig = responsiveDesign.getConfig();
    
    // Adjust for screen size
    if (responsiveConfig.isTablet || responsiveConfig.isDesktop) {
      return {
        ...baseConfig,
        accessibilityHint: baseConfig.accessibilityHint ? 
          `${baseConfig.accessibilityHint} (Click to activate)` : 
          'Click to activate',
      };
    }
    
    return baseConfig;
  }

  // High contrast adjustments
  public getHighContrastConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    if (this.features.isHighContrastEnabled) {
      return {
        ...baseConfig,
        accessibilityLabel: baseConfig.accessibilityLabel ? 
          `${baseConfig.accessibilityLabel} (High contrast mode)` : 
          undefined,
      };
    }
    
    return baseConfig;
  }

  // Large text adjustments
  public getLargeTextConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    if (this.features.isLargeTextEnabled) {
      return {
        ...baseConfig,
        accessibilityHint: baseConfig.accessibilityHint ? 
          `${baseConfig.accessibilityHint} (Large text mode)` : 
          undefined,
      };
    }
    
    return baseConfig;
  }

  // Screen reader optimizations
  public getScreenReaderConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    if (this.features.isScreenReaderEnabled) {
      return {
        ...baseConfig,
        accessibilityLiveRegion: 'polite',
        importantForAccessibility: 'yes',
      };
    }
    
    return baseConfig;
  }

  // Reduce motion adjustments
  public shouldReduceMotion(): boolean {
    return this.features.isReduceMotionEnabled;
  }

  // Voice control optimizations
  public getVoiceControlConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    if (this.features.isVoiceControlEnabled) {
      return {
        ...baseConfig,
        accessibilityActions: [
          ...(baseConfig.accessibilityActions || []),
          { name: 'activate', label: 'Activate' },
        ],
      };
    }
    
    return baseConfig;
  }

  // Switch control optimizations
  public getSwitchControlConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    if (this.features.isSwitchControlEnabled) {
      return {
        ...baseConfig,
        accessibilityActions: [
          ...(baseConfig.accessibilityActions || []),
          { name: 'select', label: 'Select' },
        ],
      };
    }
    
    return baseConfig;
  }

  // Comprehensive accessibility config
  public getComprehensiveConfig(baseConfig: EnhancedAccessibilityConfig): EnhancedAccessibilityConfig {
    let config = baseConfig;
    
    config = this.getResponsiveAccessibilityConfig(config);
    config = this.getHighContrastConfig(config);
    config = this.getLargeTextConfig(config);
    config = this.getScreenReaderConfig(config);
    config = this.getVoiceControlConfig(config);
    config = this.getSwitchControlConfig(config);
    
    return config;
  }

  // Cleanup
  public destroy(): void {
    this.listeners = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const enhancedAccessibility = EnhancedAccessibilitySystem.getInstance();

// Utility functions for easy access
export const createAccessibilityConfig = (type: string, config: any) => {
  switch (type) {
    case 'button':
      return enhancedAccessibility.createButtonConfig(config.label, config.hint, config.disabled, config.loading);
    case 'input':
      return enhancedAccessibility.createInputConfig(config.label, config.hint, config.disabled, config.required);
    case 'card':
      return enhancedAccessibility.createCardConfig(config.title, config.subtitle, config.clickable);
    case 'list':
      return enhancedAccessibility.createListConfig(config.label, config.itemCount);
    case 'image':
      return enhancedAccessibility.createImageConfig(config.label, config.decorative);
    case 'progress':
      return enhancedAccessibility.createProgressConfig(config.label, config.value, config.max);
    case 'switch':
      return enhancedAccessibility.createSwitchConfig(config.label, config.checked, config.disabled);
    case 'slider':
      return enhancedAccessibility.createSliderConfig(config.label, config.value, config.min, config.max, config.disabled);
    case 'tab':
      return enhancedAccessibility.createTabConfig(config.label, config.selected, config.disabled);
    case 'modal':
      return enhancedAccessibility.createModalConfig(config.title, config.dismissible);
    default:
      return config;
  }
};

export const announceAccessibility = (message: string, priority: 'polite' | 'assertive' = 'polite') => 
  enhancedAccessibility.announceForAccessibility(message, priority);

export const validateAccessibility = (config: EnhancedAccessibilityConfig) => 
  enhancedAccessibility.validateAccessibilityConfig(config);

export const getAccessibilityFeatures = () => 
  enhancedAccessibility.getFeatures();

export const subscribeToAccessibilityChanges = (listener: (features: AccessibilityFeatures) => void) => 
  enhancedAccessibility.subscribe(listener);

export const shouldReduceMotion = () => 
  enhancedAccessibility.shouldReduceMotion();

export const getComprehensiveAccessibilityConfig = (baseConfig: EnhancedAccessibilityConfig) => 
  enhancedAccessibility.getComprehensiveConfig(baseConfig);

export default EnhancedAccessibilitySystem;
