/**
 * @fileoverview EnhancedAnimations.tsx - Enhanced Animation Components
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  View,
  Animated,
  Easing,
  Platform,
} from 'react-native';

import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { EnhancedAnimationPresets, EnhancedAnimationUtils } from '../utils/enhancedAnimations';
import { HapticFeedback } from '../utils/haptics';

interface EnhancedAnimationsProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideInFromRight' | 'slideInFromLeft' | 'slideInFromBottom' | 'slideInFromTop' | 'scaleIn' | 'bounce' | 'pulse' | 'shimmer';
  duration?: number;
  delay?: number;
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
  onAnimationComplete?: () => void;
  loop?: boolean;
  autoStart?: boolean;
}

export const EnhancedAnimations: React.FC<EnhancedAnimationsProps> = ({
  children,
  animation = 'fadeIn',
  duration,
  delay = 0,
  hapticFeedback = false,
  hapticType = 'light',
  style,
  onAnimationComplete,
  loop = false,
  autoStart = true,
}) => {
  const { shouldReduceMotion, isReduceMotionEnabled } = useResponsiveDesign();
  const [isVisible, setIsVisible] = useState(!autoStart);
  
  const animatedValue = useRef(new Animated.Value(autoStart ? 0 : 1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (shouldReduceMotion || isReduceMotionEnabled) {
      // Skip animations for users who prefer reduced motion
      animatedValue.setValue(1);
      setIsVisible(true);
      onAnimationComplete?.();
      return;
    }

    if (autoStart) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [autoStart, shouldReduceMotion, isReduceMotionEnabled]);

  const startAnimation = () => {
    if (shouldReduceMotion || isReduceMotionEnabled) {
      return;
    }

    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }

    let animationConfig: any = {
      duration,
      delay,
      hapticFeedback,
      hapticType,
      responsive: true,
    };

    let animation: Animated.CompositeAnimation;

    switch (animation) {
      case 'fadeIn':
        animation = EnhancedAnimationPresets.fadeIn(animationConfig);
        break;
      case 'slideInFromRight':
        animation = EnhancedAnimationPresets.slideInFromRight(animationConfig);
        break;
      case 'slideInFromLeft':
        animation = EnhancedAnimationPresets.slideInFromLeft(animationConfig);
        break;
      case 'slideInFromBottom':
        animation = EnhancedAnimationPresets.slideInFromBottom(animationConfig);
        break;
      case 'slideInFromTop':
        animation = EnhancedAnimationPresets.slideInFromTop(animationConfig);
        break;
      case 'scaleIn':
        animation = EnhancedAnimationPresets.scaleIn(animationConfig);
        break;
      case 'bounce':
        animation = EnhancedAnimationPresets.bounce(animationConfig);
        break;
      case 'pulse':
        animation = EnhancedAnimationPresets.pulse(animationConfig);
        break;
      case 'shimmer':
        animation = EnhancedAnimationPresets.shimmer(animationConfig);
        break;
      default:
        animation = EnhancedAnimationPresets.fadeIn(animationConfig);
    }

    // Replace the animated value with our own
    animation = animation as any;
    if (animation._config) {
      animation._config.toValue = 1;
    }

    animationRef.current = animation;

    if (loop) {
      animationRef.current = Animated.loop(animation);
    }

    animationRef.current.start((finished) => {
      if (finished) {
        setIsVisible(true);
        onAnimationComplete?.();
      }
    });
  };

  const getAnimatedStyle = (): any => {
    if (shouldReduceMotion || isReduceMotionEnabled) {
      return { opacity: 1 };
    }

    switch (animation) {
      case 'fadeIn':
        return { opacity: animatedValue };
      case 'slideInFromRight':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'slideInFromLeft':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'slideInFromBottom':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'slideInFromTop':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'bounce':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.3, 0.5, 0.7, 1],
                outputRange: [0, 1.2, 0.8, 1.1, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'pulse':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 1.1, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      case 'shimmer':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 100],
                extrapolate: 'clamp',
              }),
            },
          ],
        };
      default:
        return { opacity: animatedValue };
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

// Staggered animation component
interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideInFromRight' | 'slideInFromLeft' | 'slideInFromBottom' | 'slideInFromTop' | 'scaleIn';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 100,
  animation = 'fadeIn',
  duration,
  delay = 0,
  style,
  onAnimationComplete,
}) => {
  const { shouldReduceMotion, isReduceMotionEnabled } = useResponsiveDesign();
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    if (shouldReduceMotion || isReduceMotionEnabled) {
      // Show all items immediately for reduced motion
      setVisibleItems(children.map((_, index) => index));
      onAnimationComplete?.();
      return;
    }

    // Stagger the appearance of items
    const timers: NodeJS.Timeout[] = [];
    
    children.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, index]);
        
        if (index === children.length - 1) {
          onAnimationComplete?.();
        }
      }, delay + (index * staggerDelay));
      
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [children.length, staggerDelay, delay, shouldReduceMotion, isReduceMotionEnabled]);

  return (
    <View style={style}>
      {children.map((child, index) => (
        <EnhancedAnimations
          key={index}
          animation={animation}
          duration={duration}
          autoStart={visibleItems.includes(index)}
        >
          {child}
        </EnhancedAnimations>
      ))}
    </View>
  );
};

// Loading animation component
interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
  type?: 'spinner' | 'pulse' | 'bounce' | 'dots';
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  color = '#0F5257',
  style,
  type = 'spinner',
}) => {
  const { getSpacing, shouldReduceMotion, isReduceMotionEnabled } = useResponsiveDesign();
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldReduceMotion || isReduceMotionEnabled) {
      return;
    }

    switch (type) {
      case 'spinner':
        const spinAnimation = Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.linear,
          })
        );
        spinAnimation.start();
        break;

      case 'pulse':
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseValue, {
              toValue: 1.2,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
        break;

      case 'bounce':
        const bounceAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(bounceValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
            }),
            Animated.timing(bounceValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
              easing: Easing.in(Easing.quad),
            }),
          ])
        );
        bounceAnimation.start();
        break;
    }
  }, [type, shouldReduceMotion, isReduceMotionEnabled]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return getSpacing(16);
      case 'large':
        return getSpacing(48);
      default:
        return getSpacing(24);
    }
  };

  const sizeValue = getSize();

  const getAnimatedStyle = () => {
    if (shouldReduceMotion || isReduceMotionEnabled) {
      return { opacity: 1 };
    }

    switch (type) {
      case 'spinner':
        return {
          transform: [
            {
              rotate: spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        };
      case 'pulse':
        return {
          transform: [{ scale: pulseValue }],
        };
      case 'bounce':
        return {
          transform: [
            {
              translateY: bounceValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -20],
              }),
            },
          ],
        };
      default:
        return {};
    }
  };

  if (type === 'dots') {
    return (
      <View style={[styles.dotsContainer, style]}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: sizeValue / 3,
                height: sizeValue / 3,
                backgroundColor: color,
                borderRadius: sizeValue / 6,
              },
              getAnimatedStyle(),
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.loadingContainer,
        {
          width: sizeValue,
          height: sizeValue,
          borderColor: color,
          borderWidth: sizeValue / 8,
          borderRadius: sizeValue / 2,
        },
        getAnimatedStyle(),
        style,
      ]}
    />
  );
};

const styles = {
  dotsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  dot: {
    borderRadius: 4,
  },
  loadingContainer: {
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
};

export default {
  EnhancedAnimations,
  StaggeredAnimation,
  LoadingAnimation,
};
