/**
 * @fileoverview EnhancedAccessibility.tsx - Enhanced Accessibility Components
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect, useState } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  useColorScheme,
} from 'react-native';

import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { enhancedAccessibility } from '../utils/enhancedAccessibility';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

interface EnhancedAccessibilityProps {
  children: React.ReactNode;
  role?: 'button' | 'text' | 'image' | 'header' | 'link' | 'none';
  label?: string;
  hint?: string;
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  value?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  actions?: Array<{
    name: string;
    label?: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  style?: ViewStyle;
  testID?: string;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
}

export const EnhancedAccessibility: React.FC<EnhancedAccessibilityProps> = ({
  children,
  role = 'none',
  label,
  hint,
  state,
  value,
  actions,
  onAccessibilityAction,
  style,
  testID,
  importantForAccessibility = 'auto',
  accessibilityLiveRegion = 'none',
  accessibilityElementsHidden = false,
  accessibilityViewIsModal = false,
}) => {
  const {
    isScreenReaderEnabled,
    isHighContrastEnabled,
    isLargeTextEnabled,
    colors,
  } = useResponsiveDesign();

  const [accessibilityFeatures, setAccessibilityFeatures] = useState(
    enhancedAccessibility.getFeatures()
  );

  useEffect(() => {
    const unsubscribe = enhancedAccessibility.subscribe((features) => {
      setAccessibilityFeatures(features);
    });

    return unsubscribe;
  }, []);

  // Create comprehensive accessibility config
  const accessibilityConfig = enhancedAccessibility.getComprehensiveConfig({
    accessible: true,
    accessibilityRole: role,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: state,
    accessibilityValue: value,
    accessibilityActions: actions,
    onAccessibilityAction,
    testID,
    importantForAccessibility,
    accessibilityLiveRegion,
    accessibilityElementsHidden,
    accessibilityViewIsModal,
  });

  // Enhanced styles for accessibility
  const enhancedStyle: ViewStyle = {
    ...style,
    ...(isScreenReaderEnabled && {
      borderWidth: 1,
      borderColor: Colors.primary,
      borderRadius: BorderRadius.sm,
    }),
    ...(isHighContrastEnabled && {
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
  };

  return (
    <View style={enhancedStyle} {...accessibilityConfig}>
      {children}
    </View>
  );
};

// Enhanced accessible button
interface EnhancedAccessibleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  testID?: string;
}

export const EnhancedAccessibleButton: React.FC<EnhancedAccessibleButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  icon,
  hapticFeedback = true,
  hapticType = 'light',
  testID,
}) => {
  const {
    getButtonStyle,
    getTextStyle,
    isScreenReaderEnabled,
    isHighContrastEnabled,
    colors,
  } = useResponsiveDesign();

  const [isPressed, setIsPressed] = useState(false);

  // Get button styles
  const buttonStyle = getButtonStyle({
    variant,
    size,
    state: loading ? 'loading' : disabled ? 'disabled' : isPressed ? 'active' : 'default',
  });

  const textStyleUnified = getTextStyle({
    variant: 'primary',
    size,
    state: loading ? 'loading' : disabled ? 'disabled' : 'default',
  });

  // Enhanced accessibility config
  const accessibilityConfig = enhancedAccessibility.createButtonConfig(
    title,
    'Double tap to activate',
    disabled,
    loading
  );

  // Enhanced styles for accessibility
  const enhancedButtonStyle: ViewStyle = {
    ...buttonStyle,
    ...(isScreenReaderEnabled && {
      borderWidth: 2,
      borderColor: Colors.primary,
      borderRadius: BorderRadius.sm,
    }),
    ...(isHighContrastEnabled && {
      borderWidth: 3,
      borderColor: Colors.primary,
    }),
    ...style,
  };

  const enhancedTextStyle: TextStyle = {
    ...textStyleUnified,
    ...(isHighContrastEnabled && {
      fontWeight: Typography.fontWeight.bold,
    }),
    ...textStyle,
  };

  const handlePressIn = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={enhancedButtonStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...accessibilityConfig}
      testID={testID || `button-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <Text style={enhancedTextStyle}>Loading...</Text>
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={enhancedTextStyle}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Enhanced accessible text
interface EnhancedAccessibleTextProps {
  children: React.ReactNode;
  role?: 'text' | 'header' | 'link' | 'button';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  style?: TextStyle;
  onPress?: () => void;
  testID?: string;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

export const EnhancedAccessibleText: React.FC<EnhancedAccessibleTextProps> = ({
  children,
  role = 'text',
  level,
  style,
  onPress,
  testID,
  importantForAccessibility = 'auto',
}) => {
  const {
    getTextStyle,
    isScreenReaderEnabled,
    isHighContrastEnabled,
    isLargeTextEnabled,
    colors,
  } = useResponsiveDesign();

  // Determine text size based on role and level
  const getTextSize = () => {
    if (role === 'header') {
      switch (level) {
        case 1:
          return 'xl';
        case 2:
          return 'lg';
        case 3:
          return 'md';
        case 4:
          return 'sm';
        case 5:
          return 'sm';
        case 6:
          return 'xs';
        default:
          return 'lg';
      }
    }
    return 'md';
  };

  const textSize = getTextSize() as 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Get text styles
  const textStyleUnified = getTextStyle({
    variant: 'primary',
    size: textSize,
    state: 'default',
  });

  // Enhanced accessibility config
  const accessibilityConfig = {
    accessible: true,
    accessibilityRole: role,
    accessibilityLabel: typeof children === 'string' ? children : undefined,
    testID,
    importantForAccessibility,
  };

  // Enhanced styles for accessibility
  const enhancedTextStyle: TextStyle = {
    ...textStyleUnified,
    ...(isScreenReaderEnabled && {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: BorderRadius.xs,
      padding: Spacing.xs,
    }),
    ...(isHighContrastEnabled && {
      fontWeight: Typography.fontWeight.bold,
      color: Colors.primary,
    }),
    ...(isLargeTextEnabled && {
      fontSize: textStyleUnified.fontSize! * 1.2,
    }),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.textButton}
        {...accessibilityConfig}
      >
        <Text style={enhancedTextStyle}>{children}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Text style={enhancedTextStyle} {...accessibilityConfig}>
      {children}
    </Text>
  );
};

// Enhanced accessible image
interface EnhancedAccessibleImageProps {
  source: { uri: string } | number;
  alt: string;
  style?: ViewStyle;
  decorative?: boolean;
  testID?: string;
  onPress?: () => void;
}

export const EnhancedAccessibleImage: React.FC<EnhancedAccessibleImageProps> = ({
  source,
  alt,
  style,
  decorative = false,
  testID,
  onPress,
}) => {
  const {
    isScreenReaderEnabled,
    isHighContrastEnabled,
    colors,
  } = useResponsiveDesign();

  // Enhanced accessibility config
  const accessibilityConfig = enhancedAccessibility.createImageConfig(alt, decorative);

  // Enhanced styles for accessibility
  const enhancedStyle: ViewStyle = {
    ...style,
    ...(isScreenReaderEnabled && !decorative && {
      borderWidth: 1,
      borderColor: Colors.primary,
      borderRadius: BorderRadius.sm,
    }),
    ...(isHighContrastEnabled && !decorative && {
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={enhancedStyle}
        {...accessibilityConfig}
        testID={testID}
      >
        {/* Image component would go here */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageAltText}>{alt}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={enhancedStyle} {...accessibilityConfig} testID={testID}>
      {/* Image component would go here */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageAltText}>{alt}</Text>
      </View>
    </View>
  );
};

