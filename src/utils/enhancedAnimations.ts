/**
 * @fileoverview enhancedAnimations.ts - Enhanced Animation System with Consistent Transitions
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Animated, Easing, Dimensions, Platform } from 'react-native';
import { responsiveDesign } from './responsiveDesign';
import { HapticFeedback } from './haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface EnhancedAnimationConfig {
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
  easing?: (value: number) => number;
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  responsive?: boolean;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  damping?: number;
  stiffness?: number;
  useNativeDriver?: boolean;
}

export class EnhancedAnimationPresets {
  // Basic animations with responsive timing
  static fadeIn(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 400 : 300 : config.duration || 300;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.quad),
    });
  }

  static fadeOut(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 300 : 200 : config.duration || 200;
    
    return Animated.timing(new Animated.Value(1), {
      toValue: 0,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.in(Easing.quad),
    });
  }

  static slideInFromRight(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 400 : 300 : config.duration || 300;
    const translateX = responsive ? responsiveDesign.getConfig().width : screenWidth;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(translateX), {
      toValue: 0,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static slideInFromLeft(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 400 : 300 : config.duration || 300;
    const translateX = responsive ? -responsiveDesign.getConfig().width : -screenWidth;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(translateX), {
      toValue: 0,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static slideInFromBottom(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 400 : 300 : config.duration || 300;
    const translateY = responsive ? responsiveDesign.getConfig().height : screenHeight;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(translateY), {
      toValue: 0,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static slideInFromTop(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 400 : 300 : config.duration || 300;
    const translateY = responsive ? -responsiveDesign.getConfig().height : -screenHeight;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(translateY), {
      toValue: 0,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.cubic),
    });
  }

  static scaleIn(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 300 : 250 : config.duration || 250;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.back(1.2)),
    });
  }

  static scaleOut(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 200 : 150 : config.duration || 150;
    
    return Animated.timing(new Animated.Value(1), {
      toValue: 0,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.in(Easing.back(1.2)),
    });
  }

  // Spring animations with responsive parameters
  static springBounce(config: SpringConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const config_ = responsive ? responsiveDesign.getConfig() : null;
    
    const tension = config.tension || (config_?.isTablet ? 120 : 100);
    const friction = config.friction || (config_?.isTablet ? 8 : 6);
    
    return Animated.spring(new Animated.Value(0), {
      toValue: 1,
      tension,
      friction,
      useNativeDriver: config.useNativeDriver !== false,
    });
  }

  static springScale(config: SpringConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const config_ = responsive ? responsiveDesign.getConfig() : null;
    
    const tension = config.tension || (config_?.isTablet ? 150 : 120);
    const friction = config.friction || (config_?.isTablet ? 10 : 8);
    
    return Animated.spring(new Animated.Value(1), {
      toValue: 1.1,
      tension,
      friction,
      useNativeDriver: config.useNativeDriver !== false,
    });
  }

  // 3D animations with responsive depth
  static rotate3D(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'medium' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 600 : 500 : config.duration || 500;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.inOut(Easing.cubic),
    });
  }

  static scale3D(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'light' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 400 : 300 : config.duration || 300;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.back(1.1)),
    });
  }

  static flip3D(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'medium' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 500 : 400 : config.duration || 400;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.inOut(Easing.cubic),
    });
  }

  // Interactive animations
  static buttonPress(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { hapticFeedback = true, hapticType = 'light' } = config;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(new Animated.Value(0.95), {
        toValue: 1,
        duration: 100,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.out(Easing.quad),
      }),
    ]);
  }

  static cardHover(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 200 : 150 : config.duration || 150;
    
    return Animated.timing(new Animated.Value(0), {
      toValue: 1,
      duration,
      delay: config.delay || 0,
      useNativeDriver: config.useNativeDriver !== false,
      easing: config.easing || Easing.out(Easing.quad),
    });
  }

  static shimmer(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 2000 : 1500 : config.duration || 1500;
    
    return Animated.loop(
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.inOut(Easing.quad),
      })
    );
  }

  static pulse(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 1000 : 800 : config.duration || 800;
    
    return Animated.loop(
      Animated.sequence([
        Animated.timing(new Animated.Value(1), {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: config.useNativeDriver !== false,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(new Animated.Value(1.1), {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: config.useNativeDriver !== false,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    );
  }

  static bounce(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 600 : 500 : config.duration || 500;
    
    return Animated.sequence([
      Animated.timing(new Animated.Value(0), {
        toValue: 1.2,
        duration: duration * 0.3,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(new Animated.Value(1.2), {
        toValue: 0.8,
        duration: duration * 0.2,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(new Animated.Value(0.8), {
        toValue: 1.1,
        duration: duration * 0.2,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(new Animated.Value(1.1), {
        toValue: 1,
        duration: duration * 0.3,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.out(Easing.quad),
      }),
    ]);
  }

  static shake(config: EnhancedAnimationConfig = {}): Animated.CompositeAnimation {
    const { responsive = true, hapticFeedback = false, hapticType = 'heavy' } = config;
    const duration = responsive ? responsiveDesign.getConfig().isTablet ? 500 : 400 : config.duration || 400;
    const intensity = responsive ? responsiveDesign.getConfig().isTablet ? 15 : 10 : 10;
    
    if (hapticFeedback) {
      HapticFeedback.trigger(hapticType);
    }
    
    return Animated.sequence([
      Animated.timing(new Animated.Value(0), {
        toValue: intensity,
        duration: duration * 0.1,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(new Animated.Value(intensity), {
        toValue: -intensity,
        duration: duration * 0.1,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.timing(new Animated.Value(-intensity), {
        toValue: intensity,
        duration: duration * 0.1,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.timing(new Animated.Value(intensity), {
        toValue: -intensity,
        duration: duration * 0.1,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.timing(new Animated.Value(-intensity), {
        toValue: 0,
        duration: duration * 0.1,
        useNativeDriver: config.useNativeDriver !== false,
        easing: Easing.in(Easing.quad),
      }),
    ]);
  }
}

export class EnhancedAnimationUtils {
  /**
   * Create staggered animations for lists
   */
  static createStaggeredAnimation(
    animations: Animated.CompositeAnimation[],
    staggerDelay: number = 100
  ): Animated.CompositeAnimation {
    const staggeredAnimations = animations.map((animation, index) => {
      return Animated.delay(index * staggerDelay);
    });

    return Animated.sequence(staggeredAnimations);
  }

  /**
   * Create a pulse animation
   */
  static createPulse(
    animatedValue: Animated.Value,
    minScale: number = 0.8,
    maxScale: number = 1.2,
    duration: number = 1000
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(animatedValue, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    );
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
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(animatedValue, {
        toValue: 1 - intensity * 0.5,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
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

  /**
   * Create a loading animation
   */
  static createLoading(
    animatedValue: Animated.Value,
    duration: number = 1000
  ): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
  }

  /**
   * Create a progress animation
   */
  static createProgress(
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = 1000
  ): Animated.CompositeAnimation {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    });
  }
}

