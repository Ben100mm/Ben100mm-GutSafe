import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
  useColorScheme,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';
import { AnimatedButton } from '../components/AnimatedButton';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import { StatusIndicator } from '../components/StatusIndicator';
import { HapticFeedback, HapticType } from '../utils/haptics';
import { AnimationPresets, TransformUtils, AnimationUtils } from '../utils/animations';
import AccessibilityService from '../utils/accessibility';
import { ScanResult, ScanHistory, ScanAnalysis, FoodItem, GutCondition, SeverityLevel } from '../types';
import DataService from '../services/DataService';

const { width, height } = Dimensions.get('window');

export const ScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const dataService = DataService.getInstance();
  
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize accessibility
    AccessibilityService.initialize();
    
    // Initialize data service and load scan history
    dataService.initialize();
    setScanHistory(dataService.getScanHistory());
    
    // Animate scanning line
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    scanAnimation.start();

    // Pulse animation for scan button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const generateMockAnalysis = (result: ScanResult, barcode: string): ScanAnalysis => {
    const mockFoods = [
      {
        name: 'Greek Yogurt',
        brand: 'Chobani',
        category: 'Dairy',
        histamineLevel: 'low' as const,
      },
      {
        name: 'Wheat Bread',
        brand: 'Wonder',
        category: 'Bakery',
      },
      {
        name: 'Aged Cheddar Cheese',
        brand: 'Cabot',
        category: 'Dairy',
        histamineLevel: 'high' as const,
      },
      {
        name: 'Banana',
        brand: null,
        category: 'Fruit',
      },
      {
        name: 'Energy Drink',
        brand: 'Red Bull',
        category: 'Beverages',
      },
    ];

    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
    
    const analysis: ScanAnalysis = {
      overallSafety: result,
      flaggedIngredients: result === 'safe' ? [] : [
        {
          ingredient: 'Wheat',
          reason: 'Contains gluten which may trigger IBS symptoms',
          severity: 'moderate' as SeverityLevel,
          condition: 'IBS' as GutCondition,
        },
        {
          ingredient: 'Fructans',
          reason: 'High FODMAP content may cause bloating',
          severity: 'mild' as SeverityLevel,
          condition: 'FODMAP sensitivity' as GutCondition,
        },
      ],
      safeAlternatives: ['Alternative option 1', 'Alternative option 2'],
      explanation: result === 'safe' 
        ? 'This food appears safe for your gut health profile.'
        : 'This food may contain ingredients that could trigger symptoms.',
    };

    return analysis;
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    // Haptic feedback for scan start
    HapticFeedback.scanStart();
    
    setScanned(true);
    
    // 3D animation for scan completion
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Generate mock food item - in real app, this would call food database API
    const mockFoodItem: FoodItem = {
      id: Date.now().toString(),
      name: 'Scanned Food Item',
      brand: 'Unknown Brand',
      category: 'Unknown',
      barcode: data,
      ingredients: ['Unknown ingredients'],
      allergens: [],
      additives: [],
      glutenFree: Math.random() > 0.5,
      lactoseFree: Math.random() > 0.5,
      fodmapLevel: Math.random() > 0.5 ? 'low' : 'high',
      histamineLevel: 'low',
      dataSource: 'Mock Database'
    };
    
    // Generate analysis using DataService
    const analysis = dataService.generateScanAnalysis(mockFoodItem);
    setScanResult(analysis.overallSafety);
    
    // Create scan history entry
    const newScan: ScanHistory = {
      id: Date.now().toString(),
      foodItem: mockFoodItem,
      analysis,
      timestamp: new Date(),
    };
    
    // Add to DataService and update local state
    dataService.addScanHistory(newScan);
    setScanHistory(dataService.getScanHistory());
    
    // Haptic feedback based on result
    if (analysis.overallSafety === 'safe') {
      HapticFeedback.foodSafe();
    } else {
      HapticFeedback.foodCaution();
    }
    
    // Announce to screen reader
    AccessibilityService.announceForAccessibility(`Scan complete. Result: ${analysis.overallSafety}. ${analysis.explanation}`);
    
    Alert.alert(
      'Scan Complete',
      `Barcode: ${data}\nResult: ${analysis.overallSafety.toUpperCase()}`,
      [
        { text: 'OK', onPress: () => setScanned(false) },
        { text: 'View History', onPress: () => (navigation as any).navigate('ScanHistory') }
      ]
    );
  };

  const resetScanner = () => {
    HapticFeedback.buttonPress();
    setScanned(false);
    setScanResult(null);
    
    // Reset animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
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
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              GutSafe needs camera access to scan barcodes and menus for your gut health.
            </Text>
            <AnimatedButton
              title="Grant Permission"
              onPress={requestCameraPermission}
              size="large"
              variant="primary"
              style={styles.permissionButton}
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
              Please enable camera access in your device settings to use the scanner.
            </Text>
            <AnimatedButton
              title="Try Again"
              onPress={requestCameraPermission}
              size="large"
              variant="outline"
              style={styles.permissionButton}
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
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.overlayTitle}>Scan Barcode</Text>
            <Text style={styles.overlaySubtitle}>
              Point your camera at a barcode or menu item
            </Text>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => (navigation as any).navigate('ScanHistory')}
            >
              <Text style={styles.historyButtonText}>View Scan History</Text>
            </TouchableOpacity>
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
              <Animated.View style={{ 
                transform: [
                  { scale: Animated.multiply(pulseAnim, scaleAnim) },
                  { rotateY: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })}
                ]
              }}>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={resetScanner}
                  disabled={!scanned}
                  {...AccessibilityService.createButtonConfig(
                    scanned ? 'Scan Again Button' : 'Scanning in Progress',
                    scanned ? 'Start a new scan' : 'Camera is ready to scan barcodes',
                    !scanned,
                    false
                  )}
                >
                  <LinearGradient
                    colors={scanned ? Colors.primaryGradient : [Colors.body, Colors.body]}
                    style={styles.scanButtonGradient}
                  >
                    <Animated.View style={{
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.8],
                      })
                    }}>
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
      </Camera>

      {/* Mock result for demo */}
      {scanResult && (
        <View style={styles.resultContainer}>
          <StatusIndicator
            result={scanResult}
            title={scanResult === 'safe' ? 'Safe to Eat' : 'Use Caution'}
            subtitle={
              scanResult === 'safe'
                ? 'This food appears safe for your gut health profile.'
                : 'This food may contain ingredients that could trigger symptoms.'
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  overlayTitle: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overlaySubtitle: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.md,
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
  },
  historyButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -100,
    marginLeft: -100,
    width: 200,
    height: 200,
  },
  scanFrameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopRightRadius: BorderRadius.sm,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: BorderRadius.sm,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomRightRadius: BorderRadius.sm,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingHorizontal: Spacing.lg,
  },
  scanButtonContainer: {
    alignItems: 'center',
  },
  scanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  scanButtonText: {
    fontSize: Typography.fontSize.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  permissionCard: {
    margin: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  permissionIcon: {
    fontSize: 32,
  },
  permissionTitle: {
    fontSize: Typography.fontSize.h2,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  permissionText: {
    fontSize: Typography.fontSize.body,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  permissionButton: {
    minWidth: 200,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 200,
    left: Spacing.lg,
    right: Spacing.lg,
  },
});
