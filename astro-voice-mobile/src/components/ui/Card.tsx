/**
 * Card Component
 * 
 * A container component with elevation and rounded corners.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../config/designTokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
  padding?: boolean;
}

export function Card({ children, style, elevation = 'sm', padding = true }: CardProps) {
  return (
    <View style={[styles.card, shadows[elevation], padding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  
  padding: {
    padding: spacing.base,
  },
});


