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
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { SafeFood, FoodItem, ScanResult } from '../types';

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
      ingredients: ['Cultured pasteurized grade A milk', 'Live active cultures'],
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
      brand: undefined,
      category: 'Fruit',
      barcode: undefined,
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
      brand: 'Bob\'s Red Mill',
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
    let filtered = safeFoods.filter(food =>
      food.foodItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.foodItem.brand && food.foodItem.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => 
          (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)
        );
      case 'usage':
        return filtered.sort((a, b) => b.usageCount - a.usageCount);
      case 'name':
        return filtered.sort((a, b) => a.foodItem.name.localeCompare(b.foodItem.name));
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
            setSafeFoods(prev => prev.filter(food => food.id !== foodId));
          },
        },
      ]
    );
  };

  const handleAddNote = (foodId: string) => {
    const food = safeFoods.find(f => f.id === foodId);
    if (!food) return;

    Alert.prompt(
      'Add Note',
      'Add a personal note about this safe food:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (note) => {
            if (note) {
              setSafeFoods(prev =>
                prev.map(f =>
                  f.id === foodId ? { ...f, notes: note } : f
                )
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
      case 'recent': return '🕒';
      case 'usage': return '📊';
      case 'name': return '🔤';
      default: return '';
    }
  };

  const formatLastUsed = (date?: Date) => {
    if (!date) return 'Never used';
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

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
        <Text style={[styles.title, { color: colors.text }]}>Safe Foods</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search safe foods..."
          placeholderTextColor={colors.textTertiary}
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
                  backgroundColor: sortBy === option.key ? colors.accent : colors.surface,
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
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAndSortedFoods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍎</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No matching safe foods' : 'No safe foods yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
                    <Text style={[styles.foodBrand, { color: colors.textSecondary }]}>
                      {safeFood.foodItem.brand}
                    </Text>
                  )}
                  <Text style={[styles.dataSource, { color: colors.textTertiary }]}>
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
                <View style={[styles.notesContainer, { backgroundColor: colors.background }]}>
                  <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                    💭 {safeFood.notes}
                  </Text>
                </View>
              )}

              <View style={styles.foodStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {safeFood.usageCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Uses
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatLastUsed(safeFood.lastUsed)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Last Used
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {safeFood.foodItem.fodmapLevel || 'N/A'}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
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
  headerRight: {
    width: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  sortContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  sortIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  sortButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  foodCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  foodBrand: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 2,
  },
  dataSource: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  foodActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  actionIcon: {
    fontSize: 16,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  notesText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
    fontStyle: 'italic',
  },
  foodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
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
