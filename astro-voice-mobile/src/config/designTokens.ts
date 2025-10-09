/**
 * Design Tokens extracted from Canva Web UI
 * 
 * This file contains all design tokens (colors, typography, spacing, etc.)
 * extracted from the web version's globals.css for use in React Native.
 * 
 * Last Updated: October 9, 2025
 */

export const colors = {
  // Primary Colors
  background: '#FFFDF9',
  foreground: '#2E2E2E',
  card: '#FFFFFF',
  cardForeground: '#2E2E2E',
  
  // Brand Colors
  primary: '#FF6B00',
  primaryForeground: '#FFFFFF',
  secondary: '#2E2E2E',
  secondaryForeground: '#FFFFFF',
  
  // Accent Colors
  accent: '#FFF4E6',
  accentForeground: '#FF6B00',
  
  // Muted Colors
  muted: '#F5F5F5',
  mutedForeground: '#6B7280',
  
  // Borders & Inputs
  border: 'rgba(0, 0, 0, 0.08)',
  inputBackground: '#F8F9FA',
  switchBackground: '#E5E7EB',
  
  // Status Colors
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  success: '#10B981',
  successForeground: '#FFFFFF',
  warning: '#F59E0B',
  warningForeground: '#FFFFFF',
  
  // Additional Colors
  online: '#10B981',
  offline: '#9CA3AF',
  yellow: '#EAB308',
  
  // Chart Colors (if needed)
  chart1: '#FF6B00',
  chart2: '#2E2E2E',
  chart3: '#F59E0B',
  chart4: '#10B981',
  chart5: '#8B5CF6',
};

export const typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    light: 'Poppins_300Light',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const gradients = {
  primary: ['#FF6B00', 'rgba(255, 107, 0, 0.8)'],
  background: ['#FFF4E6', '#FFFDF9'],
  card: ['#FFFFFF', '#FAFAFA'],
};

/**
 * Theme object combining all design tokens
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
};

export type Theme = typeof theme;

export default theme;

