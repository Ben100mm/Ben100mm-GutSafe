/**
 * @fileoverview permissionManager.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { Camera } from 'expo-camera';

export type PermissionType = 'camera' | 'location' | 'notifications' | 'storage' | 'microphone';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'restricted';

interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  reason?: string;
}

interface PermissionConfig {
  title: string;
  message: string;
  buttonPositive: string;
  buttonNegative: string;
  buttonNeutral?: string;
}

class PermissionManager {
  private static instance: PermissionManager;
  private permissionConfigs: Record<PermissionType, PermissionConfig> = {
    camera: {
      title: 'Camera Permission',
      message: 'GutSafe needs camera access to scan barcodes and analyze food items for your gut health.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
    location: {
      title: 'Location Permission',
      message: 'GutSafe needs location access to provide location-based food recommendations and track your eating patterns.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
    notifications: {
      title: 'Notification Permission',
      message: 'GutSafe needs notification access to remind you about meal times and provide important gut health updates.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
    storage: {
      title: 'Storage Permission',
      message: 'GutSafe needs storage access to save your scan history and preferences locally on your device.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
    microphone: {
      title: 'Microphone Permission',
      message: 'GutSafe needs microphone access for voice commands and audio feedback features.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  };

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  public async requestPermission(permission: PermissionType): Promise<PermissionResult> {
    try {
      switch (permission) {
        case 'camera':
          return await this.requestCameraPermission();
        case 'location':
          return await this.requestLocationPermission();
        case 'notifications':
          return await this.requestNotificationPermission();
        case 'storage':
          return await this.requestStoragePermission();
        case 'microphone':
          return await this.requestMicrophonePermission();
        default:
          return { status: 'denied', canAskAgain: false, reason: 'Unknown permission type' };
      }
    } catch (error) {
      console.error(`Permission request failed for ${permission}:`, error);
      return { status: 'denied', canAskAgain: false, reason: error.message };
    }
  }

  public async checkPermission(permission: PermissionType): Promise<PermissionResult> {
    try {
      switch (permission) {
        case 'camera':
          return await this.checkCameraPermission();
        case 'location':
          return await this.checkLocationPermission();
        case 'notifications':
          return await this.checkNotificationPermission();
        case 'storage':
          return await this.checkStoragePermission();
        case 'microphone':
          return await this.checkMicrophonePermission();
        default:
          return { status: 'denied', canAskAgain: false, reason: 'Unknown permission type' };
      }
    } catch (error) {
      console.error(`Permission check failed for ${permission}:`, error);
      return { status: 'denied', canAskAgain: false, reason: error.message };
    }
  }

  private async requestCameraPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return { status: 'granted', canAskAgain: true };
      } catch (error) {
        return { status: 'denied', canAskAgain: true, reason: 'Camera access denied' };
      }
    }

    try {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      return {
        status: status === 'granted' ? 'granted' : 'denied',
        canAskAgain: canAskAgain ?? true,
      };
    } catch (error) {
      return { status: 'denied', canAskAgain: false, reason: error.message };
    }
  }

  private async checkCameraPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        return {
          status: result.state === 'granted' ? 'granted' : 'denied',
          canAskAgain: true,
        };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    try {
      const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
      return {
        status: status === 'granted' ? 'granted' : 'denied',
        canAskAgain: canAskAgain ?? true,
      };
    } catch (error) {
      return { status: 'undetermined', canAskAgain: true };
    }
  }

  private async requestLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          return { status: 'granted', canAskAgain: true };
        }
        return { status: 'denied', canAskAgain: true };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: this.permissionConfigs.location.title,
            message: this.permissionConfigs.location.message,
            buttonPositive: this.permissionConfigs.location.buttonPositive,
            buttonNegative: this.permissionConfigs.location.buttonNegative,
          }
        );
        return {
          status: granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
          canAskAgain: granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        };
      } catch (error) {
        return { status: 'denied', canAskAgain: false, reason: error.message };
      }
    }

    // iOS location permission is handled through Info.plist
    return { status: 'granted', canAskAgain: true };
  }

  private async checkLocationPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return {
          status: result.state === 'granted' ? 'granted' : 'denied',
          canAskAgain: true,
        };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return { status: granted ? 'granted' : 'denied', canAskAgain: true };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    return { status: 'granted', canAskAgain: true };
  }

  private async requestNotificationPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const result = await Notification.requestPermission();
        return {
          status: result === 'granted' ? 'granted' : 'denied',
          canAskAgain: true,
        };
      } catch (error) {
        return { status: 'denied', canAskAgain: true };
      }
    }

    // For React Native, notification permissions are typically handled by the app
    return { status: 'granted', canAskAgain: true };
  }

  private async checkNotificationPermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const result = Notification.permission;
        return {
          status: result === 'granted' ? 'granted' : 'denied',
          canAskAgain: true,
        };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    return { status: 'granted', canAskAgain: true };
  }

  private async requestStoragePermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      // Web doesn't need explicit storage permission
      return { status: 'granted', canAskAgain: true };
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: this.permissionConfigs.storage.title,
            message: this.permissionConfigs.storage.message,
            buttonPositive: this.permissionConfigs.storage.buttonPositive,
            buttonNegative: this.permissionConfigs.storage.buttonNegative,
          }
        );
        return {
          status: granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
          canAskAgain: granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        };
      } catch (error) {
        return { status: 'denied', canAskAgain: false, reason: error.message };
      }
    }

    return { status: 'granted', canAskAgain: true };
  }

  private async checkStoragePermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      return { status: 'granted', canAskAgain: true };
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        return { status: granted ? 'granted' : 'denied', canAskAgain: true };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    return { status: 'granted', canAskAgain: true };
  }

  private async requestMicrophonePermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return { status: 'granted', canAskAgain: true };
      } catch (error) {
        return { status: 'denied', canAskAgain: true, reason: 'Microphone access denied' };
      }
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: this.permissionConfigs.microphone.title,
            message: this.permissionConfigs.microphone.message,
            buttonPositive: this.permissionConfigs.microphone.buttonPositive,
            buttonNegative: this.permissionConfigs.microphone.buttonNegative,
          }
        );
        return {
          status: granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
          canAskAgain: granted !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
        };
      } catch (error) {
        return { status: 'denied', canAskAgain: false, reason: error.message };
      }
    }

    return { status: 'granted', canAskAgain: true };
  }

  private async checkMicrophonePermission(): Promise<PermissionResult> {
    if (Platform.OS === 'web') {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        return {
          status: result.state === 'granted' ? 'granted' : 'denied',
          canAskAgain: true,
        };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        return { status: granted ? 'granted' : 'denied', canAskAgain: true };
      } catch (error) {
        return { status: 'undetermined', canAskAgain: true };
      }
    }

    return { status: 'granted', canAskAgain: true };
  }

  public showPermissionAlert(permission: PermissionType, onGranted?: () => void, onDenied?: () => void): void {
    const config = this.permissionConfigs[permission];
    
    Alert.alert(
      config.title,
      config.message,
      [
        {
          text: config.buttonNegative,
          style: 'cancel',
          onPress: onDenied,
        },
        {
          text: config.buttonPositive,
          onPress: onGranted,
        },
      ],
      { cancelable: false }
    );
  }

  public showSettingsAlert(permission: PermissionType): void {
    const config = this.permissionConfigs[permission];
    
    Alert.alert(
      `${config.title} Required`,
      `Please enable ${permission} permission in your device settings to use this feature.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  }

  public updatePermissionConfig(permission: PermissionType, config: Partial<PermissionConfig>): void {
    this.permissionConfigs[permission] = { ...this.permissionConfigs[permission], ...config };
  }

  public getAllPermissionConfigs(): Record<PermissionType, PermissionConfig> {
    return { ...this.permissionConfigs };
  }
}

export const permissionManager = PermissionManager.getInstance();

// Utility functions
export const requestPermission = (permission: PermissionType) => 
  permissionManager.requestPermission(permission);

export const checkPermission = (permission: PermissionType) => 
  permissionManager.checkPermission(permission);

export const showPermissionAlert = (permission: PermissionType, onGranted?: () => void, onDenied?: () => void) => 
  permissionManager.showPermissionAlert(permission, onGranted, onDenied);

export const showSettingsAlert = (permission: PermissionType) => 
  permissionManager.showSettingsAlert(permission);

export default PermissionManager;
