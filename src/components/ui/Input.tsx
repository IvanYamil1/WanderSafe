import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, sizes } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'filled',
  size = 'medium',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    styles[variant],
    styles[`size_${size}`],
    isFocused && styles.focused,
    error && styles.error,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={containerStyles}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? colors.error.main : isFocused ? colors.primary[500] : colors.text.tertiary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[inputStyles, style]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={error ? colors.error.main : isFocused ? colors.primary[500] : colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[4],
  },

  label: {
    ...typography.labelLarge,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
  },

  filled: {
    backgroundColor: colors.background.tertiary,
  },

  outlined: {
    backgroundColor: colors.background.primary,
    borderWidth: 1.5,
    borderColor: colors.border.main,
  },

  size_small: {
    height: sizes.input.heightSmall,
  },

  size_medium: {
    height: sizes.input.height,
  },

  size_large: {
    height: sizes.input.heightLarge,
  },

  focused: {
    borderColor: colors.border.focus,
    borderWidth: 1.5,
  },

  error: {
    borderColor: colors.error.main,
    borderWidth: 1.5,
  },

  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
  },

  inputWithLeftIcon: {
    marginLeft: spacing[2],
  },

  inputWithRightIcon: {
    marginRight: spacing[2],
  },

  leftIcon: {
    marginRight: spacing[2],
  },

  rightIcon: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },

  helperText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing[1],
    marginLeft: spacing[4],
  },

  errorText: {
    color: colors.error.main,
  },
});
