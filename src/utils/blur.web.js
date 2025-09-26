/**
 * @fileoverview blur.web.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';

// Web implementation of @react-native-community/blur with enhanced support
export const BlurView = ({ 
  style, 
  children, 
  blurAmount = 20,
  blurType = 'light',
  reducedTransparencyFallbackColor = 'rgba(255, 255, 255, 0.1)',
  ...props 
}) => {
  const getBlurStyle = () => {
    const baseStyle = {
      ...style,
      backdropFilter: `blur(${blurAmount}px)`,
      WebkitBackdropFilter: `blur(${blurAmount}px)`, // Safari support
    };

    // Handle different blur types
    switch (blurType) {
      case 'dark':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        };
      case 'light':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        };
      case 'xlight':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        };
      case 'regular':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        };
      case 'prominent':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: reducedTransparencyFallbackColor,
        };
    }
  };

  // Fallback for browsers that don't support backdrop-filter
  const fallbackStyle = {
    ...style,
    backgroundColor: reducedTransparencyFallbackColor,
    filter: `blur(${blurAmount}px)`,
  };

  return (
    <div
      style={getBlurStyle()}
      {...props}
    >
      {children}
    </div>
  );
};

// Additional blur utilities for web
export const BlurTint = {
  light: 'light',
  dark: 'dark',
  xlight: 'xlight',
  regular: 'regular',
  prominent: 'prominent',
};

// Check if backdrop-filter is supported
export const isBackdropFilterSupported = () => {
  if (typeof window === 'undefined') return false;
  
  const testElement = document.createElement('div');
  return 'backdropFilter' in testElement.style || 'WebkitBackdropFilter' in testElement.style;
};
