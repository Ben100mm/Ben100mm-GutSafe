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
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { ScanHistory, FoodItem, ScanResult, GutCondition, SeverityLevel } from '../types';
import OfflineService from '../services/OfflineService';
import NetworkService from '../services/NetworkService';

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

  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const results = await offlineService.searchCachedFoods(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Error', 'Failed to search cached foods. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [offlineService]);

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
      explanation: 'Offline analysis - limited data available. Please check online for complete analysis.',
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
      const hasTrigger = foodItem.ingredients.some(ingredient =>
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
      analysis.explanation = 'Multiple potential triggers detected. Consider avoiding or checking online for detailed analysis.';
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
      Alert.alert('Analysis Error', 'Failed to analyze food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      'Manual Food Entry',
      'Enter the food name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Analyze',
          onPress: async (foodName) => {
            if (foodName && foodName.trim()) {
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
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Offline Scanner</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: colors.accent }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Network Status */}
      <View style={[styles.networkStatus, { backgroundColor: colors.surface }]}>
        <View style={styles.networkInfo}>
          <Text style={[styles.networkStatusText, { color: colors.text }]}>
            {networkStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Text style={[styles.networkQualityText, { color: colors.textSecondary }]}>
            Quality: {networkStatus.quality}%
          </Text>
        </View>
        <Text style={[styles.offlineNote, { color: colors.textSecondary }]}>
          Searching cached foods only
        </Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
          placeholder="Search cached foods..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
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
        {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
          <View style={styles.noResults}>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              No cached foods found for "{searchQuery}"
            </Text>
            <TouchableOpacity
              style={[styles.manualEntryButton, { backgroundColor: colors.accent }]}
              onPress={handleManualEntry}
            >
              <Text style={[styles.manualEntryButtonText, { color: Colors.white }]}>
                Add Manually
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {searchResults.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={[styles.foodItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleFoodSelect(food)}
            disabled={isAnalyzing}
          >
            <View style={styles.foodInfo}>
              <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
              {food.brand && (
                <Text style={[styles.foodBrand, { color: colors.textSecondary }]}>
                  {food.brand}
                </Text>
              )}
              <Text style={[styles.foodCategory, { color: colors.textSecondary }]}>
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
        <Text style={[styles.offlineNoticeText, { color: colors.textSecondary }]}>
          ⚠️ Offline mode: Limited analysis available. Full analysis requires internet connection.
        </Text>
      </View>
    </View>
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
  title: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
  },
  networkStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  networkStatusText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  networkQualityText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
  },
  offlineNote: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
  },
  searchingText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  manualEntryContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  manualEntryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  manualEntryButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noResultsText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  foodBrand: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.xs,
  },
  foodCategory: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  foodActions: {
    alignItems: 'center',
  },
  analyzeText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  offlineNotice: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  offlineNoticeText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
});
