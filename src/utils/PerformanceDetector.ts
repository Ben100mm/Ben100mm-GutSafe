/**
 * @fileoverview PerformanceDetector.ts
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, Dimensions } from 'react-native';

interface PerformanceMetrics {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

class PerformanceDetector {
  private static instance: PerformanceDetector;
  private performanceMode: 'high' | 'medium' | 'low' = 'medium';
  private metrics: PerformanceMetrics = {};

  static getInstance(): PerformanceDetector {
    if (!PerformanceDetector.instance) {
      PerformanceDetector.instance = new PerformanceDetector();
    }
    return PerformanceDetector.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.detectPerformanceMode();
    } catch (error) {
      console.warn('Performance detection failed, using medium mode:', error);
      this.performanceMode = 'medium';
    }
  }

  private async detectPerformanceMode(): Promise<void> {
    const { width, height } = Dimensions.get('window');
    const screenSize = width * height;
    
    // Basic device detection
    const isLowEndDevice = this.isLowEndDevice(screenSize);
    const isSlowConnection = await this.isSlowConnection();
    const isWebGLSupported = await this.isWebGLSupported();

    // Determine performance mode
    if (isLowEndDevice || isSlowConnection || !isWebGLSupported) {
      this.performanceMode = 'low';
    } else if (screenSize < 2000000 || isSlowConnection) {
      this.performanceMode = 'medium';
    } else {
      this.performanceMode = 'high';
    }

    console.log('Performance mode detected:', this.performanceMode);
  }

  private isLowEndDevice(screenSize: number): boolean {
    // Basic heuristics for low-end devices
    return screenSize < 1000000; // Very small screens
  }

  private async isSlowConnection(): Promise<boolean> {
    if (Platform.OS === 'web') {
      try {
        // @ts-ignore - navigator.connection is not in TypeScript definitions
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          this.metrics.connectionType = connection.type;
          this.metrics.effectiveType = connection.effectiveType;
          this.metrics.downlink = connection.downlink;
          this.metrics.rtt = connection.rtt;

          // Consider slow if effectiveType is 2g or 3g, or downlink is very low
          return connection.effectiveType === '2g' || 
                 connection.effectiveType === '3g' ||
                 (connection.downlink && connection.downlink < 1);
        }
      } catch (error) {
        console.warn('Connection detection failed:', error);
      }
    }
    
    return false;
  }

  private async isWebGLSupported(): Promise<boolean> {
    if (Platform.OS === 'web') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (error) {
        return false;
      }
    }
    
    // Assume WebGL is supported on native platforms
    return true;
  }

  getPerformanceMode(): 'high' | 'medium' | 'low' {
    return this.performanceMode;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  shouldEnable3D(): boolean {
    return this.performanceMode === 'high';
  }

  shouldEnableParticles(): boolean {
    return this.performanceMode === 'high' || this.performanceMode === 'medium';
  }

  shouldEnableAnimations(): boolean {
    return this.performanceMode !== 'low';
  }

  getAnimationDuration(baseDuration: number): number {
    switch (this.performanceMode) {
      case 'high':
        return baseDuration;
      case 'medium':
        return baseDuration * 0.8;
      case 'low':
        return baseDuration * 0.6;
      default:
        return baseDuration;
    }
  }

  getParticleCount(maxCount: number): number {
    switch (this.performanceMode) {
      case 'high':
        return maxCount;
      case 'medium':
        return Math.floor(maxCount * 0.6);
      case 'low':
        return Math.floor(maxCount * 0.3);
      default:
        return Math.floor(maxCount * 0.6);
    }
  }
}

export default PerformanceDetector;
