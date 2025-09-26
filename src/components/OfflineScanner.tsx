/**
 * @fileoverview OfflineScanner.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  useColorScheme,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import NetworkService from '../services/NetworkService';
import OfflineService from '../services/OfflineService';
import type {
  ScanHistory,
  FoodItem,
  ScanResult,
  GutCondition,
  SeverityLevel,
} from '../types';

interface OfflineScannerProps {
  onScanComplete: (scan: ScanHistory) => void;
  onClose: () => void;
}

export const OfflineScanner: React.FC<OfflineScannerProps> = ({
  onScanComplete,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    quality: 0,
  });

  const offlineService = OfflineService.getInstance();
  const networkService = NetworkService.getInstance();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check network status
    const updateNetworkStatus = async () => {
      const isOnline = networkService.isOnline();
      const quality = await networkService.getNetworkQuality();
      setNetworkStatus({ isOnline, quality: quality.score });
    };

    updateNetworkStatus();

    // Listen for network changes
    const handleNetworkChange = () => {
      updateNetworkStatus();
    };

    networkService.on('online', handleNetworkChange);
    networkService.on('offline', handleNetworkChange);

    return () => {
      networkService.off('online', handleNetworkChange);
      networkService.off('offline', handleNetworkChange);
    };
  }, [networkService]);

  const performSearch = useCallback(
    async (query: string) => {
      setIsSearching(true);
      try {
        const results = await offlineService.searchCachedFoods(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        Alert.alert(
          'Search Error',
          'Failed to search cached foods. Please try again.'
        );
      } finally {
        setIsSearching(false);
      }
    },
    [offlineService]
  );

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const analyzeFood = async (foodItem: FoodItem): Promise<ScanHistory> => {
    // Simulate offline analysis based on cached data
    const analysis = {
      overallSafety: 'caution' as ScanResult,
      flaggedIngredients: [] as any[],
      conditionWarnings: [] as any[],
      safeAlternatives: [] as string[],
      explanation:
        'Offline analysis - limited data available. Please check online for complete analysis.',
      dataSource: 'Offline Cache',
      lastUpdated: new Date(),
    };

    // Basic offline analysis based on common triggers
    const commonTriggers = [
      { ingredient: 'gluten', conditions: ['gluten', 'ibs-fodmap'] },
      { ingredient: 'lactose', conditions: ['lactose'] },
      { ingredient: 'fructose', conditions: ['ibs-fodmap'] },
      { ingredient: 'sorbitol', conditions: ['ibs-fodmap'] },
      { ingredient: 'mannitol', conditions: ['ibs-fodmap'] },
      { ingredient: 'histamine', conditions: ['histamine'] },
      { ingredient: 'tyramine', conditions: ['histamine'] },
      { ingredient: 'sulfites', conditions: ['additives'] },
      { ingredient: 'msg', conditions: ['additives'] },
      { ingredient: 'artificial colors', conditions: ['additives'] },
      { ingredient: 'artificial flavors', conditions: ['additives'] },
    ];

    // Check ingredients for common triggers
    for (const trigger of commonTriggers) {
      const hasTrigger = foodItem.ingredients.some((ingredient) =>
        ingredient.toLowerCase().includes(trigger.ingredient)
      );

      if (hasTrigger) {
        analysis.flaggedIngredients.push({
          ingredient: trigger.ingredient,
          reason: `Contains ${trigger.ingredient} which may trigger symptoms`,
          severity: 'moderate' as SeverityLevel,
          condition: trigger.conditions[0] as GutCondition,
        });

        analysis.conditionWarnings.push({
          ingredient: trigger.ingredient,
          severity: 'moderate' as SeverityLevel,
          condition: trigger.conditions[0] as GutCondition,
        });
      }
    }

    // Determine overall safety
    if (analysis.flaggedIngredients.length === 0) {
      analysis.overallSafety = 'safe';
      analysis.explanation = 'No common triggers detected in offline analysis.';
    } else if (analysis.flaggedIngredients.length > 2) {
      analysis.overallSafety = 'avoid';
      analysis.explanation =
        'Multiple potential triggers detected. Consider avoiding or checking online for detailed analysis.';
    }

    // Generate basic safe alternatives
    if (analysis.flaggedIngredients.length > 0) {
      analysis.safeAlternatives = [
        'Check online for detailed alternatives',
        'Consult with healthcare provider',
        'Try small portion first',
      ];
    }

    const scanHistory: ScanHistory = {
      id: `offline_${Date.now()}`,
      foodItem,
      analysis,
      timestamp: new Date(),
      userFeedback: 'accurate' as const,
    };

    return scanHistory;
  };

  const handleFoodSelect = async (foodItem: FoodItem) => {
    // setSelectedFood(foodItem);
    setIsAnalyzing(true);

    try {
      const scanResult = await analyzeFood(foodItem);

      // Store offline scan for later sync
      await offlineService.storeOfflineScan(scanResult);

      onScanComplete(scanResult);

      Alert.alert(
        'Scan Complete',
        'Food analyzed offline. Results will be synced when online.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert(
        'Analysis Error',
        'Failed to analyze food. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt('Manual Food Entry', 'Enter the food name:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Analyze',
        onPress: async (foodName) => {
          if (foodName?.trim()) {
            const manualFoodItem: FoodItem = {
              id: `manual_${Date.now()}`,
              name: foodName.trim(),
              brand: 'Unknown',
              category: 'Unknown',
              barcode: '0000000000000',
              ingredients: [foodName.trim()],
              allergens: [],
              additives: [],
              glutenFree: false,
              lactoseFree: false,
              histamineLevel: 'moderate',
              dataSource: 'Manual Entry',
            };

            await handleFoodSelect(manualFoodItem);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Offline Scanner
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={[styles.closeButtonText, { color: colors.accent }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Network Status */}
      <View style={[styles.networkStatus, { backgroundColor: colors.surface }]}>
        <View style={styles.networkInfo}>
          <Text style={[styles.networkStatusText, { color: colors.text }]}>
            {networkStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Text
            style={[styles.networkQualityText, { color: colors.textSecondary }]}
          >
            Quality: {networkStatus.quality}%
          </Text>
        </View>
        <Text style={[styles.offlineNote, { color: colors.textSecondary }]}>
          Searching cached foods only
        </Text>
      </View>

      {/* Search Input */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <TextInput
          placeholder="Search cached foods..."
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          style={[
            styles.searchInput,
            { color: colors.text, borderColor: colors.border },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isSearching && (
          <Text style={[styles.searchingText, { color: colors.textSecondary }]}>
            Searching...
          </Text>
        )}
      </View>

      {/* Manual Entry Button */}
      <View style={styles.manualEntryContainer}>
        <TouchableOpacity
          style={[styles.manualEntryButton, { backgroundColor: colors.accent }]}
          onPress={handleManualEntry}
        >
          <Text style={[styles.manualEntryButtonText, { color: Colors.white }]}>
            + Manual Entry
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer}>
        {searchResults.length === 0 &&
          searchQuery.length >= 2 &&
          !isSearching && (
            <View style={styles.noResults}>
              <Text
                style={[styles.noResultsText, { color: colors.textSecondary }]}
              >
                No cached foods found for "{searchQuery}"
              </Text>
              <TouchableOpacity
                style={[
                  styles.manualEntryButton,
                  { backgroundColor: colors.accent },
                ]}
                onPress={handleManualEntry}
              >
                <Text
                  style={[
                    styles.manualEntryButtonText,
                    { color: Colors.white },
                  ]}
                >
                  Add Manually
                </Text>
              </TouchableOpacity>
            </View>
          )}

        {searchResults.map((food) => (
          <TouchableOpacity
            key={food.id}
            disabled={isAnalyzing}
            style={[
              styles.foodItem,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => handleFoodSelect(food)}
          >
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: colors.text }]}>
                {food.name}
              </Text>
              {food.brand && (
                <Text
                  style={[styles.foodBrand, { color: colors.textSecondary }]}
                >
                  {food.brand}
                </Text>
              )}
              <Text
                style={[styles.foodCategory, { color: colors.textSecondary }]}
              >
                {food.category}
              </Text>
            </View>
            <View style={styles.foodActions}>
              <Text style={[styles.analyzeText, { color: colors.accent }]}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Offline Notice */}
      <View style={[styles.offlineNotice, { backgroundColor: colors.surface }]}>
        <Text
          style={[styles.offlineNoticeText, { color: colors.textSecondary }]}
        >
          ⚠️ Offline mode: Limited analysis available. Full analysis requires
          internet connection.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  analyzeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
  },
  container: {
    flex: 1,
  },
  foodActions: {
    alignItems: 'center',
  },
  foodBrand: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    marginBottom: Spacing.xs,
  },
  foodCategory: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  foodInfo: {
    flex: 1,
  },
  foodItem: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  foodName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  manualEntryButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  manualEntryButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  manualEntryContainer: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  networkInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  networkQualityText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  networkStatus: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  networkStatusText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noResultsText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  offlineNote: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  offlineNotice: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  offlineNoticeText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchingText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
  },
});
