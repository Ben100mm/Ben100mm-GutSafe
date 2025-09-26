/**
 * @fileoverview GutProfileScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { ConditionToggle } from '../components/ConditionToggle';
import LinearGradient from '../components/LinearGradientWrapper';
import { MedicationTracker } from '../components/MedicationTracker';
import { SymptomTracker } from '../components/SymptomTracker';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type {
  GutCondition,
  SeverityLevel,
  GutConditionToggle,
  GutSymptom,
  MedicationSupplement,
} from '../types';

export const GutProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState<
    'conditions' | 'symptoms' | 'medications'
  >('conditions');
  const [conditionToggles, setConditionToggles] = useState<
    GutConditionToggle[]
  >([]);
  const [symptoms, setSymptoms] = useState<GutSymptom[]>([]);
  const [medications, setMedications] = useState<MedicationSupplement[]>([]);

  useEffect(() => {
    // Initialize condition toggles
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

  const handleEditTriggers = (condition: GutCondition) => {
    Alert.prompt(
      'Edit Triggers',
      'Enter known triggers for this condition (comma separated):',
      (text) => {
        if (text !== null) {
          const triggers = text
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          setConditionToggles((prev) =>
            prev.map((toggle) =>
              toggle.condition === condition
                ? {
                    ...toggle,
                    knownTriggers: triggers,
                    lastUpdated: new Date(),
                  }
                : toggle
            )
          );
        }
      },
      'plain-text',
      conditionToggles
        .find((t) => t.condition === condition)
        ?.knownTriggers.join(', ') || ''
    );
  };

  const handleLogSymptom = (symptomData: Omit<GutSymptom, 'id'>) => {
    const newSymptom: GutSymptom = {
      ...symptomData,
      id: Date.now().toString(),
    };
    setSymptoms((prev) => [newSymptom, ...prev]);
  };

  const handleAddMedication = (
    medicationData: Omit<MedicationSupplement, 'id'>
  ) => {
    const newMedication: MedicationSupplement = {
      ...medicationData,
      id: Date.now().toString(),
    };
    setMedications((prev) => [newMedication, ...prev]);
  };

  const handleUpdateMedication = (
    id: string,
    updates: Partial<MedicationSupplement>
  ) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
    );
  };

  const getTabIcon = (tab: string, isActive: boolean) => {
    const icons = {
      conditions: '⚙️',
      symptoms: '📊',
      medications: '💊',
    };
    return (
      <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
        {icons[tab as keyof typeof icons]}
      </Text>
    );
  };

  const enabledConditions = conditionToggles.filter((toggle) => toggle.enabled);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={Colors.primaryGradient} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gut Profile</Text>
        <Text style={styles.headerSubtitle}>
          Customize your gut health settings
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'conditions' && { backgroundColor: Colors.primary },
          ]}
          onPress={() => setActiveTab('conditions')}
        >
          {getTabIcon('conditions', activeTab === 'conditions')}
          <Text
            style={[
              styles.tabText,
              activeTab === 'conditions' && styles.activeTabText,
              {
                color: activeTab === 'conditions' ? Colors.white : colors.text,
              },
            ]}
          >
            Conditions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'symptoms' && { backgroundColor: Colors.primary },
          ]}
          onPress={() => setActiveTab('symptoms')}
        >
          {getTabIcon('symptoms', activeTab === 'symptoms')}
          <Text
            style={[
              styles.tabText,
              activeTab === 'symptoms' && styles.activeTabText,
              { color: activeTab === 'symptoms' ? Colors.white : colors.text },
            ]}
          >
            Symptoms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'medications' && { backgroundColor: Colors.primary },
          ]}
          onPress={() => setActiveTab('medications')}
        >
          {getTabIcon('medications', activeTab === 'medications')}
          <Text
            style={[
              styles.tabText,
              activeTab === 'medications' && styles.activeTabText,
              {
                color: activeTab === 'medications' ? Colors.white : colors.text,
              },
            ]}
          >
            Medications
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeTab === 'conditions' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Gut Conditions
              </Text>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Toggle conditions that affect your gut health
              </Text>
            </View>

            {enabledConditions.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>
                  Active Conditions ({enabledConditions.length})
                </Text>
                <View style={styles.summaryList}>
                  {enabledConditions.map((toggle) => (
                    <View key={toggle.condition} style={styles.summaryItem}>
                      <View
                        style={[
                          styles.severityDot,
                          {
                            backgroundColor:
                              toggle.severity === 'mild'
                                ? Colors.safe
                                : toggle.severity === 'moderate'
                                  ? Colors.caution
                                  : Colors.avoid,
                          },
                        ]}
                      />
                      <Text
                        style={[styles.summaryText, { color: colors.text }]}
                      >
                        {toggle.condition.replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.conditionsList}>
              {conditionToggles.map((toggle) => (
                <ConditionToggle
                  key={toggle.condition}
                  condition={toggle}
                  onEditTriggers={handleEditTriggers}
                  onSeverityChange={handleSeverityChange}
                  onToggle={handleConditionToggle}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'symptoms' && (
          <View style={styles.tabContent}>
            <SymptomTracker
              recentSymptoms={symptoms}
              onLogSymptom={handleLogSymptom}
            />
          </View>
        )}

        {activeTab === 'medications' && (
          <View style={styles.tabContent}>
            <MedicationTracker
              medications={medications}
              onAddMedication={handleAddMedication}
              onUpdateMedication={handleUpdateMedication}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeTabIcon: {
    opacity: 1,
  },
  activeTabText: {
    color: Colors.white,
  },
  backButton: {
    left: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'absolute',
    top: 60,
  },
  backButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  conditionsList: {
    gap: Spacing.sm,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  headerSubtitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    opacity: 0.9,
    textAlign: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
    marginBottom: Spacing.xs,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.xs,
  },
  severityDot: {
    borderRadius: 4,
    height: 8,
    marginRight: Spacing.sm,
    width: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(15, 82, 87, 0.05)',
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  summaryList: {
    gap: Spacing.sm,
  },
  summaryText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  summaryTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.md,
  },
  tab: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  tabContainer: {
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  tabIcon: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  tabText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
});
