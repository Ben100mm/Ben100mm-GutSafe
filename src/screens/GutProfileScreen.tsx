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
import LinearGradient from 'react-native-web-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { ConditionToggle } from '../components/ConditionToggle';
import { SymptomTracker } from '../components/SymptomTracker';
import { MedicationTracker } from '../components/MedicationTracker';
import { GutCondition, SeverityLevel, GutConditionToggle, GutSymptom, MedicationSupplement } from '../types';

export const GutProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState<'conditions' | 'symptoms' | 'medications'>('conditions');
  const [conditionToggles, setConditionToggles] = useState<GutConditionToggle[]>([]);
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
    ].map(condition => ({
      condition: condition as GutCondition,
      enabled: false,
      severity: 'mild' as SeverityLevel,
      knownTriggers: [],
      lastUpdated: new Date(),
    }));
    setConditionToggles(initialConditions);
  }, []);

  const handleConditionToggle = (condition: GutCondition, enabled: boolean) => {
    setConditionToggles(prev => 
      prev.map(toggle => 
        toggle.condition === condition 
          ? { ...toggle, enabled, lastUpdated: new Date() }
          : toggle
      )
    );
  };

  const handleSeverityChange = (condition: GutCondition, severity: SeverityLevel) => {
    setConditionToggles(prev => 
      prev.map(toggle => 
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
          const triggers = text.split(',').map(t => t.trim()).filter(t => t.length > 0);
          setConditionToggles(prev => 
            prev.map(toggle => 
              toggle.condition === condition 
                ? { ...toggle, knownTriggers: triggers, lastUpdated: new Date() }
                : toggle
            )
          );
        }
      },
      'plain-text',
      conditionToggles.find(t => t.condition === condition)?.knownTriggers.join(', ') || ''
    );
  };

  const handleLogSymptom = (symptomData: Omit<GutSymptom, 'id'>) => {
    const newSymptom: GutSymptom = {
      ...symptomData,
      id: Date.now().toString(),
    };
    setSymptoms(prev => [newSymptom, ...prev]);
  };

  const handleAddMedication = (medicationData: Omit<MedicationSupplement, 'id'>) => {
    const newMedication: MedicationSupplement = {
      ...medicationData,
      id: Date.now().toString(),
    };
    setMedications(prev => [newMedication, ...prev]);
  };

  const handleUpdateMedication = (id: string, updates: Partial<MedicationSupplement>) => {
    setMedications(prev => 
      prev.map(med => med.id === id ? { ...med, ...updates } : med)
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

  const enabledConditions = conditionToggles.filter(toggle => toggle.enabled);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={Colors.primaryGradient}
        style={styles.header}
      >
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
          <Text style={[
            styles.tabText,
            activeTab === 'conditions' && styles.activeTabText,
            { color: activeTab === 'conditions' ? Colors.white : colors.text },
          ]}>
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
          <Text style={[
            styles.tabText,
            activeTab === 'symptoms' && styles.activeTabText,
            { color: activeTab === 'symptoms' ? Colors.white : colors.text },
          ]}>
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
          <Text style={[
            styles.tabText,
            activeTab === 'medications' && styles.activeTabText,
            { color: activeTab === 'medications' ? Colors.white : colors.text },
          ]}>
            Medications
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'conditions' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Gut Conditions
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
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
                      <View style={[
                        styles.severityDot,
                        { backgroundColor: 
                          toggle.severity === 'mild' ? Colors.safe :
                          toggle.severity === 'moderate' ? Colors.caution : Colors.avoid
                        }
                      ]} />
                      <Text style={[styles.summaryText, { color: colors.text }]}>
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
                  onToggle={handleConditionToggle}
                  onSeverityChange={handleSeverityChange}
                  onEditTriggers={handleEditTriggers}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'symptoms' && (
          <View style={styles.tabContent}>
            <SymptomTracker
              onLogSymptom={handleLogSymptom}
              recentSymptoms={symptoms}
            />
          </View>
        )}

        {activeTab === 'medications' && (
          <View style={styles.tabContent}>
            <MedicationTracker
              onAddMedication={handleAddMedication}
              medications={medications}
              onUpdateMedication={handleUpdateMedication}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  backButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    color: Colors.white,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 82, 87, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  tabIcon: {
    fontSize: 20,
    marginRight: Spacing.xs,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  activeTabText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: 'rgba(15, 82, 87, 0.05)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 87, 0.1)',
  },
  summaryTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.md,
  },
  summaryList: {
    gap: Spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  summaryText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  conditionsList: {
    gap: Spacing.sm,
  },
});
