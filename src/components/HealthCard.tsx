import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

interface HealthCardProps {
  title: string;
  value: string;
  unit: string;
  icon: 'scan' | 'heart' | 'trend' | 'check' | 'fire';
  color: string;
  description?: string;
  showChart?: boolean;
  onPress?: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  description,
  showChart = false,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const getIcon = () => {
    switch (icon) {
      case 'scan':
        return '📱';
      case 'heart':
        return '❤️';
      case 'trend':
        return '📈';
      case 'check':
        return '✅';
      case 'fire':
        return '🔥';
      default:
        return '📊';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{getIcon()}</Text>
          <Text style={[styles.title, { color: color }]}>{title}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>
        </View>
        
        {showChart && (
          <View style={styles.chart}>
            <View style={[styles.chartBar, { backgroundColor: color, height: 20 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: 15 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: 25 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: 18 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: 22 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: 16 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: 28 }]} />
          </View>
        )}
        
        {description && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: 12,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  chevron: {
    fontSize: 16,
    color: Colors.body,
    fontWeight: '300',
  },
  cardContent: {
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    marginRight: Spacing.xs,
  },
  unit: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginBottom: Spacing.sm,
  },
  chartBar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  description: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.bodySmall,
  },
});
