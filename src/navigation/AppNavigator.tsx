/**
 * @fileoverview AppNavigator.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { HapticFeedback } from '../utils/haptics';
import AccessibilityService from '../utils/accessibility';

// Lazy loaded screens
import {
  LazyDashboardScreen,
  LazyScanScreen,
  LazyBrowseScreen,
  LazyScannerScreen,
  LazyScanHistoryScreen,
  LazyScanDetailScreen,
  LazySafeFoodsScreen,
  LazyAnalyticsScreen,
  LazyGutProfileScreen,
  LazyOnboardingScreen,
} from '../screens/lazy';

// Tab Icons
import { TabIcon } from '../components/TabIcon';
import { LazyWrapper } from '../components/LazyWrapper';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Scan Stack Navigator (for scanner modal)
const ScanStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      presentation: 'modal',
    }}
  >
    <Stack.Screen name="ScanMain">
      {() => (
        <LazyWrapper>
          <LazyScanScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
    <Stack.Screen name="Scanner">
      {() => (
        <LazyWrapper>
          <LazyScannerScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
    <Stack.Screen name="ScanHistory">
      {() => (
        <LazyWrapper>
          <LazyScanHistoryScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
    <Stack.Screen name="ScanDetail">
      {() => (
        <LazyWrapper>
          <LazyScanDetailScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
    <Stack.Screen name="SafeFoods">
      {() => (
        <LazyWrapper>
          <LazySafeFoodsScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
    <Stack.Screen name="GutProfile">
      {() => (
        <LazyWrapper>
          <LazyGutProfileScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
    <Stack.Screen name="Onboarding">
      {() => (
        <LazyWrapper>
          <LazyOnboardingScreen />
        </LazyWrapper>
      )}
    </Stack.Screen>
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    // Initialize accessibility service
    AccessibilityService.initialize();
  }, []);

  const handleTabPress = (routeName: string) => {
    HapticFeedback.navigation();
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.sm,
          height: 88,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...Platform.select({
            web: {
              boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
            },
            default: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.semiBold,
          fontSize: Typography.fontSize.bodySmall,
          marginTop: Spacing.xs,
          fontWeight: Typography.fontWeight.semiBold,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarItemStyle: {
          paddingVertical: Spacing.xs,
        },
      }}
      screenListeners={{
        tabPress: (e: any) => {
          const routeName = e.target?.split('-')[0];
          if (routeName) {
            handleTabPress(routeName);
          }
        },
      }}
    >
      <Tab.Screen
        name="Summary"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="heart" focused={focused} color={color} />
          ),
        }}
      >
        {() => (
          <LazyWrapper>
            <LazyDashboardScreen />
          </LazyWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Scan"
        component={ScanStack}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="camera" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Browse"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="grid" focused={focused} color={color} />
          ),
        }}
      >
        {() => (
          <LazyWrapper>
            <LazyBrowseScreen />
          </LazyWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Analytics"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="trend" focused={focused} color={color} />
          ),
        }}
      >
        {() => (
          <LazyWrapper>
            <LazyAnalyticsScreen />
          </LazyWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <NavigationContainer
      theme={{
        dark: false, // Force light mode for testing
        colors: {
          primary: colors.accent,
          background: '#FFFFFF', // Force white background
          card: '#FFFFFF',
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <MainTabs />
    </NavigationContainer>
  );
};
