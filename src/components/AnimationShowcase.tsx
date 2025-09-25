/**
 * @fileoverview AnimationShowcase.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

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
import LinearGradient from './LinearGradientWrapper';
import { BlurView } from '@react-native-community/blur';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { HapticFeedback } from '../utils/haptics';
import { 
  TransformUtils, 
  AnimationUtils
} from '../utils/animations';
import AccessibilityService from '../utils/accessibility';

// const { width: screenWidth } = Dimensions.get('window');

interface AnimationShowcaseProps {
  onClose?: () => void;
}

export const AnimationShowcase: React.FC<AnimationShowcaseProps> = ({ onClose }) => {
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
        const pulseAnimation = AnimationUtils.createPulse(pulseAnim, 0.9, 1.1, 1000);
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
      { scale: Animated.multiply(scaleAnim, Animated.multiply(pulseAnim, bounceAnim)) },
      { translateZ: translateZAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
      })},
      { rotateY: rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
      })},
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
    <Animated.View style={[
      styles.container,
      {
        backgroundColor: colors.background,
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ]
      }
    ]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: colors.accent }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Animation Showcase</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Card */}
        <Animated.View style={[transform3DStyle, shadowStyle]}>
          <BlurView
            style={styles.demoCard}
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={20}
            reducedTransparencyFallbackColor={colors.surface}
          >
            <LinearGradient
              colors={Colors.primaryGradient}
              style={styles.gradientOverlay}
            >
              <Text style={styles.demoTitle}>{demos[currentDemo]?.title || 'Demo'}</Text>
              <Text style={styles.demoDescription}>{demos[currentDemo]?.description || 'Description'}</Text>
              
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
            <Text style={[styles.navButtonText, { color: colors.text }]}>← Previous</Text>
          </TouchableOpacity>
          
          <View style={styles.demoIndicator}>
            <Text style={[styles.demoIndicatorText, { color: colors.textSecondary }]}>
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
            <Text style={[styles.navButtonText, { color: colors.text }]}>Next →</Text>
          </TouchableOpacity>
        </View>

        {/* Animation Types */}
        <View style={styles.animationTypes}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Animations</Text>
          
          {demos.map((demo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.animationTypeItem,
                { 
                  backgroundColor: colors.surface,
                  borderColor: currentDemo === index ? colors.accent : colors.border,
                }
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
              <Text style={[styles.animationTypeDescription, { color: colors.textSecondary }]}>
                {demo.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Haptic Feedback Demo */}
        <View style={styles.hapticDemo}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Haptic Feedback</Text>
          
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
                style={[styles.hapticButton, { backgroundColor: colors.surface }]}
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  demoCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    minHeight: 200,
  },
  gradientOverlay: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  demoDescription: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    opacity: 0.9,
  },
  demoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  navButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  demoIndicator: {
    alignItems: 'center',
  },
  demoIndicatorText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
  },
  animationTypes: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  animationTypeItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  animationTypeTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  animationTypeDescription: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
  },
  hapticDemo: {
    marginBottom: Spacing.xl,
  },
  hapticButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hapticButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    minWidth: '30%',
    alignItems: 'center',
  },
  hapticButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
});

export default AnimationShowcase;
