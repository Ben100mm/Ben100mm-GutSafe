/**
 * @fileoverview AppContext.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

import type { ScanHistory, GutProfile } from '../types';
import { logger } from '../utils/logger';

// App State Interface
interface AppState {
  // Scan History
  scanHistory: ScanHistory[];
  selectedScans: Set<string>;
  isSelectionMode: boolean;

  // User Profile
  gutProfile: GutProfile | null;
  userSettings: any | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  networkStatus: {
    isOnline: boolean;
    quality: number;
  };
}

// Action Types
type AppAction =
  | { type: 'ADD_SCAN'; payload: ScanHistory }
  | { type: 'REMOVE_SCAN'; payload: string }
  | {
      type: 'UPDATE_SCAN';
      payload: { scanId: string; updates: Partial<ScanHistory> };
    }
  | { type: 'CLEAR_SCAN_HISTORY' }
  | { type: 'TOGGLE_SCAN_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_SCANS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTION_MODE'; payload: boolean }
  | { type: 'SET_GUT_PROFILE'; payload: GutProfile }
  | { type: 'UPDATE_GUT_PROFILE'; payload: Partial<GutProfile> }
  | { type: 'SET_USER_SETTINGS'; payload: any }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<any> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'SET_NETWORK_STATUS';
      payload: { isOnline: boolean; quality: number };
    }
  | { type: 'RESET' };

// Initial State
const initialState: AppState = {
  scanHistory: [],
  selectedScans: new Set<string>(),
  isSelectionMode: false,
  gutProfile: null,
  userSettings: null,
  isLoading: false,
  error: null,
  networkStatus: {
    isOnline: true,
    quality: 100,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_SCAN':
      return {
        ...state,
        scanHistory: [action.payload, ...state.scanHistory],
      };

    case 'REMOVE_SCAN':
      return {
        ...state,
        scanHistory: state.scanHistory.filter(
          (scan) => scan.id !== action.payload
        ),
        selectedScans: new Set(
          [...state.selectedScans].filter((id) => id !== action.payload)
        ),
      };

    case 'UPDATE_SCAN':
      return {
        ...state,
        scanHistory: state.scanHistory.map((scan) =>
          scan.id === action.payload.scanId
            ? { ...scan, ...action.payload.updates }
            : scan
        ),
      };

    case 'CLEAR_SCAN_HISTORY':
      return {
        ...state,
        scanHistory: [],
        selectedScans: new Set<string>(),
      };

    case 'TOGGLE_SCAN_SELECTION':
      const newSelected = new Set(state.selectedScans);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return {
        ...state,
        selectedScans: newSelected,
      };

    case 'SELECT_ALL_SCANS':
      return {
        ...state,
        selectedScans: new Set(state.scanHistory.map((scan) => scan.id)),
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedScans: new Set<string>(),
      };

    case 'SET_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: action.payload,
        selectedScans: action.payload ? state.selectedScans : new Set<string>(),
      };

    case 'SET_GUT_PROFILE':
      return {
        ...state,
        gutProfile: action.payload,
      };

    case 'UPDATE_GUT_PROFILE':
      return {
        ...state,
        gutProfile: state.gutProfile
          ? { ...state.gutProfile, ...action.payload, updatedAt: new Date() }
          : null,
      };

    case 'SET_USER_SETTINGS':
      return {
        ...state,
        userSettings: action.payload,
      };

    case 'UPDATE_USER_SETTINGS':
      return {
        ...state,
        userSettings: state.userSettings
          ? { ...state.userSettings, ...action.payload }
          : null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkStatus: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Props
interface AppProviderProps {
  children: ReactNode;
}

// Provider Component
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state from storage
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Load scan history from storage
        // This would load from actual storage in a real implementation
        const savedScanHistory = localStorage.getItem('gut_safe_scan_history');
        if (savedScanHistory) {
          const scanHistory = JSON.parse(savedScanHistory);
          scanHistory.forEach((scan: ScanHistory) => {
            dispatch({ type: 'ADD_SCAN', payload: scan });
          });
        }

        // Load gut profile from storage
        const savedGutProfile = localStorage.getItem('gut_safe_gut_profile');
        if (savedGutProfile) {
          const gutProfile = JSON.parse(savedGutProfile);
          dispatch({ type: 'SET_GUT_PROFILE', payload: gutProfile });
        }

        // Load user settings from storage
        const savedUserSettings = localStorage.getItem(
          'gut_safe_user_settings'
        );
        if (savedUserSettings) {
          const userSettings = JSON.parse(savedUserSettings);
          dispatch({ type: 'SET_USER_SETTINGS', payload: userSettings });
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        logger.info('App state initialized', 'AppContext');
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize app' });
        dispatch({ type: 'SET_LOADING', payload: false });
        logger.error('Failed to initialize app state', 'AppContext', error);
      }
    };

    initializeApp();
  }, []);

  // Save state to storage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        'gut_safe_scan_history',
        JSON.stringify(state.scanHistory)
      );
    } catch (error) {
      logger.error('Failed to save scan history', 'AppContext', error);
    }
  }, [state.scanHistory]);

  useEffect(() => {
    try {
      if (state.gutProfile) {
        localStorage.setItem(
          'gut_safe_gut_profile',
          JSON.stringify(state.gutProfile)
        );
      }
    } catch (error) {
      logger.error('Failed to save gut profile', 'AppContext', error);
    }
  }, [state.gutProfile]);

  useEffect(() => {
    try {
      if (state.userSettings) {
        localStorage.setItem(
          'gut_safe_user_settings',
          JSON.stringify(state.userSettings)
        );
      }
    } catch (error) {
      logger.error('Failed to save user settings', 'AppContext', error);
    }
  }, [state.userSettings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use app context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific state slices
export function useScanHistory() {
  const { state } = useApp();
  return state.scanHistory;
}

export function useSelectedScans() {
  const { state } = useApp();
  return state.selectedScans;
}

export function useIsSelectionMode() {
  const { state } = useApp();
  return state.isSelectionMode;
}

export function useGutProfile() {
  const { state } = useApp();
  return state.gutProfile;
}

export function useUserSettings() {
  const { state } = useApp();
  return state.userSettings;
}

export function useIsLoading() {
  const { state } = useApp();
  return state.isLoading;
}

export function useError() {
  const { state } = useApp();
  return state.error;
}

export function useNetworkStatus() {
  const { state } = useApp();
  return state.networkStatus;
}

// Action hooks
export function useScanActions() {
  const { dispatch } = useApp();

  return {
    addScan: (scan: ScanHistory) => {
      dispatch({ type: 'ADD_SCAN', payload: scan });
      logger.info('Scan added to history', 'AppContext', { scanId: scan.id });
    },
    removeScan: (scanId: string) => {
      dispatch({ type: 'REMOVE_SCAN', payload: scanId });
      logger.info('Scan removed from history', 'AppContext', { scanId });
    },
    updateScan: (scanId: string, updates: Partial<ScanHistory>) => {
      dispatch({ type: 'UPDATE_SCAN', payload: { scanId, updates } });
      logger.info('Scan updated in history', 'AppContext', { scanId, updates });
    },
    clearScanHistory: () => {
      dispatch({ type: 'CLEAR_SCAN_HISTORY' });
      logger.info('Scan history cleared', 'AppContext');
    },
  };
}

export function useSelectionActions() {
  const { dispatch } = useApp();

  return {
    toggleScanSelection: (scanId: string) => {
      dispatch({ type: 'TOGGLE_SCAN_SELECTION', payload: scanId });
    },
    selectAllScans: () => {
      dispatch({ type: 'SELECT_ALL_SCANS' });
    },
    clearSelection: () => {
      dispatch({ type: 'CLEAR_SELECTION' });
    },
    setSelectionMode: (enabled: boolean) => {
      dispatch({ type: 'SET_SELECTION_MODE', payload: enabled });
    },
  };
}

export function useProfileActions() {
  const { dispatch } = useApp();

  return {
    setGutProfile: (profile: GutProfile) => {
      dispatch({ type: 'SET_GUT_PROFILE', payload: profile });
      logger.info('Gut profile set', 'AppContext', { profileId: profile.id });
    },
    updateGutProfile: (updates: Partial<GutProfile>) => {
      dispatch({ type: 'UPDATE_GUT_PROFILE', payload: updates });
      logger.info('Gut profile updated', 'AppContext', { updates });
    },
  };
}

export function useSettingsActions() {
  const { dispatch } = useApp();

  return {
    setUserSettings: (settings: any) => {
      dispatch({ type: 'SET_USER_SETTINGS', payload: settings });
      logger.info('User settings set', 'AppContext');
    },
    updateUserSettings: (updates: Partial<any>) => {
      dispatch({ type: 'UPDATE_USER_SETTINGS', payload: updates });
      logger.info('User settings updated', 'AppContext', { updates });
    },
  };
}

export function useUIActions() {
  const { dispatch } = useApp();

  return {
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
      if (error) {
        logger.error('App error set', 'AppContext', { error });
      }
    },
    setNetworkStatus: (isOnline: boolean, quality: number) => {
      dispatch({ type: 'SET_NETWORK_STATUS', payload: { isOnline, quality } });
      logger.info('Network status updated', 'AppContext', {
        isOnline,
        quality,
      });
    },
  };
}

export default AppContext;
