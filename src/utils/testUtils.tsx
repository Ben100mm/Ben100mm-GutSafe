/**
 * @fileoverview testUtils.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { RenderOptions } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '../components/ErrorBoundary';
// import { logger } from './logger';

// Jest types
declare global {
  const jest: any;
  const expect: any;
}

// Mock logger for tests
export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock route
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Custom render function with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </ErrorBoundary>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test data factories
export const createMockFoodItem = (overrides: Partial<any> = {}) => ({
  id: 'test-food-1',
  name: 'Test Food',
  brand: 'Test Brand',
  category: 'Test Category',
  barcode: '1234567890123',
  ingredients: ['Test Ingredient 1', 'Test Ingredient 2'],
  allergens: ['Test Allergen'],
  additives: ['Test Additive'],
  glutenFree: true,
  lactoseFree: true,
  histamineLevel: 'low' as const,
  dataSource: 'Test Database',
  isSafeFood: false,
  ...overrides,
});

export const createMockScanHistory = (overrides: Partial<any> = {}) => ({
  id: 'test-scan-1',
  foodItem: createMockFoodItem(),
  analysis: {
    overallSafety: 'safe' as const,
    flaggedIngredients: [],
    conditionWarnings: [],
    safeAlternatives: ['Alternative 1'],
    explanation: 'Test explanation',
    dataSource: 'Test Database',
    lastUpdated: new Date(),
  },
  timestamp: new Date(),
  userFeedback: 'accurate' as const,
  ...overrides,
});

export const createMockGutProfile = (overrides: Partial<any> = {}) => ({
  id: 'test-profile-1',
  conditions: {
    'ibs-fodmap': {
      enabled: true,
      severity: 'mild' as const,
      knownTriggers: [],
    },
    gluten: { enabled: false, severity: 'mild' as const, knownTriggers: [] },
    lactose: {
      enabled: true,
      severity: 'moderate' as const,
      knownTriggers: ['dairy'],
    },
    reflux: { enabled: false, severity: 'mild' as const, knownTriggers: [] },
    histamine: { enabled: false, severity: 'mild' as const, knownTriggers: [] },
    allergies: { enabled: false, severity: 'mild' as const, knownTriggers: [] },
    additives: {
      enabled: true,
      severity: 'mild' as const,
      knownTriggers: ['MSG'],
    },
  },
  preferences: {
    dietaryRestrictions: ['vegetarian'],
    preferredAlternatives: ['coconut milk'],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUserSettings = (overrides: Partial<any> = {}) => ({
  profile: {
    name: 'Test User',
    email: 'test@example.com',
    age: 30,
    gender: 'other' as const,
    gutProfile: createMockGutProfile(),
  },
  preferences: {
    theme: 'light' as const,
    language: 'en',
    units: 'metric' as const,
    notifications: {
      enabled: true,
      mealReminders: true,
      newSafeFoods: true,
      weeklyReports: true,
      scanReminders: true,
    },
    haptics: {
      enabled: true,
      intensity: 'medium' as const,
    },
    accessibility: {
      voiceOver: false,
      largeText: false,
      highContrast: false,
      reducedMotion: false,
    },
  },
  scanning: {
    autoScan: false,
    hapticFeedback: true,
    soundFeedback: true,
    saveToHistory: true,
    shareResults: false,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    crashReporting: true,
    personalizedAds: false,
  },
  ...overrides,
});

// Mock services
export const createMockDataService = () => ({
  getInstance: jest.fn(() => ({
    initialize: jest.fn(),
    getScanHistory: jest.fn(() => [createMockScanHistory()]),
    addScan: jest.fn(),
    updateScan: jest.fn(),
    removeScan: jest.fn(),
  })),
});

export const createMockNetworkService = () => ({
  getInstance: jest.fn(() => ({
    initialize: jest.fn(),
    cleanup: jest.fn(),
    isOnline: jest.fn(() => true),
    getNetworkQuality: jest.fn(() => ({ score: 100 })),
    on: jest.fn(),
    off: jest.fn(),
  })),
});

export const createMockOfflineService = () => ({
  getInstance: jest.fn(() => ({
    initialize: jest.fn(),
    saveScanHistory: jest.fn(),
    loadScanHistory: jest.fn(() => Promise.resolve([createMockScanHistory()])),
    isOfflineMode: jest.fn(() => false),
  })),
});

// Test helpers
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

export const mockCamera = {
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
};

export const mockHaptics = {
  setEnabled: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
};

// Test assertions
export const expectToBeAccessible = (element: any) => {
  expect(element).toHaveAccessibilityRole();
  expect(element).toHaveAccessibilityLabel();
};

export const expectToHaveProperStyling = (element: any) => {
  expect(element).toHaveStyle({
    minHeight: 44, // Minimum touch target size
  });
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

export const measureMemoryUsage = () => {
  const memoryInfo = (performance as any).memory;
  if (memoryInfo) {
    return {
      used: memoryInfo.usedJSHeapSize,
      total: memoryInfo.totalJSHeapSize,
      limit: memoryInfo.jsHeapSizeLimit,
    };
  }
  return null;
};

// Mock error boundary
export const MockErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

// Test environment setup
export const setupTestEnvironment = () => {
  // Mock console methods to avoid noise in tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  } as any;

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    },
    writable: true,
  });
};

// Cleanup after tests
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// Export everything
export * from '@testing-library/react-native';
export { customRender as render };
const testUtils = {
  mockLogger,
  mockNavigation,
  mockRoute,
  createMockFoodItem,
  createMockScanHistory,
  createMockGutProfile,
  createMockUserSettings,
  createMockDataService,
  createMockNetworkService,
  createMockOfflineService,
  waitFor,
  mockAsyncStorage,
  mockCamera,
  mockHaptics,
  expectToBeAccessible,
  expectToHaveProperStyling,
  measureRenderTime,
  measureMemoryUsage,
  setupTestEnvironment,
  cleanupTestEnvironment,
};

export default testUtils;
