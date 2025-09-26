/**
 * @fileoverview StorySection.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // Dimensions,
  Animated,
  TouchableOpacity,
  useColorScheme,
  Platform,
  // ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { HapticFeedback } from '../utils/haptics';

// const { width } = Dimensions.get('window');

interface StorySectionProps {
  title: string;
  subtitle: string;
  content: string;
  ctaText?: string;
  onCTAPress?: () => void;
  visualComponent?: React.ReactNode;
  sectionType: 'problem' | 'solution' | 'features' | 'social-proof' | 'cta';
  enableAnimation?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

export const StorySection: React.FC<StorySectionProps> = ({
  title,
  subtitle,
  content,
  ctaText,
  onCTAPress,
  visualComponent,
  sectionType,
  enableAnimation = true,
  performanceMode = 'medium',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  // const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (enableAnimation && performanceMode !== 'low') {
      const timer = setTimeout(() => {
        // setIsVisible(true);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }, 100);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    }

    return undefined;
  }, [enableAnimation, performanceMode, fadeAnim, scaleAnim, slideAnim]);

  const handleCTAPress = () => {
    if (onCTAPress) {
      HapticFeedback.buttonPress();
      onCTAPress();
    }
  };

  const getSectionStyles = () => {
    const baseStyles = {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    };

    switch (sectionType) {
      case 'problem':
        return {
          ...baseStyles,
          backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
          borderLeftColor: Colors.avoid,
          borderLeftWidth: 4,
        };
      case 'solution':
        return {
          ...baseStyles,
          backgroundColor: isDark ? '#0d1b2a' : '#f0f9ff',
          borderLeftColor: Colors.safe,
          borderLeftWidth: 4,
        };
      case 'features':
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
        };
      case 'social-proof':
        return {
          ...baseStyles,
          backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
        };
      case 'cta':
        return {
          ...baseStyles,
          backgroundColor: colors.accent + '10',
          borderColor: colors.accent,
          borderWidth: 2,
        };
      default:
        return baseStyles;
    }
  };

  const getTitleColor = () => {
    switch (sectionType) {
      case 'problem':
        return Colors.avoid;
      case 'solution':
        return Colors.safe;
      case 'cta':
        return colors.accent;
      default:
        return colors.text;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getSectionStyles(),
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={[styles.title, { color: getTitleColor() }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
          <Text style={[styles.contentText, { color: colors.text }]}>
            {content}
          </Text>
        </View>

        {visualComponent && (
          <View style={styles.visualContainer}>
            {visualComponent}
          </View>
        )}

        {ctaText && onCTAPress && (
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: sectionType === 'cta' ? colors.accent : colors.surface,
                borderColor: colors.accent,
                borderWidth: sectionType === 'cta' ? 0 : 2,
              },
            ]}
            onPress={handleCTAPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={ctaText}
          >
            <Text
              style={[
                styles.ctaText,
                {
                  color: sectionType === 'cta' ? colors.surface : colors.accent,
                },
              ]}
            >
              {ctaText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
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
  },
  content: {
    padding: Spacing.xl,
  },
  textContent: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.h2,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.bodyLarge,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.bodyLarge,
    marginBottom: Spacing.md,
  },
  contentText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.body,
  },
  visualContainer: {
    marginVertical: Spacing.lg,
    alignItems: 'center',
  },
  ctaButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  ctaText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: Typography.fontWeight.semiBold,
    lineHeight: Typography.lineHeight.button,
  },
});

export default StorySection;
