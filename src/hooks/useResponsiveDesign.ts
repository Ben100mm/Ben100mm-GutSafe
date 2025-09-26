/**
 * @fileoverview useResponsiveDesign.ts - React Hook for Responsive Design
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { responsiveDesign, type ResponsiveConfig } from '../utils/responsiveDesign';
import { unifiedStyling, type StyleVariant, type ComponentSize, type ComponentState } from '../utils/unifiedStyling';
import { enhancedAccessibility, type AccessibilityFeatures } from '../utils/enhancedAccessibility';

export interface UseResponsiveDesignReturn {
  // Responsive design
  config: ResponsiveConfig;
  isTablet: boolean;
  isPhone: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  orientation: 'portrait' | 'landscape';
  
  // Styling utilities
  getSpacing: (baseSpacing: number) => number;
  getFontSize: (baseSize: number) => number;
  getBorderRadius: (baseRadius: number) => number;
  getContainerWidth: () => number;
  getGridColumns: () => number;
  getPadding: () => { horizontal: number; vertical: number };
  getMargins: () => { small: number; medium: number; large: number };
  getTouchTargetSize: () => number;
  getImageSize: (baseSize: number) => { width: number; height: number };
  getShadow: () => any;
  
  // Unified styling
  getButtonStyle: (config?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => any;
  getTextStyle: (config?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => any;
  getCardStyle: (config?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => any;
  getInputStyle: (config?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => any;
  getContainerStyle: (config?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => any;
  
  // Accessibility
  accessibilityFeatures: AccessibilityFeatures;
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  isLargeTextEnabled: boolean;
  shouldReduceMotion: boolean;
  
  // Color scheme
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  colors: any;
}

export const useResponsiveDesign = (): UseResponsiveDesignReturn => {
  const [config, setConfig] = useState<ResponsiveConfig>(responsiveDesign.getConfig());
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeatures>(
    enhancedAccessibility.getFeatures()
  );
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? require('../constants/colors').Colors.dark : require('../constants/colors').Colors.light;

  useEffect(() => {
    // Subscribe to responsive design changes
    const unsubscribeResponsive = responsiveDesign.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    // Subscribe to accessibility changes
    const unsubscribeAccessibility = enhancedAccessibility.subscribe((newFeatures) => {
      setAccessibilityFeatures(newFeatures);
    });

    // Update unified styling color scheme
    unifiedStyling.setColorScheme(colorScheme || 'light');

    return () => {
      unsubscribeResponsive();
      unsubscribeAccessibility();
    };
  }, [colorScheme]);

  // Responsive design utilities
  const getSpacing = (baseSpacing: number) => responsiveDesign.getSpacing(baseSpacing);
  const getFontSize = (baseSize: number) => responsiveDesign.getFontSize(baseSize);
  const getBorderRadius = (baseRadius: number) => responsiveDesign.getBorderRadius(baseRadius);
  const getContainerWidth = () => responsiveDesign.getContainerWidth();
  const getGridColumns = () => responsiveDesign.getGridColumns();
  const getPadding = () => responsiveDesign.getPadding();
  const getMargins = () => responsiveDesign.getMargins();
  const getTouchTargetSize = () => responsiveDesign.getTouchTargetSize();
  const getImageSize = (baseSize: number) => responsiveDesign.getImageSize(baseSize);
  const getShadow = () => responsiveDesign.getShadow();

  // Unified styling utilities
  const getButtonStyle = (styleConfig?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => {
    return unifiedStyling.getButtonStyles({
      variant: 'primary',
      size: 'md',
      state: 'default',
      isDark,
      responsive: true,
      ...styleConfig,
    });
  };

  const getTextStyle = (styleConfig?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => {
    return unifiedStyling.getTextStyles({
      variant: 'primary',
      size: 'md',
      state: 'default',
      isDark,
      responsive: true,
      ...styleConfig,
    });
  };

  const getCardStyle = (styleConfig?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => {
    return unifiedStyling.getCardStyles({
      variant: 'secondary',
      size: 'md',
      state: 'default',
      isDark,
      responsive: true,
      ...styleConfig,
    });
  };

  const getInputStyle = (styleConfig?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => {
    return unifiedStyling.getInputStyles({
      variant: 'primary',
      size: 'md',
      state: 'default',
      isDark,
      responsive: true,
      ...styleConfig,
    });
  };

  const getContainerStyle = (styleConfig?: Partial<{ variant: StyleVariant; size: ComponentSize; state: ComponentState }>) => {
    return unifiedStyling.getContainerStyles({
      variant: 'primary',
      size: 'md',
      state: 'default',
      isDark,
      responsive: true,
      ...styleConfig,
    });
  };

  return {
    // Responsive design
    config,
    isTablet: config.isTablet,
    isPhone: config.isPhone,
    isDesktop: config.isDesktop,
    screenSize: config.screenSize,
    orientation: config.orientation,
    
    // Styling utilities
    getSpacing,
    getFontSize,
    getBorderRadius,
    getContainerWidth,
    getGridColumns,
    getPadding,
    getMargins,
    getTouchTargetSize,
    getImageSize,
    getShadow,
    
    // Unified styling
    getButtonStyle,
    getTextStyle,
    getCardStyle,
    getInputStyle,
    getContainerStyle,
    
    // Accessibility
    accessibilityFeatures,
    isScreenReaderEnabled: accessibilityFeatures.isScreenReaderEnabled,
    isReduceMotionEnabled: accessibilityFeatures.isReduceMotionEnabled,
    isHighContrastEnabled: accessibilityFeatures.isHighContrastEnabled,
    isLargeTextEnabled: accessibilityFeatures.isLargeTextEnabled,
    shouldReduceMotion: enhancedAccessibility.shouldReduceMotion(),
    
    // Color scheme
    colorScheme: colorScheme || 'light',
    isDark,
    colors,
  };
};

export default useResponsiveDesign;
