import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { AnimatedButton } from '../components/AnimatedButton';
import { GlassmorphicCard } from '../components/GlassmorphicCard';

const { width, height } = Dimensions.get('window');

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
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={Colors.primaryGradient}
        style={styles.gradient}
      >
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
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <Text style={styles.title}>GutSafe</Text>
            <Text style={styles.subtitle}>Peace of mind for your gut</Text>
            <Text style={styles.description}>
              Scan barcodes and menus to instantly know if foods are safe for your gut health.
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
                title="Start Scanning"
                onPress={onStartScanning}
                size="large"
                variant="primary"
                style={styles.primaryButton}
              />
            </Animated.View>

            <AnimatedButton
              title="Set Up Gut Profile"
              onPress={onSetupProfile}
              size="medium"
              variant="glass"
              style={styles.secondaryButton}
            />
          </View>

        </Animated.View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    minHeight: height,
    paddingTop: 60,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: 100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: 300,
    left: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 500,
    right: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 48,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    opacity: 0.9,
  },
  description: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
    opacity: 0.8,
    maxWidth: 300,
  },
  featuresContainer: {
    marginBottom: Spacing.xxl,
  },
  featureCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 16,
  },
  featureTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
    flex: 1,
  },
  featureText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    opacity: 0.8,
    lineHeight: Typography.lineHeight.bodySmall,
  },
  buttonContainer: {
    marginBottom: Spacing.xxl,
  },
  primaryButton: {
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryButton: {
    marginBottom: Spacing.lg,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
});
