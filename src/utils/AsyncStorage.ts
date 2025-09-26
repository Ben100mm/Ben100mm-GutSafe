/**
 * @fileoverview AsyncStorage.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Universal AsyncStorage implementation
// Automatically uses the correct implementation based on platform

import { Platform } from 'react-native';

// Web implementation
const webAsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage.getItem failed:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage.setItem failed:', error);
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage.removeItem failed:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('AsyncStorage.clear failed:', error);
      throw error;
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('AsyncStorage.getAllKeys failed:', error);
      return [];
    }
  },

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return keys.map((key) => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.warn('AsyncStorage.multiGet failed:', error);
      return keys.map((key) => [key, null]);
    }
  },

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.warn('AsyncStorage.multiSet failed:', error);
      throw error;
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('AsyncStorage.multiRemove failed:', error);
      throw error;
    }
  },
};

// Native implementation
let nativeAsyncStorage: any = null;

if (Platform.OS !== 'web') {
  try {
    nativeAsyncStorage =
      require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('Failed to load native AsyncStorage:', error);
  }
}

// Export the appropriate implementation
const AsyncStorage =
  Platform.OS === 'web' ? webAsyncStorage : nativeAsyncStorage;

export default AsyncStorage;
