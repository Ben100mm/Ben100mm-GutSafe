/**
 * @fileoverview HealthSection.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

interface HealthSectionProps {
  title: string;
  rightButton?: string;
  onRightPress?: () => void;
  children: React.ReactNode;
}

export const HealthSection: React.FC<HealthSectionProps> = ({
  title,
  rightButton,
  onRightPress,
  children,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {rightButton && (
          <TouchableOpacity onPress={onRightPress}>
            <Text style={[styles.rightButton, { color: colors.accent }]}>
              {rightButton}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  rightButton: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
  },
});
