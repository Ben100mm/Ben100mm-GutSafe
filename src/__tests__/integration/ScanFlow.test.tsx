/**
 * @fileoverview ScanFlow.test.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ScanScreen } from '../../screens/ScanScreen';
import { ScanDetailScreen } from '../../screens/ScanDetailScreen';
import { ScanHistoryScreen } from '../../screens/ScanHistoryScreen';
import FoodDatabaseService from '../../services/FoodDatabaseService';
import OfflineService from '../../services/OfflineService';
import { ScanHistory, FoodItem, ScanAnalysis } from '../../types';

// Mock services
jest.mock('../../services/FoodDatabaseService');
jest.mock('../../services/OfflineService');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

// Mock camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: 'granted' })
    ),
  },
}));

describe('Scan Flow Integration Tests', () => {
  let mockFoodDatabaseService: jest.Mocked<FoodDatabaseService>;
  let mockOfflineService: jest.Mocked<OfflineService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFoodDatabaseService = {
      initialize: jest.fn(),
      searchFoods: jest.fn(),
      getFoodByBarcode: jest.fn(),
      analyzeFoodForGutHealth: jest.fn(),
      getNutritionalInfo: jest.fn(),
      getAllergenInfo: jest.fn(),
      getSafeAlternatives: jest.fn(),
      getFoodTrends: jest.fn(),
      getFoodRecommendations: jest.fn(),
      getCacheStats: jest.fn(),
      clearCache: jest.fn(),
    } as any;

    mockOfflineService = {
      initialize: jest.fn(),
      cacheFoodItem: jest.fn(),
      getCachedFoodItem: jest.fn(),
      searchCachedFoods: jest.fn(),
      storeOfflineScan: jest.fn(),
      getOfflineScans: jest.fn(),
      markOfflineScansAsSynced: jest.fn(),
      getCacheStats: jest.fn(),
      clearAllCache: jest.fn(),
    } as any;

    (FoodDatabaseService.getInstance as jest.Mock).mockReturnValue(
      mockFoodDatabaseService
    );
    (OfflineService.getInstance as jest.Mock).mockReturnValue(
      mockOfflineService
    );
  });

  const createMockFoodItem = (): FoodItem => ({
    id: '1',
    name: 'Test Food',
    brand: 'Test Brand',
    category: 'Test Category',
    barcode: '123456789',
    ingredients: ['test ingredient 1', 'test ingredient 2'],
    allergens: ['milk'],
    additives: ['artificial flavor'],
    glutenFree: false,
    lactoseFree: false,
    histamineLevel: 'low',
    dataSource: 'Test Database',
  });

  const createMockAnalysis = (): ScanAnalysis => ({
    overallSafety: 'caution',
    flaggedIngredients: [
      {
        ingredient: 'milk',
        reason: 'Contains lactose which may trigger symptoms',
        severity: 'moderate',
        condition: 'lactose',
      },
    ],
    conditionWarnings: [
      {
        ingredient: 'milk',
        severity: 'moderate',
        condition: 'lactose',
      },
    ],
    safeAlternatives: ['lactose-free milk', 'almond milk'],
    explanation: 'This food contains lactose which may cause digestive issues.',
    dataSource: 'Test Database',
    lastUpdated: new Date(),
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  describe('Complete Scan Flow', () => {
    it('should complete full scan flow from scan to detail view', async () => {
      const mockFoodItem = createMockFoodItem();
      const mockAnalysis = createMockAnalysis();

      mockFoodDatabaseService.getFoodByBarcode.mockResolvedValue(mockFoodItem);
      mockFoodDatabaseService.analyzeFoodForGutHealth.mockResolvedValue(
        mockAnalysis
      );

      const { getByTestId, getByText } = renderWithNavigation(<ScanScreen />);

      // Wait for component to load
      await waitFor(() => {
        expect(mockFoodDatabaseService.initialize).toHaveBeenCalled();
      });

      // Simulate barcode scan
      const scanButton = screen.getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Wait for scan processing
      await waitFor(() => {
        expect(mockFoodDatabaseService.getFoodByBarcode).toHaveBeenCalled();
      });

      // Verify navigation to detail screen
      expect(mockNavigate).toHaveBeenCalledWith(
        'ScanDetail',
        expect.any(Object)
      );
    });

    it('should handle scan errors gracefully', async () => {
      mockFoodDatabaseService.getFoodByBarcode.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId } = renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockFoodDatabaseService.initialize).toHaveBeenCalled();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      await waitFor(() => {
        expect(mockFoodDatabaseService.getFoodByBarcode).toHaveBeenCalled();
      });

      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Scan Detail View', () => {
    it('should display scan results correctly', async () => {
      const mockFoodItem = createMockFoodItem();
      const mockAnalysis = createMockAnalysis();

      const { getByText, getByTestId } = renderWithNavigation(
        <ScanDetailScreen route={{ params: { scanId: '1' } }} />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(getByText(mockFoodItem.name)).toBeTruthy();
      });

      // Verify food name is displayed
      expect(getByText(mockFoodItem.name)).toBeTruthy();
      expect(getByText(mockFoodItem.brand!)).toBeTruthy();

      // Verify analysis results
      expect(getByText('Caution')).toBeTruthy();
      expect(getByText(mockAnalysis.explanation)).toBeTruthy();
    });

    it('should show safe alternatives', async () => {
      const mockFoodItem = createMockFoodItem();
      const mockAnalysis = createMockAnalysis();

      const { getByText } = renderWithNavigation(
        <ScanDetailScreen route={{ params: { scanId: '1' } }} />
      );

      await waitFor(() => {
        expect(getByText('Safe Alternatives')).toBeTruthy();
      });

      // Verify safe alternatives are displayed
      mockAnalysis.safeAlternatives.forEach((alternative) => {
        expect(getByText(alternative)).toBeTruthy();
      });
    });
  });

  describe('Scan History', () => {
    it('should display scan history correctly', async () => {
      const mockScanHistory: ScanHistory[] = [
        {
          id: '1',
          foodItem: createMockFoodItem(),
          analysis: createMockAnalysis(),
          timestamp: new Date(),
          userFeedback: 'accurate',
        },
      ];

      const { getByText } = renderWithNavigation(<ScanHistoryScreen />);

      await waitFor(() => {
        expect(getByText('Scan History')).toBeTruthy();
      });

      // Verify scan history items are displayed
      expect(getByText(mockScanHistory[0].foodItem.name)).toBeTruthy();
    });

    it('should filter scan history by safety level', async () => {
      const { getByText, getByTestId } = renderWithNavigation(
        <ScanHistoryScreen />
      );

      await waitFor(() => {
        expect(getByText('Scan History')).toBeTruthy();
      });

      // Test filter buttons
      const cautionFilter = getByTestId('filter-caution');
      fireEvent.press(cautionFilter);

      // Verify filter is applied
      expect(getByText('Caution')).toBeTruthy();
    });

    it('should search scan history', async () => {
      const { getByTestId, getByPlaceholderText } = renderWithNavigation(
        <ScanHistoryScreen />
      );

      await waitFor(() => {
        expect(getByText('Scan History')).toBeTruthy();
      });

      // Test search functionality
      const searchInput = getByPlaceholderText(
        'Search foods, ingredients, brands...'
      );
      fireEvent.changeText(searchInput, 'test food');

      // Verify search is performed
      await waitFor(() => {
        expect(mockFoodDatabaseService.searchFoods).toHaveBeenCalledWith(
          'test food'
        );
      });
    });
  });

  describe('Offline Functionality', () => {
    it('should work offline with cached data', async () => {
      const mockCachedFood = createMockFoodItem();
      mockOfflineService.getCachedFoodItem.mockResolvedValue(mockCachedFood);

      const { getByTestId } = renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockOfflineService.initialize).toHaveBeenCalled();
      });

      // Simulate offline scan
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      await waitFor(() => {
        expect(mockOfflineService.getCachedFoodItem).toHaveBeenCalled();
      });
    });

    it('should store offline scans for later sync', async () => {
      const { getByTestId } = renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockOfflineService.initialize).toHaveBeenCalled();
      });

      // Simulate offline scan
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      await waitFor(() => {
        expect(mockOfflineService.storeOfflineScan).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFoodDatabaseService.getFoodByBarcode.mockRejectedValue(
        new Error('Network error')
      );

      const { getByTestId } = renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockFoodDatabaseService.initialize).toHaveBeenCalled();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Should not crash and should show error state
      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
    });

    it('should handle invalid barcode gracefully', async () => {
      mockFoodDatabaseService.getFoodByBarcode.mockResolvedValue(null);

      const { getByTestId } = renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockFoodDatabaseService.initialize).toHaveBeenCalled();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Should show "not found" message
      await waitFor(() => {
        expect(getByTestId('not-found-message')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should load scan screen within acceptable time', async () => {
      const startTime = Date.now();

      renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockFoodDatabaseService.initialize).toHaveBeenCalled();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
    });

    it('should handle multiple rapid scans', async () => {
      const { getByTestId } = renderWithNavigation(<ScanScreen />);

      await waitFor(() => {
        expect(mockFoodDatabaseService.initialize).toHaveBeenCalled();
      });

      const scanButton = getByTestId('scan-button');

      // Simulate rapid scans
      fireEvent.press(scanButton);
      fireEvent.press(scanButton);
      fireEvent.press(scanButton);

      // Should handle gracefully without errors
      await waitFor(() => {
        expect(mockFoodDatabaseService.getFoodByBarcode).toHaveBeenCalledTimes(
          3
        );
      });
    });
  });
});
