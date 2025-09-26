/**
 * @fileoverview LinearGradientWrapper.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import { Platform, View } from 'react-native';

// Simple fallback LinearGradient that uses solid colors
const FallbackLinearGradient = ({ colors, style, children, start, end, locations, ...props }: any) => {
  // Use the first color as a solid background
  const backgroundColor = colors && colors.length > 0 ? colors[0] : '#000000';
  
  return (
    <View style={[{ backgroundColor }, style]} {...props}>
      {children}
    </View>
  );
};

// Native LinearGradient
let NativeLinearGradient: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeLinearGradient = require('expo-linear-gradient').default;
  } catch (error) {
    console.warn('Failed to load native LinearGradient:', error);
  }
}

// Export the appropriate component - use fallback for web to avoid CSS issues
const LinearGradient = Platform.OS === 'web' ? FallbackLinearGradient : NativeLinearGradient;

export default LinearGradient;
