/**
 * @fileoverview accessibilityHelpers.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform } from 'react-native';
import { logger } from './logger';

// Accessibility helper functions
export const createAccessibilityProps = (config: {
  role?: string;
  label?: string;
  hint?: string;
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
  actions?: string[];
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}) => {
  const props: any = {};

  // Role
  if (config.role) {
    props.accessibilityRole = config.role;
  }

  // Label
  if (config.label) {
    props.accessibilityLabel = config.label;
  }

  // Hint
  if (config.hint) {
    props.accessibilityHint = config.hint;
  }

  // State
  if (config.state) {
    const state = config.state;
    if (state.disabled !== undefined) {
      props.accessibilityState = { ...props.accessibilityState, disabled: state.disabled };
    }
    if (state.selected !== undefined) {
      props.accessibilityState = { ...props.accessibilityState, selected: state.selected };
    }
    if (state.checked !== undefined) {
      props.accessibilityState = { ...props.accessibilityState, checked: state.checked };
    }
    if (state.expanded !== undefined) {
      props.accessibilityState = { ...props.accessibilityState, expanded: state.expanded };
    }
  }

  // Actions
  if (config.actions && config.actions.length > 0) {
    props.accessibilityActions = config.actions.map(action => ({ name: action }));
  }

  // Value
  if (config.value) {
    props.accessibilityValue = config.value;
  }

  return props;
};

// Button accessibility props
export const getButtonAccessibilityProps = (config: {
  title: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}) => {
  return createAccessibilityProps({
    role: 'button',
    label: config.loading ? `${config.title}, loading` : config.title,
    hint: config.disabled ? 'Button is disabled' : `Tap to ${config.title.toLowerCase()}`,
    state: {
      disabled: Boolean(config.disabled || config.loading),
    },
  });
};

// Card accessibility props
export const getCardAccessibilityProps = (config: {
  title: string;
  subtitle?: string;
  expanded?: boolean;
  onPress?: () => void;
}) => {
  return createAccessibilityProps({
    role: config.onPress ? 'button' : 'none',
    label: `${config.title}${config.subtitle ? `, ${config.subtitle}` : ''}`,
    ...(config.onPress ? { hint: 'Tap to view details' } : {}),
    state: {
      expanded: Boolean(config.expanded),
    },
  });
};

// Input accessibility props
export const getInputAccessibilityProps = (config: {
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
}) => {
  return createAccessibilityProps({
    role: 'text',
    label: config.label,
    hint: config.error || config.placeholder || `Enter ${config.label.toLowerCase()}`,
    state: {
      disabled: false,
    },
  });
};

// List accessibility props
export const getListAccessibilityProps = (config: {
  itemCount: number;
  title?: string;
}) => {
  return createAccessibilityProps({
    role: 'list',
    label: config.title || `List with ${config.itemCount} items`,
    hint: `Swipe to navigate through ${config.itemCount} items`,
  });
};

// List item accessibility props
export const getListItemAccessibilityProps = (config: {
  title: string;
  subtitle?: string;
  index: number;
  total: number;
  onPress?: () => void;
}) => {
  return createAccessibilityProps({
    role: config.onPress ? 'button' : 'none',
    label: `${config.title}${config.subtitle ? `, ${config.subtitle}` : ''}`,
    hint: config.onPress ? `Item ${config.index + 1} of ${config.total}, tap to select` : `Item ${config.index + 1} of ${config.total}`,
  });
};

// Image accessibility props
export const getImageAccessibilityProps = (config: {
  alt: string;
  decorative?: boolean;
}) => {
  return createAccessibilityProps({
    role: 'image',
    ...(config.decorative ? {} : { label: config.alt }),
    state: {
      disabled: Boolean(config.decorative),
    },
  });
};

// Status indicator accessibility props
export const getStatusAccessibilityProps = (config: {
  status: 'safe' | 'caution' | 'avoid';
  title: string;
  description?: string;
}) => {
  const statusLabels = {
    safe: 'Safe',
    caution: 'Caution',
    avoid: 'Avoid',
  };

  return createAccessibilityProps({
    role: 'text',
    label: `${statusLabels[config.status]}: ${config.title}`,
    hint: config.description || `This item is marked as ${statusLabels[config.status].toLowerCase()}`,
  });
};

// Announce changes to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (Platform.OS === 'web') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  } else {
    // For React Native, use the accessibility service
    logger.info('Screen reader announcement', 'AccessibilityHelpers', { message, priority });
  }
};

// Focus management
export const focusElement = (elementRef: any) => {
  if (elementRef && elementRef.current) {
    if (Platform.OS === 'web') {
      elementRef.current.focus();
    } else {
      // For React Native, use accessibility focus
      elementRef.current.setNativeProps({ accessibilityFocus: true });
    }
  }
};

// Check if accessibility is enabled
export const isAccessibilityEnabled = (): boolean => {
  if (Platform.OS === 'web') {
    // Check for screen reader usage
    return window.navigator.userAgent.includes('NVDA') || 
           window.navigator.userAgent.includes('JAWS') ||
           window.navigator.userAgent.includes('VoiceOver');
  }
  return false; // For React Native, this would check device settings
};

// Generate accessible color contrast
export const getAccessibleColor = (backgroundColor: string, textColor: string): string => {
  // Simple contrast check - in a real app, you'd use a proper contrast calculation
  const isLight = backgroundColor.includes('#fff') || backgroundColor.includes('#f');
  return isLight ? '#000000' : '#ffffff';
};

// Create accessible touch targets
export const getAccessibleTouchTarget = (size: number = 44) => {
  return {
    minWidth: size,
    minHeight: size,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };
};

// Accessibility testing helpers
export const testAccessibility = (component: any) => {
  const issues: string[] = [];
  
  // Check for required accessibility props
  if (!component.props.accessibilityLabel && !component.props.accessibilityHint) {
    issues.push('Missing accessibility label or hint');
  }
  
  if (component.props.accessibilityRole === 'button' && component.props.disabled) {
    if (!component.props.accessibilityState?.disabled) {
      issues.push('Button should have disabled state in accessibilityState');
    }
  }
  
  return issues;
};

const accessibilityHelpers = {
  createAccessibilityProps,
  getButtonAccessibilityProps,
  getCardAccessibilityProps,
  getInputAccessibilityProps,
  getListAccessibilityProps,
  getListItemAccessibilityProps,
  getImageAccessibilityProps,
  getStatusAccessibilityProps,
  announceToScreenReader,
  focusElement,
  isAccessibilityEnabled,
  getAccessibleColor,
  getAccessibleTouchTarget,
  testAccessibility,
};

export default accessibilityHelpers;
