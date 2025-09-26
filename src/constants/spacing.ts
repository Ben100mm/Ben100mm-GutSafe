/**
 * @fileoverview spacing.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform } from 'react-native';

// GutSafe Design System - Spacing (8-point system)
export const Spacing = {
  xs: 4, // 0.5 * 8
  sm: 8, // 1 * 8
  md: 16, // 2 * 8
  lg: 24, // 3 * 8
  xl: 32, // 4 * 8
  xxl: 40, // 5 * 8
  xxxl: 48, // 6 * 8
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  sm:
    Platform.OS === 'web'
      ? {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
  md:
    Platform.OS === 'web'
      ? {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
  lg:
    Platform.OS === 'web'
      ? {
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        },
} as const;

export type SpacingKey = keyof typeof Spacing;
