import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme, Animated } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { HapticFeedback } from '../utils/haptics';
import AccessibilityService from '../utils/accessibility';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { BrowseScreen } from '../screens/BrowseScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { ScanHistoryScreen } from '../screens/ScanHistoryScreen';
import { ScanDetailScreen } from '../screens/ScanDetailScreen';
import { SafeFoodsScreen } from '../screens/SafeFoodsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import { GutProfileScreen } from '../screens/GutProfileScreen';

// Tab Icons
import { TabIcon } from '../components/TabIcon';

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
    <Stack.Screen name="ScanMain" component={ScanScreen} />
    <Stack.Screen name="Scanner" component={ScannerScreen} />
    <Stack.Screen name="ScanHistory" component={ScanHistoryScreen} />
    <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
    <Stack.Screen name="SafeFoods" component={SafeFoodsScreen} />
    <Stack.Screen name="GutProfile" component={GutProfileScreen} />
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
          ...(isDark ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          } : {}),
        },
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.medium,
          fontSize: Typography.fontSize.caption,
          marginTop: Spacing.xs,
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
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="heart" focused={focused} color={color} />
          ),
        }}
      />
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
        component={BrowseScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="grid" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="trend" focused={focused} color={color} />
          ),
        }}
      />
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
      <MainTabs />
    </NavigationContainer>
  );
};
