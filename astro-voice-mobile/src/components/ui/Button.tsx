/**
 * Button Component
 * 
 * A customizable button component with multiple variants matching the design system.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../config/designTokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`size_${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.primaryForeground : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          {typeof children === 'string' ? (
            <Text style={[textStyles, icon && { marginLeft: spacing.sm }]}>{children}</Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  primaryText: {
    color: colors.primaryForeground,
  },
  
  secondary: {
    backgroundColor: colors.secondary,
    ...shadows.sm,
  },
  secondaryText: {
    color: colors.secondaryForeground,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineText: {
    color: colors.foreground,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.foreground,
  },
  
  destructive: {
    backgroundColor: colors.destructive,
    ...shadows.sm,
  },
  destructiveText: {
    color: colors.destructiveForeground,
  },
  
  // Sizes
  size_sm: {
    height: 36,
    paddingHorizontal: spacing.base,
  },
  size_smText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  size_md: {
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  size_mdText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  
  size_lg: {
    height: 52,
    paddingHorizontal: spacing.xl,
  },
  size_lgText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
  },
  
  // States
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  disabledText: {
    opacity: 0.5,
  },
  
  text: {
    fontFamily: typography.fontFamily.medium,
  },
});

