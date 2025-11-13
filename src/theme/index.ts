/**
 * WanderSafe Design System
 * Central theme configuration
 */

// Import first to ensure proper initialization
import * as colorsModule from './colors';
import * as typographyModule from './typography';
import * as spacingModule from './spacing';
import * as shadowsModule from './shadows';
import * as radiusModule from './radius';

// Re-export everything
export const colors = colorsModule.colors;
export const COLORS = colorsModule.COLORS;
export const typography = typographyModule.typography;
export const fontSizes = typographyModule.fontSizes;
export const fontWeights = typographyModule.fontWeights;
export const lineHeights = typographyModule.lineHeights;
export const letterSpacing = typographyModule.letterSpacing;
export const spacing = spacingModule.spacing;
export const margins = spacingModule.margins;
export const padding = spacingModule.padding;
export const gap = spacingModule.gap;
export const containerPadding = spacingModule.containerPadding;
export const shadows = shadowsModule.shadows;
export const radius = radiusModule.radius;
export const shapes = radiusModule.shapes;

// Common sizes
export const sizes = {
  header: {
    height: 56,
    heightLarge: 120,
  },
  button: {
    height: 48,
    heightSmall: 40,
    heightLarge: 56,
  },
  input: {
    height: 48,
    heightSmall: 40,
    heightLarge: 56,
  },
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
    '3xl': 64,
  },
  avatar: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
  card: {
    minHeight: 120,
  },
} as const;

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const;

// Default theme export
export const theme = {
  colors: colorsModule.colors,
  typography: typographyModule.typography,
  spacing: spacingModule.spacing,
  shadows: shadowsModule.shadows,
  radius: radiusModule.radius,
  shapes: radiusModule.shapes,
  sizes,
  animation,
  zIndex,
} as const;

export default theme;
