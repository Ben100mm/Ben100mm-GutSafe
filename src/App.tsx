import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './navigation/AppNavigator';
import { HapticFeedback } from './utils/haptics';
import AccessibilityService from './utils/accessibility';

export default function App() {
  useEffect(() => {
    // Initialize accessibility service
    AccessibilityService.initialize();
    
    // Initialize haptic feedback
    HapticFeedback.setEnabled(true);
    
    // Announce app launch to screen readers
    setTimeout(() => {
      AccessibilityService.announceForAccessibility('GutSafe app launched successfully');
    }, 1000);
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
