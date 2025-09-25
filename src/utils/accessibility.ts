/**
 * @fileoverview accessibility.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { AccessibilityInfo, Platform, AccessibilityRole } from 'react-native';

export interface AccessibilityConfig {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityActions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  testID?: string;
}

export class AccessibilityService {
  private static isScreenReaderEnabled: boolean = false;
  private static isReduceMotionEnabled: boolean = false;
  private static isBoldTextEnabled: boolean = false;
  private static isGrayscaleEnabled: boolean = false;
  private static isInvertColorsEnabled: boolean = false;

  /**
   * Initialize accessibility service
   */
  static async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      // Web-specific initialization - simplified to avoid errors
      console.log('Accessibility service initialized for web');
      return;
    }

    try {
      this.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      this.isGrayscaleEnabled = await AccessibilityInfo.isGrayscaleEnabled();
      this.isInvertColorsEnabled = await AccessibilityInfo.isInvertColorsEnabled();

      // Listen for changes
      AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChanged);
      AccessibilityInfo.addEventListener('reduceMotionChanged', this.handleReduceMotionChanged);
      AccessibilityInfo.addEventListener('boldTextChanged', this.handleBoldTextChanged);
      AccessibilityInfo.addEventListener('grayscaleChanged', this.handleGrayscaleChanged);
      AccessibilityInfo.addEventListener('invertColorsChanged', this.handleInvertColorsChanged);
    } catch (error) {
      console.warn('Failed to initialize accessibility service:', error);
    }
  }

  /**
   * Check if screen reader is enabled
   */
  static isScreenReaderActive(): boolean {
    return this.isScreenReaderEnabled;
  }

  /**
   * Check if reduce motion is enabled
   */
  static isReduceMotionActive(): boolean {
    return this.isReduceMotionEnabled;
  }

  /**
   * Check if bold text is enabled
   */
  static isBoldTextActive(): boolean {
    return this.isBoldTextEnabled;
  }

  /**
   * Check if grayscale is enabled
   */
  static isGrayscaleActive(): boolean {
    return this.isGrayscaleEnabled;
  }

  /**
   * Check if invert colors is enabled
   */
  static isInvertColorsActive(): boolean {
    return this.isInvertColorsEnabled;
  }

  /**
   * Announce text to screen reader
   */
  static announceForAccessibility(text: string): void {
    if (this.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(text);
    }
  }

  /**
   * Set accessibility focus
   */
  static setAccessibilityFocus(reactTag: number): void {
    if (this.isScreenReaderEnabled) {
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  }

  /**
   * Create accessibility config for buttons
   */
  static createButtonConfig(
    label: string,
    hint?: string,
    disabled: boolean = false,
    selected: boolean = false
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
      accessibilityState: {
        disabled,
        selected,
      },
      testID: `button-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for cards
   */
  static createCardConfig(
    title: string,
    subtitle?: string,
    hint?: string,
    selected: boolean = false
  ): AccessibilityConfig {
    const label = subtitle ? `${title}, ${subtitle}` : title;
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
      accessibilityState: {
        selected,
      },
      testID: `card-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for progress indicators
   */
  static createProgressConfig(
    label: string,
    current: number,
    max: number,
    unit?: string
  ): AccessibilityConfig {
    const percentage = Math.round((current / max) * 100);
    const valueText = unit ? `${current} ${unit}` : `${current}`;
    
    return {
      accessible: true,
      accessibilityRole: 'progressbar',
      accessibilityLabel: label,
      accessibilityValue: {
        min: 0,
        max,
        now: current,
        text: `${percentage}% complete, ${valueText}`,
      },
      testID: `progress-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for images
   */
  static createImageConfig(
    label: string,
    decorative: boolean = false
  ): AccessibilityConfig {
    return {
      accessible: !decorative,
      accessibilityRole: decorative ? 'none' : 'image',
      ...(label && !decorative && { accessibilityLabel: label }),
      testID: `image-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for text inputs
   */
  static createTextInputConfig(
    label: string,
    hint?: string,
    required: boolean = false,
    error?: string
  ): AccessibilityConfig {
    const accessibilityLabel = required ? `${label} (required)` : label;
    const accessibilityHint = error ? `${hint || ''} ${error}` : hint;
    
    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel,
      ...(accessibilityHint && { accessibilityHint: accessibilityHint }),
      accessibilityState: {
        disabled: !!error,
      },
      testID: `input-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for lists
   */
  static createListConfig(
    itemCount: number,
    label: string
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'list',
      accessibilityLabel: `${label}, ${itemCount} items`,
      testID: `list-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for list items
   */
  static createListItemConfig(
    label: string,
    position: number,
    total: number,
    hint?: string
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'button' as const,
      accessibilityLabel: label,
      accessibilityHint: hint ? `${hint}, item ${position} of ${total}` : `item ${position} of ${total}`,
      testID: `list-item-${position}`,
    };
  }

  /**
   * Create accessibility config for tabs
   */
  static createTabConfig(
    label: string,
    selected: boolean,
    hint?: string
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'tab',
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
      accessibilityState: {
        selected,
      },
      testID: `tab-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for switches/toggles
   */
  static createSwitchConfig(
    label: string,
    checked: boolean,
    hint?: string
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'switch',
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
      accessibilityState: {
        checked,
      },
      testID: `switch-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for sliders
   */
  static createSliderConfig(
    label: string,
    value: number,
    min: number,
    max: number,
    step?: number
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'adjustable',
      accessibilityLabel: label,
      accessibilityValue: {
        min,
        max,
        now: value,
        text: `${value} out of ${max}`,
      },
      testID: `slider-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for headers
   */
  static createHeaderConfig(
    title: string,
    level: 1 | 2 | 3 | 4 | 5 | 6 = 1
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'header',
      accessibilityLabel: title,
      testID: `header-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for status indicators
   */
  static createStatusConfig(
    status: 'safe' | 'caution' | 'avoid' | 'loading' | 'success' | 'error',
    label: string
  ): AccessibilityConfig {
    const statusLabels = {
      safe: 'Safe',
      caution: 'Caution',
      avoid: 'Avoid',
      loading: 'Loading',
      success: 'Success',
      error: 'Error',
    };

    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: `${label}, ${statusLabels[status]}`,
      accessibilityState: {
        busy: status === 'loading',
      },
      testID: `status-${status}-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Get accessibility-friendly animation duration
   */
  static getAnimationDuration(baseDuration: number): number {
    return this.isReduceMotionActive() ? 0 : baseDuration;
  }

  /**
   * Get accessibility-friendly font weight
   */
  static getFontWeight(baseWeight: string): string {
    return this.isBoldTextActive() ? 'bold' : baseWeight;
  }

  /**
   * Get accessibility-friendly color adjustments
   */
  static getColorAdjustments(baseColor: string): string {
    if (this.isGrayscaleActive()) {
      // Convert to grayscale (simplified)
      return '#808080';
    }
    if (this.isInvertColorsActive()) {
      // Invert colors (simplified)
      return baseColor === '#000000' ? '#FFFFFF' : '#000000';
    }
    return baseColor;
  }

  /**
   * Check if color combination meets WCAG AA contrast requirements
   */
  static checkColorContrast(foreground: string, background: string): {
    ratio: number;
    meetsAA: boolean;
    meetsAAA: boolean;
  } {
    // Simplified contrast calculation - in a real app, use a proper color contrast library
    const getLuminance = (color: string): number => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const [rs, gs, bs] = [r, g, b].map(c => 
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      
      return 0.2126 * (rs || 0) + 0.7152 * (gs || 0) + 0.0722 * (bs || 0);
    };

    const lum1 = getLuminance(foreground);
    const lum2 = getLuminance(background);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);

    return {
      ratio: Math.round(ratio * 100) / 100,
      meetsAA: ratio >= 4.5,
      meetsAAA: ratio >= 7,
    };
  }

  /**
   * Get accessible font size based on user preferences
   */
  static getAccessibleFontSize(baseSize: number, isLargeText: boolean = false): number {
    if (isLargeText || this.isBoldTextActive()) {
      return Math.max(baseSize * 1.2, 16); // Minimum 16px for accessibility
    }
    return Math.max(baseSize, 12); // Minimum 12px
  }

  /**
   * Create accessibility config for modal dialogs
   */
  static createModalConfig(
    title: string,
    isVisible: boolean,
    onClose?: () => void
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'alert',
      accessibilityLabel: title,
      accessibilityHint: isVisible ? 'Modal dialog is open' : 'Modal dialog is closed',
      accessibilityState: {
        expanded: isVisible,
      },
      ...(onClose && {
        accessibilityActions: [
          {
            name: 'close',
            label: 'Close dialog',
          },
        ],
        onAccessibilityAction: (event) => {
          if (event.nativeEvent.actionName === 'close') {
            onClose();
          }
        }
      }),
      testID: `modal-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for search inputs
   */
  static createSearchConfig(
    label: string,
    placeholder?: string,
    resultsCount?: number
  ): AccessibilityConfig {
    const hint = resultsCount !== undefined 
      ? `Search ${label}. ${resultsCount} results found.`
      : `Search ${label}`;
    
    return {
      accessible: true,
      accessibilityRole: 'search',
      accessibilityLabel: label,
      ...((hint || placeholder) && { accessibilityHint: hint || placeholder }),
      testID: `search-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for navigation landmarks
   */
  static createLandmarkConfig(
    type: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary',
    label: string
  ): AccessibilityConfig {
    const roleMap = {
      main: 'main',
      navigation: 'navigation',
      banner: 'banner',
      contentinfo: 'contentinfo',
      complementary: 'complementary',
    };

    return {
      accessible: true,
      accessibilityRole: roleMap[type] as any,
      accessibilityLabel: label,
      testID: `landmark-${type}-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for form fields
   */
  static createFormFieldConfig(
    label: string,
    type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url',
    required: boolean = false,
    error?: string,
    hint?: string
  ): AccessibilityConfig {
    const accessibilityLabel = required ? `${label} (required)` : label;
    const accessibilityHint = error ? `${hint || ''} Error: ${error}` : hint;
    
    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel,
      ...(hint && { accessibilityHint: hint }),
      accessibilityState: {
        disabled: !!error,
      },
      testID: `form-field-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for loading states
   */
  static createLoadingConfig(
    label: string,
    progress?: number
  ): AccessibilityConfig {
    const hint = progress !== undefined 
      ? `Loading ${label}, ${progress}% complete`
      : `Loading ${label}`;
    
    return {
      accessible: true,
      accessibilityRole: 'progressbar',
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
      accessibilityState: {
        busy: true,
      },
      accessibilityValue: progress !== undefined ? {
        min: 0,
        max: 100,
        now: progress,
        text: `${progress}% complete`,
      } : undefined,
      testID: `loading-${label.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for error messages
   */
  static createErrorConfig(
    message: string,
    field?: string
  ): AccessibilityConfig {
    const label = field ? `Error in ${field}: ${message}` : `Error: ${message}`;
    
    return {
      accessible: true,
      accessibilityRole: 'alert',
      accessibilityLabel: label,
      testID: `error-${field ? field.toLowerCase().replace(/\s+/g, '-') : 'general'}`,
    };
  }

  /**
   * Create accessibility config for success messages
   */
  static createSuccessConfig(
    message: string,
    field?: string
  ): AccessibilityConfig {
    const label = field ? `Success in ${field}: ${message}` : `Success: ${message}`;
    
    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: label,
      testID: `success-${field ? field.toLowerCase().replace(/\s+/g, '-') : 'general'}`,
    };
  }

  /**
   * Create accessibility config for skip links
   */
  static createSkipLinkConfig(
    target: string,
    label: string = `Skip to ${target}`
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: label,
      accessibilityHint: `Skip to ${target} section`,
      testID: `skip-link-${target.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for breadcrumbs
   */
  static createBreadcrumbConfig(
    items: string[],
    currentIndex: number
  ): AccessibilityConfig {
    const breadcrumbText = items.join(', ');
    const currentItem = items[currentIndex];
    
    return {
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: `Breadcrumb navigation: ${breadcrumbText}`,
      accessibilityHint: `Currently on ${currentItem}`,
      testID: 'breadcrumb-navigation',
    };
  }

  /**
   * Create accessibility config for pagination
   */
  static createPaginationConfig(
    currentPage: number,
    totalPages: number,
    onPageChange?: (page: number) => void
  ): AccessibilityConfig {
    const label = `Page ${currentPage} of ${totalPages}`;
    const hint = totalPages > 1 ? 'Navigate between pages' : 'Single page';
    
    return {
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: label,
      ...(hint && { accessibilityHint: hint }),
      accessibilityValue: {
        min: 1,
        max: totalPages,
        now: currentPage,
        text: `Page ${currentPage} of ${totalPages}`,
      },
      testID: 'pagination-navigation',
    };
  }

  /**
   * Get accessibility-friendly spacing
   */
  static getAccessibleSpacing(baseSpacing: number): number {
    // Ensure minimum touch target size of 44x44 points
    return Math.max(baseSpacing, 11); // 11 points minimum for 44pt touch target
  }

  /**
   * Create accessibility config for data tables
   */
  static createTableConfig(
    title: string,
    rowCount: number,
    columnCount: number
  ): AccessibilityConfig {
    return {
      accessible: true,
      accessibilityRole: 'list',
      accessibilityLabel: `${title}, ${rowCount} rows, ${columnCount} columns`,
      testID: `table-${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  /**
   * Create accessibility config for table cells
   */
  static createTableCellConfig(
    content: string,
    row: number,
    column: number,
    isHeader: boolean = false
  ): AccessibilityConfig {
    const role = isHeader ? 'text' : 'text';
    const label = isHeader ? `${content} (header)` : content;
    
    return {
      accessible: true,
      accessibilityRole: role,
      accessibilityLabel: label,
      accessibilityHint: `Row ${row}, Column ${column}`,
      testID: `table-${role}-${row}-${column}`,
    };
  }

  // Event handlers
  private static handleScreenReaderChanged = (isEnabled: boolean) => {
    this.isScreenReaderEnabled = isEnabled;
  };

  private static handleReduceMotionChanged = (isEnabled: boolean) => {
    this.isReduceMotionEnabled = isEnabled;
  };

  private static handleBoldTextChanged = (isEnabled: boolean) => {
    this.isBoldTextEnabled = isEnabled;
  };

  private static handleGrayscaleChanged = (isEnabled: boolean) => {
    this.isGrayscaleEnabled = isEnabled;
  };

  private static handleInvertColorsChanged = (isEnabled: boolean) => {
    this.isInvertColorsEnabled = isEnabled;
  };
}

export default AccessibilityService;
