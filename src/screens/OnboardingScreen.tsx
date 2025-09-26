/**
 * @fileoverview OnboardingScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Animated,
  // Dimensions,
  Platform,
  Alert,
} from 'react-native';

import LinearGradient from '../components/LinearGradientWrapper';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { GutCondition, SeverityLevel, GutConditionToggle } from '../types';

// const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [currentStep, setCurrentStep] = useState(0);
  const [conditionToggles, setConditionToggles] = useState<
    GutConditionToggle[]
  >([]);
  const [knownTriggers, setKnownTriggers] = useState<{
    [key: string]: string[];
  }>({});
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [preferredAlternatives, setPreferredAlternatives] = useState<string[]>(
    []
  );
  const [isComplete, setIsComplete] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Initialize condition toggles
  React.useEffect(() => {
    const initialConditions: GutConditionToggle[] = [
      'ibs-fodmap',
      'gluten',
      'lactose',
      'reflux',
      'histamine',
      'allergies',
      'additives',
    ].map((condition) => ({
      condition: condition as GutCondition,
      enabled: false,
      severity: 'mild' as SeverityLevel,
      knownTriggers: [],
      lastUpdated: new Date(),
    }));
    setConditionToggles(initialConditions);
  }, []);

  const handleConditionToggle = (condition: GutCondition, enabled: boolean) => {
    setConditionToggles((prev) =>
      prev.map((toggle) =>
        toggle.condition === condition
          ? { ...toggle, enabled, lastUpdated: new Date() }
          : toggle
      )
    );
  };

  const handleSeverityChange = (
    condition: GutCondition,
    severity: SeverityLevel
  ) => {
    setConditionToggles((prev) =>
      prev.map((toggle) =>
        toggle.condition === condition
          ? { ...toggle, severity, lastUpdated: new Date() }
          : toggle
      )
    );
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GutSafe',
      subtitle: "Let's personalize your gut health journey",
      component: <WelcomeStep />,
    },
    {
      id: 'conditions',
      title: 'Select Your Conditions',
      subtitle: 'Choose the gut conditions that affect you',
      component: (
        <ConditionsStep
          conditionToggles={conditionToggles}
          onConditionToggle={handleConditionToggle}
          onSeverityChange={handleSeverityChange}
        />
      ),
    },
    {
      id: 'triggers',
      title: 'Known Triggers',
      subtitle: 'Add foods that you know trigger your symptoms',
      component: (
        <TriggersStep
          enabledConditions={conditionToggles.filter((t) => t.enabled)}
          knownTriggers={knownTriggers}
          onTriggersChange={setKnownTriggers}
        />
      ),
    },
    {
      id: 'preferences',
      title: 'Dietary Preferences',
      subtitle: 'Set your dietary restrictions and preferred alternatives',
      component: (
        <PreferencesStep
          dietaryRestrictions={dietaryRestrictions}
          preferredAlternatives={preferredAlternatives}
          onDietaryRestrictionsChange={setDietaryRestrictions}
          onPreferredAlternativesChange={setPreferredAlternatives}
        />
      ),
    },
    {
      id: 'complete',
      title: "You're All Set!",
      subtitle: 'Your personalized gut profile is ready',
      component: <CompleteStep />,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep((prev) => prev + 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep((prev) => prev - 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const completeOnboarding = () => {
    // Save gut profile to storage
    const gutProfile = {
      id: Date.now().toString(),
      conditions: conditionToggles.reduce<any>((acc, toggle) => {
        acc[toggle.condition] = {
          enabled: toggle.enabled,
          severity: toggle.severity,
          knownTriggers: knownTriggers[toggle.condition] || [],
        };
        return acc;
      }, {}),
      preferences: {
        dietaryRestrictions,
        preferredAlternatives,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: Save to AsyncStorage or backend
    console.log('Gut Profile Created:', gutProfile);
    setIsComplete(true);

    // Navigate to main app
    setTimeout(() => {
      (navigation as any).navigate('Summary');
    }, 2000);
  };

  const skipOnboarding = () => {
    Alert.alert(
      'Skip Onboarding',
      'You can always set up your gut profile later in settings. Are you sure you want to skip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => (navigation as any).navigate('Summary'),
        },
      ]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Conditions
        return conditionToggles.some((t) => t.enabled);
      case 2: // Triggers
        return true; // Optional step
      case 3: // Preferences
        return true; // Optional step
      case 4: // Complete
        return false;
      default:
        return false;
    }
  };

  const currentStepData = steps[currentStep];

  if (isComplete) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={Colors.primaryGradient}
          style={styles.completeHeader}
        >
          <Text style={styles.completeIcon}>🎉</Text>
          <Text style={styles.completeTitle}>Welcome to GutSafe!</Text>
          <Text style={styles.completeSubtitle}>
            Your personalized gut profile is ready. Let's start scanning!
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View
        style={[styles.progressContainer, { backgroundColor: colors.surface }]}
      >
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {currentStepData?.title || 'Welcome'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {currentStepData?.subtitle || 'Get started with GutSafe'}
        </Text>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStepData?.component || <View />}
        </ScrollView>
      </Animated.View>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.skipButton,
            { borderColor: colors.border },
          ]}
          onPress={skipOnboarding}
        >
          <Text
            style={[styles.skipButtonText, { color: colors.textSecondary }]}
          >
            Skip
          </Text>
        </TouchableOpacity>

        <View style={styles.navButtons}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.backButton,
                { borderColor: colors.border },
              ]}
              onPress={prevStep}
            >
              <Text style={[styles.backButtonText, { color: colors.text }]}>
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            disabled={!canProceed()}
            style={[
              styles.navButton,
              styles.nextButton,
              {
                backgroundColor: canProceed() ? Colors.primary : colors.border,
                opacity: canProceed() ? 1 : 0.5,
              },
            ]}
            onPress={nextStep}
          >
            <Text
              style={[
                styles.nextButtonText,
                { color: canProceed() ? Colors.white : colors.textSecondary },
              ]}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Step Components
const WelcomeStep: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.stepContent}>
      <View style={styles.welcomeIcon}>
        <Text style={styles.welcomeEmoji}>🫀</Text>
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Your Gut Health Journey Starts Here
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        GutSafe helps you identify foods that trigger digestive symptoms and
        find safe alternatives. Let's create your personalized profile in just a
        few steps.
      </Text>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Scan barcodes and analyze ingredients
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚠️</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Get instant warnings for trigger foods
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>✅</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Discover safe alternatives
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={[styles.featureText, { color: colors.text }]}>
            Track your gut health over time
          </Text>
        </View>
      </View>
    </View>
  );
};

const ConditionsStep: React.FC<{
  conditionToggles: GutConditionToggle[];
  onConditionToggle: (condition: GutCondition, enabled: boolean) => void;
  onSeverityChange: (condition: GutCondition, severity: SeverityLevel) => void;
}> = ({ conditionToggles, onConditionToggle, onSeverityChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const conditionInfo = {
    'ibs-fodmap': {
      name: 'IBS (FODMAP)',
      description: 'Irritable Bowel Syndrome with FODMAP sensitivity',
      icon: '🌾',
    },
    gluten: {
      name: 'Gluten Sensitivity',
      description: 'Sensitivity to gluten-containing foods',
      icon: '🌾',
    },
    lactose: {
      name: 'Lactose Intolerance',
      description: 'Difficulty digesting lactose in dairy products',
      icon: '🥛',
    },
    reflux: {
      name: 'Acid Reflux',
      description: 'Gastroesophageal reflux disease (GERD)',
      icon: '🔥',
    },
    histamine: {
      name: 'Histamine Intolerance',
      description: 'Sensitivity to histamine-rich foods',
      icon: '🍷',
    },
    allergies: {
      name: 'Food Allergies',
      description: 'Immune reactions to specific foods',
      icon: '🚨',
    },
    additives: {
      name: 'Additive Sensitivity',
      description: 'Sensitivity to food additives and preservatives',
      icon: '🧪',
    },
  };

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Select all conditions that apply to you. You can adjust severity levels
        and add known triggers later.
      </Text>

      <View style={styles.conditionsList}>
        {conditionToggles.map((toggle) => {
          const info = conditionInfo[toggle.condition];
          return (
            <View key={toggle.condition} style={styles.conditionCard}>
              <TouchableOpacity
                style={[
                  styles.conditionToggle,
                  toggle.enabled && { backgroundColor: `${Colors.primary}20` },
                ]}
                onPress={() =>
                  onConditionToggle(toggle.condition, !toggle.enabled)
                }
              >
                <View style={styles.conditionHeader}>
                  <Text style={styles.conditionIcon}>{info.icon}</Text>
                  <View style={styles.conditionInfo}>
                    <Text
                      style={[styles.conditionName, { color: colors.text }]}
                    >
                      {info.name}
                    </Text>
                    <Text
                      style={[
                        styles.conditionDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {info.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.toggleSwitch,
                      toggle.enabled && { backgroundColor: Colors.primary },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        toggle.enabled && { transform: [{ translateX: 20 }] },
                      ]}
                    />
                  </View>
                </View>

                {toggle.enabled && (
                  <View style={styles.severitySection}>
                    <Text
                      style={[styles.severityLabel, { color: colors.text }]}
                    >
                      Severity Level:
                    </Text>
                    <View style={styles.severityButtons}>
                      {(['mild', 'moderate', 'severe'] as SeverityLevel[]).map(
                        (severity) => (
                          <TouchableOpacity
                            key={severity}
                            style={[
                              styles.severityButton,
                              toggle.severity === severity && {
                                backgroundColor: Colors.primary,
                              },
                            ]}
                            onPress={() =>
                              onSeverityChange(toggle.condition, severity)
                            }
                          >
                            <Text
                              style={[
                                styles.severityButtonText,
                                {
                                  color:
                                    toggle.severity === severity
                                      ? Colors.white
                                      : colors.text,
                                  textTransform: 'capitalize',
                                },
                              ]}
                            >
                              {severity}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const TriggersStep: React.FC<{
  enabledConditions: GutConditionToggle[];
  knownTriggers: { [key: string]: string[] };
  onTriggersChange: (triggers: { [key: string]: string[] }) => void;
}> = ({ enabledConditions, knownTriggers, onTriggersChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const handleAddTrigger = (condition: GutCondition) => {
    Alert.prompt(
      'Add Known Trigger',
      `Enter a food that triggers your ${condition.replace('-', ' ')} symptoms:`,
      (text) => {
        if (text && text.trim()) {
          const currentTriggers = knownTriggers[condition] || [];
          onTriggersChange({
            ...knownTriggers,
            [condition]: [...currentTriggers, text.trim()],
          });
        }
      },
      'plain-text'
    );
  };

  const handleRemoveTrigger = (condition: GutCondition, trigger: string) => {
    const currentTriggers = knownTriggers[condition] || [];
    onTriggersChange({
      ...knownTriggers,
      [condition]: currentTriggers.filter((t) => t !== trigger),
    });
  };

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Add foods you know trigger your symptoms. This helps us provide more
        accurate warnings.
      </Text>

      {enabledConditions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>ℹ️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Conditions Selected
          </Text>
          <Text
            style={[styles.emptyDescription, { color: colors.textSecondary }]}
          >
            Go back and select your gut conditions first.
          </Text>
        </View>
      ) : (
        <View style={styles.triggersList}>
          {enabledConditions.map((condition) => {
            const triggers = knownTriggers[condition.condition] || [];
            return (
              <View key={condition.condition} style={styles.triggerSection}>
                <View style={styles.triggerHeader}>
                  <Text style={[styles.triggerTitle, { color: colors.text }]}>
                    {condition.condition.replace('-', ' ').toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    style={styles.addTriggerButton}
                    onPress={() => handleAddTrigger(condition.condition)}
                  >
                    <Text style={styles.addTriggerText}>+ Add Trigger</Text>
                  </TouchableOpacity>
                </View>

                {triggers.length > 0 ? (
                  <View style={styles.triggersList}>
                    {triggers.map((trigger, index) => (
                      <View key={index} style={styles.triggerItem}>
                        <Text
                          style={[styles.triggerText, { color: colors.text }]}
                        >
                          {trigger}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeTriggerButton}
                          onPress={() =>
                            handleRemoveTrigger(condition.condition, trigger)
                          }
                        >
                          <Text style={styles.removeTriggerText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.noTriggersText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No known triggers added yet
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const PreferencesStep: React.FC<{
  dietaryRestrictions: string[];
  preferredAlternatives: string[];
  onDietaryRestrictionsChange: (restrictions: string[]) => void;
  onPreferredAlternativesChange: (alternatives: string[]) => void;
}> = ({
  dietaryRestrictions,
  preferredAlternatives,
  onDietaryRestrictionsChange,
  onPreferredAlternativesChange,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const commonRestrictions = [
    'Vegetarian',
    'Vegan',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Low FODMAP',
    'Dairy-free',
    'Gluten-free',
    'Sugar-free',
  ];

  const commonAlternatives = [
    'Coconut milk',
    'Almond milk',
    'Oat milk',
    'Rice milk',
    'Gluten-free bread',
    'Cauliflower rice',
    'Zucchini noodles',
    'Coconut yogurt',
    'Cashew cheese',
    'Nutritional yeast',
  ];

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (items: string[]) => void
  ) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <View style={styles.stepContent}>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        Set your dietary preferences to get more personalized recommendations.
      </Text>

      <View style={styles.preferencesSection}>
        <Text style={[styles.preferencesTitle, { color: colors.text }]}>
          Dietary Restrictions
        </Text>
        <View style={styles.preferencesGrid}>
          {commonRestrictions.map((restriction) => (
            <TouchableOpacity
              key={restriction}
              style={[
                styles.preferenceChip,
                dietaryRestrictions.includes(restriction) && {
                  backgroundColor: Colors.primary,
                },
              ]}
              onPress={() =>
                toggleArrayItem(
                  dietaryRestrictions,
                  restriction,
                  onDietaryRestrictionsChange
                )
              }
            >
              <Text
                style={[
                  styles.preferenceChipText,
                  {
                    color: dietaryRestrictions.includes(restriction)
                      ? Colors.white
                      : colors.text,
                  },
                ]}
              >
                {restriction}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.preferencesSection}>
        <Text style={[styles.preferencesTitle, { color: colors.text }]}>
          Preferred Alternatives
        </Text>
        <View style={styles.preferencesGrid}>
          {commonAlternatives.map((alternative) => (
            <TouchableOpacity
              key={alternative}
              style={[
                styles.preferenceChip,
                preferredAlternatives.includes(alternative) && {
                  backgroundColor: Colors.primary,
                },
              ]}
              onPress={() =>
                toggleArrayItem(
                  preferredAlternatives,
                  alternative,
                  onPreferredAlternativesChange
                )
              }
            >
              <Text
                style={[
                  styles.preferenceChipText,
                  {
                    color: preferredAlternatives.includes(alternative)
                      ? Colors.white
                      : colors.text,
                  },
                ]}
              >
                {alternative}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const CompleteStep: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.stepContent}>
      <View style={styles.completeIcon}>
        <Text style={styles.completeEmoji}>🎉</Text>
      </View>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Your Gut Profile is Ready!
      </Text>
      <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
        You're all set to start scanning foods and tracking your gut health. You
        can always update your profile in settings.
      </Text>

      <View style={styles.nextStepsList}>
        <View style={styles.nextStepItem}>
          <Text style={styles.nextStepIcon}>📱</Text>
          <Text style={[styles.nextStepText, { color: colors.text }]}>
            Start scanning barcodes and ingredients
          </Text>
        </View>
        <View style={styles.nextStepItem}>
          <Text style={styles.nextStepIcon}>📊</Text>
          <Text style={[styles.nextStepText, { color: colors.text }]}>
            Track your symptoms and food reactions
          </Text>
        </View>
        <View style={styles.nextStepItem}>
          <Text style={styles.nextStepIcon}>🔍</Text>
          <Text style={[styles.nextStepText, { color: colors.text }]}>
            Browse safe foods and alternatives
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  progressBar: {
    backgroundColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: 2,
    height: 4,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    backgroundColor: Colors.primary,
    borderRadius: 2,
    height: '100%',
  },
  progressText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  stepDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  navigation: {
    alignItems: 'center',
    borderTopColor: 'rgba(15, 82, 87, 0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  navButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  backButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  nextButton: {
    alignItems: 'center',
    minWidth: 100,
  },
  nextButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  // Welcome Step
  welcomeIcon: {
    alignItems: 'center',
    backgroundColor: `${Colors.primary}20`,
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    width: 120,
  },
  welcomeEmoji: {
    fontSize: 60,
  },
  featuresList: {
    gap: Spacing.md,
    width: '100%',
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  // Conditions Step
  conditionsList: {
    gap: Spacing.md,
    width: '100%',
  },
  conditionCard: {
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  conditionToggle: {
    padding: Spacing.lg,
  },
  conditionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  conditionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.xs,
  },
  conditionDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    lineHeight: 18,
  },
  toggleSwitch: {
    backgroundColor: 'rgba(15, 82, 87, 0.2)',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 50,
  },
  toggleThumb: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    height: 26,
    width: 26,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }),
  },
  severitySection: {
    borderTopColor: 'rgba(15, 82, 87, 0.1)',
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  severityLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
    marginBottom: Spacing.sm,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  severityButton: {
    borderColor: 'rgba(15, 82, 87, 0.2)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  severityButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  // Triggers Step
  triggerSection: {
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  triggerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  triggerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
  },
  addTriggerButton: {
    backgroundColor: `${Colors.primary}20`,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addTriggerText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  triggersList: {
    gap: Spacing.sm,
  },
  triggerItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 82, 87, 0.05)',
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  removeTriggerButton: {
    alignItems: 'center',
    backgroundColor: `${Colors.avoid}20`,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  removeTriggerText: {
    color: Colors.avoid,
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
  },
  noTriggersText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    fontStyle: 'italic',
    paddingVertical: Spacing.lg,
    textAlign: 'center',
  },
  // Preferences Step
  preferencesSection: {
    marginBottom: Spacing.xl,
    width: '100%',
  },
  preferencesTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.md,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  preferenceChip: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(15, 82, 87, 0.2)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  preferenceChipText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  // Complete Step
  completeEmoji: {
    fontSize: 60,
  },
  nextStepsList: {
    gap: Spacing.md,
    width: '100%',
  },
  nextStepItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  nextStepIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  nextStepText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.body,
  },
  // Complete Screen
  completeHeader: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  completeIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  completeTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  completeSubtitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
    opacity: 0.9,
    textAlign: 'center',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
    textAlign: 'center',
  },
});
