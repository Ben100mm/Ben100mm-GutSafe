import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { HapticFeedback } from '../utils/haptics';
import { AnimationPresets, TransformUtils } from '../utils/animations';
import AccessibilityService from '../utils/accessibility';

interface TabIconProps {
  name: 'heart' | 'camera' | 'grid' | 'trend';
  focused: boolean;
  color: string;
  enable3D?: boolean;
  accessibilityLabel?: string;
}

export const TabIcon: React.FC<TabIconProps> = ({ 
  name, 
  focused, 
  color, 
  enable3D = false,
  accessibilityLabel 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Focus animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for focused state
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      // Unfocus animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  // 3D transform styles
  const transform3DStyle = enable3D ? {
    transform: [
      { scale: Animated.multiply(scaleAnim, pulseAnim) },
      { rotateY: rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      })},
    ],
    ...TransformUtils.createPerspective(1000),
  } : {
    transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
  };

  // Accessibility config
  const accessibilityConfig = AccessibilityService.createTabConfig(
    accessibilityLabel || name,
    focused,
    `Navigate to ${name} tab`
  );
  const getIconPath = () => {
    switch (name) {
      case 'heart':
        return (
          <Animated.View style={[styles.iconContainer, transform3DStyle]} {...accessibilityConfig}>
            <View style={[styles.heart, { borderColor: color }]}>
              <View style={[styles.heartFill, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </Animated.View>
        );
      case 'camera':
        return (
          <Animated.View style={[styles.iconContainer, transform3DStyle]} {...accessibilityConfig}>
            <View style={[styles.camera, { borderColor: color }]}>
              <View style={[styles.cameraLens, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </Animated.View>
        );
      case 'grid':
        return (
          <Animated.View style={[styles.iconContainer, transform3DStyle]} {...accessibilityConfig}>
            <View style={styles.grid}>
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </Animated.View>
        );
      case 'trend':
        return (
          <Animated.View style={[styles.iconContainer, transform3DStyle]} {...accessibilityConfig}>
            <View style={[styles.trend, { borderColor: color }]}>
              <View style={[styles.trendLine, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.trendLine, styles.trendLine2, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.trendLine, styles.trendLine3, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return getIconPath();
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    width: 20,
    height: 18,
    borderWidth: 2,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    transform: [{ rotate: '-45deg' }],
    position: 'relative',
  },
  heartFill: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  camera: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderRadius: 4,
    position: 'relative',
  },
  cameraLens: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 2,
  },
  grid: {
    width: 16,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'space-between',
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  },
  trend: {
    width: 20,
    height: 16,
    borderWidth: 1,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  trendLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  trendLine2: {
    top: 6,
    width: 12,
  },
  trendLine3: {
    top: 10,
    width: 16,
  },
});
