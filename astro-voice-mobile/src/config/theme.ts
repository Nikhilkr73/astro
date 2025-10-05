// Kundli App Theme - Brown and Golden Palette
export const Colors = {
  // Primary - Rich Browns
  primary: '#6B2C16', // Deep brown (from Kundli logo)
  primaryLight: '#8B3A1F',
  primaryDark: '#4A1E0F',
  
  // Secondary - Golden/Orange
  secondary: '#D4A76A', // Golden (from Kundli logo)
  secondaryLight: '#E5C99A',
  secondaryDark: '#B8904F',
  
  // Accent - Warm Orange (Chat button color)
  accent: '#E67538', // Bright orange for CTAs
  accentLight: '#F49759',
  accentDark: '#C85A1C',
  
  // Backgrounds
  background: '#FBF9F7', // Warm off-white
  cardBackground: '#FFFFFF',
  headerBackground: '#6B2C16',
  
  // Text
  textPrimary: '#2C1810',
  textSecondary: '#6B4E3D',
  textTertiary: '#9B8578',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  
  // Status Colors
  success: '#4CAF50',
  error: '#E53935',
  warning: '#FFA726',
  info: '#42A5F5',
  
  // Borders & Dividers
  border: '#E5DDD5',
  divider: '#F0EBE6',
  
  // Category Colors (for tabs)
  categoryAll: '#6B2C16',
  categoryLove: '#E91E63',
  categoryMarriage: '#9C27B0',
  categoryCareer: '#2196F3',
  
  // Gradients (arrays for LinearGradient)
  gradientPrimary: ['#6B2C16', '#8B3A1F'],
  gradientSecondary: ['#D4A76A', '#B8904F'],
  gradientAccent: ['#E67538', '#C85A1C'],
  gradientCard: ['#FFFFFF', '#FBF9F7'],
};

export const Fonts = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    title: 24,
    hero: 32,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

