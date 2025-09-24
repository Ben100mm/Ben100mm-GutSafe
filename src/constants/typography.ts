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

  // Font Sizes
  fontSize: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    title1: 32,
    title2: 24,
    title3: 20,
    body: 16,
    bodySmall: 14,
    label: 12,
    caption: 10,
  },

  // Line Heights
  lineHeight: {
    h1: 40,
    h2: 32,
    h3: 28,
    h4: 24,
    title1: 40,
    title2: 32,
    title3: 28,
    body: 24,
    bodySmall: 20,
    label: 16,
    caption: 14,
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
