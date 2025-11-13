/**
 * WanderSafe Border Radius System
 * Consistent rounded corners
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999, // Fully rounded (pill shape)
} as const;

// Common shape presets
export const shapes = {
  button: radius.md,       // 12
  card: radius.lg,         // 16
  input: radius.md,        // 12
  modal: radius.xl,        // 20
  chip: radius.full,       // Pill
  avatar: radius.full,     // Circle
  badge: radius.sm,        // 8
  image: radius.md,        // 12
} as const;
