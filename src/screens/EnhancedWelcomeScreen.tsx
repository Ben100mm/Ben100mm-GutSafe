/**
 * @fileoverview EnhancedWelcomeScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';

import { AnimatedButton } from '../components/AnimatedButton';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import LinearGradient from '../components/LinearGradientWrapper';
// import { BlurView } from '@react-native-community/blur';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { height } = Dimensions.get('window');

interface EnhancedWelcomeScreenProps {
  onStartScanning: () => void;
  onSetupProfile: () => void;
}

export const EnhancedWelcomeScreen: React.FC<EnhancedWelcomeScreenProps> = ({
  onStartScanning,
  onSetupProfile,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the main button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <LinearGradient colors={Colors.primaryGradient} style={styles.gradient}>
        {/* Floating background elements */}
        <View style={styles.floatingElements}>
          <Animated.View style={[styles.floatingCircle, styles.circle1]} />
          <Animated.View style={[styles.floatingCircle, styles.circle2]} />
          <Animated.View style={[styles.floatingCircle, styles.circle3]} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <Text style={styles.title}>GutSafe</Text>
            <Text style={styles.subtitle}>Peace of mind for your gut</Text>
            <Text style={styles.description}>
              Scan barcodes and menus to instantly know if foods are safe for
              your gut health.
            </Text>
          </View>

          {/* Feature cards */}
          <View style={styles.featuresContainer}>
            <GlassmorphicCard style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIcon}>
                  <Text style={styles.iconText}>📱</Text>
                </View>
                <Text style={styles.featureTitle}>Instant Scanning</Text>
              </View>
              <Text style={styles.featureText}>
                Point, scan, and get instant gut health insights
              </Text>
            </GlassmorphicCard>

            <GlassmorphicCard style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIcon}>
                  <Text style={styles.iconText}>👤</Text>
                </View>
                <Text style={styles.featureTitle}>Personalized</Text>
              </View>
              <Text style={styles.featureText}>
                Tailored to your specific sensitivities and conditions
              </Text>
            </GlassmorphicCard>

            <GlassmorphicCard style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={styles.featureIcon}>
                  <Text style={styles.iconText}>⚡</Text>
                </View>
                <Text style={styles.featureTitle}>Real-time</Text>
              </View>
              <Text style={styles.featureText}>
                No more guessing - get answers in seconds
              </Text>
            </GlassmorphicCard>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <AnimatedButton
                size="large"
                style={styles.primaryButton}
                title="Start Scanning"
                variant="primary"
                onPress={onStartScanning}
              />
            </Animated.View>

            <AnimatedButton
              size="medium"
              style={styles.secondaryButton}
              title="Set Up Gut Profile"
              variant="glass"
              onPress={onSetupProfile}
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: Spacing.xxl,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  circle1: {
    height: 200,
    right: -50,
    top: 100,
    width: 200,
  },
  circle2: {
    height: 150,
    left: -30,
    top: 300,
    width: 150,
  },
  circle3: {
    height: 100,
    right: 50,
    top: 500,
    width: 100,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  description: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
    maxWidth: 300,
    opacity: 0.8,
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  featureHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 32,
  },
  featureText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: Typography.lineHeight.bodySmall,
    opacity: 0.8,
  },
  featureTitle: {
    color: Colors.white,
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
  },
  featuresContainer: {
    marginBottom: Spacing.xxl,
  },
  floatingCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1000,
    position: 'absolute',
  },
  floatingElements: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  gradient: {
    minHeight: height,
    paddingTop: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconText: {
    fontSize: 16,
  },
  primaryButton: {
    elevation: 8,
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  secondaryButton: {
    marginBottom: Spacing.lg,
  },
  subtitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.lg,
    opacity: 0.9,
    textAlign: 'center',
  },
  title: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 48,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
