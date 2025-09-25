/**
 * @fileoverview TrafficLightResults.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  // Dimensions,
  Platform,
} from 'react-native';
// import LinearGradient from 'react-native-web-linear-gradient';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { ScanResult, SeverityLevel, GutCondition } from '../types';

// const { width } = Dimensions.get('window');

interface TrafficLightResultsProps {
  overallSafety: ScanResult;
  flaggedIngredients: Array<{
    ingredient: string;
    reason: string;
    severity: SeverityLevel;
    condition: GutCondition;
  }>;
  safeAlternatives: string[];
  explanation: string;
  confidence: number;
  dataSource: string;
  lastUpdated: Date;
  onAlternativePress?: (alternative: string) => void;
  onIngredientPress?: (ingredient: string) => void;
  showDetailedBreakdown?: boolean;
}

export const TrafficLightResults: React.FC<TrafficLightResultsProps> = ({
  overallSafety,
  flaggedIngredients,
  safeAlternatives,
  explanation,
  confidence,
  dataSource,
  lastUpdated,
  onAlternativePress,
  onIngredientPress,
  showDetailedBreakdown = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAllAlternatives, setShowAllAlternatives] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // const getSafetyColor = (safety: ScanResult) => {
  //   switch (safety) {
  //     case 'safe':
  //       return Colors.safe;
  //     case 'caution':
  //       return Colors.caution;
  //     case 'avoid':
  //       return Colors.avoid;
  //     default:
  //       return colors.textSecondary;
  //   }
  // };

  const getSafetyIcon = (safety: ScanResult) => {
    switch (safety) {
      case 'safe':
        return '✅';
      case 'caution':
        return '⚠️';
      case 'avoid':
        return '❌';
      default:
        return '❓';
    }
  };

  const getSafetyTitle = (safety: ScanResult) => {
    switch (safety) {
      case 'safe':
        return 'Safe to Eat';
      case 'caution':
        return 'Use Caution';
      case 'avoid':
        return 'Avoid This Food';
      default:
        return 'Unknown Safety';
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
      default:
        return colors.textSecondary;
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
      default:
        return '⚪';
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return Colors.safe;
    if (conf >= 0.6) return Colors.caution;
    return Colors.avoid;
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.8) return 'High Confidence';
    if (conf >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const displayedAlternatives = showAllAlternatives 
    ? safeAlternatives 
    : safeAlternatives.slice(0, 3);

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {/* Main Safety Indicator */}
      <View style={[styles.safetyCard, { backgroundColor: colors.surface }]}>
        <View style={styles.safetyHeader}>
          <View style={styles.safetyIconContainer}>
            <Text style={styles.safetyIcon}>{getSafetyIcon(overallSafety)}</Text>
          </View>
          <View style={styles.safetyInfo}>
            <Text style={[styles.safetyTitle, { color: colors.text }]}>
              {getSafetyTitle(overallSafety)}
            </Text>
            <Text style={[styles.safetySubtitle, { color: colors.textSecondary }]}>
              {explanation}
            </Text>
          </View>
        </View>
        
        {/* Confidence Indicator */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill,
                { 
                  width: `${confidence * 100}%`,
                  backgroundColor: getConfidenceColor(confidence),
                }
              ]} 
            />
          </View>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence) }]}>
            {getConfidenceText(confidence)}
          </Text>
        </View>
      </View>

      {/* Detailed Breakdown */}
      {showDetailedBreakdown && (
        <View style={styles.breakdownContainer}>
          {/* Flagged Ingredients */}
          {flaggedIngredients.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('ingredients')}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Problematic Ingredients ({flaggedIngredients.length})
                </Text>
                <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                  {expandedSection === 'ingredients' ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>
              
              {expandedSection === 'ingredients' && (
                <View style={styles.sectionContent}>
                  {flaggedIngredients.map((ingredient, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.ingredientItem}
                      onPress={() => onIngredientPress?.(ingredient.ingredient)}
                    >
                      <View style={styles.ingredientHeader}>
                        <Text style={styles.severityIcon}>
                          {getSeverityIcon(ingredient.severity)}
                        </Text>
                        <Text style={[styles.ingredientName, { color: colors.text }]}>
                          {ingredient.ingredient}
                        </Text>
                        <View style={[
                          styles.severityBadge,
                          { backgroundColor: getSeverityColor(ingredient.severity) + '20' }
                        ]}>
                          <Text style={[
                            styles.severityText,
                            { color: getSeverityColor(ingredient.severity) }
                          ]}>
                            {ingredient.severity.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.ingredientReason, { color: colors.textSecondary }]}>
                        {ingredient.reason}
                      </Text>
                      <Text style={[styles.ingredientCondition, { color: colors.accent }]}>
                        Affects: {ingredient.condition.replace('-', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Safe Alternatives */}
          {safeAlternatives.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection('alternatives')}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Safe Alternatives ({safeAlternatives.length})
                </Text>
                <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                  {expandedSection === 'alternatives' ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>
              
              {expandedSection === 'alternatives' && (
                <View style={styles.sectionContent}>
                  <View style={styles.alternativesGrid}>
                    {displayedAlternatives.map((alternative, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.alternativeChip,
                          { 
                            backgroundColor: Colors.safe + '20',
                            borderColor: Colors.safe + '40',
                          }
                        ]}
                        onPress={() => onAlternativePress?.(alternative)}
                      >
                        <Text style={[styles.alternativeText, { color: Colors.safe }]}>
                          {alternative}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {safeAlternatives.length > 3 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAllAlternatives(!showAllAlternatives)}
                    >
                      <Text style={[styles.showMoreText, { color: colors.accent }]}>
                        {showAllAlternatives ? 'Show Less' : `Show ${safeAlternatives.length - 3} More`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Data Source & Timestamp */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection('metadata')}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Analysis Details
              </Text>
              <Text style={[styles.expandIcon, { color: colors.textSecondary }]}>
                {expandedSection === 'metadata' ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {expandedSection === 'metadata' && (
              <View style={styles.sectionContent}>
                <View style={styles.metadataItem}>
                  <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                    Data Source:
                  </Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {dataSource}
                  </Text>
                </View>
                
                <View style={styles.metadataItem}>
                  <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                    Last Updated:
                  </Text>
                  <Text style={[styles.metadataValue, { color: colors.text }]}>
                    {formatDate(lastUpdated)}
                  </Text>
                </View>
                
                <View style={styles.metadataItem}>
                  <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                    Confidence:
                  </Text>
                  <Text style={[styles.metadataValue, { color: getConfidenceColor(confidence) }]}>
                    {Math.round(confidence * 100)}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.accent }]}
          onPress={() => {/* Add to safe foods */}}
        >
          <Text style={[styles.actionButtonText, { color: Colors.white }]}>
            Add to Safe Foods
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => {/* Share result */}}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Share Result
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  safetyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  safetyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 82, 87, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  safetyIcon: {
    fontSize: 30,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  safetySubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 20,
  },
  confidenceContainer: {
    marginTop: Spacing.sm,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'right',
  },
  breakdownContainer: {
    gap: Spacing.md,
  },
  section: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h4,
    fontFamily: Typography.fontFamily.semiBold,
  },
  expandIcon: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  ingredientItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  severityIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  ingredientName: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.bold,
  },
  ingredientReason: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  ingredientCondition: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.medium,
  },
  alternativesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  alternativeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  alternativeText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
  showMoreButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
  },
  metadataLabel: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.medium,
  },
  metadataValue: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
