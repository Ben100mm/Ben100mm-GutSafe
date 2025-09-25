/**
 * @fileoverview haptics.web.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Web implementation of expo-haptics
export const HapticFeedback = {
  setEnabled: (enabled) => {
    console.log('Haptic feedback enabled:', enabled);
  },
  impact: (style) => {
    console.log('Haptic impact:', style);
  },
  notification: (type) => {
    console.log('Haptic notification:', type);
  },
  selection: () => {
    console.log('Haptic selection');
  },
};
