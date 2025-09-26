/**
 * @fileoverview AnimationShowcase.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { BlurView } from '@react-native-community/blur';
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import AccessibilityService from '../utils/accessibility';
import { TransformUtils, AnimationUtils } from '../utils/animations';
import { HapticFeedback } from '../utils/haptics';

import LinearGradient from './LinearGradientWrapper';

// const { width: screenWidth } = Dimensions.get('window');

interface AnimationShowcaseProps {
  onClose?: () => void;
}

export const AnimationShowcase: React.FC<AnimationShowcaseProps> = ({
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [currentDemo, setCurrentDemo] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateZAnim = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const demos = [
    {
      title: '3D Card Flip',
      description: 'Demonstrates 3D card flipping with perspective',
      action: () => {
        HapticFeedback.trigger('medium');
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      },
    },
    {
      title: '3D Scale & Depth',
      description: 'Shows 3D scaling with depth and shadow effects',
      action: () => {
        HapticFeedback.trigger('light');
        Animated.parallel([
          Animated.timing(translateZAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(shadowAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.1,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.parallel([
            Animated.timing(translateZAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(shadowAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        });
      },
    },
    {
      title: 'Pulse Animation',
      description: 'Continuous pulsing effect for attention',
      action: () => {
        HapticFeedback.trigger('selection');
        const pulseAnimation = AnimationUtils.createPulse(
          pulseAnim,
          0.9,
          1.1,
          1000
        );
        pulseAnimation.start();
        setTimeout(() => pulseAnimation.stop(), 3000);
      },
    },
    {
      title: 'Shake Animation',
      description: 'Error state shake animation',
      action: () => {
        HapticFeedback.trigger('error');
        const shakeAnimation = AnimationUtils.createShake(shakeAnim, 10);
        shakeAnimation.start();
      },
    },
    {
      title: 'Bounce Animation',
      description: 'Success state bounce animation',
      action: () => {
        HapticFeedback.trigger('success');
        const bounceAnimation = AnimationUtils.createBounce(bounceAnim, 0.2);
        bounceAnimation.start();
      },
    },
    {
      title: 'Morphing Animation',
      description: 'Smooth morphing between states',
      action: () => {
        HapticFeedback.trigger('medium');
        const morphAnimation = AnimationUtils.createMorph(
          scaleAnim,
          0.8,
          1.2,
          500
        );
        morphAnimation.start(() => {
          AnimationUtils.createMorph(scaleAnim, 1.2, 1, 500).start();
        });
      },
    },
  ];

  const nextDemo = () => {
    HapticFeedback.navigation();
    setCurrentDemo((prev) => (prev + 1) % demos.length);
  };

  const prevDemo = () => {
    HapticFeedback.navigation();
    setCurrentDemo((prev) => (prev - 1 + demos.length) % demos.length);
  };

  // 3D transform styles
  const transform3DStyle = {
    transform: [
      {
        scale: Animated.multiply(
          scaleAnim,
          Animated.multiply(pulseAnim, bounceAnim)
        ),
      },
      {
        translateZ: translateZAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 20],
        }),
      },
      {
        rotateY: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
      { translateX: shakeAnim },
    ],
    ...TransformUtils.createPerspective(1000),
  };

  // Shadow style for 3D effect
  const shadowStyle = {
    shadowOpacity: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.5],
    }),
    shadowRadius: shadowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 20],
    }),
    shadowOffset: {
      width: shadowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 8],
      }),
      height: shadowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 12],
      }),
    },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.closeButtonText, { color: colors.accent }]}>
            ✕
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Animation Showcase
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Demo Card */}
        <Animated.View style={[transform3DStyle, shadowStyle]}>
          <BlurView
            blurAmount={20}
            blurType={isDark ? 'dark' : 'light'}
            reducedTransparencyFallbackColor={colors.surface}
            style={styles.demoCard}
          >
            <LinearGradient
              colors={Colors.primaryGradient}
              style={styles.gradientOverlay}
            >
              <Text style={styles.demoTitle}>
                {demos[currentDemo]?.title || 'Demo'}
              </Text>
              <Text style={styles.demoDescription}>
                {demos[currentDemo]?.description || 'Description'}
              </Text>

              <TouchableOpacity
                style={styles.demoButton}
                onPress={demos[currentDemo]?.action || (() => {})}
                {...AccessibilityService.createButtonConfig(
                  `Run ${demos[currentDemo]?.title || 'Demo'} animation`,
                  demos[currentDemo]?.description || 'Description'
                )}
              >
                <Text style={styles.demoButtonText}>Run Animation</Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Demo Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={prevDemo}
            {...AccessibilityService.createButtonConfig(
              'Previous demo',
              'Go to previous animation demo'
            )}
          >
            <Text style={[styles.navButtonText, { color: colors.text }]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.demoIndicator}>
            <Text
              style={[
                styles.demoIndicatorText,
                { color: colors.textSecondary },
              ]}
            >
              {currentDemo + 1} of {demos.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={nextDemo}
            {...AccessibilityService.createButtonConfig(
              'Next demo',
              'Go to next animation demo'
            )}
          >
            <Text style={[styles.navButtonText, { color: colors.text }]}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animation Types */}
        <View style={styles.animationTypes}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Animations
          </Text>

          {demos.map((demo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.animationTypeItem,
                {
                  backgroundColor: colors.surface,
                  borderColor:
                    currentDemo === index ? colors.accent : colors.border,
                },
              ]}
              onPress={() => {
                HapticFeedback.selection();
                setCurrentDemo(index);
              }}
              {...AccessibilityService.createButtonConfig(
                demo.title,
                demo.description
              )}
            >
              <Text style={[styles.animationTypeTitle, { color: colors.text }]}>
                {demo.title}
              </Text>
              <Text
                style={[
                  styles.animationTypeDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {demo.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Haptic Feedback Demo */}
        <View style={styles.hapticDemo}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Haptic Feedback
          </Text>

          <View style={styles.hapticButtons}>
            {[
              { type: 'light', label: 'Light' },
              { type: 'medium', label: 'Medium' },
              { type: 'heavy', label: 'Heavy' },
              { type: 'success', label: 'Success' },
              { type: 'warning', label: 'Warning' },
              { type: 'error', label: 'Error' },
            ].map((haptic, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.hapticButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => HapticFeedback.trigger(haptic.type)}
                {...AccessibilityService.createButtonConfig(
                  `${haptic.label} haptic feedback`,
                  `Trigger ${haptic.label.toLowerCase()} haptic feedback`
                )}
              >
                <Text style={[styles.hapticButtonText, { color: colors.text }]}>
                  {haptic.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animationTypeDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  animationTypeItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  animationTypeTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  animationTypes: {
    marginBottom: Spacing.xl,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  demoButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  demoCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    minHeight: 200,
    overflow: 'hidden',
  },
  demoDescription: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.lg,
    opacity: 0.9,
    textAlign: 'center',
  },
  demoIndicator: {
    alignItems: 'center',
  },
  demoIndicatorText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  demoTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  gradientOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  hapticButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    minWidth: '30%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  hapticButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  hapticButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hapticDemo: {
    marginBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: 44,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    minWidth: 100,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  navigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  placeholder: {
    width: 32,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});

export default AnimationShowcase;
