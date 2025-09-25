/**
 * @fileoverview ConditionToggle.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import LinearGradient from './LinearGradientWrapper';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { GutCondition, SeverityLevel, GutConditionToggle as GutConditionToggleType } from '../types';

interface ConditionToggleProps {
  condition: GutConditionToggleType;
  onToggle: (condition: GutCondition, enabled: boolean) => void;
  onSeverityChange: (condition: GutCondition, severity: SeverityLevel) => void;
  onEditTriggers: (condition: GutCondition) => void;
}

const getConditionDisplayName = (condition: GutCondition): string => {
  const names: Record<GutCondition, string> = {
    'ibs-fodmap': 'IBS / FODMAP Sensitivity',
    'gluten': 'Gluten Sensitivity',
    'lactose': 'Lactose Intolerance',
    'reflux': 'Acid Reflux / GERD',
    'histamine': 'Histamine Intolerance',
    'allergies': 'Food Allergies',
    'additives': 'Food Additives Sensitivity',
  };
  return names[condition];
};

const getSeverityColor = (severity: SeverityLevel): string => {
  const colors: Record<SeverityLevel, string> = {
    'mild': Colors.safe,
    'moderate': Colors.caution,
    'severe': Colors.avoid,
  };
  return colors[severity];
};

const getSeverityIcon = (severity: SeverityLevel): string => {
  const icons: Record<SeverityLevel, string> = {
    'mild': '🟢',
    'moderate': '🟡',
    'severe': '🔴',
  };
  return icons[severity];
};

export const ConditionToggle: React.FC<ConditionToggleProps> = ({
  condition,
  onToggle,
  onSeverityChange,
  onEditTriggers,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleToggle = (value: boolean) => {
    onToggle(condition.condition, value);
  };

  const handleSeverityPress = () => {
    const severityOrder: SeverityLevel[] = ['mild', 'moderate', 'severe'];
    const currentIndex = severityOrder.indexOf(condition.severity);
    const nextIndex = (currentIndex + 1) % severityOrder.length;
    onSeverityChange(condition.condition, severityOrder[nextIndex]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={condition.enabled ? ['rgba(15, 82, 87, 0.05)', 'rgba(86, 207, 225, 0.05)'] : ['transparent', 'transparent']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                {getConditionDisplayName(condition.condition)}
              </Text>
              {condition.enabled && (
                <View style={styles.severityContainer}>
                  <Text style={styles.severityIcon}>
                    {getSeverityIcon(condition.severity)}
                  </Text>
                  <Text style={[styles.severityText, { color: getSeverityColor(condition.severity) }]}>
                    {condition.severity.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Switch
              value={condition.enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: Colors.primary }}
              thumbColor={condition.enabled ? Colors.white : colors.textTertiary}
              ios_backgroundColor={colors.border}
            />
          </View>

          {condition.enabled && (
            <View style={styles.detailsContainer}>
              <TouchableOpacity
                style={[styles.severityButton, { borderColor: getSeverityColor(condition.severity) }]}
                onPress={handleSeverityPress}
              >
                <Text style={[styles.severityButtonText, { color: getSeverityColor(condition.severity) }]}>
                  Severity: {condition.severity}
                </Text>
                <Text style={styles.severityButtonIcon}>↻</Text>
              </TouchableOpacity>

              {condition.knownTriggers.length > 0 && (
                <View style={styles.triggersContainer}>
                  <Text style={[styles.triggersLabel, { color: colors.textSecondary }]}>
                    Known Triggers:
                  </Text>
                  <View style={styles.triggersList}>
                    {condition.knownTriggers.slice(0, 3).map((trigger, index) => (
                      <View key={index} style={[styles.triggerTag, { backgroundColor: colors.border }]}>
                        <Text style={[styles.triggerText, { color: colors.text }]}>
                          {trigger}
                        </Text>
                      </View>
                    ))}
                    {condition.knownTriggers.length > 3 && (
                      <View style={[styles.triggerTag, { backgroundColor: Colors.primary }]}>
                        <Text style={styles.triggerTextMore}>
                          +{condition.knownTriggers.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.editButton, { borderColor: colors.border }]}
                onPress={() => onEditTriggers(condition.condition)}
              >
                <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>
                  {condition.knownTriggers.length > 0 ? 'Edit Triggers' : 'Add Triggers'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 87, 0.1)',
  },
  gradient: {
    padding: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.xs,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  severityText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  detailsContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 82, 87, 0.1)',
  },
  severityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  severityButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  severityButtonIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  triggersContainer: {
    marginBottom: Spacing.md,
  },
  triggersLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    marginBottom: Spacing.xs,
  },
  triggersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  triggerTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  triggerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  triggerTextMore: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    color: Colors.white,
  },
  editButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
});
