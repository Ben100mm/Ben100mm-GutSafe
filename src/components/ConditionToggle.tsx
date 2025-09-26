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

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type {
  GutCondition,
  SeverityLevel,
  GutConditionToggle as GutConditionToggleType,
} from '../types';

import LinearGradient from './LinearGradientWrapper';

interface ConditionToggleProps {
  condition: GutConditionToggleType;
  onToggle: (condition: GutCondition, enabled: boolean) => void;
  onSeverityChange: (condition: GutCondition, severity: SeverityLevel) => void;
  onEditTriggers: (condition: GutCondition) => void;
}

const getConditionDisplayName = (condition: GutCondition): string => {
  const names: Record<GutCondition, string> = {
    'ibs-fodmap': 'IBS / FODMAP Sensitivity',
    gluten: 'Gluten Sensitivity',
    lactose: 'Lactose Intolerance',
    reflux: 'Acid Reflux / GERD',
    histamine: 'Histamine Intolerance',
    allergies: 'Food Allergies',
    additives: 'Food Additives Sensitivity',
  };
  return names[condition];
};

const getSeverityColor = (severity: SeverityLevel): string => {
  const colors: Record<SeverityLevel, string> = {
    mild: Colors.safe,
    moderate: Colors.caution,
    severe: Colors.avoid,
  };
  return colors[severity];
};

const getSeverityIcon = (severity: SeverityLevel): string => {
  const icons: Record<SeverityLevel, string> = {
    mild: '🟢',
    moderate: '🟡',
    severe: '🔴',
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
    const nextSeverity = severityOrder[nextIndex];
    if (nextSeverity) {
      onSeverityChange(condition.condition, nextSeverity);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LinearGradient
        colors={
          condition.enabled
            ? ['rgba(15, 82, 87, 0.05)', 'rgba(86, 207, 225, 0.05)']
            : ['transparent', 'transparent']
        }
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
                  <Text
                    style={[
                      styles.severityText,
                      { color: getSeverityColor(condition.severity) },
                    ]}
                  >
                    {condition.severity.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Switch
              ios_backgroundColor={colors.border}
              thumbColor={
                condition.enabled ? Colors.white : colors.textTertiary
              }
              trackColor={{ false: colors.border, true: Colors.primary }}
              value={condition.enabled}
              onValueChange={handleToggle}
            />
          </View>

          {condition.enabled && (
            <View style={styles.detailsContainer}>
              <TouchableOpacity
                style={[
                  styles.severityButton,
                  { borderColor: getSeverityColor(condition.severity) },
                ]}
                onPress={handleSeverityPress}
              >
                <Text
                  style={[
                    styles.severityButtonText,
                    { color: getSeverityColor(condition.severity) },
                  ]}
                >
                  Severity: {condition.severity}
                </Text>
                <Text style={styles.severityButtonIcon}>↻</Text>
              </TouchableOpacity>

              {condition.knownTriggers.length > 0 && (
                <View style={styles.triggersContainer}>
                  <Text
                    style={[
                      styles.triggersLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Known Triggers:
                  </Text>
                  <View style={styles.triggersList}>
                    {condition.knownTriggers
                      .slice(0, 3)
                      .map((trigger, index) => (
                        <View
                          key={index}
                          style={[
                            styles.triggerTag,
                            { backgroundColor: colors.border },
                          ]}
                        >
                          <Text
                            style={[styles.triggerText, { color: colors.text }]}
                          >
                            {trigger}
                          </Text>
                        </View>
                      ))}
                    {condition.knownTriggers.length > 3 && (
                      <View
                        style={[
                          styles.triggerTag,
                          { backgroundColor: Colors.primary },
                        ]}
                      >
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
                <Text
                  style={[
                    styles.editButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {condition.knownTriggers.length > 0
                    ? 'Edit Triggers'
                    : 'Add Triggers'}
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
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  detailsContainer: {
    borderTopColor: 'rgba(15, 82, 87, 0.1)',
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  editButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  editButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  gradient: {
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  severityButtonIcon: {
    color: Colors.primary,
    fontSize: 16,
  },
  severityButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  severityContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  severityIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  severityText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  triggerTag: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  triggerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  triggerTextMore: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
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
});
