/**
 * @fileoverview SymptomTracker.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { GutSymptom } from '../types';

import LinearGradient from './LinearGradientWrapper';

interface SymptomTrackerProps {
  onLogSymptom: (symptom: Omit<GutSymptom, 'id'>) => void;
  recentSymptoms?: GutSymptom[];
}

const symptomTypes = [
  { key: 'bloating', label: 'Bloating', emoji: '💨' },
  { key: 'cramping', label: 'Cramping', emoji: '😣' },
  { key: 'diarrhea', label: 'Diarrhea', emoji: '💩' },
  { key: 'constipation', label: 'Constipation', emoji: '🚽' },
  { key: 'gas', label: 'Gas', emoji: '💨' },
  { key: 'nausea', label: 'Nausea', emoji: '🤢' },
  { key: 'reflux', label: 'Reflux', emoji: '🔥' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'headache', label: 'Headache', emoji: '🤕' },
  { key: 'skin_irritation', label: 'Skin Issues', emoji: '🔴' },
  { key: 'other', label: 'Other', emoji: '❓' },
] as const;

const locations = [
  { key: 'upper_abdomen', label: 'Upper Abdomen' },
  { key: 'lower_abdomen', label: 'Lower Abdomen' },
  { key: 'full_abdomen', label: 'Full Abdomen' },
  { key: 'chest', label: 'Chest' },
  { key: 'general', label: 'General' },
] as const;

export const SymptomTracker: React.FC<SymptomTrackerProps> = ({
  onLogSymptom,
  recentSymptoms = [],
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<number>(5);
  const [duration, setDuration] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string | null>(null);
  const [potentialTriggers, setPotentialTriggers] = useState<string>('');

  const handleLogSymptom = () => {
    if (!selectedType) {
      Alert.alert('Select Symptom', 'Please select a symptom type.');
      return;
    }

    const symptomData = {
      type: selectedType as GutSymptom['type'],
      severity: severity as GutSymptom['severity'],
      description: description.trim() || '',
      duration: parseInt(duration) || 0,
      timestamp: new Date(),
      potentialTriggers: potentialTriggers.trim()
        ? potentialTriggers.split(',').map((t) => t.trim())
        : [],
      location: (location as GutSymptom['location']) || 'general',
    };

    onLogSymptom(symptomData);

    // Reset form
    setSelectedType(null);
    setSeverity(5);
    setDuration('');
    setDescription('');
    setLocation(null);
    setPotentialTriggers('');

    Alert.alert(
      'Symptom Logged',
      'Your symptom has been recorded successfully.'
    );
  };

  const renderSeveritySlider = () => (
    <View style={styles.severityContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        Severity (1-10)
      </Text>
      <View style={styles.severityButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.severityButton,
              {
                backgroundColor:
                  value <= severity ? Colors.primary : colors.border,
              },
            ]}
            onPress={() => setSeverity(value)}
          >
            <Text
              style={[
                styles.severityButtonText,
                {
                  color: value <= severity ? Colors.white : colors.text,
                },
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.severityLabel, { color: colors.textSecondary }]}>
        {severity <= 3 ? 'Mild' : severity <= 7 ? 'Moderate' : 'Severe'}
      </Text>
    </View>
  );

  const getRecentSymptomColor = (severity: number): string => {
    if (severity <= 3) {
      return Colors.safe;
    }
    if (severity <= 7) {
      return Colors.caution;
    }
    return Colors.avoid;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient colors={Colors.primaryGradient} style={styles.header}>
        <Text style={styles.headerTitle}>Log Gut Symptom</Text>
        <Text style={styles.headerSubtitle}>
          Track your symptoms to identify patterns
        </Text>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {/* Symptom Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Symptom Type
          </Text>
          <View style={styles.symptomGrid}>
            {symptomTypes.map((symptom) => (
              <TouchableOpacity
                key={symptom.key}
                style={[
                  styles.symptomButton,
                  {
                    backgroundColor:
                      selectedType === symptom.key
                        ? Colors.primary
                        : colors.border,
                    borderColor:
                      selectedType === symptom.key
                        ? Colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedType(symptom.key)}
              >
                <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                <Text
                  style={[
                    styles.symptomLabel,
                    {
                      color:
                        selectedType === symptom.key
                          ? Colors.white
                          : colors.text,
                    },
                  ]}
                >
                  {symptom.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity */}
        {renderSeveritySlider()}

        {/* Duration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Duration (minutes)
          </Text>
          <TextInput
            keyboardType="numeric"
            placeholder="How long did it last?"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Location (Optional)
          </Text>
          <View style={styles.locationGrid}>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc.key}
                style={[
                  styles.locationButton,
                  {
                    backgroundColor:
                      location === loc.key ? Colors.primary : colors.border,
                    borderColor:
                      location === loc.key ? Colors.primary : colors.border,
                  },
                ]}
                onPress={() => setLocation(loc.key)}
              >
                <Text
                  style={[
                    styles.locationText,
                    {
                      color: location === loc.key ? Colors.white : colors.text,
                    },
                  ]}
                >
                  {loc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Description (Optional)
          </Text>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="Describe the symptom in detail..."
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Potential Triggers */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Potential Triggers (Optional)
          </Text>
          <TextInput
            placeholder="Food, stress, activities... (comma separated)"
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={potentialTriggers}
            onChangeText={setPotentialTriggers}
          />
        </View>

        {/* Log Button */}
        <TouchableOpacity
          disabled={!selectedType}
          style={[
            styles.logButton,
            {
              backgroundColor: selectedType ? Colors.primary : colors.border,
            },
          ]}
          onPress={handleLogSymptom}
        >
          <Text
            style={[
              styles.logButtonText,
              {
                color: selectedType ? Colors.white : colors.textTertiary,
              },
            ]}
          >
            Log Symptom
          </Text>
        </TouchableOpacity>

        {/* Recent Symptoms */}
        {recentSymptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              Recent Symptoms
            </Text>
            <View style={styles.recentSymptomsContainer}>
              {recentSymptoms.slice(0, 5).map((symptom) => (
                <View
                  key={symptom.id}
                  style={[
                    styles.recentSymptomItem,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.recentSymptomHeader}>
                    <Text
                      style={[styles.recentSymptomType, { color: colors.text }]}
                    >
                      {symptomTypes.find((s) => s.key === symptom.type)?.emoji}{' '}
                      {symptomTypes.find((s) => s.key === symptom.type)?.label}
                    </Text>
                    <View
                      style={[
                        styles.severityIndicator,
                        {
                          backgroundColor: getRecentSymptomColor(
                            symptom.severity
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.recentSymptomDetails,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Severity: {symptom.severity}/10 • {symptom.duration}min •{' '}
                    {symptom.timestamp.toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    flex: 1,
    marginTop: -BorderRadius.lg,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  headerSubtitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    opacity: 0.9,
  },
  headerTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.sm,
  },
  locationButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  locationText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  logButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  logButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
  },
  recentSymptomDetails: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
  recentSymptomHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  recentSymptomItem: {
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  recentSymptomType: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  recentSymptomsContainer: {
    gap: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  severityButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  severityButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  severityContainer: {
    marginBottom: Spacing.lg,
  },
  severityIndicator: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  severityLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  symptomButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: '30%',
    padding: Spacing.md,
  },
  symptomEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  symptomLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  textArea: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    height: 80,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
  },
});
