/**
 * @fileoverview AccessibilityEnhancements.tsx - Enhanced Accessibility Components
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  useColorScheme,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

// Enhanced Accessible Button with better semantics
interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'menuitem';
  testID?: string;
  style?: any;
  textStyle?: any;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(isEnabled);
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: size === 'small' ? Spacing.md : size === 'large' ? Spacing.xl : Spacing.lg,
      paddingVertical: size === 'small' ? Spacing.sm : size === 'large' ? Spacing.lg : Spacing.md,
      minHeight: size === 'small' ? 36 : size === 'large' ? 56 : 48,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.accent,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.accent,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : Colors.avoid,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontFamily: Typography.fontFamily.semiBold,
      fontSize: size === 'small' ? Typography.fontSize.bodySmall : size === 'large' ? Typography.fontSize.h3 : Typography.fontSize.body,
    };

    switch (variant) {
      case 'primary':
      case 'danger':
        return {
          ...baseStyle,
          color: Colors.white,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.text,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: colors.accent,
        };
      default:
        return {
          ...baseStyle,
          color: colors.text,
        };
    }
  };

  const accessibilityConfig = {
    accessible: true,
    accessibilityRole,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint: accessibilityHint || (disabled ? 'Button is disabled' : undefined),
    accessibilityState: {
      disabled: disabled || loading,
      busy: loading,
    },
    testID: testID || `button-${title.toLowerCase().replace(/\s+/g, '-')}`,
  };

  const screenReaderStyle = isScreenReaderEnabled
    ? {
        borderWidth: 2,
        borderColor: colors.accent,
        borderRadius: BorderRadius.sm,
      }
    : {};

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[getButtonStyle(), screenReaderStyle, style]}
      onPress={onPress}
      {...accessibilityConfig}
    >
      <Text style={[getTextStyle(), textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

// Enhanced Accessible Input with better semantics
interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  accessibilityHint?: string;
  testID?: string;
  style?: any;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  secureTextEntry = false,
  accessibilityHint,
  testID,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = {
    borderWidth: 1,
    borderColor: error ? Colors.avoid : isFocused ? colors.accent : colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: disabled ? colors.background : colors.surface,
    color: colors.text,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    minHeight: multiline ? 80 : 48,
  };

  const accessibilityConfig = {
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: `${label}${required ? ' (required)' : ''}`,
    accessibilityHint: accessibilityHint || (error ? `Error: ${error}` : undefined),
    accessibilityState: {
      disabled,
    },
    testID: testID || `input-${label.toLowerCase().replace(/\s+/g, '-')}`,
  };

  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={{ color: Colors.avoid }}> *</Text>}
      </Text>
      
      <Text
        style={[inputStyle, multiline && styles.multilineInput]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        {...accessibilityConfig}
      />
      
      {error && (
        <Text style={[styles.errorText, { color: Colors.avoid }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

// Enhanced Accessible Card with better semantics
interface AccessibleCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: any;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  disabled = false,
  selected = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const cardStyle = {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.sm,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    ...(selected && {
      borderWidth: 2,
      borderColor: colors.accent,
    }),
    ...(disabled && {
      opacity: 0.6,
    }),
  };

  const accessibilityConfig = {
    accessible: true,
    accessibilityRole: onPress ? 'button' as const : 'none' as const,
    accessibilityLabel: accessibilityLabel || title,
    accessibilityHint: accessibilityHint || (onPress ? 'Double tap to activate' : undefined),
    accessibilityState: {
      disabled,
      selected,
    },
    testID: testID || `card-${title?.toLowerCase().replace(/\s+/g, '-') || 'default'}`,
  };

  const CardContent = () => (
    <View style={[cardStyle, style]}>
      {title && (
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        {...accessibilityConfig}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View {...accessibilityConfig}>
      <CardContent />
    </View>
  );
};

// Enhanced Accessible List with better semantics
interface AccessibleListProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    disabled?: boolean;
    selected?: boolean;
  }>;
  accessibilityLabel?: string;
  testID?: string;
  style?: any;
}

export const AccessibleList: React.FC<AccessibleListProps> = ({
  items,
  accessibilityLabel,
  testID,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[styles.listContainer, style]}
      accessibilityRole="list"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {items.map((item, index) => (
        <AccessibleCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          disabled={item.disabled}
          selected={item.selected}
          accessibilityLabel={`${item.title}${item.subtitle ? `, ${item.subtitle}` : ''}`}
          accessibilityHint={item.onPress ? 'Double tap to activate' : undefined}
          testID={`list-item-${index}`}
        />
      ))}
    </View>
  );
};

// Enhanced Accessible Modal with better semantics
interface AccessibleModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  accessibilityLabel?: string;
  testID?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  visible,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  accessibilityLabel,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  if (!visible) return null;

  return (
    <View
      style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
      accessibilityRole="dialog"
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>
          {title}
        </Text>
        
        <View style={styles.modalBody}>
          {children}
        </View>
        
        <View style={styles.modalActions}>
          <AccessibleButton
            title={cancelText}
            onPress={onClose}
            variant="outline"
            style={styles.modalButton}
          />
          {onConfirm && (
            <AccessibleButton
              title={confirmText}
              onPress={onConfirm}
              variant="primary"
              style={styles.modalButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.sm,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
  },
  cardTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.sm,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.md,
  },
  listContainer: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    margin: Spacing.lg,
    maxWidth: 400,
    width: '90%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default {
  AccessibleButton,
  AccessibleInput,
  AccessibleCard,
  AccessibleList,
  AccessibleModal,
};
