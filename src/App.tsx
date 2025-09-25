/**
 * @fileoverview GutSafe - Main Application Component
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { HapticFeedback } from './utils/haptics';
import AccessibilityService from './utils/accessibility';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DataService from './services/DataService';
import OfflineService from './services/OfflineService';
import NetworkService from './services/NetworkService';
import AILearningService from './services/AILearningService';

export default function App() {
  console.log('🚀 GutSafe App - Full Navigation Version 4.0');
  
  useEffect(() => {
    DataService.getInstance().initialize();
    OfflineService.getInstance().initialize();
    NetworkService.getInstance().initialize();
    AILearningService.getInstance().initialize();
    
    // Initialize haptic feedback
    HapticFeedback.setEnabled(true);
    
    // Announce app launch to screen readers
    setTimeout(() => {
      AccessibilityService.announceForAccessibility('GutSafe app launched successfully');
    }, 1000);
  }, []);

  // Temporary bypass for testing
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}