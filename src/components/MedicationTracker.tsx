/**
 * @fileoverview MedicationTracker.tsx
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
import type { MedicationSupplement } from '../types';

import LinearGradient from './LinearGradientWrapper';

interface MedicationTrackerProps {
  onAddMedication: (medication: Omit<MedicationSupplement, 'id'>) => void;
  medications: MedicationSupplement[];
  onUpdateMedication: (
    id: string,
    updates: Partial<MedicationSupplement>
  ) => void;
}

const medicationTypes = [
  { key: 'medication', label: 'Medication', emoji: '💊' },
  { key: 'supplement', label: 'Supplement', emoji: '💊' },
  { key: 'probiotic', label: 'Probiotic', emoji: '🦠' },
  { key: 'enzyme', label: 'Enzyme', emoji: '⚗️' },
  { key: 'antacid', label: 'Antacid', emoji: '🧪' },
  { key: 'other', label: 'Other', emoji: '❓' },
] as const;

const frequencies = [
  { key: 'daily', label: 'Daily' },
  { key: 'twice_daily', label: 'Twice Daily' },
  { key: 'as_needed', label: 'As Needed' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
] as const;

const categories = [
  { key: 'digestive_aid', label: 'Digestive Aid' },
  { key: 'anti_inflammatory', label: 'Anti-Inflammatory' },
  { key: 'probiotic', label: 'Probiotic' },
  { key: 'enzyme_support', label: 'Enzyme Support' },
  { key: 'acid_control', label: 'Acid Control' },
  { key: 'immune_support', label: 'Immune Support' },
  { key: 'other', label: 'Other' },
] as const;

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  onAddMedication,
  medications,
  onUpdateMedication,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isGutRelated, setIsGutRelated] = useState(true);

  const handleAddMedication = () => {
    if (!name.trim() || !type || !dosage.trim() || !frequency) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const medicationData = {
      name: name.trim(),
      type: type as MedicationSupplement['type'],
      dosage: dosage.trim(),
      frequency: frequency as MedicationSupplement['frequency'],
      startDate: new Date(),
      isActive: true,
      notes: notes.trim() || '',
      gutRelated: isGutRelated,
      category: (category as MedicationSupplement['category']) || 'other',
    };

    onAddMedication(medicationData);

    // Reset form
    setName('');
    setType(null);
    setDosage('');
    setFrequency(null);
    setCategory(null);
    setNotes('');
    setIsGutRelated(true);
    setIsAdding(false);

    Alert.alert(
      'Medication Added',
      'Your medication has been added successfully.'
    );
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    onUpdateMedication(id, { isActive });
  };

  const getMedicationTypeEmoji = (type: string): string => {
    return medicationTypes.find((t) => t.key === type)?.emoji || '💊';
  };

  const getFrequencyLabel = (freq: string): string => {
    return frequencies.find((f) => f.key === freq)?.label || freq;
  };

  const getCategoryLabel = (cat: string): string => {
    return categories.find((c) => c.key === cat)?.label || cat;
  };

  const activeMedications = medications.filter((m) => m.isActive);
  const inactiveMedications = medications.filter((m) => !m.isActive);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient colors={Colors.primaryGradient} style={styles.header}>
        <Text style={styles.headerTitle}>Medications & Supplements</Text>
        <Text style={styles.headerSubtitle}>
          Track your gut-related medications and supplements
        </Text>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {/* Add Medication Button */}
        <TouchableOpacity
          style={[styles.addButton, { borderColor: Colors.primary }]}
          onPress={() => setIsAdding(true)}
        >
          <Text style={[styles.addButtonText, { color: Colors.primary }]}>
            + Add Medication/Supplement
          </Text>
        </TouchableOpacity>

        {/* Add Medication Form */}
        {isAdding && (
          <View
            style={[
              styles.formContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Add New Item
            </Text>

            {/* Name */}
            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              placeholder="Medication or supplement name"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={name}
              onChangeText={setName}
            />

            {/* Type */}
            <Text style={[styles.label, { color: colors.text }]}>Type *</Text>
            <View style={styles.typeGrid}>
              {medicationTypes.map((medType) => (
                <TouchableOpacity
                  key={medType.key}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        type === medType.key ? Colors.primary : colors.border,
                      borderColor:
                        type === medType.key ? Colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setType(medType.key)}
                >
                  <Text style={styles.typeEmoji}>{medType.emoji}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      {
                        color:
                          type === medType.key ? Colors.white : colors.text,
                      },
                    ]}
                  >
                    {medType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dosage */}
            <Text style={[styles.label, { color: colors.text }]}>Dosage *</Text>
            <TextInput
              placeholder="e.g., 500mg, 1 capsule"
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={dosage}
              onChangeText={setDosage}
            />

            {/* Frequency */}
            <Text style={[styles.label, { color: colors.text }]}>
              Frequency *
            </Text>
            <View style={styles.frequencyGrid}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.key}
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor:
                        frequency === freq.key ? Colors.primary : colors.border,
                      borderColor:
                        frequency === freq.key ? Colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFrequency(freq.key)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      {
                        color:
                          frequency === freq.key ? Colors.white : colors.text,
                      },
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text style={[styles.label, { color: colors.text }]}>
              Category (Optional)
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        category === cat.key ? Colors.primary : colors.border,
                      borderColor:
                        category === cat.key ? Colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color:
                          category === cat.key ? Colors.white : colors.text,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Gut Related Toggle */}
            <TouchableOpacity
              style={[
                styles.gutRelatedToggle,
                {
                  backgroundColor: isGutRelated
                    ? Colors.primary
                    : colors.border,
                },
              ]}
              onPress={() => setIsGutRelated(!isGutRelated)}
            >
              <Text
                style={[
                  styles.gutRelatedText,
                  { color: isGutRelated ? Colors.white : colors.text },
                ]}
              >
                🫀 Gut-Related: {isGutRelated ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>

            {/* Notes */}
            <Text style={[styles.label, { color: colors.text }]}>
              Notes (Optional)
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Additional notes..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Form Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setIsAdding(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddMedication}
              >
                <Text style={styles.saveButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Active Medications */}
        {activeMedications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Medications & Supplements
            </Text>
            {activeMedications.map((medication) => (
              <View
                key={medication.id}
                style={[
                  styles.medicationCard,
                  { backgroundColor: colors.background },
                ]}
              >
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationEmoji}>
                      {getMedicationTypeEmoji(medication.type)}
                    </Text>
                    <View>
                      <Text
                        style={[styles.medicationName, { color: colors.text }]}
                      >
                        {medication.name}
                      </Text>
                      <Text
                        style={[
                          styles.medicationDetails,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {medication.dosage} •{' '}
                        {getFrequencyLabel(medication.frequency)}
                      </Text>
                      {medication.category && (
                        <Text
                          style={[
                            styles.medicationCategory,
                            { color: Colors.primary },
                          ]}
                        >
                          {getCategoryLabel(medication.category)}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.activeToggle,
                      { backgroundColor: Colors.safe },
                    ]}
                    onPress={() => handleToggleActive(medication.id, false)}
                  >
                    <Text style={styles.activeToggleText}>Active</Text>
                  </TouchableOpacity>
                </View>
                {medication.notes && (
                  <Text
                    style={[
                      styles.medicationNotes,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {medication.notes}
                  </Text>
                )}
                <Text
                  style={[
                    styles.medicationStartDate,
                    { color: colors.textTertiary },
                  ]}
                >
                  Started: {medication.startDate.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Inactive Medications */}
        {inactiveMedications.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Inactive Items
            </Text>
            {inactiveMedications.map((medication) => (
              <View
                key={medication.id}
                style={[
                  styles.medicationCard,
                  styles.inactiveCard,
                  { backgroundColor: colors.background },
                ]}
              >
                <View style={styles.medicationHeader}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationEmoji}>
                      {getMedicationTypeEmoji(medication.type)}
                    </Text>
                    <View>
                      <Text
                        style={[
                          styles.medicationName,
                          styles.inactiveText,
                          { color: colors.textTertiary },
                        ]}
                      >
                        {medication.name}
                      </Text>
                      <Text
                        style={[
                          styles.medicationDetails,
                          { color: colors.textTertiary },
                        ]}
                      >
                        {medication.dosage} •{' '}
                        {getFrequencyLabel(medication.frequency)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.activeToggle,
                      { backgroundColor: colors.border },
                    ]}
                    onPress={() => handleToggleActive(medication.id, true)}
                  >
                    <Text
                      style={[
                        styles.activeToggleText,
                        { color: colors.textTertiary },
                      ]}
                    >
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💊</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Medications Yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Add your medications and supplements to track their effects on
              your gut health
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  activeToggle: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  activeToggleText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.caption,
  },
  addButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h4,
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  cancelButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  categoryButton: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  formContainer: {
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  formTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.lg,
  },
  frequencyButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  frequencyText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.bodySmall,
  },
  gutRelatedText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  gutRelatedToggle: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
    textAlign: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.xs,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  inactiveText: {
    textDecorationLine: 'line-through',
  },
  input: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.sm,
  },
  medicationCard: {
    borderColor: 'rgba(15, 82, 87, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  medicationCategory: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
  },
  medicationDetails: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    marginBottom: Spacing.xs,
  },
  medicationEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  medicationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicationInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  medicationName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  medicationNotes: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  medicationStartDate: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    marginTop: Spacing.sm,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.md,
  },
  textArea: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    height: 80,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textAlignVertical: 'top',
  },
  typeButton: {
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: '30%',
    padding: Spacing.md,
  },
  typeEmoji: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
  },
});
