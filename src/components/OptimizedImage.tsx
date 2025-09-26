/**
 * @fileoverview OptimizedImage.tsx
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { usePlatformOptimizations } from '../hooks/usePlatformOptimizations';
import { useMobileOptimizations } from '../hooks/useMobileOptimizations';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedImageProps {
  uri: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: () => void;
  cachePolicy?: 'memory' | 'disk' | 'none';
  progressive?: boolean;
  blurRadius?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  uri,
  width,
  height,
  quality = 80,
  placeholder,
  fallback,
  style,
  resizeMode = 'cover',
  onLoad,
  onError,
  cachePolicy = 'memory',
  progressive = true,
  blurRadius = 0,
}) => {
  const { getImageConfig, getOptimizedImageSize, isWeb, isMobile } = usePlatformOptimizations();
  const { getOptimizedImageQuality } = useMobileOptimizations();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Calculate optimized dimensions and quality
  const optimizedDimensions = useMemo(() => {
    const targetWidth = width || screenWidth;
    const targetHeight = height || Math.round(targetWidth * 0.75);
    
    // Get platform-optimized dimensions
    const optimizedSize = getOptimizedImageSize(targetWidth, targetHeight);
    
    // Get platform-optimized quality
    const optimizedQuality = getOptimizedImageQuality();
    const finalQuality = quality || optimizedQuality;
    
    // For web, we can use query parameters for optimization
    if (isWeb) {
      const url = new URL(uri);
      url.searchParams.set('w', optimizedSize.width.toString());
      url.searchParams.set('h', optimizedSize.height.toString());
      url.searchParams.set('q', finalQuality.toString());
      if (progressive) {
        url.searchParams.set('f', 'progressive');
      }
      return {
        uri: url.toString(),
        width: optimizedSize.width,
        height: optimizedSize.height,
      };
    }
    
    return {
      uri,
      width: optimizedSize.width,
      height: optimizedSize.height,
    };
  }, [uri, width, height, quality, progressive, getOptimizedImageSize, getOptimizedImageQuality, isWeb]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    onError?.();
  }, [onError]);

  const imageStyle = useMemo(() => [
    styles.image,
    {
      width: optimizedDimensions.width,
      height: optimizedDimensions.height,
    },
    style,
  ], [optimizedDimensions.width, optimizedDimensions.height, style]);

  if (error && fallback) {
    return <View style={imageStyle}>{fallback}</View>;
  }

  return (
    <View style={imageStyle}>
      {loading && (
        <View style={styles.loadingContainer}>
          {placeholder || (
            <View style={styles.defaultPlaceholder}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </View>
      )}
      
      <Image
        source={{ uri: optimizedDimensions.uri }}
        style={[
          styles.image,
          { opacity: loading ? 0 : 1 },
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        blurRadius={blurRadius}
        // Web-specific props
        {...(Platform.OS === 'web' && {
          loading: 'lazy',
          decoding: 'async',
        })}
      />
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  defaultPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
});

export default OptimizedImage;
