/**
 * @fileoverview GlassmorphicCard.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { BlurView } from '@react-native-community/blur';
import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';

import { Colors } from '../constants/colors';
import { BorderRadius, Shadows } from '../constants/spacing';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark';
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = React.memo(({
  children,
  style,
  intensity = 20,
  tint = 'light',
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        blurAmount={intensity}
        blurType={tint}
        reducedTransparencyFallbackColor={Colors.white}
        style={styles.blur}
      >
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
});

GlassmorphicCard.displayName = 'GlassmorphicCard';

const styles = StyleSheet.create({
  blur: {
    flex: 1,
  },
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flex: 1,
  },
});
