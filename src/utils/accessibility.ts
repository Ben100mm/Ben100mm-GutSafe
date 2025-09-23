import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilityConfig {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
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
      accessibilityHint: hint,
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
      accessibilityHint: hint,
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
      accessibilityLabel: decorative ? undefined : label,
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
      accessibilityHint,
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
      accessibilityHint: hint,
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
      accessibilityHint: hint,
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
