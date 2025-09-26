/**
 * @fileoverview haptics.web.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Web implementation of expo-haptics with Web Vibration API support
class WebHapticFeedback {
  constructor() {
    this.enabled = true;
    this.vibrationSupported = 'vibrate' in navigator;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    console.log('Haptic feedback enabled:', enabled);
  }

  impact(style = 'medium') {
    if (!this.enabled || !this.vibrationSupported) {
      console.log('Haptic impact:', style);
      return;
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };

    navigator.vibrate(patterns[style] ?? patterns.medium);
  }

  notification(type = 'success') {
    if (!this.enabled || !this.vibrationSupported) {
      console.log('Haptic notification:', type);
      return;
    }

    const patterns = {
      success: [10, 50, 10],
      warning: [20, 50, 20],
      error: [30, 50, 30, 50, 30],
    };

    navigator.vibrate(patterns[type] ?? patterns.success);
  }

  selection() {
    if (!this.enabled || !this.vibrationSupported) {
      console.log('Haptic selection');
      return;
    }

    navigator.vibrate([5]);
  }

  // Additional web-specific methods
  buttonPress() {
    this.impact('light');
  }

  longPress() {
    this.impact('heavy');
  }

  // Check if haptics are supported
  isSupported() {
    return this.vibrationSupported;
  }
}

export const HapticFeedback = new WebHapticFeedback();

// Export individual functions for compatibility
export const impactAsync = (style) => HapticFeedback.impact(style);
export const notificationAsync = (type) => HapticFeedback.notification(type);
export const selectionAsync = () => HapticFeedback.selection();
