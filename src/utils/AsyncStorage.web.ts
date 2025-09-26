/**
 * @fileoverview AsyncStorage.web.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

// Web-compatible AsyncStorage implementation
// This provides a localStorage-based implementation for web environments

interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<[string, string | null][]>;
  multiSet(keyValuePairs: [string, string][]): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

class WebAsyncStorage implements AsyncStorageInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage.getItem failed:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage.setItem failed:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage.removeItem failed:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('AsyncStorage.clear failed:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('AsyncStorage.getAllKeys failed:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return keys.map((key) => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.warn('AsyncStorage.multiGet failed:', error);
      return keys.map((key) => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.warn('AsyncStorage.multiSet failed:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('AsyncStorage.multiRemove failed:', error);
      throw error;
    }
  }
}

const AsyncStorage = new WebAsyncStorage();
export default AsyncStorage;
