/**
 * @fileoverview animations.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Animated, Easing, Dimensions, Platform } from 'react-native';

import { HapticFeedback } from './haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
  easing?: (value: number) => number;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  damping?: number;
  stiffness?: number;
  useNativeDriver?: boolean;
}

export class AnimationPresets {
  // Basic animations
  static fadeIn(config: AnimationConfig = {}): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.quad),
    });
  }

  static fadeOut(config: AnimationConfig = {}): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(1), {
      toValue: 0,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.in(Easing.quad),
    });
  }

  static slideInFromRight(
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(screenWidth), {
      toValue: 0,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static slideInFromLeft(
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(-screenWidth), {
      toValue: 0,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static slideInFromBottom(
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(screenHeight), {
      toValue: 0,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static slideInFromTop(
    config: AnimationConfig = {}
  ): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(-screenHeight), {
      toValue: 0,
      duration: config.duration || 300,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  // 3D Transform animations
  static rotate3D(config: AnimationConfig = {}): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: config.duration || 600,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.inOut(Easing.cubic),
    });
  }

  static scale3D(config: AnimationConfig = {}): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: config.duration || 400,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.back(1.2)),
    });
  }

  static flip3D(config: AnimationConfig = {}): Animated.CompositeAnimation {
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration: config.duration || 500,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.inOut(Easing.cubic),
    });
  }

  // Spring animations
  static springBounce(config: SpringConfig = {}): Animated.CompositeAnimation {
    return Animated.spring(new Animated.Value(0), {
      toValue: 1,
      tension: config.tension || 100,
      friction: config.friction || 8,
      useNativeDriver: config.useNativeDriver !== false,
    });
  }

  static springGentle(config: SpringConfig = {}): Animated.CompositeAnimation {
    return Animated.spring(new Animated.Value(0), {
      toValue: 1,
      tension: config.tension || 50,
      friction: config.friction || 10,
      useNativeDriver: config.useNativeDriver !== false,
    });
  }

  static springSnappy(config: SpringConfig = {}): Animated.CompositeAnimation {
    return Animated.spring(new Animated.Value(0), {
      toValue: 1,
      tension: config.tension || 200,
      friction: config.friction || 6,
      useNativeDriver: config.useNativeDriver !== false,
    });
  }
}

export class AnimationUtils {
  /**
   * Create a staggered animation for multiple elements
   */
  static createStaggeredAnimation(
    animations: Animated.CompositeAnimation[],
    staggerDelay: number = 100
  ): Animated.CompositeAnimation {
    return Animated.stagger(staggerDelay, animations);
  }

  /**
   * Create a sequence of animations
   */
  static createSequence(
    animations: Animated.CompositeAnimation[]
  ): Animated.CompositeAnimation {
    return Animated.sequence(animations);
  }

  /**
   * Create a parallel animation
   */
  static createParallel(
    animations: Animated.CompositeAnimation[]
  ): Animated.CompositeAnimation {
    return Animated.parallel(animations);
  }

  /**
   * Create a loop animation
   */
  static createLoop(
    animation: Animated.CompositeAnimation,
    iterations?: number
  ): Animated.CompositeAnimation {
    return Animated.loop(animation, { iterations });
  }

  /**
   * Create a pulse animation
   */
  static createPulse(
    animatedValue: Animated.Value,
    minValue: number = 0.8,
    maxValue: number = 1.2,
    duration: number = 1000
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxValue,
          duration: duration / 2,
          useNativeDriver: Platform.OS !== 'web',
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(animatedValue, {
          toValue: minValue,
          duration: duration / 2,
          useNativeDriver: Platform.OS !== 'web',
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
  }

  /**
   * Create a shake animation
   */
  static createShake(
    animatedValue: Animated.Value,
    intensity: number = 10
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  }

  /**
   * Create a bounce animation
   */
  static createBounce(
    animatedValue: Animated.Value,
    intensity: number = 0.3
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1 + intensity,
        duration: 150,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(animatedValue, {
        toValue: 1 - intensity * 0.5,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.out(Easing.quad),
      }),
    ]);
  }

  /**
   * Create a morphing animation between two values
   */
  static createMorph(
    animatedValue: Animated.Value,
    fromValue: number,
    toValue: number,
    duration: number = 300
  ): Animated.CompositeAnimation {
    animatedValue.setValue(fromValue);
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.cubic),
    });
  }
}

export class TransformUtils {
  /**
   * Create 3D rotation transform
   */
  static createRotation3D(
    animatedValue: Animated.Value,
    axis: 'x' | 'y' | 'z' = 'y'
  ): any {
    const inputRange = [0, 1];
    const outputRange =
      axis === 'x'
        ? ['0deg', '360deg']
        : axis === 'y'
          ? ['0deg', '360deg']
          : ['0deg', '360deg'];

    return {
      [`rotate${axis.toUpperCase()}`]: animatedValue.interpolate({
        inputRange,
        outputRange,
        extrapolate: 'clamp',
      }),
    };
  }

  /**
   * Create 3D scale transform
   */
  static createScale3D(animatedValue: Animated.Value, scale: number = 1): any {
    return {
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, scale],
        extrapolate: 'clamp',
      }),
    };
  }

  /**
   * Create perspective transform
   */
  static createPerspective(perspective: number = 1000): any {
    return { perspective };
  }

  /**
   * Create 3D translation transform
   */
  static createTranslate3D(
    animatedValue: Animated.Value,
    x: number = 0,
    y: number = 0,
    z: number = 0
  ): any {
    return {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, x],
        extrapolate: 'clamp',
      }),
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, y],
        extrapolate: 'clamp',
      }),
      translateZ: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, z],
        extrapolate: 'clamp',
      }),
    };
  }

  /**
   * Create flip animation transform
   */
  static createFlipTransform(
    animatedValue: Animated.Value,
    axis: 'x' | 'y' = 'y'
  ): any {
    const inputRange = [0, 0.5, 1];
    const outputRange =
      axis === 'x' ? ['0deg', '90deg', '0deg'] : ['0deg', '90deg', '0deg'];

    return {
      [`rotate${axis.toUpperCase()}`]: animatedValue.interpolate({
        inputRange,
        outputRange,
        extrapolate: 'clamp',
      }),
    };
  }
}

export class HapticAnimations {
  /**
   * Animate with haptic feedback
   */
  static animateWithHaptic(
    animation: Animated.CompositeAnimation,
    _hapticType: string,
    delay: number = 0
  ): Animated.CompositeAnimation {
    return Animated.sequence([
      Animated.delay(delay),
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }),
      animation,
    ]);
  }

  /**
   * Button press animation with haptic
   */
  static buttonPress(
    scaleValue: Animated.Value,
    hapticType: string = 'light'
  ): Animated.CompositeAnimation {
    HapticFeedback.trigger(hapticType);

    return Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]);
  }

  /**
   * Success animation with haptic
   */
  static success(
    scaleValue: Animated.Value,
    hapticType: string = 'success'
  ): Animated.CompositeAnimation {
    HapticFeedback.trigger(hapticType);

    return AnimationUtils.createBounce(scaleValue, 0.2);
  }

  /**
   * Error animation with haptic
   */
  static error(
    shakeValue: Animated.Value,
    hapticType: string = 'error'
  ): Animated.CompositeAnimation {
    HapticFeedback.trigger(hapticType);

    return AnimationUtils.createShake(shakeValue, 8);
  }
}

const AnimationExports = {
  AnimationPresets,
  AnimationUtils,
  TransformUtils,
  HapticAnimations,
};

export default AnimationExports;
