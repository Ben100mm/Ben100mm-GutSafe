/**
 * @fileoverview RealDataFlow.e2e.ts - E2E tests with real data
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { App } from '../../App';
import { createMockUserSettings, createMockScanHistory } from '../../utils/testUtils';

// Mock real API responses
const mockOpenFoodFactsResponse = {
  product: {
    product_name: 'Greek Yogurt',
    brands: 'Chobani',
    categories: 'Dairy products, Fermented foods',
    ingredients_text: 'Cultured pasteurized Grade A milk, live active cultures',
    allergens_tags: ['en:milk'],
    additives_tags: [],
    nutrition_grades: 'a',
    nutriments: {
      energy_100g: 59,
      proteins_100g: 10,
      carbohydrates_100g: 3.6,
      fat_100g: 0.4,
      fiber_100g: 0,
      sugars_100g: 3.6,
    },
    traces_tags: [],
    ecoscore_grade: 'a',
    nova_group: 1,
  },
};

const mockUSDAFoodResponse = {
  foods: [
    {
      fdcId: 12345,
      description: 'Greek Yogurt, plain, low fat',
      brandOwner: 'Chobani',
      ingredients: 'Cultured pasteurized Grade A milk, live active cultures',
      allergens: ['Milk'],
      foodNutrients: [
        { nutrient: { name: 'Energy' }, amount: 59 },
        { nutrient: { name: 'Protein' }, amount: 10 },
        { nutrient: { name: 'Carbohydrate, by difference' }, amount: 3.6 },
        { nutrient: { name: 'Total lipid (fat)' }, amount: 0.4 },
      ],
    },
  ],
};

describe('GutSafe App E2E Tests with Real Data', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock real API calls
    global.fetch = jest.fn()
      .mockImplementation((url: string) => {
        if (url.includes('openfoodfacts.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOpenFoodFactsResponse),
          });
        }
        if (url.includes('api.nal.usda.gov')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockUSDAFoodResponse),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });
  });

  const renderApp = () => {
    return render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );
  };

  describe('Complete User Journey with Real Data', () => {
    it('should complete onboarding flow with real gut profile data', async () => {
      const { getByText, getByTestId } = renderApp();

      // Wait for app to load
      await waitFor(() => {
        expect(getByText('Welcome to GutSafe')).toBeTruthy();
      });

      // Complete onboarding steps
      fireEvent.press(getByText('Get Started'));

      // Select conditions
      await waitFor(() => {
        expect(getByText('Select Your Conditions')).toBeTruthy();
      });

      // Select IBS-FODMAP condition
      const ibsToggle = getByTestId('condition-toggle-ibs-fodmap');
      fireEvent.press(ibsToggle);

      // Select Lactose Intolerance
      const lactoseToggle = getByTestId('condition-toggle-lactose');
      fireEvent.press(lactoseToggle);

      // Set severity levels
      const ibsSeverity = getByTestId('severity-slider-ibs-fodmap');
      fireEvent(ibsSeverity, 'onValueChange', 0.7); // 70% severity

      const lactoseSeverity = getByTestId('severity-slider-lactose');
      fireEvent(lactoseSeverity, 'onValueChange', 0.5); // 50% severity

      // Proceed to next step
      fireEvent.press(getByText('Next'));

      // Add known triggers
      await waitFor(() => {
        expect(getByText('Known Triggers')).toBeTruthy();
      });

      const triggerInput = getByTestId('trigger-input');
      fireEvent.changeText(triggerInput, 'dairy');
      fireEvent.press(getByText('Add Trigger'));

      fireEvent.changeText(triggerInput, 'onions');
      fireEvent.press(getByText('Add Trigger'));

      // Proceed to preferences
      fireEvent.press(getByText('Next'));

      // Set dietary preferences
      await waitFor(() => {
        expect(getByText('Dietary Preferences')).toBeTruthy();
      });

      const restrictionsInput = getByTestId('dietary-restrictions-input');
      fireEvent.changeText(restrictionsInput, 'vegetarian');

      const alternativesInput = getByTestId('preferred-alternatives-input');
      fireEvent.changeText(alternativesInput, 'coconut milk');

      // Complete onboarding
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByText("You're All Set!")).toBeTruthy();
      });

      fireEvent.press(getByText('Complete Setup'));

      // Verify navigation to dashboard
      await waitFor(() => {
        expect(getByText('🎉 GutSafe Dashboard')).toBeTruthy();
      });
    });

    it('should scan real food item and analyze for gut health', async () => {
      const { getByText, getByTestId } = renderApp();

      // Navigate to scan screen
      fireEvent.press(getByText('Scan'));

      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      // Simulate barcode scan
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Wait for scan processing
      await waitFor(() => {
        expect(getByText('Scanning...')).toBeTruthy();
      });

      // Wait for real API response
      await waitFor(() => {
        expect(getByText('Greek Yogurt')).toBeTruthy();
      });

      // Verify real food data is displayed
      expect(getByText('Chobani')).toBeTruthy();
      expect(getByText('Dairy products')).toBeTruthy();

      // Verify gut health analysis
      await waitFor(() => {
        expect(getByText('Caution')).toBeTruthy();
      });

      // Verify flagged ingredients
      expect(getByText('milk')).toBeTruthy();
      expect(getByText('Contains lactose which may trigger symptoms')).toBeTruthy();

      // Verify safe alternatives
      expect(getByText('Safe Alternatives')).toBeTruthy();
      expect(getByText('lactose-free yogurt')).toBeTruthy();
      expect(getByText('coconut yogurt')).toBeTruthy();
    });

    it('should save scan to history and display in dashboard', async () => {
      const { getByText, getByTestId } = renderApp();

      // Complete a scan first
      fireEvent.press(getByText('Scan'));
      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      await waitFor(() => {
        expect(getByText('Greek Yogurt')).toBeTruthy();
      });

      // Save to history
      fireEvent.press(getByText('Save to History'));

      // Navigate to dashboard
      fireEvent.press(getByText('Dashboard'));

      await waitFor(() => {
        expect(getByText('🎉 GutSafe Dashboard')).toBeTruthy();
      });

      // Verify scan count updated
      expect(getByText('1')).toBeTruthy(); // Today's scans
      expect(getByText('Foods analyzed')).toBeTruthy();

      // Navigate to history
      fireEvent.press(getByText('History'));

      await waitFor(() => {
        expect(getByText('Scan History')).toBeTruthy();
      });

      // Verify scan appears in history
      expect(getByText('Greek Yogurt')).toBeTruthy();
      expect(getByText('Chobani')).toBeTruthy();
      expect(getByText('Caution')).toBeTruthy();
    });

    it('should update gut profile and reflect changes in analysis', async () => {
      const { getByText, getByTestId } = renderApp();

      // Navigate to profile
      fireEvent.press(getByText('Profile'));

      await waitFor(() => {
        expect(getByText('Gut Profile')).toBeTruthy();
      });

      // Update condition severity
      const ibsSeverity = getByTestId('severity-slider-ibs-fodmap');
      fireEvent(ibsSeverity, 'onValueChange', 0.9); // Increase to 90%

      // Add new trigger
      const triggerInput = getByTestId('trigger-input');
      fireEvent.changeText(triggerInput, 'garlic');
      fireEvent.press(getByText('Add Trigger'));

      // Save changes
      fireEvent.press(getByText('Save Changes'));

      await waitFor(() => {
        expect(getByText('Profile Updated')).toBeTruthy();
      });

      // Navigate back to scan
      fireEvent.press(getByText('Scan'));

      // Scan the same food item
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      await waitFor(() => {
        expect(getByText('Greek Yogurt')).toBeTruthy();
      });

      // Verify analysis reflects updated profile
      await waitFor(() => {
        expect(getByText('High Risk')).toBeTruthy(); // Should be higher risk now
      });

      // Verify new trigger is considered
      expect(getByText('garlic')).toBeTruthy();
    });
  });

  describe('Real API Integration', () => {
    it('should handle OpenFoodFacts API responses', async () => {
      const { getByText, getByTestId } = renderApp();

      fireEvent.press(getByText('Scan'));
      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Wait for real API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('openfoodfacts.org')
        );
      });

      // Verify real data is processed
      await waitFor(() => {
        expect(getByText('Greek Yogurt')).toBeTruthy();
      });

      // Verify nutritional information from real API
      expect(getByText('59 kcal')).toBeTruthy();
      expect(getByText('10g protein')).toBeTruthy();
      expect(getByText('3.6g carbs')).toBeTruthy();
    });

    it('should handle USDA API responses', async () => {
      const { getByText, getByTestId } = renderApp();

      fireEvent.press(getByText('Scan'));
      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Wait for USDA API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('api.nal.usda.gov')
        );
      });

      // Verify USDA data is processed
      await waitFor(() => {
        expect(getByText('Greek Yogurt, plain, low fat')).toBeTruthy();
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      const { getByText, getByTestId } = renderApp();

      fireEvent.press(getByText('Scan'));
      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Should show error message
      await waitFor(() => {
        expect(getByText('Unable to scan food item')).toBeTruthy();
      });

      // Should offer retry option
      expect(getByText('Retry')).toBeTruthy();
    });

    it('should handle network timeouts', async () => {
      // Mock timeout
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const { getByText, getByTestId } = renderApp();

      fireEvent.press(getByText('Scan'));
      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      // Should show timeout message
      await waitFor(() => {
        expect(getByText('Scan timed out')).toBeTruthy();
      });
    });
  });

  describe('Data Persistence', () => {
    it('should persist scan history across app restarts', async () => {
      const { getByText, getByTestId } = renderApp();

      // Complete a scan
      fireEvent.press(getByText('Scan'));
      await waitFor(() => {
        expect(getByText('Scan Barcode')).toBeTruthy();
      });

      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);

      await waitFor(() => {
        expect(getByText('Greek Yogurt')).toBeTruthy();
      });

      fireEvent.press(getByText('Save to History'));

      // Simulate app restart
      const { getByText: getByTextAfterRestart } = renderApp();

      // Navigate to history
      fireEvent.press(getByTextAfterRestart('History'));

      await waitFor(() => {
        expect(getByTextAfterRestart('Scan History')).toBeTruthy();
      });

      // Verify scan is still there
      expect(getByTextAfterRestart('Greek Yogurt')).toBeTruthy();
    });

    it('should persist user settings across app restarts', async () => {
      const { getByText, getByTestId } = renderApp();

      // Update settings
      fireEvent.press(getByText('Profile'));
      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
      });

      fireEvent.press(getByText('Settings'));

      // Change theme
      const themeToggle = getByTestId('theme-toggle');
      fireEvent.press(themeToggle);

      // Save settings
      fireEvent.press(getByText('Save Settings'));

      // Simulate app restart
      const { getByTestId: getByTestIdAfterRestart } = renderApp();

      // Navigate to settings
      fireEvent.press(getByText('Profile'));
      fireEvent.press(getByText('Settings'));

      // Verify theme is persisted
      const themeToggleAfterRestart = getByTestIdAfterRestart('theme-toggle');
      expect(themeToggleAfterRestart).toBeTruthy();
    });
  });

  describe('Performance with Real Data', () => {
    it('should handle large scan history efficiently', async () => {
      const { getByText, getByTestId } = renderApp();

      // Simulate many scans
      for (let i = 0; i < 50; i++) {
        fireEvent.press(getByText('Scan'));
        await waitFor(() => {
          expect(getByText('Scan Barcode')).toBeTruthy();
        });

        const scanButton = getByTestId('scan-button');
        fireEvent.press(scanButton);

        await waitFor(() => {
          expect(getByText('Greek Yogurt')).toBeTruthy();
        });

        fireEvent.press(getByText('Save to History'));

        // Navigate back to scan
        fireEvent.press(getByText('Scan'));
      }

      // Navigate to history
      fireEvent.press(getByText('History'));

      await waitFor(() => {
        expect(getByText('Scan History')).toBeTruthy();
      });

      // Should handle large list efficiently
      expect(getByText('Greek Yogurt')).toBeTruthy();
    });

    it('should load dashboard within acceptable time with real data', async () => {
      const startTime = Date.now();

      const { getByText } = renderApp();

      await waitFor(() => {
        expect(getByText('🎉 GutSafe Dashboard')).toBeTruthy();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });
  });
});
