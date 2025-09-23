import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface TabIconProps {
  name: 'heart' | 'camera' | 'grid';
  focused: boolean;
  color: string;
}

export const TabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => {
  const getIconPath = () => {
    switch (name) {
      case 'heart':
        return (
          <View style={styles.iconContainer}>
            <View style={[styles.heart, { borderColor: color }]}>
              <View style={[styles.heartFill, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </View>
        );
      case 'camera':
        return (
          <View style={styles.iconContainer}>
            <View style={[styles.camera, { borderColor: color }]}>
              <View style={[styles.cameraLens, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </View>
        );
      case 'grid':
        return (
          <View style={styles.iconContainer}>
            <View style={styles.grid}>
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
              <View style={[styles.gridDot, { backgroundColor: focused ? color : 'transparent' }]} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return getIconPath();
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    width: 20,
    height: 18,
    borderWidth: 2,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    transform: [{ rotate: '-45deg' }],
    position: 'relative',
  },
  heartFill: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  camera: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderRadius: 4,
    position: 'relative',
  },
  cameraLens: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 2,
  },
  grid: {
    width: 16,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'space-between',
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    margin: 1,
  },
});
