/**
 * @fileoverview ResponsiveGrid.tsx - Responsive Grid System Component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';

import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { Spacing } from '../constants/spacing';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  gap?: number;
  style?: ViewStyle;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 1,
  gap = Spacing.md,
  style,
  alignItems = 'stretch',
  justifyContent = 'flex-start',
  wrap = true,
}) => {
  const { getSpacing, getGridColumns, screenSize, isTablet, isDesktop } = useResponsiveDesign();

  // Determine number of columns based on responsive config
  const getColumnCount = (): number => {
    if (typeof columns === 'number') {
      return columns;
    }

    // Responsive column configuration
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

  // Enhanced grid styles for different screen sizes
  const enhancedGridStyle: ViewStyle = {
    ...gridStyle,
    ...(isDesktop && {
      maxWidth: '100%',
      margin: '0 auto',
    }),
    ...(isTablet && {
      paddingHorizontal: getSpacing(Spacing.lg),
    }),
  };

  return (
    <View style={enhancedGridStyle}>
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

interface ResponsiveGridItemProps {
  children: React.ReactNode;
  span?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  offset?: number;
  style?: ViewStyle;
  order?: number;
}

export const ResponsiveGridItem: React.FC<ResponsiveGridItemProps> = ({
  children,
  span = 1,
  offset = 0,
  style,
  order,
}) => {
  const { getSpacing, screenSize } = useResponsiveDesign();

  // Determine span based on responsive config
  const getSpanCount = (): number => {
    if (typeof span === 'number') {
      return span;
    }

    const responsiveSpan = span[screenSize] || span.md || 1;
    return responsiveSpan;
  };

  const spanCount = getSpanCount();
  const responsiveOffset = getSpacing(offset);

  const itemStyle: ViewStyle = {
    flex: spanCount,
    marginLeft: responsiveOffset,
    ...(order !== undefined && { order }),
    ...style,
  };

  return (
    <View style={itemStyle}>
      {children}
    </View>
  );
};

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  padding?: number | { horizontal?: number; vertical?: number };
  margin?: number | { horizontal?: number; vertical?: number };
  style?: ViewStyle;
  centered?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'full',
  padding = 0,
  margin = 0,
  style,
  centered = true,
}) => {
  const { getContainerWidth, getSpacing, getPadding, isDesktop, isTablet } = useResponsiveDesign();

  // Get max width based on breakpoint
  const getMaxWidth = (): number | string => {
    if (maxWidth === 'full') return '100%';
    
    const maxWidths = {
      xs: 480,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400,
    };

    return maxWidths[maxWidth] || '100%';
  };

  // Get padding values
  const getPaddingValues = () => {
    if (typeof padding === 'number') {
      return { horizontal: padding, vertical: padding };
    }
    return padding;
  };

  // Get margin values
  const getMarginValues = () => {
    if (typeof margin === 'number') {
      return { horizontal: margin, vertical: margin };
    }
    return margin;
  };

  const paddingValues = getPaddingValues();
  const marginValues = getMarginValues();

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: getMaxWidth(),
    paddingHorizontal: getSpacing(paddingValues.horizontal || 0),
    paddingVertical: getSpacing(paddingValues.vertical || 0),
    marginHorizontal: getSpacing(marginValues.horizontal || 0),
    marginVertical: getSpacing(marginValues.vertical || 0),
    ...(centered && {
      alignSelf: 'center',
    }),
    ...(isDesktop && {
      paddingHorizontal: getSpacing(Spacing.xl),
    }),
    ...(isTablet && {
      paddingHorizontal: getSpacing(Spacing.lg),
    }),
    ...style,
  };

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
};

// Responsive flex component
interface ResponsiveFlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: boolean;
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  style?: ViewStyle;
  responsive?: {
    direction?: { xs?: string; sm?: string; md?: string; lg?: string; xl?: string; xxl?: string };
    wrap?: { xs?: boolean; sm?: boolean; md?: boolean; lg?: boolean; xl?: boolean; xxl?: boolean };
  };
}

export const ResponsiveFlex: React.FC<ResponsiveFlexProps> = ({
  children,
  direction = 'row',
  wrap = false,
  alignItems = 'flex-start',
  justifyContent = 'flex-start',
  gap = 0,
  style,
  responsive,
}) => {
  const { getSpacing, screenSize } = useResponsiveDesign();

  // Get responsive direction
  const getResponsiveDirection = (): string => {
    if (responsive?.direction) {
      return responsive.direction[screenSize] || direction;
    }
    return direction;
  };

  // Get responsive wrap
  const getResponsiveWrap = (): boolean => {
    if (responsive?.wrap) {
      return responsive.wrap[screenSize] ?? wrap;
    }
    return wrap;
  };

  const flexStyle: ViewStyle = {
    flexDirection: getResponsiveDirection() as any,
    flexWrap: getResponsiveWrap() ? 'wrap' : 'nowrap',
    alignItems,
    justifyContent,
    gap: getSpacing(gap),
    ...style,
  };

  return (
    <View style={flexStyle}>
      {children}
    </View>
  );
};

export default {
  ResponsiveGrid,
  ResponsiveGridItem,
  ResponsiveContainer,
  ResponsiveFlex,
};
