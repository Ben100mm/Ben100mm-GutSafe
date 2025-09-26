/**
 * @fileoverview unifiedStyling.ts - Unified Styling System for Consistent UI
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { StyleSheet, Platform, useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { responsiveDesign } from './responsiveDesign';

// Unified style variants
export type StyleVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

interface UnifiedStyleConfig {
  variant: StyleVariant;
  size: ComponentSize;
  state: ComponentState;
  isDark: boolean;
  responsive: boolean;
}

class UnifiedStylingSystem {
  private static instance: UnifiedStylingSystem;
  private colorScheme: 'light' | 'dark' = 'light';

  private constructor() {}

  public static getInstance(): UnifiedStylingSystem {
    if (!UnifiedStylingSystem.instance) {
      UnifiedStylingSystem.instance = new UnifiedStylingSystem();
    }
    return UnifiedStylingSystem.instance;
  }

  public setColorScheme(scheme: 'light' | 'dark'): void {
    this.colorScheme = scheme;
  }

  private getColors() {
    return this.colorScheme === 'dark' ? Colors.dark : Colors.light;
  }

  // Unified Button Styles
  public getButtonStyles(config: UnifiedStyleConfig) {
    const colors = this.getColors();
    const { variant, size, state, responsive } = config;
    
    const baseStyle = {
      borderRadius: responsive ? responsiveDesign.getBorderRadius(BorderRadius.md) : BorderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    };

    // Size-based styles
    const sizeStyles = {
      xs: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.xs) : Spacing.xs,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() - 8 : 32,
      },
      sm: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() - 4 : 36,
      },
      md: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() : 48,
      },
      lg: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() + 8 : 56,
      },
      xl: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.xxl) : Spacing.xxl,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() + 16 : 64,
      },
    };

    // Variant-based styles
    const variantStyles = {
      primary: {
        backgroundColor: state === 'disabled' ? colors.border : Colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      tertiary: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      success: {
        backgroundColor: state === 'disabled' ? colors.border : Colors.safe,
        borderWidth: 0,
      },
      warning: {
        backgroundColor: state === 'disabled' ? colors.border : Colors.caution,
        borderWidth: 0,
      },
      error: {
        backgroundColor: state === 'disabled' ? colors.border : Colors.avoid,
        borderWidth: 0,
      },
      info: {
        backgroundColor: state === 'disabled' ? colors.border : Colors.primaryLight,
        borderWidth: 0,
      },
    };

    // State-based styles
    const stateStyles = {
      default: {},
      hover: {
        opacity: 0.9,
      },
      active: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
      },
      disabled: {
        opacity: 0.5,
      },
      loading: {
        opacity: 0.8,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[state],
    };
  }

  // Unified Text Styles
  public getTextStyles(config: UnifiedStyleConfig) {
    const colors = this.getColors();
    const { variant, size, state, responsive } = config;
    
    const baseStyle = {
      fontFamily: Typography.fontFamily.regular,
      textAlign: 'left' as const,
    };

    // Size-based styles
    const sizeStyles = {
      xs: {
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.caption) : Typography.fontSize.caption,
        lineHeight: responsive ? responsiveDesign.getFontSize(Typography.lineHeight.caption) : Typography.lineHeight.caption,
      },
      sm: {
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.bodySmall) : Typography.fontSize.bodySmall,
        lineHeight: responsive ? responsiveDesign.getFontSize(Typography.lineHeight.bodySmall) : Typography.lineHeight.bodySmall,
      },
      md: {
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.body) : Typography.fontSize.body,
        lineHeight: responsive ? responsiveDesign.getFontSize(Typography.lineHeight.body) : Typography.lineHeight.body,
      },
      lg: {
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.h4) : Typography.fontSize.h4,
        lineHeight: responsive ? responsiveDesign.getFontSize(Typography.lineHeight.h4) : Typography.lineHeight.h4,
      },
      xl: {
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.h3) : Typography.fontSize.h3,
        lineHeight: responsive ? responsiveDesign.getFontSize(Typography.lineHeight.h3) : Typography.lineHeight.h3,
      },
    };

    // Variant-based styles
    const variantStyles = {
      primary: {
        color: colors.text,
        fontWeight: Typography.fontWeight.medium,
      },
      secondary: {
        color: colors.textSecondary,
        fontWeight: Typography.fontWeight.regular,
      },
      tertiary: {
        color: colors.textTertiary,
        fontWeight: Typography.fontWeight.regular,
      },
      success: {
        color: Colors.safe,
        fontWeight: Typography.fontWeight.medium,
      },
      warning: {
        color: Colors.caution,
        fontWeight: Typography.fontWeight.medium,
      },
      error: {
        color: Colors.avoid,
        fontWeight: Typography.fontWeight.medium,
      },
      info: {
        color: Colors.primaryLight,
        fontWeight: Typography.fontWeight.medium,
      },
    };

    // State-based styles
    const stateStyles = {
      default: {},
      hover: {
        opacity: 0.8,
      },
      active: {
        opacity: 0.7,
      },
      disabled: {
        opacity: 0.5,
      },
      loading: {
        opacity: 0.7,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[state],
    };
  }

  // Unified Card Styles
  public getCardStyles(config: UnifiedStyleConfig) {
    const colors = this.getColors();
    const { variant, size, state, responsive } = config;
    
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: responsive ? responsiveDesign.getBorderRadius(BorderRadius.lg) : BorderRadius.lg,
      ...(responsive ? responsiveDesign.getShadow() : Shadows.md),
    };

    // Size-based styles
    const sizeStyles = {
      xs: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
        margin: responsive ? responsiveDesign.getSpacing(Spacing.xs) : Spacing.xs,
      },
      sm: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
        margin: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
      },
      md: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
        margin: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
      },
      lg: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
        margin: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
      },
      xl: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.xxl) : Spacing.xxl,
        margin: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
      },
    };

    // Variant-based styles
    const variantStyles = {
      primary: {
        borderWidth: 1,
        borderColor: Colors.primary,
      },
      secondary: {
        borderWidth: 1,
        borderColor: colors.border,
      },
      tertiary: {
        borderWidth: 0,
      },
      success: {
        borderWidth: 1,
        borderColor: Colors.safe,
      },
      warning: {
        borderWidth: 1,
        borderColor: Colors.caution,
      },
      error: {
        borderWidth: 1,
        borderColor: Colors.avoid,
      },
      info: {
        borderWidth: 1,
        borderColor: Colors.primaryLight,
      },
    };

    // State-based styles
    const stateStyles = {
      default: {},
      hover: {
        transform: [{ translateY: -2 }],
        ...(responsive ? responsiveDesign.getShadow() : Shadows.lg),
      },
      active: {
        transform: [{ scale: 0.98 }],
      },
      disabled: {
        opacity: 0.5,
      },
      loading: {
        opacity: 0.8,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[state],
    };
  }

  // Unified Input Styles
  public getInputStyles(config: UnifiedStyleConfig) {
    const colors = this.getColors();
    const { variant, size, state, responsive } = config;
    
    const baseStyle = {
      borderWidth: 1,
      borderRadius: responsive ? responsiveDesign.getBorderRadius(BorderRadius.md) : BorderRadius.md,
      backgroundColor: colors.surface,
      color: colors.text,
      fontFamily: Typography.fontFamily.regular,
    };

    // Size-based styles
    const sizeStyles = {
      xs: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.xs) : Spacing.xs,
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.bodySmall) : Typography.fontSize.bodySmall,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() - 8 : 32,
      },
      sm: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.body) : Typography.fontSize.body,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() - 4 : 36,
      },
      md: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.body) : Typography.fontSize.body,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() : 48,
      },
      lg: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.bodyLarge) : Typography.fontSize.bodyLarge,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() + 8 : 56,
      },
      xl: {
        paddingHorizontal: responsive ? responsiveDesign.getSpacing(Spacing.xxl) : Spacing.xxl,
        paddingVertical: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
        fontSize: responsive ? responsiveDesign.getFontSize(Typography.fontSize.h4) : Typography.fontSize.h4,
        minHeight: responsive ? responsiveDesign.getTouchTargetSize() + 16 : 64,
      },
    };

    // Variant-based styles
    const variantStyles = {
      primary: {
        borderColor: state === 'active' ? Colors.primary : colors.border,
      },
      secondary: {
        borderColor: state === 'active' ? colors.textSecondary : colors.border,
      },
      tertiary: {
        borderColor: state === 'active' ? colors.textTertiary : colors.border,
      },
      success: {
        borderColor: state === 'active' ? Colors.safe : colors.border,
      },
      warning: {
        borderColor: state === 'active' ? Colors.caution : colors.border,
      },
      error: {
        borderColor: Colors.avoid,
      },
      info: {
        borderColor: state === 'active' ? Colors.primaryLight : colors.border,
      },
    };

    // State-based styles
    const stateStyles = {
      default: {},
      hover: {
        borderColor: Colors.primary,
      },
      active: {
        borderColor: Colors.primary,
        borderWidth: 2,
      },
      disabled: {
        backgroundColor: colors.background,
        opacity: 0.5,
      },
      loading: {
        opacity: 0.8,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyles[state],
    };
  }

  // Unified Container Styles
  public getContainerStyles(config: UnifiedStyleConfig) {
    const colors = this.getColors();
    const { size, responsive } = config;
    
    const baseStyle = {
      backgroundColor: colors.background,
      flex: 1,
    };

    // Size-based styles
    const sizeStyles = {
      xs: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.sm) : Spacing.sm,
      },
      sm: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.md) : Spacing.md,
      },
      md: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.lg) : Spacing.lg,
      },
      lg: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.xl) : Spacing.xl,
      },
      xl: {
        padding: responsive ? responsiveDesign.getSpacing(Spacing.xxl) : Spacing.xxl,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  }

  // Create StyleSheet with unified styles
  public createStyleSheet(styles: any): any {
    return StyleSheet.create(styles);
  }
}

// Export singleton instance
export const unifiedStyling = UnifiedStylingSystem.getInstance();

// Utility functions for easy access
export const getButtonStyle = (config: Partial<UnifiedStyleConfig> = {}) => {
  const defaultConfig: UnifiedStyleConfig = {
    variant: 'primary',
    size: 'md',
    state: 'default',
    isDark: false,
    responsive: true,
    ...config,
  };
  return unifiedStyling.getButtonStyles(defaultConfig);
};

export const getTextStyle = (config: Partial<UnifiedStyleConfig> = {}) => {
  const defaultConfig: UnifiedStyleConfig = {
    variant: 'primary',
    size: 'md',
    state: 'default',
    isDark: false,
    responsive: true,
    ...config,
  };
  return unifiedStyling.getTextStyles(defaultConfig);
};

export const getCardStyle = (config: Partial<UnifiedStyleConfig> = {}) => {
  const defaultConfig: UnifiedStyleConfig = {
    variant: 'secondary',
    size: 'md',
    state: 'default',
    isDark: false,
    responsive: true,
    ...config,
  };
  return unifiedStyling.getCardStyles(defaultConfig);
};

export const getInputStyle = (config: Partial<UnifiedStyleConfig> = {}) => {
  const defaultConfig: UnifiedStyleConfig = {
    variant: 'primary',
    size: 'md',
    state: 'default',
    isDark: false,
    responsive: true,
    ...config,
  };
  return unifiedStyling.getInputStyles(defaultConfig);
};

export const getContainerStyle = (config: Partial<UnifiedStyleConfig> = {}) => {
  const defaultConfig: UnifiedStyleConfig = {
    variant: 'primary',
    size: 'md',
    state: 'default',
    isDark: false,
    responsive: true,
    ...config,
  };
  return unifiedStyling.getContainerStyles(defaultConfig);
};

export default UnifiedStylingSystem;
