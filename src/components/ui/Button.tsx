import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, sizes, shadows } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
  ].filter(Boolean) as TextStyle[];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor = variant === 'outline' || variant === 'ghost'
    ? colors.primary[500]
    : variant === 'danger'
    ? colors.neutral[0]
    : colors.neutral[0];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : colors.neutral[0]}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles}>{children}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing[6],
    ...shadows.sm,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.secondary[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error.main,
  },

  // Sizes
  size_small: {
    height: sizes.button.heightSmall,
    paddingHorizontal: spacing[4],
  },
  size_medium: {
    height: sizes.button.height,
    paddingHorizontal: spacing[6],
  },
  size_large: {
    height: sizes.button.heightLarge,
    paddingHorizontal: spacing[8],
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },

  text_primary: {
    color: colors.neutral[0],
  },
  text_secondary: {
    color: colors.neutral[0],
  },
  text_outline: {
    color: colors.primary[500],
  },
  text_ghost: {
    color: colors.primary[500],
  },
  text_danger: {
    color: colors.neutral[0],
  },

  text_small: {
    ...typography.buttonSmall,
  },
  text_medium: {
    ...typography.button,
  },
  text_large: {
    ...typography.button,
    fontSize: typography.h5.fontSize,
  },

  textDisabled: {
    opacity: 0.7,
  },

  // Icons
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
});
