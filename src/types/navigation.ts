/**
 * @fileoverview navigation.ts - Navigation Type Definitions
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Root Stack Navigator Types
export type RootStackParamList = {
  MainTabs: undefined;
  Scanner: {
    barcode?: string;
    mode?: 'scan' | 'manual';
  };
  ScanHistory: {
    date?: Date;
    status?: 'safe' | 'caution' | 'avoid';
  };
  ScanDetail: {
    scanId: string;
  };
  SafeFoods: {
    category?: string;
    search?: string;
  };
  GutProfile: {
    section?: 'overview' | 'symptoms' | 'medications' | 'preferences';
  };
  Onboarding: {
    step?: number;
  };
};

// Tab Navigator Types
export type MainTabParamList = {
  Summary: {
    date?: Date;
  };
  Scan: {
    barcode?: string;
  };
  Browse: {
    search?: string;
    category?: string;
    filter?: string;
  };
  Analytics: {
    startDate?: Date;
    endDate?: Date;
    period?: 'day' | 'week' | 'month' | 'year';
  };
};

// Navigation Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any; // Will be properly typed with React Navigation
  route: {
    params: RootStackParamList[T];
  };
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: any; // Will be properly typed with React Navigation
  route: {
    params: MainTabParamList[T];
  };
};

// Deep Link Types
export interface DeepLinkParams {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface DeepLinkConfig {
  path: string;
  params?: DeepLinkParams;
}

// Navigation State Types
export interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  params?: Record<string, any>;
  history: string[];
}

// Navigation Actions
export type NavigationAction = 
  | { type: 'NAVIGATE'; payload: { route: string; params?: any } }
  | { type: 'GO_BACK' }
  | { type: 'RESET'; payload: { route: string; params?: any } }
  | { type: 'REPLACE'; payload: { route: string; params?: any } };

// Navigation Context Types
export interface NavigationContextType {
  state: NavigationState;
  dispatch: (action: NavigationAction) => void;
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  reset: (route: string, params?: any) => void;
  replace: (route: string, params?: any) => void;
  canGoBack: () => boolean;
  getCurrentRoute: () => string;
  getCurrentParams: () => Record<string, any>;
}

// Route Configuration Types
export interface RouteConfig {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  options?: {
    title?: string;
    headerShown?: boolean;
    presentation?: 'card' | 'modal' | 'transparentModal';
    gestureEnabled?: boolean;
  };
  params?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date';
      required?: boolean;
      default?: any;
    };
  };
}

// Tab Configuration Types
export interface TabConfig {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  icon: {
    name: string;
    type?: 'ionicon' | 'material' | 'custom';
  };
  label: string;
  options?: {
    badge?: string | number;
    badgeColor?: string;
  };
}

// Navigation Options Types
export interface NavigationOptions {
  headerShown?: boolean;
  headerTitle?: string;
  headerStyle?: {
    backgroundColor?: string;
    elevation?: number;
    shadowOpacity?: number;
  };
  headerTintColor?: string;
  headerTitleStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  tabBarStyle?: {
    backgroundColor?: string;
    borderTopColor?: string;
    borderTopWidth?: number;
    height?: number;
  };
  tabBarLabelStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
  };
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
}

// Screen Props with Navigation
export interface ScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}

// Navigation Events
export interface NavigationEvent {
  type: 'focus' | 'blur' | 'beforeRemove' | 'state';
  target?: string;
  data?: any;
}

// Navigation Listener
export type NavigationListener = (event: NavigationEvent) => void;

// Navigation Hook Types
export interface UseNavigationReturn {
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  reset: (route: string, params?: any) => void;
  replace: (route: string, params?: any) => void;
  canGoBack: () => boolean;
  getCurrentRoute: () => string;
  getCurrentParams: () => Record<string, any>;
  addListener: (event: string, listener: NavigationListener) => () => void;
}

// Deep Link Event Types
export interface DeepLinkEvent {
  url: string;
  timestamp: number;
  source: 'initial' | 'foreground' | 'background';
}

// Deep Link Handler Types
export type DeepLinkHandler = (url: string, navigation: any) => void;

// Navigation Analytics Types
export interface NavigationAnalytics {
  screenName: string;
  timestamp: number;
  duration?: number;
  params?: Record<string, any>;
  source?: string;
}

// Navigation Performance Types
export interface NavigationPerformance {
  screenName: string;
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export default {
  RootStackParamList,
  MainTabParamList,
  RootStackScreenProps,
  MainTabScreenProps,
  DeepLinkParams,
  DeepLinkConfig,
  NavigationState,
  NavigationAction,
  NavigationContextType,
  RouteConfig,
  TabConfig,
  NavigationOptions,
  ScreenProps,
  NavigationEvent,
  NavigationListener,
  UseNavigationReturn,
  DeepLinkEvent,
  DeepLinkHandler,
  NavigationAnalytics,
  NavigationPerformance,
};
