/**
 * @fileoverview ImmersiveHero.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-web-linear-gradient';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { HapticFeedback } from '../utils/haptics';
// import { AnimationPresets, TransformUtils } from '../utils/animations';

const { width, height } = Dimensions.get('window');

interface ImmersiveHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCTAPress: () => void;
  enable3D?: boolean;
  enableParticles?: boolean;
  backgroundType?: 'gradient' | 'solid' | 'pattern';
  performanceMode?: 'high' | 'medium' | 'low';
}

export const ImmersiveHero: React.FC<ImmersiveHeroProps> = ({
  title,
  subtitle,
  ctaText,
  onCTAPress,
  enable3D = false,
  enableParticles = false,
  backgroundType = 'gradient',
  performanceMode = 'medium',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  // const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Progressive loading based on performance mode
    const loadDelay = performanceMode === 'high' ? 0 : performanceMode === 'medium' ? 100 : 300;
    
    setTimeout(() => {
      // setIsLoaded(true);
      
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Particle animation (only if enabled and performance allows)
      if (enableParticles && performanceMode !== 'low') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(particleAnim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(particleAnim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ])
        ).start();
      }
    }, loadDelay);
  }, [performanceMode, enableParticles, fadeAnim, particleAnim, scaleAnim, slideAnim]);

  const handleCTAPress = () => {
    HapticFeedback.buttonPress();
    onCTAPress();
  };

  const renderBackground = () => {
    if (backgroundType === 'gradient') {
      return (
        <LinearGradient
          colors={isDark ? [Colors.primary, Colors.primaryLight] : [Colors.primaryLight, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
      );
    } else if (backgroundType === 'pattern') {
      return (
        <View style={[styles.background, { backgroundColor: colors.background }]}>
          {/* Pattern overlay would go here */}
          <View style={styles.patternOverlay} />
        </View>
      );
    } else {
      return <View style={[styles.background, { backgroundColor: colors.background }]} />;
    }
  };

  const renderParticles = () => {
    if (!enableParticles || performanceMode === 'low') return null;

    return (
      <View style={styles.particlesContainer}>
        {[...Array(performanceMode === 'high' ? 20 : 10)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.6,
                opacity: particleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 0.8, 0.3],
                }),
                transform: [
                  {
                    translateY: particleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                  {
                    scale: particleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBackground()}
      {renderParticles()}
      
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
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.accent }]}
          onPress={handleCTAPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={ctaText}
        >
          <Text style={[styles.ctaText, { color: colors.surface }]}>
            {ctaText}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Scroll indicator */}
      <Animated.View
        style={[
          styles.scrollIndicator,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.scrollDot, { backgroundColor: colors.textTertiary }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.8,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    // Pattern would be implemented here
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryLight,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.hero,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.hero,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.bodyLarge,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: Typography.lineHeight.bodyLarge,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  ctaButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    minWidth: 200,
    alignItems: 'center',
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
  ctaText: {
    fontSize: Typography.fontSize.button,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: Typography.fontWeight.semiBold,
    lineHeight: Typography.lineHeight.button,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: Spacing.xl,
    alignItems: 'center',
  },
  scrollDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default ImmersiveHero;
