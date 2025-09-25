/**
 * @fileoverview typography.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// GutSafe Design System - Typography (Apple Health App Style)
import { Platform } from 'react-native';

export const Typography = {
  // Font Families - SF Pro (Apple System Font)
  fontFamily: {
    regular: Platform.select({
      ios: 'SF Pro Display',
      android: 'SF Pro Display',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'SF Pro Display',
      android: 'SF Pro Display',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'SF Pro Display',
      android: 'SF Pro Display',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'SF Pro Display',
      android: 'SF Pro Display',
      default: 'System',
    }),
  },

  // Font Sizes - Hybrid Design System
  fontSize: {
    // Hero/Display sizes for immersive sections
    display: 48,
    hero: 40,
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    // Body text with clear hierarchy
    title1: 32,
    title2: 28,
    title3: 24,
    body: 16,
    bodySmall: 14,
    bodyLarge: 18,
    // UI elements
    label: 12,
    caption: 10,
    button: 16,
    tab: 14,
  },

  // Line Heights - Optimized for clarity and readability
  lineHeight: {
    display: 56,
    hero: 48,
    h1: 40,
    h2: 36,
    h3: 32,
    h4: 28,
    h5: 24,
    title1: 40,
    title2: 36,
    title3: 32,
    body: 24,
    bodySmall: 20,
    bodyLarge: 26,
    label: 16,
    caption: 14,
    button: 20,
    tab: 18,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
} as const;

export type TypographyKey = keyof typeof Typography;
