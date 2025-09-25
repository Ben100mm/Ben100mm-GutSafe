/**
 * @fileoverview lazy/index.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { lazy } from 'react';

// Lazy load screens for better performance
export const LazyDashboardScreen = lazy(() => import('../DashboardScreen'));
export const LazyScanScreen = lazy(() => import('../ScanScreen').then(module => ({ default: module.ScanScreen })));
export const LazyBrowseScreen = lazy(() => import('../BrowseScreen').then(module => ({ default: module.BrowseScreen })));
export const LazyScannerScreen = lazy(() => import('../ScannerScreen').then(module => ({ default: module.ScannerScreen })));
export const LazyScanHistoryScreen = lazy(() => import('../ScanHistoryScreen').then(module => ({ default: module.ScanHistoryScreen })));
export const LazyScanDetailScreen = lazy(() => import('../ScanDetailScreen').then(module => ({ default: module.ScanDetailScreen })));
export const LazySafeFoodsScreen = lazy(() => import('../SafeFoodsScreen').then(module => ({ default: module.SafeFoodsScreen })));
export const LazyAnalyticsScreen = lazy(() => import('../AnalyticsScreen'));
export const LazyGutProfileScreen = lazy(() => import('../GutProfileScreen').then(module => ({ default: module.GutProfileScreen })));
export const LazyOnboardingScreen = lazy(() => import('../OnboardingScreen').then(module => ({ default: module.OnboardingScreen })));
export const LazyUserSettingsScreen = lazy(() => import('../UserSettingsScreen').then(module => ({ default: module.UserSettingsScreen })));
export const LazyNotificationSettingsScreen = lazy(() => import('../NotificationSettingsScreen').then(module => ({ default: module.NotificationSettingsScreen })));
export const LazySummaryScreen = lazy(() => import('../SummaryScreen').then(module => ({ default: module.SummaryScreen })));