// Enhanced accessible list
interface EnhancedAccessibleListProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    disabled?: boolean;
    selected?: boolean;
  }>;
  label: string;
  style?: ViewStyle;
  testID?: string;
}

export const EnhancedAccessibleList: React.FC<EnhancedAccessibleListProps> = ({
  items,
  label,
  style,
  testID,
}) => {
  const {
    isScreenReaderEnabled,
    isHighContrastEnabled,
    colors,
  } = useResponsiveDesign();

  // Enhanced accessibility config
  const accessibilityConfig = enhancedAccessibility.createListConfig(label, items.length);

  // Enhanced styles for accessibility
  const enhancedStyle: ViewStyle = {
    ...style,
    ...(isScreenReaderEnabled && {
      borderWidth: 1,
      borderColor: Colors.primary,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
    }),
    ...(isHighContrastEnabled && {
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
  };

  return (
    <View style={enhancedStyle} {...accessibilityConfig} testID={testID}>
      {items.map((item, index) => (
        <EnhancedAccessibleButton
          key={item.id}
          title={item.title}
          onPress={item.onPress || (() => {})}
          disabled={item.disabled}
          variant={item.selected ? 'primary' : 'secondary'}
          size="medium"
          testID={`list-item-${index}`}
        />
      ))}
    </View>
  );
};

// Enhanced accessible progress bar
interface EnhancedAccessibleProgressProps {
  value: number;
  max: number;
  label: string;
  style?: ViewStyle;
  testID?: string;
  showPercentage?: boolean;
}

export const EnhancedAccessibleProgress: React.FC<EnhancedAccessibleProgressProps> = ({
  value,
  max,
  label,
  style,
  testID,
  showPercentage = true,
}) => {
  const {
    isScreenReaderEnabled,
    isHighContrastEnabled,
    colors,
  } = useResponsiveDesign();

  const percentage = Math.round((value / max) * 100);

  // Enhanced accessibility config
  const accessibilityConfig = enhancedAccessibility.createProgressConfig(label, value, max);

  // Enhanced styles for accessibility
  const enhancedStyle: ViewStyle = {
    ...style,
    ...(isScreenReaderEnabled && {
      borderWidth: 1,
      borderColor: Colors.primary,
      borderRadius: BorderRadius.sm,
      padding: Spacing.sm,
    }),
    ...(isHighContrastEnabled && {
      borderWidth: 2,
      borderColor: Colors.primary,
    }),
  };

  return (
    <View style={enhancedStyle} {...accessibilityConfig} testID={testID}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isHighContrastEnabled ? Colors.primary : Colors.safe,
              },
            ]}
          />
        </View>
        {showPercentage && (
          <Text style={styles.progressText}>{percentage}%</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  textButton: {
    alignSelf: 'flex-start',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAltText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default {
  EnhancedAccessibility,
  EnhancedAccessibleButton,
  EnhancedAccessibleText,
  EnhancedAccessibleImage,
  EnhancedAccessibleList,
  EnhancedAccessibleProgress,
};
