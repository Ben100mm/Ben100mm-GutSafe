import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Colors } from './src/constants/colors';
import { EnhancedWelcomeScreen } from './src/screens/EnhancedWelcomeScreen';
import { ScannerScreen } from './src/screens/ScannerScreen';

export default function App() {
  const [showScanner, setShowScanner] = useState(false);

  const handleStartScanning = () => {
    setShowScanner(true);
  };

  const handleSetupProfile = () => {
    // TODO: Navigate to profile setup
    console.log('Setup profile pressed');
  };

  if (showScanner) {
    return <ScannerScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <EnhancedWelcomeScreen
        onStartScanning={handleStartScanning}
        onSetupProfile={handleSetupProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
