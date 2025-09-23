import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { ProgressRing as ProgressRingType } from '../types';

interface ProgressRingProps {
  data: ProgressRingType;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  showValue?: boolean;
  animated?: boolean;
}

const { width } = Dimensions.get('window');

export const ProgressRing: React.FC<ProgressRingProps> = ({
  data,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  showValue = true,
  animated = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (data.value / 100) * circumference;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: data.value,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(data.value);
    }
  }, [data.value, animated, animatedValue]);

  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        {/* Simple circular progress using View with border */}
        <View style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.border,
            borderTopColor: data.color,
            transform: [{ rotate: `${(data.value / 100) * 360}deg` }],
          }
        ]} />
        
        {/* Center content */}
        <View style={styles.centerContent}>
          {showValue && (
            <Text style={[styles.value, { color: colors.text }]}>
              {Math.round(data.value)}
            </Text>
          )}
          {showLabel && (
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              {data.unit}
            </Text>
          )}
        </View>
      </View>
      
      {/* Label below ring */}
      <Text style={[styles.label, { color: colors.text }]}>
        {data.label}
      </Text>
    </View>
  );
};

interface MultipleProgressRingsProps {
  rings: ProgressRingType[];
  size?: number;
  strokeWidth?: number;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export const MultipleProgressRings: React.FC<MultipleProgressRingsProps> = ({
  rings,
  size = 100,
  strokeWidth = 6,
  layout = 'horizontal',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const containerStyle = layout === 'horizontal' 
    ? styles.horizontalContainer 
    : layout === 'vertical' 
    ? styles.verticalContainer 
    : styles.gridContainer;

  return (
    <View style={[containerStyle, { backgroundColor: colors.surface }]}>
      {rings.map((ring, index) => (
        <ProgressRing
          key={ring.id}
          data={ring}
          size={size}
          strokeWidth={strokeWidth}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: Typography.fontSize.title2,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.title2,
  },
  unit: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
  },
  label: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: Spacing.lg,
  },
});
