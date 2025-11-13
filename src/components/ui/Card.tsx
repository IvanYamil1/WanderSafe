import React from 'react';
import { View, StyleSheet, ViewProps, Pressable } from 'react-native';
import { colors, radius, spacing, shadows } from '@/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing;
  onPress?: () => void;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 4,
  onPress,
  children,
  style,
  ...props
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyles,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    backgroundColor: colors.background.card,
  },

  elevated: {
    ...shadows.md,
  },

  outlined: {
    borderWidth: 1,
    borderColor: colors.border.main,
  },

  filled: {
    backgroundColor: colors.background.secondary,
  },

  pressed: {
    opacity: 0.8,
  },
});
