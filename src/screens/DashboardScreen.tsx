import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HealthCard } from '../components/HealthCard';
import { HealthSection } from '../components/HealthSection';
import { MultipleProgressRings } from '../components/ProgressRing';
import { TrendChart } from '../components/TrendChart';
import { Animated3DCard } from '../components/Animated3DCard';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { HapticFeedback, HapticType } from '../utils/haptics';
import { AnimationPresets, TransformUtils, AnimationUtils } from '../utils/animations';
import AccessibilityService from '../utils/accessibility';
import { ProgressRing as ProgressRingType, TrendAnalysis, ChartDataPoint, SafeFood, ShareableContent } from '../types';
import { SharingService } from '../utils/sharing';
import DataService from '../services/DataService';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [showSafeFoods, setShowSafeFoods] = useState(false);
  const dataService = DataService.getInstance();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Initialize accessibility service
    AccessibilityService.initialize();
    
    // Initialize data service
    dataService.initialize();
    
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
  }, []);
  const [safeFoods] = useState<SafeFood[]>(dataService.getSafeFoods());

  const handleEditPress = () => {
    HapticFeedback.buttonPress();
    (navigation as any).navigate('GutProfile');
  };

  const handleCardPress = (cardType: string) => {
    HapticFeedback.buttonPress();
    if (cardType === 'Safe Foods') {
      setShowSafeFoods(true);
    } else {
      console.log(`${cardType} card pressed`);
    }
  };

  const handleShareGutHealth = async () => {
    const shareContent: ShareableContent = {
      type: 'gut_report',
      title: 'My Gut Health Report',
      description: 'Check out my gut health insights from GutSafe!',
      data: { score: 85, improvement: '+12%' },
      shareUrl: 'gutsafe://report',
    };
    await SharingService.shareWithOptions(shareContent);
  };

  const handleShareSafeFood = async (safeFood: SafeFood) => {
    await SharingService.shareSafeFood(safeFood);
  };

  // Mock data for progress rings
  const progressRings: ProgressRingType[] = [
    {
      id: 'gut-health',
      label: 'Gut Health',
      value: 85,
      goal: 90,
      color: Colors.primary,
      unit: 'score',
    },
    {
      id: 'safe-foods',
      label: 'Safe Foods',
      value: 75,
      goal: 100,
      color: Colors.safe,
      unit: 'foods',
    },
    {
      id: 'energy',
      label: 'Energy',
      value: 80,
      goal: 100,
      color: Colors.primaryLight,
      unit: 'level',
    },
  ];

  // Mock trend data
  const gutHealthTrend: TrendAnalysis = {
    period: 'week',
    trend: 'up',
    changePercentage: 12.5,
    dataPoints: [
      { x: 1, y: 75 },
      { x: 2, y: 78 },
      { x: 3, y: 82 },
      { x: 4, y: 80 },
      { x: 5, y: 85 },
      { x: 6, y: 88 },
      { x: 7, y: 85 },
    ],
    insights: [
      'Your gut health has improved by 12.5% this week',
      'Consistent improvement in daily scores',
    ],
    recommendations: [
      'Continue tracking your food intake',
      'Consider adding more probiotic foods',
    ],
  };

  return (
    <Animated.View style={[
      styles.container, 
      { 
        backgroundColor: colors.background,
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ]
      }
    ]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text 
          style={[styles.title, { color: colors.text }]}
          {...AccessibilityService.createHeaderConfig('Summary', 1)}
        >
          Summary
        </Text>
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={handleEditPress}
          {...AccessibilityService.createButtonConfig(
            'Profile Settings',
            'Open gut profile settings',
            false,
            false
          )}
        >
          <Text style={styles.profileButtonText}>B</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Rings Section */}
        <HealthSection
          title="Today's Progress"
          rightButton="View All"
          onRightPress={() => handleCardPress('View All Progress')}
        >
          <Animated3DCard
            variant="glass"
            enable3D={true}
            enableHover={true}
            hapticType={"light"}
            accessibilityLabel="Today's Progress Rings"
            accessibilityHint="View your daily progress metrics"
          >
            <MultipleProgressRings
              rings={progressRings}
              size={100}
              strokeWidth={8}
              layout="horizontal"
            />
          </Animated3DCard>
        </HealthSection>

        {/* Pinned Section */}
        <HealthSection
          title="Pinned"
          rightButton="Edit"
          onRightPress={handleEditPress}
        >
          <Animated3DCard
            variant="solid"
            enable3D={true}
            enableHover={true}
            hapticType={"light"}
            accessibilityLabel="Recent Scans Card"
            accessibilityHint="View your recent food scans"
            onPress={() => handleCardPress('Recent Scans')}
          >
            <HealthCard
              title="Recent Scans"
              value="12"
              unit="today"
              icon="scan"
              color={Colors.primary}
              onPress={() => handleCardPress('Recent Scans')}
            />
          </Animated3DCard>
          <Animated3DCard
            variant="solid"
            enable3D={true}
            enableHover={true}
            hapticType={"light"}
            accessibilityLabel="Safe Foods Card"
            accessibilityHint="View your safe foods list"
            onPress={() => handleCardPress('Safe Foods')}
          >
            <HealthCard
              title="Safe Foods"
              value="8"
              unit="favorites"
              icon="heart"
              color={Colors.safe}
              onPress={() => handleCardPress('Safe Foods')}
            />
          </Animated3DCard>
        </HealthSection>

        {/* Gut Health Trend Chart */}
        <Animated3DCard
          variant="gradient"
          enable3D={true}
          enableHover={true}
          hapticType={"light"}
          accessibilityLabel="Gut Health Trend Chart"
          accessibilityHint="View your weekly gut health progress"
        >
          <TrendChart
            data={gutHealthTrend}
            title="Gut Health Trend"
            subtitle="Your weekly progress"
            color={Colors.primary}
            height={180}
          />
        </Animated3DCard>

        {/* Gut Profile Card */}
        <Animated3DCard
          variant="solid"
          enable3D={true}
          enableHover={true}
          hapticType={HapticType.MEDIUM}
          accessibilityLabel="Gut Profile Settings"
          accessibilityHint="Manage your gut health conditions, symptoms and medications"
          onPress={handleEditPress}
          style={styles.showAllCard}
        >
          <View style={styles.showAllContent}>
            <View style={styles.showAllIcon}>
              <Text style={styles.showAllIconText}>⚙️</Text>
            </View>
            <View style={styles.showAllTextContainer}>
              <Text style={[styles.showAllText, { color: colors.text }]}>
                Gut Profile Settings
              </Text>
              <Text style={[styles.showAllSubtext, { color: colors.textSecondary }]}>
                Manage conditions, track symptoms & medications
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
          </View>
        </Animated3DCard>

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

      {/* Safe Foods Modal */}
      <Modal
        visible={showSafeFoods}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowSafeFoods(false)}>
              <Text style={[styles.modalCloseButton, { color: colors.accent }]}>Done</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Safe Foods</Text>
            <TouchableOpacity onPress={handleShareGutHealth}>
              <Text style={[styles.modalShareButton, { color: colors.accent }]}>Share</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {safeFoods.map((safeFood) => (
              <View key={safeFood.id} style={[styles.safeFoodCard, { backgroundColor: colors.surface }]}>
                <View style={styles.safeFoodHeader}>
                  <Text style={[styles.safeFoodName, { color: colors.text }]}>
                    {safeFood.foodItem.name}
                  </Text>
                  <TouchableOpacity onPress={() => handleShareSafeFood(safeFood)}>
                    <Text style={styles.shareIcon}>📤</Text>
                  </TouchableOpacity>
                </View>
                {safeFood.foodItem.brand && (
                  <Text style={[styles.safeFoodBrand, { color: colors.textSecondary }]}>
                    {safeFood.foodItem.brand}
                  </Text>
                )}
                <Text style={[styles.dataSource, { color: colors.textTertiary }]}>
                  Source: {safeFood.foodItem.dataSource}
                </Text>
                <View style={styles.safeFoodStats}>
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    Used {safeFood.usageCount} times
                  </Text>
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    FODMAP: {safeFood.foodItem.fodmapLevel}
                  </Text>
                </View>
                {safeFood.notes && (
                  <Text style={[styles.safeFoodNotes, { color: colors.textSecondary }]}>
                    💭 {safeFood.notes}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </Animated.View>
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
  showAllTextContainer: {
    flex: 1,
  },
  showAllText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  showAllSubtext: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 100, // Space for bottom navigation
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalCloseButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalShareButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  safeFoodCard: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  safeFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  safeFoodName: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
    flex: 1,
  },
  shareIcon: {
    fontSize: 16,
  },
  safeFoodBrand: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 2,
  },
  dataSource: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.sm,
  },
  safeFoodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
  },
  safeFoodNotes: {
    fontSize: Typography.fontSize.caption,
    fontFamily: Typography.fontFamily.regular,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});

export default DashboardScreen;
