/**
 * @fileoverview appStore.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ScanHistory, ScanResult, GutProfile } from '../types';
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
  
  // Actions
  addScan: (scan: ScanHistory) => void;
  removeScan: (scanId: string) => void;
  updateScan: (scanId: string, updates: Partial<ScanHistory>) => void;
  clearScanHistory: () => void;
  
  // Selection Actions
  toggleScanSelection: (scanId: string) => void;
  selectAllScans: () => void;
  clearSelection: () => void;
  setSelectionMode: (enabled: boolean) => void;
  
  // Profile Actions
  setGutProfile: (profile: GutProfile) => void;
  updateGutProfile: (updates: Partial<GutProfile>) => void;
  
  // Settings Actions
  setUserSettings: (settings: any) => void;
  updateUserSettings: (updates: Partial<any>) => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNetworkStatus: (isOnline: boolean, quality: number) => void;
  
  // Utility Actions
  reset: () => void;
}

// Initial State
const initialState = {
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

// Create Store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Scan History Actions
        addScan: (scan: ScanHistory) => {
          set((state) => {
            const newHistory = [scan, ...state.scanHistory];
            logger.info('Scan added to history', 'AppStore', { scanId: scan.id });
            return { scanHistory: newHistory };
          });
        },

        removeScan: (scanId: string) => {
          set((state) => {
            const newHistory = state.scanHistory.filter(scan => scan.id !== scanId);
            const newSelected = new Set(state.selectedScans);
            newSelected.delete(scanId);
            logger.info('Scan removed from history', 'AppStore', { scanId });
            return { 
              scanHistory: newHistory,
              selectedScans: newSelected
            };
          });
        },

        updateScan: (scanId: string, updates: Partial<ScanHistory>) => {
          set((state) => {
            const newHistory = state.scanHistory.map(scan =>
              scan.id === scanId ? { ...scan, ...updates } : scan
            );
            logger.info('Scan updated in history', 'AppStore', { scanId, updates });
            return { scanHistory: newHistory };
          });
        },

        clearScanHistory: () => {
          set(() => {
            logger.info('Scan history cleared', 'AppStore');
            return { 
              scanHistory: [],
              selectedScans: new Set<string>()
            };
          });
        },

        // Selection Actions
        toggleScanSelection: (scanId: string) => {
          set((state) => {
            const newSelected = new Set(state.selectedScans);
            if (newSelected.has(scanId)) {
              newSelected.delete(scanId);
            } else {
              newSelected.add(scanId);
            }
            return { selectedScans: newSelected };
          });
        },

        selectAllScans: () => {
          set((state) => {
            const allScanIds = new Set(state.scanHistory.map(scan => scan.id));
            return { selectedScans: allScanIds };
          });
        },

        clearSelection: () => {
          set(() => ({ selectedScans: new Set<string>() }));
        },

        setSelectionMode: (enabled: boolean) => {
          set(() => {
            if (!enabled) {
              return { 
                isSelectionMode: enabled,
                selectedScans: new Set<string>()
              };
            }
            return { isSelectionMode: enabled };
          });
        },

        // Profile Actions
        setGutProfile: (profile: GutProfile) => {
          set(() => {
            logger.info('Gut profile set', 'AppStore', { profileId: profile.id });
            return { gutProfile: profile };
          });
        },

        updateGutProfile: (updates: Partial<GutProfile>) => {
          set((state) => {
            if (!state.gutProfile) return state;
            const updatedProfile = { ...state.gutProfile, ...updates, updatedAt: new Date() };
            logger.info('Gut profile updated', 'AppStore', { updates });
            return { gutProfile: updatedProfile };
          });
        },

        // Settings Actions
        setUserSettings: (settings: any) => {
          set(() => {
            logger.info('User settings set', 'AppStore');
            return { userSettings: settings };
          });
        },

        updateUserSettings: (updates: Partial<any>) => {
          set((state) => {
            if (!state.userSettings) return state;
            const updatedSettings = { ...state.userSettings, ...updates };
            logger.info('User settings updated', 'AppStore', { updates });
            return { userSettings: updatedSettings };
          });
        },

        // UI Actions
        setLoading: (loading: boolean) => {
          set(() => ({ isLoading: loading }));
        },

        setError: (error: string | null) => {
          set(() => {
            if (error) {
              logger.error('App error set', 'AppStore', { error });
            }
            return { error };
          });
        },

        setNetworkStatus: (isOnline: boolean, quality: number) => {
          set(() => {
            logger.info('Network status updated', 'AppStore', { isOnline, quality });
            return { 
              networkStatus: { isOnline, quality }
            };
          });
        },

        // Utility Actions
        reset: () => {
          set(() => {
            logger.info('App store reset', 'AppStore');
            return { ...initialState };
          });
        },
      }),
      {
        name: 'gutsafe-app-store',
        partialize: (state) => ({
          scanHistory: state.scanHistory,
          gutProfile: state.gutProfile,
          userSettings: state.userSettings,
        }),
      }
    ),
    {
      name: 'gutsafe-app-store',
    }
  )
);

// Selectors for common use cases
export const useScanHistory = () => useAppStore((state) => state.scanHistory);
export const useSelectedScans = () => useAppStore((state) => state.selectedScans);
export const useIsSelectionMode = () => useAppStore((state) => state.isSelectionMode);
export const useGutProfile = () => useAppStore((state) => state.gutProfile);
export const useUserSettings = () => useAppStore((state) => state.userSettings);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useNetworkStatus = () => useAppStore((state) => state.networkStatus);

// Action selectors
export const useScanActions = () => useAppStore((state) => ({
  addScan: state.addScan,
  removeScan: state.removeScan,
  updateScan: state.updateScan,
  clearScanHistory: state.clearScanHistory,
}));

export const useSelectionActions = () => useAppStore((state) => ({
  toggleScanSelection: state.toggleScanSelection,
  selectAllScans: state.selectAllScans,
  clearSelection: state.clearSelection,
  setSelectionMode: state.setSelectionMode,
}));

export const useProfileActions = () => useAppStore((state) => ({
  setGutProfile: state.setGutProfile,
  updateGutProfile: state.updateGutProfile,
}));

export const useSettingsActions = () => useAppStore((state) => ({
  setUserSettings: state.setUserSettings,
  updateUserSettings: state.updateUserSettings,
}));

export const useUIActions = () => useAppStore((state) => ({
  setLoading: state.setLoading,
  setError: state.setError,
  setNetworkStatus: state.setNetworkStatus,
}));
