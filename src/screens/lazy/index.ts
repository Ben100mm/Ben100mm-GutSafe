/**
 * @fileoverview lazy/index.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { lazy } from 'react';

// Lazy load screens for better performance with error boundaries
const createLazyScreen = (importFn: () => Promise<any>, fallback?: React.ComponentType) => {
  return lazy(() => 
    importFn().catch((error) => {
      console.error('Failed to load screen:', error);
      // Return a fallback component or error screen
      return {
        default: () => (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Failed to load screen</h2>
            <p>Please try refreshing the page.</p>
          </div>
        )
      };
    })
  );
};

// Lazy load screens for better performance
export const LazyDashboardScreen = createLazyScreen(() => import('../DashboardScreen'));
export const LazyScanScreen = createLazyScreen(() =>
  import('../ScanScreen').then((module) => ({ default: module.ScanScreen }))
);
export const LazyBrowseScreen = createLazyScreen(() =>
  import('../BrowseScreen').then((module) => ({ default: module.BrowseScreen }))
);
export const LazyScannerScreen = createLazyScreen(() =>
  import('../ScannerScreen').then((module) => ({
    default: module.ScannerScreen,
  }))
);
export const LazyScanHistoryScreen = createLazyScreen(() =>
  import('../ScanHistoryScreen').then((module) => ({
    default: module.ScanHistoryScreen,
  }))
);
export const LazyScanDetailScreen = createLazyScreen(() =>
  import('../ScanDetailScreen').then((module) => ({
    default: module.ScanDetailScreen,
  }))
);
export const LazySafeFoodsScreen = createLazyScreen(() =>
  import('../SafeFoodsScreen').then((module) => ({
    default: module.SafeFoodsScreen,
  }))
);
export const LazyAnalyticsScreen = createLazyScreen(() => import('../AnalyticsScreen'));
export const LazyGutProfileScreen = createLazyScreen(() =>
  import('../GutProfileScreen').then((module) => ({
    default: module.GutProfileScreen,
  }))
);
export const LazyOnboardingScreen = createLazyScreen(() =>
  import('../OnboardingScreen').then((module) => ({
    default: module.OnboardingScreen,
  }))
);
export const LazyUserSettingsScreen = createLazyScreen(() =>
  import('../UserSettingsScreen').then((module) => ({
    default: module.UserSettingsScreen,
  }))
);
export const LazyNotificationSettingsScreen = createLazyScreen(() =>
  import('../NotificationSettingsScreen').then((module) => ({
    default: module.NotificationSettingsScreen,
  }))
);
export const LazySummaryScreen = createLazyScreen(() =>
  import('../SummaryScreen').then((module) => ({
    default: module.SummaryScreen,
  }))
);

// Lazy load heavy components
export const LazyFoodTrendAnalysis = lazy(() =>
  import('../../components/FoodTrendAnalysis').then((module) => ({
    default: module.FoodTrendAnalysis,
  }))
);

export const LazyMedicationTracker = lazy(() =>
  import('../../components/MedicationTracker').then((module) => ({
    default: module.MedicationTracker,
  }))
);

export const LazySymptomTracker = lazy(() =>
  import('../../components/SymptomTracker').then((module) => ({
    default: module.SymptomTracker,
  }))
);

export const LazyImmersiveHero = lazy(() =>
  import('../../components/ImmersiveHero').then((module) => ({
    default: module.ImmersiveHero,
  }))
);

export const LazyStorySection = lazy(() =>
  import('../../components/StorySection').then((module) => ({
    default: module.StorySection,
  }))
);
