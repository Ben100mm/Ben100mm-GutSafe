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
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { HealthCard } from '../components/HealthCard';
import { HealthSection } from '../components/HealthSection';

export const SummaryScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Summary</Text>
        <TouchableOpacity style={styles.profileButton}>
          <View style={[styles.profileImage, { backgroundColor: colors.accent }]}>
            <Text style={styles.profileInitial}>B</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Pinned Section */}
        <HealthSection
          title="Pinned"
          rightButton="Edit"
          onRightPress={() => console.log('Edit pressed')}
        >
          <HealthCard
            title="Recent Scans"
            value="12"
            unit="today"
            icon="scan"
            color={colors.accent}
            onPress={() => (navigation as any).navigate('ScanHistory')}
          />
          <HealthCard
            title="Safe Foods"
            value="8"
            unit="favorites"
            icon="heart"
            color={Colors.safe}
            onPress={() => console.log('Safe foods pressed')}
          />
        </HealthSection>

        {/* Show All Health Data */}
        <TouchableOpacity style={[styles.showAllCard, { backgroundColor: colors.surface }]}>
          <View style={styles.showAllContent}>
            <View style={[styles.showAllIcon, { backgroundColor: colors.accent }]}>
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
            title="Gut Health Score"
            value="85"
            unit="this week"
            icon="trend"
            color={Colors.safe}
            description="Your gut health has improved over the last 4 weeks"
            showChart={true}
            onPress={() => console.log('Gut health score pressed')}
          />
          <HealthCard
            title="Safe Choices"
            value="24"
            unit="this week"
            icon="check"
            color={Colors.safe}
            description="You've made 24 safe food choices this week"
            onPress={() => console.log('Safe choices pressed')}
          />
        </HealthSection>

        {/* Highlights Section */}
        <HealthSection title="Highlights">
          <HealthCard
            title="Streak"
            value="7"
            unit="days"
            icon="fire"
            color={Colors.caution}
            description="7 days without gut issues"
            onPress={() => console.log('Streak pressed')}
          />
        </HealthSection>

        {/* Get More from GutSafe */}
        <HealthSection title="Get More from GutSafe">
          <TouchableOpacity style={[styles.premiumCard, { backgroundColor: colors.surface }]}>
            <View style={styles.premiumContent}>
              <View style={[styles.premiumIcon, { backgroundColor: Colors.primary }]}>
                <Text style={styles.premiumIconText}>★</Text>
              </View>
              <View style={styles.premiumText}>
                <Text style={[styles.premiumTitle, { color: colors.text }]}>
                  GutSafe Premium
                </Text>
                <Text style={[styles.premiumSubtitle, { color: colors.textSecondary }]}>
                  Advanced analytics, meal planning, and more
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </HealthSection>

        {/* Articles Section */}
        <HealthSection title="Articles">
          <TouchableOpacity style={[styles.articleCard, { backgroundColor: colors.surface }]}>
            <View style={styles.articleContent}>
              <View style={[styles.articleIcon, { backgroundColor: colors.accent }]}>
                <Text style={styles.articleIconText}>📚</Text>
              </View>
              <View style={styles.articleText}>
                <Text style={[styles.articleTitle, { color: colors.text }]}>
                  Understanding FODMAPs
                </Text>
                <Text style={[styles.articleSubtitle, { color: colors.textSecondary }]}>
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
    fontSize: Typography.fontSize.h1,
    fontFamily: Typography.fontFamily.bold,
  },
  profileButton: {
    padding: Spacing.xs,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: Colors.white,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  showAllCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 12,
    padding: Spacing.md,
  },
  showAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showAllIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  showAllIconText: {
    color: Colors.white,
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.bold,
  },
  showAllText: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.medium,
  },
  chevron: {
    fontSize: 20,
    color: Colors.body,
    fontWeight: '300',
  },
  premiumCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  premiumIconText: {
    color: Colors.white,
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.bold,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  premiumSubtitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
  },
  articleCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
  },
  articleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  articleIconText: {
    fontSize: Typography.fontSize.bodySmall,
  },
  articleText: {
    flex: 1,
  },
  articleTitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  articleSubtitle: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.regular,
  },
});
