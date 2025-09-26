/**
 * @fileoverview BrowseScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  // TouchableOpacity,
  ScrollView,
  StatusBar,
  useColorScheme,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Animated3DCard } from '../components/Animated3DCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import AccessibilityService from '../utils/accessibility';
import { HapticFeedback } from '../utils/haptics';
// import { AnimationPresets, AnimationUtils } from '../utils/animations';

export const BrowseScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Initialize accessibility
    AccessibilityService.initialize();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Browse</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Categories Grid */}
        <Animated.View
          style={[
            styles.categoriesGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {browseCategories.map((category, index) => (
            <Animated3DCard
              key={index}
              enable3D
              accessibilityHint={category.description}
              accessibilityLabel={category.title}
              hapticType="light"
              style={
                [
                  styles.categoryCard,
                  { backgroundColor: colors.surface },
                ] as any
              }
              variant="solid"
              onPress={() => {
                HapticFeedback.buttonPress();
                console.log(`${category.title} pressed`);
              }}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color },
                ]}
              >
                <Text style={styles.categoryIconText}>{category.icon}</Text>
              </View>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category.title}
              </Text>
              <Text
                style={[
                  styles.categoryDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {category.description}
              </Text>
            </Animated3DCard>
          ))}
        </Animated.View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>

          <View
            style={[styles.activityCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📱</Text>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Scanned: Organic Quinoa
                </Text>
                <Text
                  style={[styles.activityTime, { color: colors.textSecondary }]}
                >
                  2 hours ago • Source: Monash FODMAP Database
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
                <Text
                  style={[styles.activityTime, { color: colors.textSecondary }]}
                >
                  Yesterday • Source: Restaurant Database
                </Text>
              </View>
              <Text style={[styles.activityStatus, { color: Colors.caution }]}>
                Caution
              </Text>
            </View>

            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>🥛</Text>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Scanned: Greek Yogurt
                </Text>
                <Text
                  style={[styles.activityTime, { color: colors.textSecondary }]}
                >
                  3 days ago • Source: USDA Food Database
                </Text>
              </View>
              <Text style={[styles.activityStatus, { color: Colors.safe }]}>
                Safe
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activityCard: {
    borderRadius: 12,
    padding: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  activityItem: {
    alignItems: 'center',
    borderBottomColor: Colors.border,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  activityStatus: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  activityTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  activityTitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  categoryCard: {
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    width: '48%',
  },
  categoryDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    lineHeight: Typography.lineHeight.caption,
    textAlign: 'center',
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    width: 48,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  recentSection: {
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
  },
});
