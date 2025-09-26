/**
 * @fileoverview ScanDetailScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LinearGradient from '../components/LinearGradientWrapper';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type {
  ScanHistory,
  ScanResult,
  SeverityLevel,
  GutCondition,
} from '../types';
import { SharingService } from '../utils/sharing';

interface ScanDetailRouteParams {
  ScanDetail: {
    scanId: string;
  };
}

type ScanDetailRouteProp = RouteProp<ScanDetailRouteParams, 'ScanDetail'>;

// Mock scan data - in real app, this would come from a store or API
const mockScanData: { [key: string]: ScanHistory } = {
  '1': {
    id: '1',
    foodItem: {
      id: '1',
      name: 'Greek Yogurt',
      brand: 'Chobani',
      category: 'Dairy',
      barcode: '1234567890123',
      ingredients: ['Milk', 'Live cultures'],
      allergens: ['Milk'],
      additives: [],
      glutenFree: true,
      lactoseFree: false,
      histamineLevel: 'low',
      dataSource: 'USDA Database',
    },
    analysis: {
      overallSafety: 'safe' as ScanResult,
      flaggedIngredients: [],
      conditionWarnings: [],
      safeAlternatives: ['Coconut yogurt', 'Almond yogurt'],
      explanation:
        'This Greek yogurt is low in histamine and contains probiotics that may benefit gut health. No problematic ingredients detected.',
      dataSource: 'USDA Food Database',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userFeedback: 'accurate',
  },
  '2': {
    id: '2',
    foodItem: {
      id: '2',
      name: 'Wheat Bread',
      brand: 'Wonder',
      category: 'Bakery',
      barcode: '1234567890124',
      ingredients: ['Wheat flour', 'Water', 'Yeast', 'Salt'],
      allergens: ['Wheat', 'Gluten'],
      additives: [],
      glutenFree: false,
      lactoseFree: true,
      histamineLevel: 'low',
      dataSource: 'Product Database',
    },
    analysis: {
      overallSafety: 'caution' as ScanResult,
      flaggedIngredients: [
        {
          ingredient: 'Wheat',
          reason: 'Contains gluten which may trigger IBS symptoms',
          severity: 'moderate' as SeverityLevel,
          condition: 'gluten' as GutCondition,
        },
        {
          ingredient: 'Fructans',
          reason: 'High FODMAP content may cause bloating',
          severity: 'mild' as SeverityLevel,
          condition: 'ibs-fodmap' as GutCondition,
        },
      ],
      conditionWarnings: [
        {
          ingredient: 'Wheat',
          severity: 'moderate' as SeverityLevel,
          condition: 'gluten' as GutCondition,
        },
      ],
      safeAlternatives: ['Sourdough bread', 'Gluten-free bread', 'Rice cakes'],
      explanation:
        'This wheat bread contains gluten and fructans that may trigger digestive symptoms in sensitive individuals.',
      dataSource: 'Monash FODMAP Database',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  '3': {
    id: '3',
    foodItem: {
      id: '3',
      name: 'Aged Cheddar Cheese',
      brand: 'Cabot',
      category: 'Dairy',
      barcode: '1234567890125',
      ingredients: ['Milk', 'Salt', 'Enzymes', 'Annatto'],
      allergens: ['Milk'],
      additives: ['Annatto'],
      glutenFree: true,
      lactoseFree: false,
      histamineLevel: 'high',
      dataSource: 'USDA Database',
    },
    analysis: {
      overallSafety: 'avoid' as ScanResult,
      flaggedIngredients: [
        {
          ingredient: 'Histamine',
          reason: 'Aged cheese contains high levels of histamine',
          severity: 'severe' as SeverityLevel,
          condition: 'histamine' as GutCondition,
        },
        {
          ingredient: 'Tyramine',
          reason: 'May cause headaches and digestive issues',
          severity: 'moderate' as SeverityLevel,
          condition: 'histamine' as GutCondition,
        },
      ],
      conditionWarnings: [
        {
          ingredient: 'Histamine',
          severity: 'severe' as SeverityLevel,
          condition: 'histamine' as GutCondition,
        },
      ],
      safeAlternatives: [
        'Fresh mozzarella',
        'Cottage cheese',
        'Ricotta cheese',
      ],
      explanation:
        'This aged cheddar cheese contains very high levels of histamine and tyramine, which can trigger severe reactions in sensitive individuals.',
      dataSource: 'Histamine Intolerance Database',
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
};

export const ScanDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScanDetailRouteProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const { scanId } = route.params;
  const [scanData, setScanData] = useState<ScanHistory | null>(null);
  const [userFeedback, setUserFeedback] = useState<
    'accurate' | 'inaccurate' | null
  >(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Simulate loading scan data
    const loadScanData = () => {
      const data = mockScanData[scanId];
      if (data) {
        setScanData(data);
        setUserFeedback(data.userFeedback || null);

        // Animate content in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    loadScanData();
  }, [scanId, fadeAnim, slideAnim]);

  const getResultConfig = () => {
    if (!scanData) {
      return null;
    }

    switch (scanData.analysis.overallSafety) {
      case 'safe':
        return {
          color: Colors.safe,
          icon: '✅',
          backgroundColor: `${Colors.safe}15`,
          title: 'Safe to Eat',
          gradient: [Colors.safe, `${Colors.safe}80`],
        };
      case 'caution':
        return {
          color: Colors.caution,
          icon: '⚠️',
          backgroundColor: `${Colors.caution}15`,
          title: 'Use Caution',
          gradient: [Colors.caution, `${Colors.caution}80`],
        };
      case 'avoid':
        return {
          color: Colors.avoid,
          icon: '❌',
          backgroundColor: `${Colors.avoid}15`,
          title: 'Avoid',
          gradient: [Colors.avoid, `${Colors.avoid}80`],
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

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // const handleShare = async () => {
  //   if (!scanData) return;
  //   await SharingService.shareScanResult(scanData);
  // };

  const handleShareWithOptions = async () => {
    if (!scanData) {
      return;
    }
    await SharingService.shareWithOptions({
      type: 'scan_result',
      title: `GutSafe Scan: ${scanData.foodItem.name}`,
      description: `Scan result: ${scanData.analysis.overallSafety.toUpperCase()}`,
      data: scanData,
      shareUrl: `gutsafe://scan/${scanId}`,
    });
  };

  const handleAddToSafeFoods = () => {
    if (!scanData) {
      return;
    }

    Alert.alert(
      'Add to Safe Foods',
      `Add "${scanData.foodItem.name}" to your safe foods list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            // In real app, this would save to backend
            Alert.alert('Success', 'Added to safe foods!');
          },
        },
      ]
    );
  };

  const handleFeedback = (feedback: 'accurate' | 'inaccurate') => {
    setUserFeedback(feedback);
    // In real app, this would save to backend
    Alert.alert(
      'Thank you!',
      'Your feedback helps improve our analysis accuracy.',
      [{ text: 'OK' }]
    );
  };

  if (!scanData) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const resultConfig = getResultConfig();
  if (!resultConfig) {
    return null;
  }

  const { foodItem, analysis } = scanData;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.accent }]}>
            ‹ Back
          </Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToSafeFoods}
          >
            <Text style={[styles.actionButtonText, { color: colors.accent }]}>
              + Safe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareWithOptions}
          >
            <Text style={[styles.actionButtonText, { color: colors.accent }]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Result Header */}
          <LinearGradient
            colors={resultConfig.gradient as any}
            style={styles.resultHeader}
          >
            <View style={styles.resultHeaderContent}>
              <Text style={styles.resultIcon}>{resultConfig.icon}</Text>
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle}>{resultConfig.title}</Text>
                <Text style={styles.foodName}>{foodItem.name}</Text>
                {foodItem.brand && (
                  <Text style={styles.brandName}>{foodItem.brand}</Text>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Analysis Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Analysis
            </Text>
            <Text style={[styles.explanation, { color: colors.textSecondary }]}>
              {analysis.explanation}
            </Text>
          </View>

          {/* Flagged Ingredients */}
          {analysis.flaggedIngredients.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Flagged Ingredients ({analysis.flaggedIngredients.length})
              </Text>
              {analysis.flaggedIngredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientCard}>
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
          {analysis.safeAlternatives.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Safe Alternatives
              </Text>
              <View style={styles.alternativesGrid}>
                {analysis.safeAlternatives.map((alternative, index) => (
                  <View
                    key={index}
                    style={[
                      styles.alternativeCard,
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

          {/* Data Source Information */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Source
            </Text>
            <View style={styles.dataSourceContainer}>
              <View style={styles.dataSourceInfo}>
                <Text style={[styles.dataSourceName, { color: colors.text }]}>
                  {analysis.dataSource}
                </Text>
                <Text
                  style={[
                    styles.dataSourceDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Last updated: {analysis.lastUpdated.toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.dataSourceIcon}>
                <Text style={styles.dataSourceIconText}>📊</Text>
              </View>
            </View>
          </View>

          {/* Food Details */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Food Details
            </Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Category
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {foodItem.category || 'Unknown'}
                </Text>
              </View>
              {foodItem.histamineLevel && (
                <View style={styles.detailItem}>
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
              <View style={styles.detailItem}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Scanned
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatTimestamp(scanData.timestamp)}
                </Text>
              </View>
              {foodItem.barcode && (
                <View style={styles.detailItem}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Barcode
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {foodItem.barcode}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Feedback Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Was this analysis helpful?
            </Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  {
                    backgroundColor:
                      userFeedback === 'accurate'
                        ? Colors.safe
                        : colors.background,
                    borderColor: Colors.safe,
                  },
                ]}
                onPress={() => handleFeedback('accurate')}
              >
                <Text
                  style={[
                    styles.feedbackButtonText,
                    {
                      color:
                        userFeedback === 'accurate'
                          ? Colors.white
                          : Colors.safe,
                    },
                  ]}
                >
                  ✓ Accurate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  {
                    backgroundColor:
                      userFeedback === 'inaccurate'
                        ? Colors.avoid
                        : colors.background,
                    borderColor: Colors.avoid,
                  },
                ]}
                onPress={() => handleFeedback('inaccurate')}
              >
                <Text
                  style={[
                    styles.feedbackButtonText,
                    {
                      color:
                        userFeedback === 'inaccurate'
                          ? Colors.white
                          : Colors.avoid,
                    },
                  ]}
                >
                  ✗ Inaccurate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: Spacing.xs,
  },
  actionButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  alternativeCard: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  alternativeIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  alternativeText: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  alternativesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  brandName: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    opacity: 0.9,
  },
  conditionText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    fontStyle: 'italic',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceLabel: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    opacity: 0.8,
  },
  confidenceValue: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  dataSourceContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataSourceDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  dataSourceIcon: {
    marginLeft: Spacing.md,
  },
  dataSourceIconText: {
    fontSize: 24,
  },
  dataSourceInfo: {
    flex: 1,
  },
  dataSourceName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: 2,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
  },
  detailValue: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginLeft: Spacing.md,
    textAlign: 'right',
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  explanation: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
  },
  feedbackButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  feedbackButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  foodName: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  ingredientCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  ingredientHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  ingredientName: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginRight: Spacing.sm,
  },
  ingredientReason: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    marginBottom: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
  },
  resultHeader: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
  },
  resultHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  resultIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.md,
  },
  severityBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  severityIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  severityText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.caption,
    textTransform: 'capitalize',
  },
});
