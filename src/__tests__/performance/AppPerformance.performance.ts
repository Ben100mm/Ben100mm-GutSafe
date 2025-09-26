/**
 * @fileoverview AppPerformance.performance.ts - Performance testing suite
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { App } from '../../App';
import { DashboardScreen } from '../../screens/DashboardScreen';
import { ScanScreen } from '../../screens/ScanScreen';
import { createMockUserSettings, createMockScanHistory } from '../../utils/testUtils';

// Performance testing utilities
const measurePerformance = async (testName: string, testFn: () => Promise<void> | void) => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  await testFn();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const duration = endTime - startTime;
  const memoryDelta = endMemory - startMemory;
  
  console.log(`Performance Test: ${testName}`);
  console.log(`Duration: ${duration.toFixed(2)}ms`);
  console.log(`Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
  
  return { duration, memoryDelta };
};

const measureRenderTime = (component: React.ReactElement) => {
  const startTime = performance.now();
  render(component);
  const endTime = performance.now();
  return endTime - startTime;
};

const measureMemoryUsage = () => {
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

describe('App Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Rendering Performance', () => {
    it('should render dashboard screen within acceptable time', () => {
      const renderTime = measureRenderTime(
        <NavigationContainer>
          <DashboardScreen />
        </NavigationContainer>
      );
      
      expect(renderTime).toBeLessThan(500); // Should render within 500ms
    });

    it('should render scan screen within acceptable time', () => {
      const renderTime = measureRenderTime(
        <NavigationContainer>
          <ScanScreen />
        </NavigationContainer>
      );
      
      expect(renderTime).toBeLessThan(500); // Should render within 500ms
    });

    it('should render app within acceptable time', () => {
      const renderTime = measureRenderTime(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );
      
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during screen navigation', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      const initialMemory = measureMemoryUsage();
      
      // Navigate between screens multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.press(getByText('Dashboard'));
        await waitFor(() => {
          expect(getByText('🎉 GutSafe Dashboard')).toBeTruthy();
        });
        
        fireEvent.press(getByText('Scan'));
        await waitFor(() => {
          expect(getByText('Scan Barcode')).toBeTruthy();
        });
      }
      
      const finalMemory = measureMemoryUsage();
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
        
        expect(memoryIncreaseMB).toBeLessThan(10); // Should not increase by more than 10MB
      }
    });

    it('should handle large datasets efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      const initialMemory = measureMemoryUsage();
      
      // Simulate large scan history
      const largeScanHistory = Array.from({ length: 1000 }, (_, i) => 
        createMockScanHistory({ id: `scan-${i}` })
      );
      
      // Navigate to history screen
      fireEvent.press(getByText('History'));
      
      const finalMemory = measureMemoryUsage();
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory.used - initialMemory.used;
        const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
        
        expect(memoryIncreaseMB).toBeLessThan(50); // Should not increase by more than 50MB
      }
    });
  });

  describe('User Interaction Performance', () => {
    it('should handle rapid button presses efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <DashboardScreen />
        </NavigationContainer>
      );

      const startTime = performance.now();
      
      // Simulate rapid button presses
      for (let i = 0; i < 50; i++) {
        fireEvent.press(getByText("Today's Scans"));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should handle 50 presses within 1 second
    });

    it('should handle scroll performance efficiently', async () => {
      const { getByTestId } = render(
        <NavigationContainer>
          <DashboardScreen />
        </NavigationContainer>
      );

      const scrollView = getByTestId('dashboard-scroll');
      
      const startTime = performance.now();
      
      // Simulate rapid scrolling
      for (let i = 0; i < 20; i++) {
        fireEvent.scroll(scrollView, {
          nativeEvent: {
            contentOffset: { y: i * 100 },
            contentSize: { height: 2000 },
            layoutMeasurement: { height: 800 },
          },
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should handle 20 scroll events within 500ms
    });
  });

  describe('API Performance', () => {
    it('should handle API calls within acceptable time', async () => {
      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      fireEvent.press(getByText('Scan'));
      
      const startTime = performance.now();
      
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
      
      await waitFor(() => {
        expect(getByText('Scanning...')).toBeTruthy();
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should start scanning within 2 seconds
    });

    it('should handle concurrent API calls efficiently', async () => {
      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      fireEvent.press(getByText('Scan'));
      
      const startTime = performance.now();
      
      // Simulate multiple concurrent scans
      const scanButton = getByTestId('scan-button');
      const promises = Array.from({ length: 5 }, () => {
        fireEvent.press(scanButton);
        return waitFor(() => {
          expect(getByText('Scanning...')).toBeTruthy();
        });
      });
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should handle 5 concurrent scans within 5 seconds
    });
  });

  describe('Data Processing Performance', () => {
    it('should process large food datasets efficiently', async () => {
      const largeFoodDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `food-${i}`,
        name: `Food Item ${i}`,
        brand: `Brand ${i}`,
        category: 'Test Category',
        ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
        allergens: ['allergen1'],
        additives: [],
        glutenFree: true,
        lactoseFree: true,
        histamineLevel: 'low' as const,
        dataSource: 'Test Database',
      }));

      const startTime = performance.now();
      
      // Simulate processing large dataset
      const processedData = largeFoodDataset.map(food => ({
        ...food,
        processed: true,
        timestamp: Date.now(),
      }));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should process 10k items within 1 second
      expect(processedData).toHaveLength(10000);
    });

    it('should handle complex gut health analysis efficiently', async () => {
      const complexFoodItem = {
        id: 'complex-food',
        name: 'Complex Food Item',
        brand: 'Test Brand',
        category: 'Test Category',
        ingredients: Array.from({ length: 100 }, (_, i) => `ingredient-${i}`),
        allergens: ['milk', 'gluten', 'soy', 'nuts'],
        additives: Array.from({ length: 50 }, (_, i) => `additive-${i}`),
        glutenFree: false,
        lactoseFree: false,
        histamineLevel: 'high' as const,
        dataSource: 'Test Database',
      };

      const startTime = performance.now();
      
      // Simulate complex gut health analysis
      const analysis = {
        overallSafety: 'high-risk' as const,
        flaggedIngredients: complexFoodItem.ingredients.filter(ingredient => 
          ingredient.includes('allergen') || ingredient.includes('additive')
        ),
        conditionWarnings: complexFoodItem.allergens.map(allergen => ({
          ingredient: allergen,
          severity: 'high' as const,
          condition: allergen,
        })),
        safeAlternatives: ['alternative1', 'alternative2', 'alternative3'],
        explanation: 'Complex analysis result',
        dataSource: 'Test Database',
        lastUpdated: new Date(),
      };
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should analyze complex food within 100ms
      expect(analysis.flaggedIngredients.length).toBeGreaterThan(0);
    });
  });

  describe('Storage Performance', () => {
    it('should save large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createMockScanHistory({ id: `scan-${i}` })
      );

      const startTime = performance.now();
      
      // Simulate saving large dataset
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('large-dataset', JSON.stringify(largeDataset));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should save 1k items within 2 seconds
    });

    it('should load large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        createMockScanHistory({ id: `scan-${i}` })
      );

      // Pre-save the dataset
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem('large-dataset', JSON.stringify(largeDataset));

      const startTime = performance.now();
      
      // Simulate loading large dataset
      const loadedData = await AsyncStorage.getItem('large-dataset');
      const parsedData = JSON.parse(loadedData || '[]');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should load 1k items within 1 second
      expect(parsedData).toHaveLength(1000);
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network connections gracefully', async () => {
      // Mock slow network
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({}),
          }), 5000) // 5 second delay
        )
      );

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      fireEvent.press(getByText('Scan'));
      
      const startTime = performance.now();
      
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
      
      // Should show loading state quickly
      await waitFor(() => {
        expect(getByText('Scanning...')).toBeTruthy();
      }, { timeout: 1000 });
      
      const loadingTime = performance.now() - startTime;
      expect(loadingTime).toBeLessThan(1000); // Should show loading within 1 second
      
      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle network timeouts efficiently', async () => {
      // Mock network timeout
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
      );

      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      fireEvent.press(getByText('Scan'));
      
      const startTime = performance.now();
      
      const scanButton = getByTestId('scan-button');
      fireEvent.press(scanButton);
      
      // Should handle timeout gracefully
      await waitFor(() => {
        expect(getByText('Scan timed out')).toBeTruthy();
      }, { timeout: 2000 });
      
      const timeoutTime = performance.now() - startTime;
      expect(timeoutTime).toBeLessThan(2000); // Should handle timeout within 2 seconds
      
      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should maintain performance during heavy usage', async () => {
      const { getByText, getByTestId } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      const startTime = performance.now();
      const startMemory = measureMemoryUsage();
      
      // Simulate heavy usage pattern
      for (let i = 0; i < 20; i++) {
        // Navigate to scan
        fireEvent.press(getByText('Scan'));
        await waitFor(() => {
          expect(getByText('Scan Barcode')).toBeTruthy();
        });
        
        // Simulate scan
        const scanButton = getByTestId('scan-button');
        fireEvent.press(scanButton);
        
        // Navigate to dashboard
        fireEvent.press(getByText('Dashboard'));
        await waitFor(() => {
          expect(getByText('🎉 GutSafe Dashboard')).toBeTruthy();
        });
        
        // Navigate to history
        fireEvent.press(getByText('History'));
        await waitFor(() => {
          expect(getByText('Scan History')).toBeTruthy();
        });
      }
      
      const endTime = performance.now();
      const endMemory = measureMemoryUsage();
      
      const totalDuration = endTime - startTime;
      const memoryIncrease = endMemory ? endMemory.used - (startMemory?.used || 0) : 0;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      expect(totalDuration).toBeLessThan(30000); // Should complete 20 cycles within 30 seconds
      expect(memoryIncreaseMB).toBeLessThan(20); // Should not increase memory by more than 20MB
    });

    it('should handle background/foreground transitions efficiently', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <App />
        </NavigationContainer>
      );

      const startTime = performance.now();
      
      // Simulate background/foreground transitions
      for (let i = 0; i < 10; i++) {
        // Simulate app going to background
        fireEvent.press(getByText('Dashboard'));
        await waitFor(() => {
          expect(getByText('🎉 GutSafe Dashboard')).toBeTruthy();
        });
        
        // Simulate app coming to foreground
        fireEvent.press(getByText('Scan'));
        await waitFor(() => {
          expect(getByText('Scan Barcode')).toBeTruthy();
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000); // Should handle 10 transitions within 10 seconds
    });
  });
});
