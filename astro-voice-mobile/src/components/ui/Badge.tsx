/**
 * Badge Component
 * 
 * A small label component for status indicators, categories, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../config/designTokens';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  
  text: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  
  // Variants
  default: {
    backgroundColor: colors.muted,
  },
  defaultText: {
    color: colors.mutedForeground,
  },
  
  primary: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  primaryText: {
    color: colors.primary,
  },
  
  secondary: {
    backgroundColor: colors.secondary,
  },
  secondaryText: {
    color: colors.secondaryForeground,
  },
  
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  successText: {
    color: colors.success,
  },
  
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  warningText: {
    color: colors.warning,
  },
  
  destructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  destructiveText: {
    color: colors.destructive,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineText: {
    color: colors.foreground,
  },
});


