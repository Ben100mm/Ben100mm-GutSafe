/**
 * @fileoverview ScanScreen.tsx
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
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedButton } from '../components/AnimatedButton';
import { ImmersiveHero } from '../components/ImmersiveHero';
import { StickyCTA } from '../components/StickyCTA';
import { StorySection } from '../components/StorySection';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import PerformanceDetector from '../utils/PerformanceDetector';

export const ScanScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const [performanceMode, setPerformanceMode] = useState<
    'high' | 'medium' | 'low'
  >('medium');
  const performanceDetector = PerformanceDetector.getInstance();

  useEffect(() => {
    const initializePerformance = async () => {
      await performanceDetector.initialize();
      setPerformanceMode(performanceDetector.getPerformanceMode());
    };
    initializePerformance();
  }, [performanceDetector]);

  const handleBarcodeScan = () => {
    (navigation as any).navigate('Scanner');
  };

  const handleMenuScan = () => {
    // TODO: Implement menu scanning
    console.log('Menu scan pressed');
  };

  const handleRecipeScan = () => {
    // TODO: Implement recipe scanning
    console.log('Recipe scan pressed');
  };

  const handleRecentScans = () => {
    (navigation as any).navigate('ScanHistory');
  };

  const handleSafeFoods = () => {
    (navigation as any).navigate('SafeFoods');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* Immersive Hero Section */}
        <ImmersiveHero
          backgroundType="gradient"
          ctaText="Scan Barcode"
          enableParticles={performanceDetector.shouldEnableParticles()}
          performanceMode={performanceMode}
          subtitle="Instantly analyze any food for gut health compatibility with AI-powered insights"
          title="Smart Food Scanning"
          onCTAPress={handleBarcodeScan}
        />

        {/* Problem Section */}
        <StorySection
          content="Many foods contain hidden ingredients that can trigger digestive issues. Without proper analysis, you might unknowingly consume foods that cause discomfort, bloating, or other gut health problems."
          enableAnimation={performanceDetector.shouldEnableAnimations()}
          performanceMode={performanceMode}
          sectionType="problem"
          subtitle="The hidden ingredients problem"
          title="Food Uncertainty"
        />

        {/* Solution Section */}
        <StorySection
          content="Our advanced AI instantly analyzes barcodes, ingredient lists, and even menu photos to identify potential gut health triggers and provide personalized recommendations."
          ctaText="Try Barcode Scan"
          enableAnimation={performanceDetector.shouldEnableAnimations()}
          performanceMode={performanceMode}
          sectionType="solution"
          subtitle="AI-powered ingredient detection"
          title="Instant Food Analysis"
          onCTAPress={handleBarcodeScan}
        />

        {/* Features Section */}
        <StorySection
          content="Barcode scanning, menu photo analysis, and recipe import - we provide multiple ways to analyze your food for complete gut health coverage."
          enableAnimation={performanceDetector.shouldEnableAnimations()}
          performanceMode={performanceMode}
          sectionType="features"
          subtitle="Choose your preferred scanning method"
          title="Multiple Scan Options"
        />
      </ScrollView>

      {/* Sticky CTA */}
      <StickyCTA
        enablePulse
        accessibilityLabel="Start scanning food for gut health analysis"
        position="bottom"
        size="large"
        text="Start Scanning"
        variant="primary"
        onPress={handleBarcodeScan}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Scan</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.scanOptions}>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Choose how you'd like to scan
          </Text>

          {/* Barcode Scanner */}
          <TouchableOpacity
            style={[styles.scanCard, { backgroundColor: colors.surface }]}
            onPress={handleBarcodeScan}
          >
            <View style={styles.scanCardContent}>
              <View
                style={[styles.scanIcon, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.scanIconText}>📱</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={[styles.scanTitle, { color: colors.text }]}>
                  Barcode Scanner
                </Text>
                <Text
                  style={[
                    styles.scanDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Scan packaged foods and products
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Menu Scanner */}
          <TouchableOpacity
            style={[styles.scanCard, { backgroundColor: colors.surface }]}
            onPress={handleMenuScan}
          >
            <View style={styles.scanCardContent}>
              <View
                style={[styles.scanIcon, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.scanIconText}>📋</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={[styles.scanTitle, { color: colors.text }]}>
                  Menu Scanner
                </Text>
                <Text
                  style={[
                    styles.scanDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Scan restaurant menus and dishes
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Recipe Scanner */}
          <TouchableOpacity
            style={[styles.scanCard, { backgroundColor: colors.surface }]}
            onPress={handleRecipeScan}
          >
            <View style={styles.scanCardContent}>
              <View
                style={[styles.scanIcon, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.scanIconText}>👨‍🍳</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={[styles.scanTitle, { color: colors.text }]}>
                  Recipe Scanner
                </Text>
                <Text
                  style={[
                    styles.scanDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Analyze recipes and ingredients
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.quickActionsTitle, { color: colors.text }]}>
            Quick Actions
          </Text>

          <View style={styles.actionButtons}>
            <AnimatedButton
              size="medium"
              style={styles.actionButton}
              title="Recent Scans"
              variant="outline"
              onPress={handleRecentScans}
            />
            <AnimatedButton
              size="medium"
              style={styles.actionButton}
              title="Safe Foods"
              variant="outline"
              onPress={handleSafeFoods}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chevron: {
    color: Colors.body,
    fontSize: 16,
    fontWeight: '300',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  quickActions: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xl,
  },
  quickActionsTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.h3,
    marginBottom: Spacing.md,
  },
  scanCard: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  scanCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scanDescription: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.bodySmall,
  },
  scanIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: Spacing.md,
    width: 40,
  },
  scanIconText: {
    fontSize: 20,
  },
  scanOptions: {
    flex: 1,
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h1,
  },
});
