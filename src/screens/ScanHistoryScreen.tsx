/**
 * @fileoverview ScanHistoryScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useNavigation } from '@react-navigation/native';
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  RefreshControl,
  TextInput,
  Alert,
  Share,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScanDetailCard } from '../components/ScanDetailCard';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type {
  ScanHistory,
  ScanResult,
  GutCondition,
  SeverityLevel,
} from '../types';
import { logger } from '../utils/logger';

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
      ingredients: [
        'Cultured pasteurized grade A milk',
        'Live active cultures',
      ],
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
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: '4',
    foodItem: {
      id: '4',
      name: 'Banana',
      brand: 'Unknown',
      category: 'Fruit',
      barcode: '1234567890123',
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
      conditionWarnings: [],
      safeAlternatives: ['Green banana', 'Plantain'],
      explanation:
        'Bananas are generally well-tolerated and contain prebiotic fiber that supports gut health. Choose slightly green bananas for lower sugar content.',
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
      ingredients: [
        'Carbonated water',
        'Sucrose',
        'Glucose',
        'Citric acid',
        'Taurine',
        'Sodium citrate',
        'Caffeine',
      ],
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
          condition: 'additives' as GutCondition,
        },
        {
          ingredient: 'Artificial sweeteners',
          reason: 'May cause bloating and digestive discomfort',
          severity: 'mild' as SeverityLevel,
          condition: 'additives' as GutCondition,
        },
        {
          ingredient: 'Taurine',
          reason: 'High levels may affect gut bacteria',
          severity: 'mild' as SeverityLevel,
          condition: 'additives' as GutCondition,
        },
      ],
      conditionWarnings: [
        {
          ingredient: 'Caffeine',
          severity: 'moderate' as SeverityLevel,
          condition: 'additives' as GutCondition,
        },
      ],
      safeAlternatives: ['Green tea', 'Herbal tea', 'Coconut water'],
      explanation:
        'This energy drink contains high levels of caffeine and artificial ingredients that may irritate the digestive system.',
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

  const [scanHistory] = useState<ScanHistory[]>(mockScanHistory);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'safe' | 'caution' | 'avoid'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'safety' | 'category'>(
    'date'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const searchInputRef = useRef<TextInput>(null);
  // const fadeAnim = useRef(new Animated.Value(0)).current;

  // Enhanced filtering and sorting logic
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = scanHistory;

    // Apply safety filter
    if (filter !== 'all') {
      filtered = filtered.filter(
        (scan) => scan.analysis.overallSafety === filter
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (scan) =>
          scan.foodItem.name.toLowerCase().includes(query) ||
          scan.foodItem.brand?.toLowerCase().includes(query) ||
          scan.foodItem.category?.toLowerCase().includes(query) ||
          scan.foodItem.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(query)
          ) ||
          scan.analysis.flaggedIngredients.some((flagged) =>
            flagged.ingredient.toLowerCase().includes(query)
          )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'name':
          comparison = a.foodItem.name.localeCompare(b.foodItem.name);
          break;
        case 'safety':
          const safetyOrder = { safe: 0, caution: 1, avoid: 2 };
          comparison =
            safetyOrder[a.analysis.overallSafety] -
            safetyOrder[b.analysis.overallSafety];
          break;
        case 'category':
          comparison = (a.foodItem.category || '').localeCompare(
            b.foodItem.category || ''
          );
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [scanHistory, filter, searchQuery, sortBy, sortOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleCardPress = (scanId: string) => {
    if (isSelectionMode) {
      toggleScanSelection(scanId);
    } else {
      // Navigate to detailed view
      (navigation as any).navigate('ScanDetail', { scanId });
    }
  };

  const handleCardExpand = (scanId: string) => {
    setExpandedCard(expandedCard === scanId ? null : scanId);
  };

  const toggleScanSelection = (scanId: string) => {
    const newSelection = new Set(selectedScans);
    if (newSelection.has(scanId)) {
      newSelection.delete(scanId);
    } else {
      newSelection.add(scanId);
    }
    setSelectedScans(newSelection);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedScans(new Set());
  };

  const selectAllScans = () => {
    setSelectedScans(new Set(filteredAndSortedHistory.map((scan) => scan.id)));
  };

  const clearSelection = () => {
    setSelectedScans(new Set());
  };

  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const scansToExport =
        selectedScans.size > 0
          ? filteredAndSortedHistory.filter((scan) =>
              selectedScans.has(scan.id)
            )
          : filteredAndSortedHistory;

      let exportData: string;
      // let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(scansToExport, null, 2);
          // filename = `scan-history-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          exportData = generateCSV(scansToExport);
          // filename = `scan-history-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'pdf':
          // In a real app, you would generate a PDF here
          exportData = generatePDF(scansToExport);
          // filename = `scan-history-${new Date().toISOString().split('T')[0]}.pdf`;
          mimeType = 'application/pdf';
          break;
      }

      await Share.share({
        message: exportData,
        title: 'GutSafe Scan History Export',
        url: `data:${mimeType};base64,${btoa(exportData)}`,
      });

      setShowExportModal(false);
      Alert.alert('Success', 'Scan history exported successfully!');
    } catch (error) {
      logger.error('Export error', 'ScanHistoryScreen', error);
      Alert.alert('Error', 'Failed to export scan history. Please try again.');
    }
  };

  const generateCSV = (scans: ScanHistory[]): string => {
    const headers = [
      'Date',
      'Food Name',
      'Brand',
      'Category',
      'Safety Level',
      'Ingredients',
      'Flagged Ingredients',
      'Safe Alternatives',
      'Explanation',
    ];

    const rows = scans.map((scan) => [
      scan.timestamp.toISOString(),
      scan.foodItem.name,
      scan.foodItem.brand || '',
      scan.foodItem.category || '',
      scan.analysis.overallSafety,
      scan.foodItem.ingredients.join('; '),
      scan.analysis.flaggedIngredients.map((f) => f.ingredient).join('; '),
      scan.analysis.safeAlternatives.join('; '),
      scan.analysis.explanation,
    ]);

    return [headers, ...rows]
      .map((row) =>
        row
          .map((field) => `"${field.toString().replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
  };

  const generatePDF = (scans: ScanHistory[]): string => {
    // Simplified PDF generation - in a real app, use a proper PDF library
    return `GutSafe Scan History Report
Generated: ${new Date().toLocaleDateString()}
Total Scans: ${scans.length}

${scans
  .map(
    (scan) => `
Food: ${scan.foodItem.name}
Brand: ${scan.foodItem.brand || 'N/A'}
Safety: ${scan.analysis.overallSafety}
Date: ${scan.timestamp.toLocaleDateString()}
Ingredients: ${scan.foodItem.ingredients.join(', ')}
Explanation: ${scan.analysis.explanation}
---`
  )
  .join('\n')}`;
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.blur();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getFilterCount = (result: ScanResult) => {
    return scanHistory.filter((scan) => scan.analysis.overallSafety === result)
      .length;
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
        <Text style={[styles.title, { color: colors.text }]}>Scan History</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleSelectionMode}
          >
            <Text style={[styles.headerButtonText, { color: colors.accent }]}>
              {isSelectionMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowExportModal(true)}
          >
            <Text style={[styles.headerButtonText, { color: colors.accent }]}>
              Export
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <View
          style={[styles.searchInputContainer, { borderColor: colors.border }]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            placeholder="Search foods, ingredients, brands..."
            placeholderTextColor={colors.textSecondary}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text
                style={[
                  styles.clearButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.searchFilterButton,
            { backgroundColor: colors.accent },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text
            style={[styles.searchFilterButtonText, { color: Colors.white }]}
          >
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Filters */}
      {showFilters && (
        <Animated.View
          style={[styles.filtersContainer, { backgroundColor: colors.surface }]}
        >
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              Sort by:
            </Text>
            <View style={styles.sortButtons}>
              {[
                { key: 'date', label: 'Date' },
                { key: 'name', label: 'Name' },
                { key: 'safety', label: 'Safety' },
                { key: 'category', label: 'Category' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    {
                      backgroundColor:
                        sortBy === option.key ? colors.accent : 'transparent',
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setSortBy(option.key as any)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      {
                        color:
                          sortBy === option.key ? Colors.white : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.orderButton, { backgroundColor: colors.accent }]}
              onPress={toggleSortOrder}
            >
              <Text style={[styles.orderButtonText, { color: Colors.white }]}>
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <View
          style={[styles.selectionActions, { backgroundColor: colors.accent }]}
        >
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={selectAllScans}
          >
            <Text style={[styles.selectionButtonText, { color: Colors.white }]}>
              Select All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={clearSelection}
          >
            <Text style={[styles.selectionButtonText, { color: Colors.white }]}>
              Clear
            </Text>
          </TouchableOpacity>
          <Text style={[styles.selectionCount, { color: Colors.white }]}>
            {selectedScans.size} selected
          </Text>
        </View>
      )}

      {/* Stats Summary */}
      <View
        style={[styles.statsContainer, { backgroundColor: colors.surface }]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.total}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.safe }]}>
              {stats.safe}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Safe
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.caution }]}>
              {stats.caution}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Caution
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.avoid }]}>
              {stats.avoid}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Avoid
            </Text>
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
                  backgroundColor:
                    filter === filterOption.key
                      ? colors.accent
                      : colors.surface,
                },
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      filter === filterOption.key ? Colors.white : colors.text,
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
      <FlatList
        removeClippedSubviews
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No matching scans found' : 'No scans found'}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? 'Try adjusting your search terms or filters'
                : filter === 'all'
                  ? 'Start scanning foods to see your history here'
                  : `No ${filter} scans found`}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={[
                  styles.clearSearchButton,
                  { backgroundColor: colors.accent },
                ]}
                onPress={clearSearch}
              >
                <Text
                  style={[
                    styles.clearSearchButtonText,
                    { color: Colors.white },
                  ]}
                >
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.scrollContent}
        data={filteredAndSortedHistory}
        getItemLayout={(_data, index) => ({
          length: 200, // Approximate height of each item
          offset: 200 * index,
          index,
        })}
        initialNumToRender={10}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: scan }) => (
          <View style={styles.scanItemContainer}>
            {isSelectionMode && (
              <TouchableOpacity
                style={[
                  styles.selectionCheckbox,
                  {
                    backgroundColor: selectedScans.has(scan.id)
                      ? colors.accent
                      : 'transparent',
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => toggleScanSelection(scan.id)}
              >
                {selectedScans.has(scan.id) && (
                  <Text style={[styles.checkmark, { color: Colors.white }]}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            )}
            <View style={isSelectionMode ? styles.selectedCard : undefined}>
              <ScanDetailCard
                expanded={expandedCard === scan.id}
                scanHistory={scan}
                onExpand={() => handleCardExpand(scan.id)}
                onPress={() => handleCardPress(scan.id)}
              />
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        windowSize={10}
      />

      {/* Export Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showExportModal}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Export Scan History
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
            >
              {selectedScans.size > 0
                ? `Export ${selectedScans.size} selected scans`
                : `Export all ${filteredAndSortedHistory.length} scans`}
            </Text>

            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={[styles.exportOption, { borderColor: colors.border }]}
                onPress={() => handleExport('json')}
              >
                <Text style={styles.exportIcon}>📄</Text>
                <Text style={[styles.exportLabel, { color: colors.text }]}>
                  JSON
                </Text>
                <Text
                  style={[
                    styles.exportDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Complete data with all details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportOption, { borderColor: colors.border }]}
                onPress={() => handleExport('csv')}
              >
                <Text style={styles.exportIcon}>📊</Text>
                <Text style={[styles.exportLabel, { color: colors.text }]}>
                  CSV
                </Text>
                <Text
                  style={[
                    styles.exportDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Spreadsheet format for analysis
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportOption, { borderColor: colors.border }]}
                onPress={() => handleExport('pdf')}
              >
                <Text style={styles.exportIcon}>📋</Text>
                <Text style={[styles.exportLabel, { color: colors.text }]}>
                  PDF
                </Text>
                <Text
                  style={[
                    styles.exportDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Printable report format
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  checkmark: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearButtonText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
  },
  clearSearchButton: {
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  clearSearchButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  container: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  exportDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    textAlign: 'right',
  },
  exportIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  exportLabel: {
    flex: 1,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h4,
  },
  exportOption: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: Spacing.md,
  },
  exportOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    borderRadius: 20,
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  filterContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  filterLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
    marginRight: Spacing.md,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  filtersContainer: {
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  modalButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    maxWidth: 400,
    padding: Spacing.lg,
    width: '100%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  orderButton: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  orderButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  scanItemContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchFilterButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchFilterButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
  },
  searchInputContainer: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  selectedCard: {
    opacity: 0.8,
  },
  selectionActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  selectionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  selectionButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  selectionCheckbox: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: Spacing.sm,
    width: 24,
  },
  selectionCount: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
    marginLeft: 'auto',
  },
  sortButton: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sortButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.xs,
  },
  statsContainer: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  title: {
    flex: 1,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    textAlign: 'center',
  },
});
