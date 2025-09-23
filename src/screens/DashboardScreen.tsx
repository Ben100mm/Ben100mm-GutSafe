import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { HealthCard } from '../components/HealthCard';
import { HealthSection } from '../components/HealthSection';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const DashboardScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleEditPress = () => {
    console.log('Edit pressed');
  };

  const handleCardPress = (cardType: string) => {
    console.log(`${cardType} card pressed`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Summary</Text>
        <TouchableOpacity style={styles.profileButton} onPress={handleEditPress}>
          <Text style={styles.profileButtonText}>B</Text>
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
          onRightPress={handleEditPress}
        >
          <HealthCard
            title="Recent Scans"
            value="12"
            unit="today"
            icon="scan"
            color={Colors.primary}
            onPress={() => handleCardPress('Recent Scans')}
          />
          <HealthCard
            title="Safe Foods"
            value="8"
            unit="favorites"
            icon="heart"
            color={Colors.safe}
            onPress={() => handleCardPress('Safe Foods')}
          />
          <HealthCard
            title="Gut Health Score"
            value="85"
            unit="this week"
            icon="trend"
            color={Colors.primary}
            showChart={true}
            description="Your gut health has improved over the last 4 weeks"
            onPress={() => handleCardPress('Gut Health Score')}
          />
        </HealthSection>

        {/* Show All Health Data */}
        <TouchableOpacity 
          style={[styles.showAllCard, { backgroundColor: colors.surface }]}
          onPress={() => handleCardPress('Show All Health Data')}
        >
          <View style={styles.showAllContent}>
            <View style={styles.showAllIcon}>
              <Text style={styles.showAllIconText}>G</Text>
            </View>
            <Text style={[styles.showAllText, { color: colors.text }]}>
              Show All Gut Health Data
            </Text>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Trends Section */}
        <HealthSection title="Trends">
          <HealthCard
            title="Weekly Progress"
            value="+12%"
            unit="improvement"
            icon="trend"
            color={Colors.safe}
            description="Your gut health trends are looking positive this week"
            onPress={() => handleCardPress('Weekly Progress')}
          />
          <HealthCard
            title="Food Sensitivity"
            value="3"
            unit="new triggers found"
            icon="check"
            color={Colors.caution}
            description="Track your food reactions to identify patterns"
            onPress={() => handleCardPress('Food Sensitivity')}
          />
        </HealthSection>

        {/* Highlights Section */}
        <HealthSection title="Highlights">
          <HealthCard
            title="Weekly Insights"
            value="3"
            unit="new safe foods discovered"
            icon="fire"
            color={Colors.safe}
            description="You've found 3 new foods that work well with your gut"
            onPress={() => handleCardPress('Weekly Insights')}
          />
          <HealthCard
            title="Streak"
            value="7"
            unit="days in a row"
            icon="heart"
            color={Colors.primary}
            description="Keep up the great work with your gut health routine"
            onPress={() => handleCardPress('Streak')}
          />
        </HealthSection>

        {/* Get More from GutSafe Section */}
        <HealthSection title="Get More from GutSafe">
          <HealthCard
            title="Premium Features"
            value="Unlock"
            unit="advanced analytics"
            icon="trend"
            color={Colors.primary}
            description="Get personalized meal plans and detailed insights"
            onPress={() => handleCardPress('Premium Features')}
          />
          <HealthCard
            title="Expert Consultation"
            value="Book"
            unit="with nutritionist"
            icon="heart"
            color={Colors.primary}
            description="Get personalized advice from certified gut health experts"
            onPress={() => handleCardPress('Expert Consultation')}
          />
        </HealthSection>

        {/* Articles Section */}
        <HealthSection title="Articles">
          <HealthCard
            title="Gut Health Tips"
            value="5"
            unit="new articles this week"
            icon="check"
            color={Colors.primary}
            description="Latest research and tips for better gut health"
            onPress={() => handleCardPress('Gut Health Tips')}
          />
          <HealthCard
            title="Recipe Collection"
            value="12"
            unit="gut-friendly recipes"
            icon="heart"
            color={Colors.safe}
            description="Delicious meals designed for optimal gut health"
            onPress={() => handleCardPress('Recipe Collection')}
          />
        </HealthSection>

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingTop: 44,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  profileButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  showAllCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  showAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showAllIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  showAllIconText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  showAllText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 100, // Space for bottom navigation
  },
});

export default DashboardScreen;
