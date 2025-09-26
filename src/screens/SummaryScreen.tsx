/**
 * @fileoverview SummaryScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HealthCard } from '../components/HealthCard';
import { HealthSection } from '../components/HealthSection';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

export const SummaryScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Summary</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View
            style={[styles.profileImage, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.profileInitial}>B</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Pinned Section */}
        <HealthSection
          rightButton="Edit"
          title="Pinned"
          onRightPress={() => console.log('Edit pressed')}
        >
          <HealthCard
            color={colors.accent}
            icon="scan"
            title="Recent Scans"
            unit="today"
            value="12"
            onPress={() => (navigation as any).navigate('ScanHistory')}
          />
          <HealthCard
            color={Colors.safe}
            icon="heart"
            title="Safe Foods"
            unit="favorites"
            value="8"
            onPress={() => console.log('Safe foods pressed')}
          />
        </HealthSection>

        {/* Show All Health Data */}
        <TouchableOpacity
          style={[styles.showAllCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.showAllContent}>
            <View
              style={[styles.showAllIcon, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.showAllIconText}>G</Text>
            </View>
            <Text style={[styles.showAllText, { color: colors.text }]}>
              Show All Gut Health Data
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Trends Section */}
        <HealthSection title="Trends">
          <HealthCard
            showChart
            color={Colors.safe}
            description="Your gut health has improved over the last 4 weeks"
            icon="trend"
            title="Gut Health Score"
            unit="this week"
            value="85"
            onPress={() => console.log('Gut health score pressed')}
          />
          <HealthCard
            color={Colors.safe}
            description="You've made 24 safe food choices this week"
            icon="check"
            title="Safe Choices"
            unit="this week"
            value="24"
            onPress={() => console.log('Safe choices pressed')}
          />
        </HealthSection>

        {/* Highlights Section */}
        <HealthSection title="Highlights">
          <HealthCard
            color={Colors.caution}
            description="7 days without gut issues"
            icon="fire"
            title="Streak"
            unit="days"
            value="7"
            onPress={() => console.log('Streak pressed')}
          />
        </HealthSection>

        {/* Get More from GutSafe */}
        <HealthSection title="Get More from GutSafe">
          <TouchableOpacity
            style={[styles.premiumCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.premiumContent}>
              <View
                style={[
                  styles.premiumIcon,
                  { backgroundColor: Colors.primary },
                ]}
              >
                <Text style={styles.premiumIconText}>★</Text>
              </View>
              <View style={styles.premiumText}>
                <Text style={[styles.premiumTitle, { color: colors.text }]}>
                  GutSafe Premium
                </Text>
                <Text
                  style={[
                    styles.premiumSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Advanced analytics, meal planning, and more
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </HealthSection>

        {/* Articles Section */}
        <HealthSection title="Articles">
          <TouchableOpacity
            style={[styles.articleCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.articleContent}>
              <View
                style={[styles.articleIcon, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.articleIconText}>📚</Text>
              </View>
              <View style={styles.articleText}>
                <Text style={[styles.articleTitle, { color: colors.text }]}>
                  Understanding FODMAPs
                </Text>
                <Text
                  style={[
                    styles.articleSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Learn about high and low FODMAP foods
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </HealthSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  articleCard: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  articleContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  articleIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 24,
  },
  articleIconText: {
    fontSize: Typography.fontSize.bodySmall,
  },
  articleSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  articleText: {
    flex: 1,
  },
  articleTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  chevron: {
    color: Colors.body,
    fontSize: 20,
    fontWeight: '300',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  premiumCard: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  premiumContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  premiumIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 24,
  },
  premiumIconText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.bodySmall,
  },
  premiumSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  profileButton: {
    padding: Spacing.xs,
  },
  profileImage: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  profileInitial: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.body,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  showAllCard: {
    borderRadius: 12,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
  },
  showAllContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  showAllIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 24,
  },
  showAllIconText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.bodySmall,
  },
  showAllText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
  },
});
