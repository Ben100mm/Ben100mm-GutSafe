/**
 * @fileoverview responsiveDesign.ts - Comprehensive Responsive Design System
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Device type detection
export type DeviceType = 'phone' | 'tablet' | 'desktop';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveConfig {
  deviceType: DeviceType;
  screenSize: ScreenSize;
  orientation: Orientation;
  width: number;
  height: number;
  pixelRatio: number;
  isTablet: boolean;
  isPhone: boolean;
  isDesktop: boolean;
}

class ResponsiveDesignSystem {
  private static instance: ResponsiveDesignSystem;
  private config: ResponsiveConfig;
  private listeners: Array<(config: ResponsiveConfig) => void> = [];

  private constructor() {
    this.config = this.calculateConfig();
    this.setupListeners();
  }

  public static getInstance(): ResponsiveDesignSystem {
    if (!ResponsiveDesignSystem.instance) {
      ResponsiveDesignSystem.instance = new ResponsiveDesignSystem();
    }
    return ResponsiveDesignSystem.instance;
  }

  private calculateConfig(): ResponsiveConfig {
    const { width, height } = Dimensions.get('window');
    const pixelRatio = PixelRatio.get();
    const orientation = width > height ? 'landscape' : 'portrait';
    
    // Device type detection
    const isTablet = this.isTabletDevice(width, height, pixelRatio);
    const isPhone = !isTablet && Platform.OS !== 'web';
    const isDesktop = Platform.OS === 'web';
    
    const deviceType: DeviceType = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone';
    
    // Screen size detection
    const screenSize = this.getScreenSize(width, height, deviceType);
    
    return {
      deviceType,
      screenSize,
      orientation,
      width,
      height,
      pixelRatio,
      isTablet,
      isPhone,
      isDesktop,
    };
  }

  private isTabletDevice(width: number, height: number, pixelRatio: number): boolean {
    const diagonal = Math.sqrt(width * width + height * height) / pixelRatio;
    return diagonal >= 7; // 7 inches or larger
  }

  private getScreenSize(width: number, height: number, deviceType: DeviceType): ScreenSize {
    const minDimension = Math.min(width, height);
    
    if (deviceType === 'desktop') {
      if (minDimension >= 1920) return 'xxl';
      if (minDimension >= 1440) return 'xl';
      if (minDimension >= 1200) return 'lg';
      if (minDimension >= 992) return 'md';
      if (minDimension >= 768) return 'sm';
      return 'xs';
    }
    
    if (deviceType === 'tablet') {
      if (minDimension >= 1024) return 'xl';
      if (minDimension >= 768) return 'lg';
      if (minDimension >= 600) return 'md';
      return 'sm';
    }
    
    // Phone sizes
    if (minDimension >= 414) return 'lg';
    if (minDimension >= 375) return 'md';
    if (minDimension >= 320) return 'sm';
    return 'xs';
  }

  private setupListeners(): void {
    if (Platform.OS === 'web') {
      window.addEventListener('resize', this.handleResize);
    } else {
      Dimensions.addEventListener('change', this.handleResize);
    }
  }

  private handleResize = (): void => {
    const newConfig = this.calculateConfig();
    this.config = newConfig;
    this.listeners.forEach(listener => listener(newConfig));
  };

  public getConfig(): ResponsiveConfig {
    return { ...this.config };
  }

  public subscribe(listener: (config: ResponsiveConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Responsive spacing
  public getSpacing(baseSpacing: number): number {
    const { screenSize, deviceType } = this.config;
    
    const multipliers = {
      xs: { phone: 0.8, tablet: 0.9, desktop: 1.0 },
      sm: { phone: 0.9, tablet: 1.0, desktop: 1.1 },
      md: { phone: 1.0, tablet: 1.1, desktop: 1.2 },
      lg: { phone: 1.1, tablet: 1.2, desktop: 1.3 },
      xl: { phone: 1.2, tablet: 1.3, desktop: 1.4 },
      xxl: { phone: 1.3, tablet: 1.4, desktop: 1.5 },
    };

    const deviceKey = deviceType === 'desktop' ? 'desktop' : deviceType === 'tablet' ? 'tablet' : 'phone';
    return Math.round(baseSpacing * multipliers[screenSize][deviceKey]);
  }

  // Responsive font sizes
  public getFontSize(baseSize: number): number {
    const { screenSize, deviceType } = this.config;
    
    const multipliers = {
      xs: { phone: 0.85, tablet: 0.9, desktop: 0.95 },
      sm: { phone: 0.9, tablet: 0.95, desktop: 1.0 },
      md: { phone: 1.0, tablet: 1.05, desktop: 1.1 },
      lg: { phone: 1.05, tablet: 1.1, desktop: 1.15 },
      xl: { phone: 1.1, tablet: 1.15, desktop: 1.2 },
      xxl: { phone: 1.15, tablet: 1.2, desktop: 1.25 },
    };

    const deviceKey = deviceType === 'desktop' ? 'desktop' : deviceType === 'tablet' ? 'tablet' : 'phone';
    return Math.round(baseSize * multipliers[screenSize][deviceKey]);
  }

  // Responsive border radius
  public getBorderRadius(baseRadius: number): number {
    const { screenSize, deviceType } = this.config;
    
    const multipliers = {
      xs: { phone: 0.8, tablet: 0.9, desktop: 1.0 },
      sm: { phone: 0.9, tablet: 1.0, desktop: 1.1 },
      md: { phone: 1.0, tablet: 1.1, desktop: 1.2 },
      lg: { phone: 1.1, tablet: 1.2, desktop: 1.3 },
      xl: { phone: 1.2, tablet: 1.3, desktop: 1.4 },
      xxl: { phone: 1.3, tablet: 1.4, desktop: 1.5 },
    };

    const deviceKey = deviceType === 'desktop' ? 'desktop' : deviceType === 'tablet' ? 'tablet' : 'phone';
    return Math.round(baseRadius * multipliers[screenSize][deviceKey]);
  }

  // Responsive container widths
  public getContainerWidth(): number {
    const { width, deviceType, screenSize } = this.config;
    
    if (deviceType === 'desktop') {
      const maxWidths = {
        xs: 480,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400,
      };
      return Math.min(width, maxWidths[screenSize]);
    }
    
    if (deviceType === 'tablet') {
      return Math.min(width * 0.9, 800);
    }
    
    // Phone
    return Math.min(width * 0.95, 400);
  }

  // Responsive grid columns
  public getGridColumns(): number {
    const { deviceType, screenSize } = this.config;
    
    if (deviceType === 'desktop') {
      const columns = {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
      };
      return columns[screenSize];
    }
    
    if (deviceType === 'tablet') {
      return screenSize === 'lg' || screenSize === 'xl' ? 3 : 2;
    }
    
    // Phone
    return 1;
  }

  // Responsive breakpoints
  public isBreakpoint(breakpoint: ScreenSize): boolean {
    const { screenSize } = this.config;
    const order = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    return order.indexOf(screenSize) >= order.indexOf(breakpoint);
  }

  // Responsive padding
  public getPadding(): { horizontal: number; vertical: number } {
    const { deviceType, screenSize } = this.config;
    
    if (deviceType === 'desktop') {
      const padding = {
        xs: { horizontal: 16, vertical: 12 },
        sm: { horizontal: 20, vertical: 16 },
        md: { horizontal: 24, vertical: 20 },
        lg: { horizontal: 32, vertical: 24 },
        xl: { horizontal: 40, vertical: 32 },
        xxl: { horizontal: 48, vertical: 40 },
      };
      return padding[screenSize];
    }
    
    if (deviceType === 'tablet') {
      return { horizontal: 24, vertical: 20 };
    }
    
    // Phone
    return { horizontal: 16, vertical: 12 };
  }

  // Responsive margins
  public getMargins(): { small: number; medium: number; large: number } {
    const { deviceType, screenSize } = this.config;
    
    if (deviceType === 'desktop') {
      const margins = {
        xs: { small: 8, medium: 16, large: 24 },
        sm: { small: 12, medium: 20, large: 32 },
        md: { small: 16, medium: 24, large: 40 },
        lg: { small: 20, medium: 32, large: 48 },
        xl: { small: 24, medium: 40, large: 56 },
        xxl: { small: 32, medium: 48, large: 64 },
      };
      return margins[screenSize];
    }
    
    if (deviceType === 'tablet') {
      return { small: 12, medium: 20, large: 32 };
    }
    
    // Phone
    return { small: 8, medium: 16, large: 24 };
  }

  // Responsive touch targets
  public getTouchTargetSize(): number {
    const { deviceType } = this.config;
    
    if (deviceType === 'desktop') return 32;
    if (deviceType === 'tablet') return 44;
    return 48; // Phone - minimum recommended touch target
  }

  // Responsive image sizes
  public getImageSize(baseSize: number): { width: number; height: number } {
    const { deviceType, screenSize } = this.config;
    
    let multiplier = 1;
    
    if (deviceType === 'desktop') {
      const multipliers = {
        xs: 0.8,
        sm: 0.9,
        md: 1.0,
        lg: 1.1,
        xl: 1.2,
        xxl: 1.3,
      };
      multiplier = multipliers[screenSize];
    } else if (deviceType === 'tablet') {
      multiplier = 1.2;
    } else {
      multiplier = 1.0;
    }
    
    return {
      width: Math.round(baseSize * multiplier),
      height: Math.round(baseSize * multiplier),
    };
  }

  // Responsive shadow
  public getShadow(): any {
    const { deviceType, screenSize } = this.config;
    
    if (Platform.OS === 'web') {
      if (deviceType === 'desktop') {
        const shadows = {
          xs: '0 1px 3px rgba(0, 0, 0, 0.1)',
          sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
          md: '0 4px 8px rgba(0, 0, 0, 0.12)',
          lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
          xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
          xxl: '0 16px 32px rgba(0, 0, 0, 0.2)',
        };
        return { boxShadow: shadows[screenSize] };
      }
      
      if (deviceType === 'tablet') {
        return { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' };
      }
      
      return { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)' };
    }
    
    // React Native shadows
    if (deviceType === 'desktop') {
      const shadows = {
        xs: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
        sm: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
        md: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
        lg: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
        xl: { shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 12 },
        xxl: { shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 16 },
      };
      return shadows[screenSize];
    }
    
    if (deviceType === 'tablet') {
      return { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 };
    }
    
    return { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 };
  }

  // Cleanup
  public destroy(): void {
    if (Platform.OS === 'web') {
      window.removeEventListener('resize', this.handleResize);
    } else {
      Dimensions.removeEventListener('change', this.handleResize);
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const responsiveDesign = ResponsiveDesignSystem.getInstance();

// Utility functions for easy access
export const getResponsiveSpacing = (baseSpacing: number) => 
  responsiveDesign.getSpacing(baseSpacing);

export const getResponsiveFontSize = (baseSize: number) => 
  responsiveDesign.getFontSize(baseSize);

export const getResponsiveBorderRadius = (baseRadius: number) => 
  responsiveDesign.getBorderRadius(baseRadius);

export const getResponsiveContainerWidth = () => 
  responsiveDesign.getContainerWidth();

export const getResponsiveGridColumns = () => 
  responsiveDesign.getGridColumns();

export const isResponsiveBreakpoint = (breakpoint: ScreenSize) => 
  responsiveDesign.isBreakpoint(breakpoint);

export const getResponsivePadding = () => 
  responsiveDesign.getPadding();

export const getResponsiveMargins = () => 
  responsiveDesign.getMargins();

export const getResponsiveTouchTargetSize = () => 
  responsiveDesign.getTouchTargetSize();

export const getResponsiveImageSize = (baseSize: number) => 
  responsiveDesign.getImageSize(baseSize);

export const getResponsiveShadow = () => 
  responsiveDesign.getShadow();

export const getResponsiveConfig = () => 
  responsiveDesign.getConfig();

export const subscribeToResponsiveChanges = (listener: (config: ResponsiveConfig) => void) => 
  responsiveDesign.subscribe(listener);

export default ResponsiveDesignSystem;
