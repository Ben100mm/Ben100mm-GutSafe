/**
 * @fileoverview ScreenSizeOptimizer.tsx - Screen Size Optimization Component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  View,
  Dimensions,
  Platform,
  useColorScheme,
} from 'react-native';

import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { responsiveDesign } from '../utils/responsiveDesign';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface ScreenSizeOptimizerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  optimizeFor?: 'phone' | 'tablet' | 'desktop' | 'auto';
  enableOrientationChange?: boolean;
  enableSizeOptimization?: boolean;
  enableLayoutOptimization?: boolean;
  enableContentOptimization?: boolean;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  onSizeChange?: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => void;
}

export const ScreenSizeOptimizer: React.FC<ScreenSizeOptimizerProps> = ({
  children,
  style,
  optimizeFor = 'auto',
  enableOrientationChange = true,
  enableSizeOptimization = true,
  enableLayoutOptimization = true,
  enableContentOptimization = true,
  onOrientationChange,
  onSizeChange,
}) => {
  const {
    config,
    isTablet,
    isPhone,
    isDesktop,
    screenSize,
    orientation,
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
  } = useResponsiveDesign();

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [isLandscape, setIsLandscape] = useState(dimensions.width > dimensions.height);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      const newIsLandscape = window.width > window.height;
      setIsLandscape(newIsLandscape);
      
      if (enableOrientationChange && onOrientationChange) {
        onOrientationChange(newIsLandscape ? 'landscape' : 'portrait');
      }
    });

    return () => subscription?.remove();
  }, [enableOrientationChange, onOrientationChange]);

  useEffect(() => {
    if (onSizeChange) {
      onSizeChange(screenSize);
    }
  }, [screenSize, onSizeChange]);

  // Get optimized styles based on screen size and device type
  const getOptimizedStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      width: '100%',
    };

    if (!enableSizeOptimization) {
      return { ...baseStyle, ...style };
    }

    // Device-specific optimizations
    if (isDesktop) {
      return {
        ...baseStyle,
        maxWidth: getContainerWidth(),
        alignSelf: 'center',
        paddingHorizontal: getPadding().horizontal,
        paddingVertical: getPadding().vertical,
        ...style,
      };
    }

    if (isTablet) {
      return {
        ...baseStyle,
        paddingHorizontal: getPadding().horizontal,
        paddingVertical: getPadding().vertical,
        ...style,
      };
    }

    // Phone optimizations
    return {
      ...baseStyle,
      paddingHorizontal: getSpacing(Spacing.md),
      paddingVertical: getSpacing(Spacing.sm),
      ...style,
    };
  };

  // Get layout optimizations
  const getLayoutOptimizations = (): ViewStyle => {
    if (!enableLayoutOptimization) {
      return {};
    }

    const optimizations: ViewStyle = {};

    // Orientation-based optimizations
    if (isLandscape) {
      optimizations.flexDirection = 'row';
      optimizations.gap = getSpacing(Spacing.lg);
    } else {
      optimizations.flexDirection = 'column';
      optimizations.gap = getSpacing(Spacing.md);
    }

    // Screen size-based optimizations
    switch (screenSize) {
      case 'xs':
        optimizations.padding = getSpacing(Spacing.sm);
        break;
      case 'sm':
        optimizations.padding = getSpacing(Spacing.md);
        break;
      case 'md':
        optimizations.padding = getSpacing(Spacing.lg);
        break;
      case 'lg':
        optimizations.padding = getSpacing(Spacing.xl);
        break;
      case 'xl':
        optimizations.padding = getSpacing(Spacing.xxl);
        break;
      case 'xxl':
        optimizations.padding = getSpacing(Spacing.xxxl);
        break;
    }

    return optimizations;
  };

  // Get content optimizations
  const getContentOptimizations = (): ViewStyle => {
    if (!enableContentOptimization) {
      return {};
    }

    const optimizations: ViewStyle = {};

    // Grid-based layout for larger screens
    if (isDesktop || (isTablet && screenSize === 'lg')) {
      optimizations.display = 'grid';
      optimizations.gridTemplateColumns = `repeat(${getGridColumns()}, 1fr)`;
      optimizations.gap = getSpacing(Spacing.lg);
    }

    // Flex-based layout for smaller screens
    if (isPhone || (isTablet && screenSize !== 'lg')) {
      optimizations.flexDirection = 'column';
      optimizations.gap = getSpacing(Spacing.md);
    }

    return optimizations;
  };

  const optimizedStyle: ViewStyle = {
    ...getOptimizedStyles(),
    ...getLayoutOptimizations(),
    ...getContentOptimizations(),
  };

  return (
    <View style={optimizedStyle}>
      {children}
    </View>
  );
};

// Responsive container for different screen sizes
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number | 'auto' | 'full';
  padding?: number | { horizontal?: number; vertical?: number };
  margin?: number | { horizontal?: number; vertical?: number };
  style?: ViewStyle;
  centered?: boolean;
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'auto',
  padding = 0,
  margin = 0,
  style,
  centered = true,
  breakpoints,
}) => {
  const {
    config,
    isTablet,
    isPhone,
    isDesktop,
    screenSize,
    getContainerWidth,
    getSpacing,
    getPadding,
    getMargins,
  } = useResponsiveDesign();

  // Get responsive max width
  const getResponsiveMaxWidth = (): number | string => {
    if (maxWidth === 'full') return '100%';
    if (maxWidth === 'auto') return getContainerWidth();
    if (typeof maxWidth === 'number') return maxWidth;
    
    if (breakpoints) {
      const breakpoint = breakpoints[screenSize];
      if (breakpoint) return breakpoint;
    }

    return getContainerWidth();
  };

  // Get responsive padding
  const getResponsivePadding = () => {
    if (typeof padding === 'number') {
      return {
        horizontal: padding,
        vertical: padding,
      };
    }
    return padding;
  };

  // Get responsive margin
  const getResponsiveMargin = () => {
    if (typeof margin === 'number') {
      return {
        horizontal: margin,
        vertical: margin,
      };
    }
    return margin;
  };

  const paddingValues = getResponsivePadding();
  const marginValues = getResponsiveMargin();

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: getResponsiveMaxWidth(),
    paddingHorizontal: getSpacing(paddingValues.horizontal || 0),
    paddingVertical: getSpacing(paddingValues.vertical || 0),
    marginHorizontal: getSpacing(marginValues.horizontal || 0),
    marginVertical: getSpacing(marginValues.vertical || 0),
    ...(centered && {
      alignSelf: 'center',
    }),
    ...style,
  };

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// Responsive grid for different screen sizes
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  gap?: number;
  style?: ViewStyle;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  responsive?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 1,
  gap = Spacing.md,
  style,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  wrap = true,
  responsive = true,
}) => {
  const {
    config,
    isTablet,
    isPhone,
    isDesktop,
    screenSize,
    getSpacing,
    getGridColumns,
  } = useResponsiveDesign();

  // Get responsive column count
  const getColumnCount = (): number => {
    if (!responsive) {
      return typeof columns === 'number' ? columns : 1;
    }

    if (typeof columns === 'number') {
      return columns;
    }

    const responsiveColumns = columns[screenSize] || columns.md || 1;
    return responsiveColumns;
  };

  const columnCount = getColumnCount();
  const responsiveGap = getSpacing(gap);

  // Calculate item width based on columns and gap
  const itemWidth = `${(100 - (columnCount - 1) * (responsiveGap / 8)) / columnCount}%`;

  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    alignItems,
    justifyContent,
    gap: responsiveGap,
    ...style,
  };

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            style: [
              {
                width: itemWidth,
                minWidth: itemWidth,
                maxWidth: itemWidth,
              },
              child.props.style,
            ],
          });
        }
        return child;
      })}
    </View>
  );
};

// Responsive text for different screen sizes
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  color?: string;
  style?: ViewStyle;
  responsive?: boolean;
  breakpoints?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
  };
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'md',
  weight = 'regular',
  color,
  style,
  responsive = true,
  breakpoints,
}) => {
  const {
    config,
    isTablet,
    isPhone,
    isDesktop,
    screenSize,
    getFontSize,
    colors,
  } = useResponsiveDesign();

  // Get responsive font size
  const getResponsiveFontSize = (): number => {
    if (!responsive) {
      const baseSizes = {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 20,
      };
      return baseSizes[size];
    }

    const baseSizes = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
    };

    const baseSize = baseSizes[size];
    return getFontSize(baseSize);
  };

  // Get responsive font weight
  const getResponsiveFontWeight = (): string => {
    const weights = {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    };
    return weights[weight];
  };

  const textStyle: ViewStyle = {
    fontSize: getResponsiveFontSize(),
    fontWeight: getResponsiveFontWeight(),
    color: color || colors.text,
    ...style,
  };

  return (
    <View style={textStyle}>
      {children}
    </View>
  );
};

export default {
  ScreenSizeOptimizer,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveText,
};
