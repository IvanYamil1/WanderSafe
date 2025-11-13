/**
 * WanderSafe Color Palette
 * Professional, modern color system
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary/Accent Colors
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Warm accent
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Neutral/Gray Scale
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic Colors
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
    bg: '#E8F5E9',
  },

  warning: {
    light: '#FFD54F',
    main: '#FFC107',
    dark: '#FFA000',
    bg: '#FFF9C4',
  },

  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
    bg: '#FFEBEE',
  },

  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
    bg: '#E3F2FD',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F5',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    modalOverlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Text Colors
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    tertiary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
    link: '#2196F3',
  },

  // Border Colors
  border: {
    light: '#F0F0F0',
    main: '#E0E0E0',
    dark: '#BDBDBD',
    focus: '#2196F3',
  },

  // Special Colors
  special: {
    gradient: {
      primary: ['#2196F3', '#1976D2'],
      secondary: ['#FF9800', '#F57C00'],
      success: ['#4CAF50', '#388E3C'],
      sunset: ['#FF6B6B', '#FFA726'],
      ocean: ['#00BCD4', '#0097A7'],
      purple: ['#9C27B0', '#7B1FA2'],
    },
    shadow: '#000000',
    rating: '#FFB800',
    verified: '#4CAF50',
    premium: '#9C27B0',
  },

  // Category Colors (for places)
  category: {
    restaurante: '#FF5722',
    museo: '#9C27B0',
    parque: '#4CAF50',
    monumento: '#795548',
    bar: '#E91E63',
    cafe: '#8D6E63',
    tienda: '#FF9800',
    galeria: '#673AB7',
    teatro: '#E91E63',
    plaza: '#009688',
    mercado: '#FFC107',
    mirador: '#00BCD4',
    iglesia: '#757575',
    centro_cultural: '#9C27B0',
  },

  // Safety Level Colors
  safety: {
    safe: '#4CAF50',
    moderate: '#FFC107',
    caution: '#FF9800',
    danger: '#F44336',
  },

  // Social/OAuth Colors
  social: {
    google: '#DB4437',
    apple: '#000000',
    facebook: '#1877F2',
  },
} as const;

// Convenience aliases
export const COLORS = {
  // Quick access to most used colors
  PRIMARY: colors.primary[500],
  SECONDARY: colors.secondary[500],
  SUCCESS: colors.success.main,
  WARNING: colors.warning.main,
  ERROR: colors.error.main,
  INFO: colors.info.main,

  WHITE: colors.neutral[0],
  BLACK: colors.neutral[1000],

  TEXT_PRIMARY: colors.text.primary,
  TEXT_SECONDARY: colors.text.secondary,
  TEXT_TERTIARY: colors.text.tertiary,

  BG_PRIMARY: colors.background.primary,
  BG_SECONDARY: colors.background.secondary,

  BORDER: colors.border.main,
} as const;
