import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

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
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
  },
  rightButton: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
  },
  content: {
    flex: 1,
  },
});
