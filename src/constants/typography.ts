// GutSafe Design System - Typography
import { Platform } from 'react-native';

export const Typography = {
  // Font Families
  fontFamily: {
    regular: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'Inter-Medium',
      android: 'Inter-Medium',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'Inter-Bold',
      android: 'Inter-Bold',
      default: 'System',
    }),
  },

  // Font Sizes
  fontSize: {
    h1: 32,
    h2: 24,
    h3: 20,
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
