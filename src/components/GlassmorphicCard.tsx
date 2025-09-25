/**
 * @fileoverview GlassmorphicCard.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Colors } from '../constants/colors';
import { BorderRadius, Shadows } from '../constants/spacing';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark';
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        style={styles.blur}
        blurType={tint}
        blurAmount={intensity}
        reducedTransparencyFallbackColor={Colors.white}
      >
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
