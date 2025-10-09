/**
 * Avatar Component
 * 
 * A circular image component for user/astrologer profiles.
 */

import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { colors, typography, shadows } from '../../config/designTokens';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  fallbackText?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  border?: boolean;
}

const sizeValues = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
};

export function Avatar({ source, fallbackText, size = 'md', style, border = false }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const avatarSize = sizeValues[size];
  
  const showFallback = !source || imageError;
  const initials = fallbackText
    ? fallbackText
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        border && styles.border,
        style,
      ]}
    >
      {showFallback ? (
        <View style={styles.fallback}>
          <Text style={[styles.fallbackText, { fontSize: avatarSize / 2.5 }]}>
            {initials}
          </Text>
        </View>
      ) : (
        <Image
          source={source!}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.muted,
  },
  
  border: {
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 0, 0.1)',
    ...shadows.sm,
  },
  
  image: {
    width: '100%',
    height: '100%',
  },
  
  fallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  
  fallbackText: {
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.semiBold,
  },
});


