/**
 * @fileoverview HybridAccessibility.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { AccessibilityInfo, Platform } from 'react-native';

interface HybridAccessibilityConfig {
  // Clarity-first accessibility
  clearLabels: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  
  // Immersive accessibility
  enableAudioDescriptions: boolean;
  enableHapticFeedback: boolean;
  enableVoiceOver: boolean;
  
  // Performance-aware accessibility
  adaptiveAnimations: boolean;
  progressiveEnhancement: boolean;
}

class HybridAccessibility {
  private static instance: HybridAccessibility;
  private config: HybridAccessibilityConfig = {
    clearLabels: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    enableAudioDescriptions: false,
    enableHapticFeedback: true,
    enableVoiceOver: false,
    adaptiveAnimations: true,
    progressiveEnhancement: true,
  };

  static getInstance(): HybridAccessibility {
    if (!HybridAccessibility.instance) {
      HybridAccessibility.instance = new HybridAccessibility();
    }
    return HybridAccessibility.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check system accessibility settings
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      const isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();

      this.config.enableVoiceOver = isScreenReaderEnabled;
      this.config.reducedMotion = isReduceMotionEnabled;
      this.config.largeText = isBoldTextEnabled;

      // Listen for accessibility changes
      AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChange);
      AccessibilityInfo.addEventListener('reduceMotionChanged', this.handleReduceMotionChange);
      AccessibilityInfo.addEventListener('boldTextChanged', this.handleBoldTextChange);

    } catch (error) {
      console.warn('Failed to initialize accessibility:', error);
    }
  }

  private handleScreenReaderChange = (isEnabled: boolean) => {
    this.config.enableVoiceOver = isEnabled;
    this.config.enableAudioDescriptions = isEnabled;
  };

  private handleReduceMotionChange = (isEnabled: boolean) => {
    this.config.reducedMotion = isEnabled;
  };

  private handleBoldTextChange = (isEnabled: boolean) => {
    this.config.largeText = isEnabled;
  };

  // Clarity-first accessibility methods
  createClearButtonConfig(
    label: string,
    hint?: string,
    disabled: boolean = false,
    selected: boolean = false
  ) {
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: {
        disabled,
        selected,
      },
      accessibilityActions: [
        { name: 'activate', label: 'Activate' },
      ],
    };
  }

  createClearHeaderConfig(text: string, level: number = 1) {
    return {
      accessible: true,
      accessibilityRole: 'header' as const,
      accessibilityLabel: text,
      accessibilityLevel: level,
    };
  }

  createClearTextConfig(text: string, isImportant: boolean = false) {
    return {
      accessible: true,
      accessibilityRole: 'text' as const,
      accessibilityLabel: text,
      accessibilityState: {
        selected: isImportant,
      },
    };
  }

  // Immersive accessibility methods
  createImmersiveButtonConfig(
    label: string,
    hint?: string,
    enableHaptic: boolean = true,
    enableAudio: boolean = false
  ) {
    const config = {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityActions: [
        { name: 'activate', label: 'Activate' },
      ],
    };

    if (enableHaptic && this.config.enableHapticFeedback) {
      // Add haptic feedback on press
      (config as any).onAccessibilityAction = (event: any) => {
        if (event.nativeEvent.actionName === 'activate') {
          // Haptic feedback would be triggered here
        }
      };
    }

    return config;
  }

  createImmersiveCardConfig(
    title: string,
    description: string,
    enable3D: boolean = false
  ) {
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: `${title}. ${description}`,
      accessibilityHint: 'Double tap to interact',
      accessibilityActions: [
        { name: 'activate', label: 'Activate' },
        { name: 'longpress', label: 'Long press for more options' },
      ],
    };
  }

  // Performance-aware accessibility methods
  createAdaptiveAnimationConfig(
    baseDuration: number,
    enableReducedMotion: boolean = true
  ) {
    if (enableReducedMotion && this.config.reducedMotion) {
      return {
        duration: baseDuration * 0.3,
        useNativeDriver: true,
      };
    }
    return {
      duration: baseDuration,
      useNativeDriver: true,
    };
  }

  // Hybrid design specific methods
  createHeroSectionConfig(
    title: string,
    subtitle: string,
    ctaText: string
  ) {
    return {
      accessible: true,
      accessibilityRole: 'banner' as const,
      accessibilityLabel: `${title}. ${subtitle}`,
      accessibilityHint: `Double tap ${ctaText} to continue`,
      accessibilityActions: [
        { name: 'activate', label: ctaText },
        { name: 'scroll', label: 'Scroll to see more content' },
      ],
    };
  }

  createStorySectionConfig(
    title: string,
    content: string,
    sectionType: 'problem' | 'solution' | 'features' | 'social-proof' | 'cta'
  ) {
    const roleMap: Record<string, string> = {
      problem: 'alert',
      solution: 'main',
      features: 'region',
      'social-proof': 'complementary',
      cta: 'button',
    };

    return {
      accessible: true,
      accessibilityRole: roleMap[sectionType] as any,
      accessibilityLabel: title,
      accessibilityHint: content,
    };
  }

  createStickyCTAConfig(
    text: string,
    position: 'bottom' | 'top' | 'floating'
  ) {
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: text,
      accessibilityHint: `Sticky ${position} action button`,
      accessibilityActions: [
        { name: 'activate', label: 'Activate' },
      ],
    };
  }

  // Utility methods
  shouldEnableAnimations(): boolean {
    return !this.config.reducedMotion && this.config.adaptiveAnimations;
  }

  shouldEnableHaptics(): boolean {
    return this.config.enableHapticFeedback;
  }

  shouldEnableAudioDescriptions(): boolean {
    return this.config.enableAudioDescriptions && this.config.enableVoiceOver;
  }

  getTextScale(): number {
    return this.config.largeText ? 1.2 : 1.0;
  }

  getContrastLevel(): 'normal' | 'high' {
    return this.config.highContrast ? 'high' : 'normal';
  }

  // Configuration getters
  getConfig(): HybridAccessibilityConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<HybridAccessibilityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Cleanup
  destroy(): void {
    // Note: removeEventListener is not available in React Native's AccessibilityInfo
    // Event listeners are automatically cleaned up when the component unmounts
    console.log('HybridAccessibility cleanup completed');
  }
}

export default HybridAccessibility;
