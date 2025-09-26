/**
 * @fileoverview ScanDetailCard.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  useColorScheme,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { ScanHistory, SeverityLevel } from '../types';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScanDetailCardProps {
  scanHistory: ScanHistory;
  onPress?: () => void;
  onExpand?: () => void;
  expanded?: boolean;
}

export const ScanDetailCard: React.FC<ScanDetailCardProps> = ({
  scanHistory,
  onPress,
  onExpand,
  expanded = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [isExpanded, setIsExpanded] = useState(expanded);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { foodItem, analysis, timestamp } = scanHistory;
  const {
    overallSafety,
    flaggedIngredients,
    safeAlternatives,
    explanation,
    dataSource,
  } = analysis;

  const getResultConfig = () => {
    switch (overallSafety) {
      case 'safe':
        return {
          color: Colors.safe,
          icon: '✅',
          backgroundColor: `${Colors.safe}15`,
          title: 'Safe to Eat',
        };
      case 'caution':
        return {
          color: Colors.caution,
          icon: '⚠️',
          backgroundColor: `${Colors.caution}15`,
          title: 'Use Caution',
        };
      case 'avoid':
        return {
          color: Colors.avoid,
          icon: '❌',
          backgroundColor: `${Colors.avoid}15`,
          title: 'Avoid',
        };
    }
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'mild':
        return Colors.safe;
      case 'moderate':
        return Colors.caution;
      case 'severe':
        return Colors.avoid;
    }
  };

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'mild':
        return '🟢';
      case 'moderate':
        return '🟡';
      case 'severe':
        return '🔴';
    }
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);

    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    onExpand?.();
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const resultConfig = getResultConfig();

  if (!resultConfig) {
    return null;
  }
  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{resultConfig.icon}</Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.foodName, { color: colors.text }]}>
              {foodItem.name}
            </Text>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(timestamp)}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: resultConfig.backgroundColor },
            ]}
          >
            <Text style={[styles.resultText, { color: resultConfig.color }]}>
              {resultConfig.title}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleExpanded}
          >
            <Animated.Text
              style={[
                styles.chevron,
                {
                  color: colors.textSecondary,
                  transform: [{ rotate: chevronRotation }],
                },
              ]}
            >
              ›
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.basicInfo}>
        <View style={styles.confidenceRow}>
          <Text
            style={[styles.confidenceLabel, { color: colors.textSecondary }]}
          >
            Data Source
          </Text>
          <Text style={[styles.confidenceValue, { color: colors.text }]}>
            {dataSource}
          </Text>
        </View>
        {foodItem.brand && (
          <Text style={[styles.brand, { color: colors.textSecondary }]}>
            {foodItem.brand}
          </Text>
        )}
        <Text style={[styles.dataSource, { color: colors.textTertiary }]}>
          Source: {dataSource}
        </Text>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Explanation */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Analysis
            </Text>
            <Text style={[styles.explanation, { color: colors.textSecondary }]}>
              {explanation}
            </Text>
          </View>

          {/* Flagged Ingredients */}
          {flaggedIngredients.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Flagged Ingredients ({flaggedIngredients.length})
              </Text>
              {flaggedIngredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientHeader}>
                    <Text style={styles.severityIcon}>
                      {getSeverityIcon(ingredient.severity)}
                    </Text>
                    <Text
                      style={[styles.ingredientName, { color: colors.text }]}
                    >
                      {ingredient.ingredient}
                    </Text>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: `${getSeverityColor(ingredient.severity)}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityText,
                          { color: getSeverityColor(ingredient.severity) },
                        ]}
                      >
                        {ingredient.severity}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.ingredientReason,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {ingredient.reason}
                  </Text>
                  <Text
                    style={[
                      styles.conditionText,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Affects: {ingredient.condition}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Safe Alternatives */}
          {safeAlternatives.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Safe Alternatives
              </Text>
              <View style={styles.alternativesList}>
                {safeAlternatives.map((alternative, index) => (
                  <View
                    key={index}
                    style={[
                      styles.alternativeItem,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Text style={styles.alternativeIcon}>✅</Text>
                    <Text
                      style={[styles.alternativeText, { color: colors.text }]}
                    >
                      {alternative}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Additional Food Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Food Details
            </Text>
            <View style={styles.foodDetails}>
              {foodItem.category && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Category
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {foodItem.category}
                  </Text>
                </View>
              )}
              {foodItem.histamineLevel && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Histamine Level
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {foodItem.histamineLevel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  alternativeIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  alternativeItem: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  alternativeText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  alternativesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  basicInfo: {
    marginBottom: Spacing.sm,
  },
  brand: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  card: {
    borderRadius: 12,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  chevron: {
    fontSize: 16,
    fontWeight: '300',
  },
  conditionText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    fontStyle: 'italic',
  },
  confidenceLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  confidenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  confidenceValue: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  dataSource: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },
  detailLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailValue: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.caption,
    textTransform: 'capitalize',
  },
  expandButton: {
    padding: Spacing.xs,
  },
  expandedContent: {
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  explanation: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: Typography.lineHeight.bodySmall,
  },
  foodDetails: {
    gap: Spacing.xs,
  },
  foodName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: 2,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  ingredientHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  ingredientItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
  },
  ingredientName: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
    marginRight: Spacing.sm,
  },
  ingredientReason: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    marginBottom: 2,
  },
  resultBadge: {
    borderRadius: 8,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  resultText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.caption,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
    marginBottom: Spacing.sm,
  },
  severityBadge: {
    borderRadius: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  severityIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  severityText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.caption,
    textTransform: 'capitalize',
  },
  timestamp: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flex: 1,
  },
});
