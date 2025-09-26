/**
 * @fileoverview TabIcon.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

// import { Colors } from '../constants/colors';
// import { HapticFeedback } from '../utils/haptics';
// import { AnimationPresets, TransformUtils } from '../utils/animations';
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
  accessibilityLabel,
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
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Pulse animation for focused state
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
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
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }

    return undefined;
  }, [focused, pulseAnim, rotateAnim, scaleAnim]);

  // 3D transform styles
  const transform3DStyle = enable3D
    ? {
        transform: [
          { scale: Animated.multiply(scaleAnim, pulseAnim) },
          {
            rotateY: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }
    : {
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
          <Animated.View
            style={[styles.iconContainer, transform3DStyle]}
            {...accessibilityConfig}
          >
            <View style={[styles.heart, { borderColor: color }]}>
              <View
                style={[
                  styles.heartFill,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
            </View>
          </Animated.View>
        );
      case 'camera':
        return (
          <Animated.View
            style={[styles.iconContainer, transform3DStyle]}
            {...accessibilityConfig}
          >
            <View style={[styles.camera, { borderColor: color }]}>
              <View
                style={[
                  styles.cameraLens,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
            </View>
          </Animated.View>
        );
      case 'grid':
        return (
          <Animated.View
            style={[styles.iconContainer, transform3DStyle]}
            {...accessibilityConfig}
          >
            <View style={styles.grid}>
              <View
                style={[
                  styles.gridDot,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
              <View
                style={[
                  styles.gridDot,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
              <View
                style={[
                  styles.gridDot,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
              <View
                style={[
                  styles.gridDot,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
            </View>
          </Animated.View>
        );
      case 'trend':
        return (
          <Animated.View
            style={[styles.iconContainer, transform3DStyle]}
            {...accessibilityConfig}
          >
            <View style={[styles.trend, { borderColor: color }]}>
              <View
                style={[
                  styles.trendLine,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
              <View
                style={[
                  styles.trendLine,
                  styles.trendLine2,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
              <View
                style={[
                  styles.trendLine,
                  styles.trendLine3,
                  { backgroundColor: focused ? color : 'transparent' },
                ]}
              />
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
  camera: {
    borderRadius: 4,
    borderWidth: 2,
    height: 16,
    position: 'relative',
    width: 20,
  },
  cameraLens: {
    borderRadius: 2,
    bottom: 2,
    left: 2,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  grid: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 16,
    justifyContent: 'space-between',
    width: 16,
  },
  gridDot: {
    borderRadius: 3,
    height: 6,
    margin: 1,
    width: 6,
  },
  heart: {
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    height: 18,
    position: 'relative',
    transform: [{ rotate: '-45deg' }],
    width: 20,
  },
  heartFill: {
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    bottom: 2,
    left: 2,
    position: 'absolute',
    right: 2,
    top: 2,
    transform: [{ rotate: '45deg' }],
  },
  iconContainer: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  trend: {
    alignItems: 'flex-start',
    borderRadius: 2,
    borderWidth: 1,
    height: 16,
    justifyContent: 'flex-end',
    position: 'relative',
    width: 20,
  },
  trendLine: {
    borderRadius: 1,
    height: 2,
    position: 'absolute',
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
