/**
 * WanderSafe Spacing System
 * 8-point grid system for consistent spacing
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

// Semantic spacing
export const margins = {
  xs: spacing[1],  // 4
  sm: spacing[2],  // 8
  md: spacing[4],  // 16
  lg: spacing[6],  // 24
  xl: spacing[8],  // 32
  '2xl': spacing[10], // 40
  '3xl': spacing[12], // 48
} as const;

export const padding = {
  xs: spacing[1],  // 4
  sm: spacing[2],  // 8
  md: spacing[4],  // 16
  lg: spacing[6],  // 24
  xl: spacing[8],  // 32
  '2xl': spacing[10], // 40
  '3xl': spacing[12], // 48
} as const;

export const gap = {
  xs: spacing[1],  // 4
  sm: spacing[2],  // 8
  md: spacing[3],  // 12
  lg: spacing[4],  // 16
  xl: spacing[6],  // 24
} as const;

// Screen/Container padding
export const containerPadding = {
  horizontal: spacing[4], // 16
  vertical: spacing[6],   // 24
  screen: spacing[4],     // 16
} as const;
