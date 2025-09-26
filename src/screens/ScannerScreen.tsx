/**
 * @fileoverview ScannerScreen.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  useColorScheme,
  Modal,
  Platform,
} from 'react-native';

import { AnimatedButton } from '../components/AnimatedButton';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import LinearGradient from '../components/LinearGradientWrapper';
import { OfflineScanner } from '../components/OfflineScanner';
import { StatusIndicator } from '../components/StatusIndicator';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import DataService from '../services/DataService';
import NetworkService from '../services/NetworkService';
import OfflineService from '../services/OfflineService';
import type { ScanResult, ScanHistory } from '../types';
import AccessibilityService from '../utils/accessibility';
import { HapticFeedback } from '../utils/haptics';
import { cameraManager } from '../utils/cameraManager';
import { useMobileOptimizations } from '../hooks/useMobileOptimizations';

export const ScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { getAnimationConfig, shouldUseNativeDriver, trackPerformance } = useMobileOptimizations();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineScanner, setShowOfflineScanner] = useState(false);
  const [networkQuality, setNetworkQuality] = useState(0);

  const dataService = DataService.getInstance();
  const offlineService = OfflineService.getInstance();
  const networkService = NetworkService.getInstance();

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize accessibility
    AccessibilityService.initialize();

    // Initialize services
    dataService.initialize();
    offlineService.initialize();

    // Check network status
    const updateNetworkStatus = async () => {
      const online = networkService.isOnline();
      const quality = await networkService.getNetworkQuality();
      setIsOnline(online);
      setNetworkQuality(quality.score);
    };

    updateNetworkStatus();

    // Listen for network changes
    const handleNetworkChange = () => {
      updateNetworkStatus();
    };

    networkService.on('online', handleNetworkChange);
    networkService.on('offline', handleNetworkChange);

    // Get optimized animation config
    const animationConfig = getAnimationConfig();
    
    // Animate scanning line
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: animationConfig.duration * 6.67, // 2000ms equivalent
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: animationConfig.duration * 6.67,
          useNativeDriver: shouldUseNativeDriver,
        }),
      ])
    );
    scanAnimation.start();

    // Pulse animation for scan button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: animationConfig.duration * 3.33, // 1000ms equivalent
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: animationConfig.duration * 3.33,
          useNativeDriver: shouldUseNativeDriver,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      networkService.off('online', handleNetworkChange);
      networkService.off('offline', handleNetworkChange);
      scanAnimation.stop();
      pulseAnimation.stop();
    };
  }, [dataService, networkService, offlineService, pulseAnim, scanLineAnim]);

  useEffect(() => {
    const initializeCamera = async () => {
      const startTime = performance.now();
      
      try {
        const hasPermission = await cameraManager.requestPermissions();
        setHasPermission(hasPermission);
        
        if (hasPermission) {
          await cameraManager.startScanning();
        }
        
        const endTime = performance.now();
        trackPerformance('ScannerScreen', 'cameraInitialization', endTime - startTime);
      } catch (error) {
        console.error('Camera initialization failed:', error);
        setHasPermission(false);
      }
    };

    initializeCamera();

    return () => {
      cameraManager.cleanup();
    };
  }, [trackPerformance]);

  const requestCameraPermission = async () => {
    try {
      const hasPermission = await cameraManager.requestPermissions();
      setHasPermission(hasPermission);
      
      if (hasPermission) {
        await cameraManager.startScanning();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setHasPermission(false);
    }
  };

  // const generateMockAnalysis = (result: ScanResult, barcode: string): ScanAnalysis => {
  //   // Mock analysis function - commented out for now
  // };

  // const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
  //   // Mock barcode scanning function - commented out for now
  // };

  const handleOfflineScanComplete = (scan: ScanHistory) => {
    setShowOfflineScanner(false);
    setScanResult(scan.analysis.overallSafety);

    // Show result
    Alert.alert(
      'Offline Scan Complete',
      `Food: ${scan.foodItem.name}\nResult: ${scan.analysis.overallSafety.toUpperCase()}\n\nThis scan will be synced when online.`,
      [
        { text: 'OK', onPress: () => setScanned(false) },
        {
          text: 'View History',
          onPress: () => (navigation as any).navigate('ScanHistory'),
        },
      ]
    );
  };

  const resetScanner = () => {
    HapticFeedback.buttonPress();
    setScanned(false);
    setScanResult(null);

    // Reset animations with optimized config
    const animationConfig = getAnimationConfig();
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: animationConfig.duration,
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={Colors.primaryGradient}
          style={styles.gradientContainer}
        >
          <GlassmorphicCard style={styles.permissionCard}>
            <View style={styles.permissionIconContainer}>
              <Text style={styles.permissionIcon}>📷</Text>
            </View>
            <Text style={styles.permissionTitle}>
              Camera Permission Required
            </Text>
            <Text style={styles.permissionText}>
              GutSafe needs camera access to scan barcodes and menus for your
              gut health.
            </Text>
            <AnimatedButton
              size="large"
              style={styles.permissionButton}
              title="Grant Permission"
              variant="primary"
              onPress={requestCameraPermission}
            />
          </GlassmorphicCard>
        </LinearGradient>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={Colors.primaryGradient}
          style={styles.gradientContainer}
        >
          <GlassmorphicCard style={styles.permissionCard}>
            <View style={styles.permissionIconContainer}>
              <Text style={styles.permissionIcon}>❌</Text>
            </View>
            <Text style={styles.permissionTitle}>Camera Access Denied</Text>
            <Text style={styles.permissionText}>
              Please enable camera access in your device settings to use the
              scanner.
            </Text>
            <AnimatedButton
              size="large"
              style={styles.permissionButton}
              title="Try Again"
              variant="outline"
              onPress={requestCameraPermission}
            />
          </GlassmorphicCard>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.camera}>
        <View style={styles.overlay}>
          {/* Top overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.topOverlay}
          >
            <View style={styles.topHeader}>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.surface },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.overlayTitle}>Scan Barcode</Text>
            <Text style={styles.overlaySubtitle}>
              Point your camera at a barcode or menu item
            </Text>

            {/* Network Status */}
            <View style={styles.networkStatusContainer}>
              <Text style={styles.networkStatusText}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </Text>
              <Text style={styles.networkQualityText}>
                Quality: {networkQuality}%
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => (navigation as any).navigate('ScanHistory')}
              >
                <Text style={styles.historyButtonText}>View History</Text>
              </TouchableOpacity>

              {!isOnline && (
                <TouchableOpacity
                  style={styles.offlineButton}
                  onPress={() => setShowOfflineScanner(true)}
                >
                  <Text style={styles.offlineButtonText}>Offline Search</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Scanning frame */}
          <View style={styles.scanFrame}>
            <View style={styles.scanFrameCorner} />
            <View style={[styles.scanFrameCorner, styles.topRight]} />
            <View style={[styles.scanFrameCorner, styles.bottomLeft]} />
            <View style={[styles.scanFrameCorner, styles.bottomRight]} />

            {/* Animated scanning line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 200],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Bottom overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.bottomOverlay}
          >
            <View style={styles.scanButtonContainer}>
              <Animated.View
                style={{
                  transform: [
                    { scale: Animated.multiply(pulseAnim, scaleAnim) },
                    {
                      rotateY: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  disabled={!scanned}
                  style={styles.scanButton}
                  onPress={resetScanner}
                  {...AccessibilityService.createButtonConfig(
                    scanned ? 'Scan Again Button' : 'Scanning in Progress',
                    scanned
                      ? 'Start a new scan'
                      : 'Camera is ready to scan barcodes',
                    !scanned,
                    false
                  )}
                >
                  <LinearGradient
                    colors={
                      scanned
                        ? Colors.primaryGradient
                        : [Colors.body, Colors.body]
                    }
                    style={styles.scanButtonGradient}
                  >
                    <Animated.View
                      style={{
                        opacity: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.8],
                        }),
                      }}
                    >
                      <Text style={styles.scanButtonText}>
                        {scanned ? 'Scan Again' : 'Scanning...'}
                      </Text>
                    </Animated.View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Mock result for demo */}
      {scanResult && (
        <View style={styles.resultContainer}>
          <StatusIndicator
            result={scanResult}
            subtitle={
              scanResult === 'safe'
                ? 'This food appears safe for your gut health profile.'
                : 'This food may contain ingredients that could trigger symptoms.'
            }
            title={scanResult === 'safe' ? 'Safe to Eat' : 'Use Caution'}
          />
        </View>
      )}

      {/* Offline Scanner Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={showOfflineScanner}
        onRequestClose={() => setShowOfflineScanner(false)}
      >
        <OfflineScanner
          onClose={() => setShowOfflineScanner(false)}
          onScanComplete={handleOfflineScanComplete}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomLeft: {
    borderBottomLeftRadius: BorderRadius.sm,
    borderRightWidth: 0,
    borderTopWidth: 0,
    bottom: 0,
    left: 0,
  },
  bottomOverlay: {
    bottom: 0,
    left: 0,
    paddingBottom: 50,
    paddingHorizontal: Spacing.lg,
    position: 'absolute',
    right: 0,
  },
  bottomRight: {
    borderBottomRightRadius: BorderRadius.sm,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    bottom: 0,
    right: 0,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.body,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  gradientContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  historyButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
    textAlign: 'center',
  },
  networkQualityText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.caption,
    opacity: 0.8,
  },
  networkStatusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  networkStatusText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
  },
  offlineButton: {
    backgroundColor: 'rgba(255, 165, 0, 0.3)',
    borderColor: 'rgba(255, 165, 0, 0.5)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  offlineButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
  },
  overlaySubtitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.md,
    opacity: 0.9,
    textAlign: 'center',
  },
  overlayTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  permissionButton: {
    minWidth: 200,
  },
  permissionCard: {
    alignItems: 'center',
    margin: Spacing.lg,
    padding: Spacing.xl,
  },
  permissionIcon: {
    fontSize: 32,
  },
  permissionIconContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    width: 80,
  },
  permissionText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.lg,
    opacity: 0.8,
    textAlign: 'center',
  },
  permissionTitle: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  resultContainer: {
    bottom: 200,
    left: Spacing.lg,
    position: 'absolute',
    right: Spacing.lg,
  },
  scanButton: {
    borderRadius: 60,
    height: 120,
    overflow: 'hidden',
    width: 120,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: `0 8px 16px ${Colors.primary}4D`,
        }
      : {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }),
  },
  scanButtonContainer: {
    alignItems: 'center',
  },
  scanButtonGradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scanButtonIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  scanButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.bodySmall,
    textAlign: 'center',
  },
  scanFrame: {
    height: 200,
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
    position: 'absolute',
    top: '50%',
    width: 200,
  },
  scanFrameCorner: {
    borderColor: Colors.primary,
    borderWidth: 3,
    height: 30,
    position: 'absolute',
    width: 30,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: `0 0 4px ${Colors.primary}80`,
        }
      : {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 4,
        }),
  },
  scanLine: {
    backgroundColor: Colors.primary,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: `0 0 4px ${Colors.primary}`,
        }
      : {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 4,
        }),
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.lg,
  },
  topOverlay: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  topRight: {
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: BorderRadius.sm,
    right: 0,
    top: 0,
  },
});
