import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

export const BrowseScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const browseCategories = [
    {
      title: 'Gut Conditions',
      icon: '🫀',
      description: 'Manage your gut health conditions',
      color: colors.accent,
    },
    {
      title: 'Food Database',
      icon: '🍎',
      description: 'Browse safe and unsafe foods',
      color: Colors.safe,
    },
    {
      title: 'Scan History',
      icon: '📊',
      description: 'View your scanning history',
      color: Colors.caution,
    },
    {
      title: 'Settings',
      icon: '⚙️',
      description: 'App preferences and profile',
      color: Colors.avoid,
    },
    {
      title: 'Help & Support',
      icon: '❓',
      description: 'Get help and contact support',
      color: colors.accent,
    },
    {
      title: 'About GutSafe',
      icon: 'ℹ️',
      description: 'Learn more about the app',
      color: colors.accent,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Browse</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {browseCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { backgroundColor: colors.surface }]}
              onPress={() => console.log(`${category.title} pressed`)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Text style={styles.categoryIconText}>{category.icon}</Text>
              </View>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category.title}
              </Text>
              <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                {category.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          
          <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📱</Text>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Scanned: Organic Quinoa
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  2 hours ago
                </Text>
              </View>
              <Text style={[styles.activityStatus, { color: Colors.safe }]}>
                Safe
              </Text>
            </View>
            
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📋</Text>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Scanned: Restaurant Menu
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  Yesterday
                </Text>
              </View>
              <Text style={[styles.activityStatus, { color: Colors.caution }]}>
                Caution
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.h1,
    fontFamily: Typography.fontFamily.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  categoryCard: {
    width: '48%',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.caption,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.md,
  },
  activityCard: {
    borderRadius: 12,
    padding: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.xs,
  },
  activityTime: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  activityStatus: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
  },
});
