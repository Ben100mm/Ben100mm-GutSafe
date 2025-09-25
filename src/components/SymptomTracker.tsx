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
import LinearGradient from './LinearGradientWrapper';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { GutSymptom } from '../types';

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
      potentialTriggers: potentialTriggers.trim() ? potentialTriggers.split(',').map(t => t.trim()) : [],
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

    Alert.alert('Symptom Logged', 'Your symptom has been recorded successfully.');
  };

  const renderSeveritySlider = () => (
    <View style={styles.severityContainer}>
      <Text style={[styles.label, { color: colors.text }]}>Severity (1-10)</Text>
      <View style={styles.severityButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.severityButton,
              {
                backgroundColor: value <= severity ? Colors.primary : colors.border,
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
    if (severity <= 3) return Colors.safe;
    if (severity <= 7) return Colors.caution;
    return Colors.avoid;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={Colors.primaryGradient}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Log Gut Symptom</Text>
        <Text style={styles.headerSubtitle}>Track your symptoms to identify patterns</Text>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {/* Symptom Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Symptom Type</Text>
          <View style={styles.symptomGrid}>
            {symptomTypes.map((symptom) => (
              <TouchableOpacity
                key={symptom.key}
                style={[
                  styles.symptomButton,
                  {
                    backgroundColor: selectedType === symptom.key ? Colors.primary : colors.border,
                    borderColor: selectedType === symptom.key ? Colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedType(symptom.key)}
              >
                <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                <Text
                  style={[
                    styles.symptomLabel,
                    {
                      color: selectedType === symptom.key ? Colors.white : colors.text,
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
          <Text style={[styles.label, { color: colors.text }]}>Duration (minutes)</Text>
          <TextInput
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
            placeholder="How long did it last?"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Location (Optional)</Text>
          <View style={styles.locationGrid}>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc.key}
                style={[
                  styles.locationButton,
                  {
                    backgroundColor: location === loc.key ? Colors.primary : colors.border,
                    borderColor: location === loc.key ? Colors.primary : colors.border,
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
          <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
          <TextInput
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
            placeholder="Describe the symptom in detail..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Potential Triggers */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Potential Triggers (Optional)</Text>
          <TextInput
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
            placeholder="Food, stress, activities... (comma separated)"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Log Button */}
        <TouchableOpacity
          style={[
            styles.logButton,
            {
              backgroundColor: selectedType ? Colors.primary : colors.border,
            },
          ]}
          onPress={handleLogSymptom}
          disabled={!selectedType}
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
            <Text style={[styles.label, { color: colors.text }]}>Recent Symptoms</Text>
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
                    <Text style={[styles.recentSymptomType, { color: colors.text }]}>
                      {symptomTypes.find(s => s.key === symptom.type)?.emoji}{' '}
                      {symptomTypes.find(s => s.key === symptom.type)?.label}
                    </Text>
                    <View
                      style={[
                        styles.severityIndicator,
                        { backgroundColor: getRecentSymptomColor(symptom.severity) },
                      ]}
                    />
                  </View>
                  <Text style={[styles.recentSymptomDetails, { color: colors.textSecondary }]}>
                    Severity: {symptom.severity}/10 • {symptom.duration}min • {symptom.timestamp.toLocaleDateString()}
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
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    color: Colors.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    marginTop: -BorderRadius.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
    marginBottom: Spacing.sm,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  symptomButton: {
    flex: 1,
    minWidth: '30%',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  symptomEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  symptomLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  severityContainer: {
    marginBottom: Spacing.lg,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  severityButton: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  severityLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    height: 80,
    textAlignVertical: 'top',
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  locationButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  locationText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  logButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  logButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
  },
  recentSymptomsContainer: {
    gap: Spacing.sm,
  },
  recentSymptomItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 82, 87, 0.1)',
  },
  recentSymptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  recentSymptomType: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recentSymptomDetails: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
  },
});
