import { StyleSheet } from 'react-native';

// Orange-Gold Color Palette
export const colors = {
  // Primary Colors
  primary: '#F7931E',
  primaryLight: '#FFB347',
  primaryDark: '#E8851A',
  
  // Gradient Colors
  gradientStart: '#F7931E',
  gradientEnd: '#FFB347',
  
  // Background Colors
  background: '#FFF8F0',
  backgroundSecondary: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#2E2E2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textLight: '#D1D5DB',
  
  // Accent Colors
  accent: '#FFD580',
  accentLight: '#FFE4B5',
  
  // Border Colors
  border: '#FFE4B5',
  borderLight: '#F3F4F6',
  
  // Status Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Online/Offline
  online: '#10B981',
  offline: '#6B7280',
  
  // Shadow Colors
  shadow: '#F7931E',
  shadowLight: '#000000',
  
  // White/Black
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparent
  transparent: 'transparent',
};

// Typography Configuration
export const typography = {
  // Font Family
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_500Medium', // Changed to medium for lighter feel
    bold: 'Poppins_500Medium', // Changed to medium for lighter feel
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// Border Radius Scale
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Icon Sizes
export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
};

// Shadow Styles
export const shadows = {
  sm: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  orange: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  orangeLg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Common Style Utilities
export const commonStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  
  cardLarge: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  
  // Button Styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.orange,
  },
  
  buttonSecondary: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Text Styles
  textPrimary: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  
  textSecondary: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  
  textHeading: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize['2xl'],
    color: colors.textPrimary,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
  },
  
  textSubheading: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  
  // Input Styles
  input: {
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundCard,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
  },
  
  inputFocused: {
    borderColor: colors.primary,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.sm,
  },
  
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing['4xl'],
  },
  
  emptyStateText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  emptyStateSubtext: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});

// Gradient Configuration
export const gradients = {
  primary: {
    colors: [colors.gradientStart, colors.gradientEnd],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  primaryVertical: {
    colors: [colors.gradientStart, colors.gradientEnd],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

// Touchable Opacity
export const touchableOpacity = 0.8;

// Export theme object for easy access
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  iconSizes,
  shadows,
  gradients,
  touchableOpacity,
  commonStyles,
};
