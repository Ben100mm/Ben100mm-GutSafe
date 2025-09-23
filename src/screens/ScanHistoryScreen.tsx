import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { ScanDetailCard } from '../components/ScanDetailCard';
import { ScanHistory, ScanResult, GutCondition, SeverityLevel } from '../types';

// Mock scan history data
const mockScanHistory: ScanHistory[] = [
  {
    id: '1',
    foodItem: {
      id: '1',
      name: 'Greek Yogurt',
      brand: 'Chobani',
      category: 'Dairy',
      barcode: '1234567890123',
      ingredients: ['Cultured pasteurized grade A milk', 'Live active cultures'],
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
      safeAlternatives: ['Coconut yogurt', 'Almond yogurt'],
      explanation: 'This Greek yogurt is low in histamine and contains probiotics that may benefit gut health. No problematic ingredients detected.',
      dataSource: 'USDA Food Database',
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    userFeedback: 'accurate',
  },
  {
    id: '2',
    foodItem: {
      id: '2',
      name: 'Wheat Bread',
      brand: 'Wonder',
      category: 'Bakery',
      barcode: '1234567890124',
      ingredients: ['Wheat Flour', 'Water', 'Yeast', 'Salt', 'Sugar'],
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
      dataSource: 'Monash FODMAP Database',
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: '3',
    foodItem: {
      id: '3',
      name: 'Aged Cheddar Cheese',
      brand: 'Cabot',
      category: 'Dairy',
      barcode: '1234567890125',
      ingredients: ['Pasteurized milk', 'Salt', 'Cheese cultures', 'Enzymes'],
      allergens: ['Milk'],
      additives: [],
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
      dataSource: 'Histamine Intolerance Database',
      lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: '4',
    foodItem: {
      id: '4',
      name: 'Banana',
      brand: undefined,
      category: 'Fruit',
      barcode: undefined,
      ingredients: ['Banana'],
      allergens: [],
      additives: [],
      glutenFree: true,
      lactoseFree: true,
      histamineLevel: 'low',
      dataSource: 'FODMAP Database',
    },
    analysis: {
      overallSafety: 'safe' as ScanResult,
      flaggedIngredients: [],
      safeAlternatives: ['Green banana', 'Plantain'],
      explanation: 'Bananas are generally well-tolerated and contain prebiotic fiber that supports gut health. Choose slightly green bananas for lower sugar content.',
      dataSource: 'FODMAP Database',
      lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: '5',
    foodItem: {
      id: '5',
      name: 'Energy Drink',
      brand: 'Red Bull',
      category: 'Beverages',
      barcode: '1234567890126',
      ingredients: ['Carbonated water', 'Sucrose', 'Glucose', 'Citric acid', 'Taurine', 'Sodium citrate', 'Caffeine'],
      allergens: [],
      additives: ['Artificial flavors', 'Colors'],
      glutenFree: true,
      lactoseFree: true,
      histamineLevel: 'low',
      dataSource: 'Product Database',
    },
    analysis: {
      overallSafety: 'caution' as ScanResult,
      flaggedIngredients: [
        {
          ingredient: 'Caffeine',
          reason: 'High caffeine content may irritate the gut',
          severity: 'moderate' as SeverityLevel,
          condition: 'Caffeine sensitivity' as GutCondition,
        },
        {
          ingredient: 'Artificial sweeteners',
          reason: 'May cause bloating and digestive discomfort',
          severity: 'mild' as SeverityLevel,
          condition: 'Sweetener sensitivity' as GutCondition,
        },
        {
          ingredient: 'Taurine',
          reason: 'High levels may affect gut bacteria',
          severity: 'mild' as SeverityLevel,
          condition: 'Gut dysbiosis' as GutCondition,
        },
      ],
      safeAlternatives: ['Green tea', 'Herbal tea', 'Coconut water'],
      explanation: 'This energy drink contains high levels of caffeine and artificial ingredients that may irritate the digestive system.',
      dataSource: 'Caffeine Database',
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
];

export const ScanHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [scanHistory, setScanHistory] = useState<ScanHistory[]>(mockScanHistory);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'safe' | 'caution' | 'avoid'>('all');

  const filteredHistory = useMemo(() => {
    if (filter === 'all') return scanHistory;
    return scanHistory.filter(scan => scan.analysis.overallSafety === filter);
  }, [scanHistory, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCardPress = (scanId: string) => {
    // Navigate to detailed view
    (navigation as any).navigate('ScanDetail', { scanId });
  };

  const handleCardExpand = (scanId: string) => {
    setExpandedCard(expandedCard === scanId ? null : scanId);
  };

  const getFilterCount = (result: ScanResult) => {
    return scanHistory.filter(scan => scan.analysis.overallSafety === result).length;
  };

  const getStatsSummary = () => {
    const total = scanHistory.length;
    const safe = getFilterCount('safe');
    const caution = getFilterCount('caution');
    const avoid = getFilterCount('avoid');
    
    return { total, safe, caution, avoid };
  };

  const stats = getStatsSummary();

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
        <Text style={[styles.title, { color: colors.text }]}>Scan History</Text>
        <TouchableOpacity
          style={styles.safeFoodsButton}
          onPress={() => (navigation as any).navigate('SafeFoods')}
        >
          <Text style={[styles.safeFoodsButtonText, { color: colors.accent }]}>Safe Foods</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.safe }]}>{stats.safe}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Safe</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.caution }]}>{stats.caution}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Caution</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.avoid }]}>{stats.avoid}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avoid</Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'safe', label: 'Safe', count: stats.safe },
            { key: 'caution', label: 'Caution', count: stats.caution },
            { key: 'avoid', label: 'Avoid', count: stats.avoid },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                {
                  backgroundColor: filter === filterOption.key ? colors.accent : colors.surface,
                },
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: filter === filterOption.key ? Colors.white : colors.text,
                  },
                ]}
              >
                {filterOption.label} ({filterOption.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scan History List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No scans found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {filter === 'all'
                ? 'Start scanning foods to see your history here'
                : `No ${filter} scans found`}
            </Text>
          </View>
        ) : (
          filteredHistory.map((scan) => (
            <ScanDetailCard
              key={scan.id}
              scanHistory={scan}
              onPress={() => handleCardPress(scan.id)}
              onExpand={() => handleCardExpand(scan.id)}
              expanded={expandedCard === scan.id}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
  },
  safeFoodsButton: {
    padding: Spacing.xs,
  },
  safeFoodsButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  statsContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  filterButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
  },
});
