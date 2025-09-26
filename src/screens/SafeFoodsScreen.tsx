/**
 * @fileoverview SafeFoodsScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useNavigation } from '@react-navigation/native';
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
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { SafeFood } from '../types';

// Mock safe foods data
const mockSafeFoods: SafeFood[] = [
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
      fodmapLevel: 'low',
      glutenFree: true,
      lactoseFree: false,
      histamineLevel: 'low',
      dataSource: 'USDA Food Database',
      isSafeFood: true,
      addedToSafeFoods: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    usageCount: 12,
    notes: 'Great for breakfast, low histamine',
  },
  {
    id: '2',
    foodItem: {
      id: '2',
      name: 'Banana',
      brand: 'Unknown',
      category: 'Fruit',
      barcode: '0000000000000',
      ingredients: ['Banana'],
      allergens: [],
      additives: [],
      fodmapLevel: 'low',
      glutenFree: true,
      lactoseFree: true,
      histamineLevel: 'low',
      dataSource: 'FODMAP Database',
      isSafeFood: true,
      addedToSafeFoods: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    addedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usageCount: 8,
    notes: 'Best when slightly green',
  },
  {
    id: '3',
    foodItem: {
      id: '3',
      name: 'Quinoa',
      brand: "Bob's Red Mill",
      category: 'Grains',
      barcode: '1234567890127',
      ingredients: ['Quinoa'],
      allergens: [],
      additives: [],
      fodmapLevel: 'low',
      glutenFree: true,
      lactoseFree: true,
      histamineLevel: 'low',
      dataSource: 'Monash FODMAP Database',
      isSafeFood: true,
      addedToSafeFoods: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
    addedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    usageCount: 15,
    notes: 'Perfect protein source',
  },
];

export const SafeFoodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [safeFoods, setSafeFoods] = useState<SafeFood[]>(mockSafeFoods);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'usage' | 'name'>('recent');

  const filteredAndSortedFoods = useMemo(() => {
    const filtered = safeFoods.filter(
      (food) =>
        food.foodItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.foodItem.brand &&
          food.foodItem.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    switch (sortBy) {
      case 'recent':
        return filtered.sort(
          (a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
        );
      case 'usage':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      case 'name':
        return filtered.sort((a, b) =>
          a.foodItem.name.localeCompare(b.foodItem.name)
        );
      default:
        return filtered;
    }
  }, [safeFoods, searchQuery, sortBy]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleRemoveSafeFood = (foodId: string) => {
    Alert.alert(
      'Remove from Safe Foods',
      'Are you sure you want to remove this food from your safe foods list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSafeFoods((prev) => prev.filter((food) => food.id !== foodId));
          },
        },
      ]
    );
  };

  const handleAddNote = (foodId: string) => {
    const food = safeFoods.find((f) => f.id === foodId);
    if (!food) {
      return;
    }

    Alert.prompt(
      'Add Note',
      'Add a personal note about this safe food:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (note) => {
            if (note) {
              setSafeFoods((prev) =>
                prev.map((f) => (f.id === foodId ? { ...f, notes: note } : f))
              );
            }
          },
        },
      ],
      'plain-text',
      food.notes || ''
    );
  };

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'recent':
        return '🕒';
      case 'usage':
        return '📊';
      case 'name':
        return '🔤';
      default:
        return '';
    }
  };

  const formatLastUsed = (date?: Date) => {
    if (!date) {
      return 'Never used';
    }
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    }
    return `${Math.floor(diffDays / 30)} months ago`;
  };

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
        <Text style={[styles.title, { color: colors.text }]}>Safe Foods</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface }]}
      >
        <TextInput
          placeholder="Search safe foods..."
          placeholderTextColor={colors.textTertiary}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'recent', label: 'Recent' },
            { key: 'usage', label: 'Most Used' },
            { key: 'name', label: 'Name' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === option.key ? colors.accent : colors.surface,
                },
              ]}
              onPress={() => setSortBy(option.key as any)}
            >
              <Text style={styles.sortIcon}>{getSortIcon(option.key)}</Text>
              <Text
                style={[
                  styles.sortButtonText,
                  {
                    color: sortBy === option.key ? Colors.white : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Safe Foods List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {filteredAndSortedFoods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍎</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No matching safe foods' : 'No safe foods yet'}
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Add foods to your safe foods list from scan results'}
            </Text>
          </View>
        ) : (
          filteredAndSortedFoods.map((safeFood) => (
            <View
              key={safeFood.id}
              style={[styles.foodCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.foodHeader}>
                <View style={styles.foodInfo}>
                  <Text style={[styles.foodName, { color: colors.text }]}>
                    {safeFood.foodItem.name}
                  </Text>
                  {safeFood.foodItem.brand && (
                    <Text
                      style={[
                        styles.foodBrand,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {safeFood.foodItem.brand}
                    </Text>
                  )}
                  <Text
                    style={[styles.dataSource, { color: colors.textTertiary }]}
                  >
                    Source: {safeFood.foodItem.dataSource}
                  </Text>
                </View>
                <View style={styles.foodActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleAddNote(safeFood.id)}
                  >
                    <Text style={styles.actionIcon}>📝</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRemoveSafeFood(safeFood.id)}
                  >
                    <Text style={styles.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {safeFood.notes && (
                <View
                  style={[
                    styles.notesContainer,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[styles.notesText, { color: colors.textSecondary }]}
                  >
                    💭 {safeFood.notes}
                  </Text>
                </View>
              )}

              <View style={styles.foodStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {safeFood.usageCount}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Uses
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatLastUsed(safeFood.lastUsed)}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Last Used
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {safeFood.foodItem.fodmapLevel || 'N/A'}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    FODMAP
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    padding: Spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  container: {
    flex: 1,
  },
  dataSource: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
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
  foodActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  foodBrand: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: 2,
  },
  foodCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
  },
  foodHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: 2,
  },
  foodStats: {
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerRight: {
    width: 60,
  },
  notesContainer: {
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
  notesText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    fontStyle: 'italic',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    paddingVertical: Spacing.sm,
  },
  sortButton: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sortButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  sortContainer: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sortIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
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
    fontSize: Typography.fontSize.body,
    marginBottom: 2,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
  },
});
