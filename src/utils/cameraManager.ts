/**
 * @fileoverview cameraManager.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, Alert } from 'react-native';
import { Camera } from 'expo-camera';

interface CameraConfig {
  quality: number;
  flashMode: 'on' | 'off' | 'auto';
  focusMode: 'on' | 'off';
  whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'fluorescent' | 'incandescent';
  zoom: number;
  enableAutoFocus: boolean;
  enableFlash: boolean;
}

interface BarcodeScanResult {
  type: string;
  data: string;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

class CameraManager {
  private static instance: CameraManager;
  private cameraRef: any = null;
  private isScanning = false;
  private config: CameraConfig = {
    quality: 0.8,
    flashMode: 'off',
    focusMode: 'on',
    whiteBalance: 'auto',
    zoom: 0,
    enableAutoFocus: true,
    enableFlash: false,
  };

  private constructor() {}

  public static getInstance(): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance;
  }

  public setCameraRef(ref: any): void {
    this.cameraRef = ref;
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }

      const { status } = await Camera.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return false;
    }
  }

  public async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        const result = await navigator.permissions.query({ name: 'camera' });
        return result.state === 'granted';
      }

      const { status } = await Camera.getCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Camera permission check failed:', error);
      return false;
    }
  }

  public async startScanning(): Promise<void> {
    if (this.isScanning) return;

    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to use the scanner.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    this.isScanning = true;
  }

  public stopScanning(): void {
    this.isScanning = false;
  }

  public async capturePhoto(): Promise<string | null> {
    if (!this.cameraRef) {
      console.error('Camera ref not set');
      return null;
    }

    try {
      if (Platform.OS === 'web') {
        // Web implementation - capture from video element
        const video = this.cameraRef.querySelector('video');
        if (!video) return null;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0);
        
        return canvas.toDataURL('image/jpeg', this.config.quality);
      }

      const photo = await this.cameraRef.takePictureAsync({
        quality: this.config.quality,
        base64: false,
        skipProcessing: false,
      });

      return photo.uri;
    } catch (error) {
      console.error('Photo capture failed:', error);
      return null;
    }
  }

  public async focusCamera(point?: { x: number; y: number }): Promise<void> {
    if (!this.cameraRef || Platform.OS === 'web') return;

    try {
      if (point) {
        await this.cameraRef.focusAsync(point);
      } else {
        await this.cameraRef.autoFocusAsync();
      }
    } catch (error) {
      console.error('Camera focus failed:', error);
    }
  }

  public async setFlashMode(mode: 'on' | 'off' | 'auto'): Promise<void> {
    if (!this.cameraRef || Platform.OS === 'web') return;

    try {
      await this.cameraRef.setFlashModeAsync(mode);
      this.config.flashMode = mode;
    } catch (error) {
      console.error('Flash mode change failed:', error);
    }
  }

  public async setZoom(zoom: number): Promise<void> {
    if (!this.cameraRef || Platform.OS === 'web') return;

    try {
      await this.cameraRef.setZoomAsync(zoom);
      this.config.zoom = zoom;
    } catch (error) {
      console.error('Zoom change failed:', error);
    }
  }

  public async setWhiteBalance(balance: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'fluorescent' | 'incandescent'): Promise<void> {
    if (!this.cameraRef || Platform.OS === 'web') return;

    try {
      await this.cameraRef.setWhiteBalanceAsync(balance);
      this.config.whiteBalance = balance;
    } catch (error) {
      console.error('White balance change failed:', error);
    }
  }

  public handleBarcodeScanned = (result: BarcodeScanResult): void => {
    if (!this.isScanning) return;

    // Stop scanning after successful scan
    this.stopScanning();

    // Process the barcode result
    console.log('Barcode scanned:', result);
    
    // You can emit events or call callbacks here
    // For example: EventEmitter.emit('barcodeScanned', result);
  };

  public getConfig(): CameraConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<CameraConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public isScanningActive(): boolean {
    return this.isScanning;
  }

  // Web-specific methods
  public async initializeWebCamera(): Promise<boolean> {
    if (Platform.OS !== 'web') return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      return true;
    } catch (error) {
      console.error('Web camera initialization failed:', error);
      return false;
    }
  }

  public cleanup(): void {
    this.stopScanning();
    this.cameraRef = null;
  }
}

export const cameraManager = CameraManager.getInstance();

// Utility functions
export const requestCameraPermission = () => cameraManager.requestPermissions();
export const checkCameraPermission = () => cameraManager.checkPermissions();
export const startCameraScanning = () => cameraManager.startScanning();
export const stopCameraScanning = () => cameraManager.stopScanning();
export const capturePhoto = () => cameraManager.capturePhoto();
export const focusCamera = (point?: { x: number; y: number }) => cameraManager.focusCamera(point);
export const setFlashMode = (mode: 'on' | 'off' | 'auto') => cameraManager.setFlashMode(mode);
export const setCameraZoom = (zoom: number) => cameraManager.setZoom(zoom);
export const setWhiteBalance = (balance: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'fluorescent' | 'incandescent') => 
  cameraManager.setWhiteBalance(balance);

export default CameraManager;