export class EnhancedTransformUtils {
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

  /**
   * Create responsive transform based on device type
   */
  static createResponsiveTransform(
    animatedValue: Animated.Value,
    transformType: 'scale' | 'translate' | 'rotate',
    baseValue: number = 1
  ): any {
    const config = responsiveDesign.getConfig();
    const multiplier = config.isTablet ? 1.2 : config.isDesktop ? 1.5 : 1.0;
    
    switch (transformType) {
      case 'scale':
        return {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, baseValue * multiplier],
            extrapolate: 'clamp',
          }),
        };
      case 'translate':
        return {
          translateX: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, baseValue * multiplier],
            extrapolate: 'clamp',
          }),
        };
      case 'rotate':
        return {
          rotate: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${baseValue * multiplier}deg`],
            extrapolate: 'clamp',
          }),
        };
      default:
        return {};
    }
  }
}

export class EnhancedHapticAnimations {
  /**
   * Animate with haptic feedback
   */
  static animateWithHaptic(
    animation: Animated.CompositeAnimation,
    hapticType: string,
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
   * Create haptic feedback sequence
   */
  static createHapticSequence(
    animations: Animated.CompositeAnimation[],
    hapticTypes: string[]
  ): Animated.CompositeAnimation {
    const hapticAnimations = animations.map((animation, index) => {
      return this.animateWithHaptic(animation, hapticTypes[index] || 'light');
    });

    return Animated.sequence(hapticAnimations);
  }
}

// Export utility functions
export const createResponsiveAnimation = (config: EnhancedAnimationConfig) => {
  const responsiveConfig = responsiveDesign.getConfig();
  
  return {
    ...config,
    duration: config.duration || (responsiveConfig.isTablet ? 400 : 300),
    useNativeDriver: config.useNativeDriver !== false,
  };
};

export const createDeviceOptimizedAnimation = (config: EnhancedAnimationConfig) => {
  const responsiveConfig = responsiveDesign.getConfig();
  
  if (responsiveConfig.isDesktop) {
    return {
      ...config,
      duration: (config.duration || 300) * 1.2,
      hapticFeedback: false,
    };
  }
  
  if (responsiveConfig.isTablet) {
    return {
      ...config,
      duration: (config.duration || 300) * 1.1,
    };
  }
  
  return config;
};

export default {
  EnhancedAnimationPresets,
  EnhancedAnimationUtils,
  EnhancedTransformUtils,
  EnhancedHapticAnimations,
  createResponsiveAnimation,
  createDeviceOptimizedAnimation,
};
