/**
 * @fileoverview AppNavigator.tsx - Simplified Navigation Structure
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import { useColorScheme, Platform, Linking } from 'react-native';

import { LazyWrapper } from '../components/LazyWrapper';
import { TabIcon } from '../components/TabIcon';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
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
import AccessibilityService from '../utils/accessibility';
import { HapticFeedback } from '../utils/haptics';
import { linkingConfig, DeepLinkHandler } from './linking';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Simplified Main Stack Navigator
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.light.background },
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen 
      name="Scanner" 
      options={{ presentation: 'modal' }}
    >
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

// Simplified Main Tab Navigator
const MainTabs = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  useEffect(() => {
    // Initialize accessibility service
    AccessibilityService.initialize();
  }, []);

  const handleTabPress = (_routeName: string) => {
    HapticFeedback.navigation();
  };

  return (
    <Tab.Navigator
      screenListeners={{
        tabPress: (e: any) => {
          const routeName = e.target?.split('-')[0];
          if (routeName) {
            handleTabPress(routeName);
          }
        },
      }}
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
    >
      <Tab.Screen
        name="Summary"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon color={color} focused={focused} name="heart" />
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
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon color={color} focused={focused} name="camera" />
          ),
        }}
      >
        {() => (
          <LazyWrapper>
            <LazyScanScreen />
          </LazyWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Browse"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon color={color} focused={focused} name="grid" />
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
            <TabIcon color={color} focused={focused} name="trend" />
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

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (DeepLinkHandler.isValidDeepLink(url)) {
        // Navigation will be handled by the linking configuration
        console.log('Deep link received:', url);
      }
    };

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Handle initial deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <NavigationContainer
      linking={linkingConfig}
      theme={{
        dark: isDark,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      }}
    >
      <MainStack />
    </NavigationContainer>
  );
};
