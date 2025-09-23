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
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { ScanHistory, ScanResult, SeverityLevel, GutCondition } from '../types';

type ScanDetailRouteParams = {
  ScanDetail: {
    scanId: string;
  };
};

type ScanDetailRouteProp = RouteProp<ScanDetailRouteParams, 'ScanDetail'>;

// Mock scan data - in real app, this would come from a store or API
const mockScanData: { [key: string]: ScanHistory } = {
  '1': {
    id: '1',
    foodItem: {
      name: 'Greek Yogurt',
      brand: 'Chobani',
      category: 'Dairy',
      barcode: '1234567890123',
      histamineLevel: 'low',
    },
    analysis: {
      result: 'safe' as ScanResult,
      confidence: 0.92,
      flaggedIngredients: [],
      safeAlternatives: ['Coconut yogurt', 'Almond yogurt'],
      explanation: 'This Greek yogurt is low in histamine and contains probiotics that may benefit gut health. No problematic ingredients detected.',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    userFeedback: 'accurate',
  },
  '2': {
    id: '2',
    foodItem: {
      name: 'Wheat Bread',
      brand: 'Wonder',
      category: 'Bakery',
      barcode: '1234567890124',
    },
    analysis: {
      result: 'caution' as ScanResult,
      confidence: 0.78,
      flaggedIngredients: [
        {
          ingredient: 'Wheat',
          reason: 'Contains gluten which may trigger IBS symptoms',
          severity: 'moderate' as SeverityLevel,
          condition: 'IBS' as GutCondition,
        },
        {
          ingredient: 'Fructans',
          reason: 'High FODMAP content may cause bloating',
          severity: 'mild' as SeverityLevel,
          condition: 'FODMAP sensitivity' as GutCondition,
        },
      ],
      safeAlternatives: ['Sourdough bread', 'Gluten-free bread', 'Rice cakes'],
      explanation: 'This wheat bread contains gluten and fructans that may trigger digestive symptoms in sensitive individuals.',
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  '3': {
    id: '3',
    foodItem: {
      name: 'Aged Cheddar Cheese',
      brand: 'Cabot',
      category: 'Dairy',
      barcode: '1234567890125',
      histamineLevel: 'high',
    },
    analysis: {
      result: 'avoid' as ScanResult,
      confidence: 0.95,
      flaggedIngredients: [
        {
          ingredient: 'Histamine',
          reason: 'Aged cheese contains high levels of histamine',
          severity: 'severe' as SeverityLevel,
          condition: 'Histamine intolerance' as GutCondition,
        },
        {
          ingredient: 'Tyramine',
          reason: 'May cause headaches and digestive issues',
          severity: 'moderate' as SeverityLevel,
          condition: 'Tyramine sensitivity' as GutCondition,
        },
      ],
      safeAlternatives: ['Fresh mozzarella', 'Cottage cheese', 'Ricotta cheese'],
      explanation: 'This aged cheddar cheese contains very high levels of histamine and tyramine, which can trigger severe reactions in sensitive individuals.',
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
  const [userFeedback, setUserFeedback] = useState<'accurate' | 'inaccurate' | null>(null);
  
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
  }, [scanId]);

  const getResultConfig = () => {
    if (!scanData) return null;
    
    switch (scanData.analysis.result) {
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

  const handleShare = async () => {
    if (!scanData) return;

    const shareContent = {
      message: `GutSafe Scan Result: ${scanData.foodItem.name} - ${getResultConfig()?.title}`,
      url: `gutsafe://scan/${scanId}`,
    };

    try {
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
    }
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const resultConfig = getResultConfig();
  if (!resultConfig) return null;

  const { foodItem, analysis } = scanData;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: colors.accent }]}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            colors={resultConfig.gradient}
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
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceValue}>
                  {Math.round(analysis.confidence * 100)}%
                </Text>
                <Text style={styles.confidenceLabel}>Confidence</Text>
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
                    <Text style={[styles.ingredientName, { color: colors.text }]}>
                      {ingredient.ingredient}
                    </Text>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: `${getSeverityColor(ingredient.severity)}20` }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: getSeverityColor(ingredient.severity) }
                      ]}>
                        {ingredient.severity}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ingredientReason, { color: colors.textSecondary }]}>
                    {ingredient.reason}
                  </Text>
                  <Text style={[styles.conditionText, { color: colors.textTertiary }]}>
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
                  <View key={index} style={[styles.alternativeCard, { backgroundColor: colors.background }]}>
                    <Text style={styles.alternativeIcon}>✅</Text>
                    <Text style={[styles.alternativeText, { color: colors.text }]}>
                      {alternative}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Food Details */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Food Details
            </Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Category
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {foodItem.category || 'Unknown'}
                </Text>
              </View>
              {foodItem.histamineLevel && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                    Histamine Level
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {foodItem.histamineLevel}
                  </Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Scanned
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatTimestamp(scanData.timestamp)}
                </Text>
              </View>
              {foodItem.barcode && (
                <View style={styles.detailItem}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
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
                    backgroundColor: userFeedback === 'accurate' ? Colors.safe : colors.background,
                    borderColor: Colors.safe,
                  },
                ]}
                onPress={() => handleFeedback('accurate')}
              >
                <Text style={[
                  styles.feedbackButtonText,
                  { color: userFeedback === 'accurate' ? Colors.white : Colors.safe }
                ]}>
                  ✓ Accurate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feedbackButton,
                  {
                    backgroundColor: userFeedback === 'inaccurate' ? Colors.avoid : colors.background,
                    borderColor: Colors.avoid,
                  },
                ]}
                onPress={() => handleFeedback('inaccurate')}
              >
                <Text style={[
                  styles.feedbackButtonText,
                  { color: userFeedback === 'inaccurate' ? Colors.white : Colors.avoid }
                ]}>
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  shareButton: {
    padding: Spacing.xs,
  },
  shareButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
  },
  resultHeader: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  resultHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  foodName: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  brandName: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    opacity: 0.9,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  confidenceLabel: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    opacity: 0.8,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  explanation: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.lineHeight.body,
  },
  ingredientCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
    marginRight: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  severityText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.semiBold,
    textTransform: 'capitalize',
  },
  ingredientReason: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 2,
  },
  conditionText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    fontStyle: 'italic',
  },
  alternativesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    flex: 1,
    minWidth: '45%',
  },
  alternativeIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  alternativeText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    flex: 1,
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
  },
  detailValue: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
