import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, colors } from '@/theme';

type TextVariant = keyof typeof typography;
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'link' | 'error' | 'success';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  center?: boolean;
  bold?: boolean;
  children: React.ReactNode;
}

const getColorMap = (): Record<TextColor, string> => ({
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  tertiary: colors.text.tertiary,
  inverse: colors.text.inverse,
  link: colors.text.link,
  error: colors.error.main,
  success: colors.success.main,
});

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  center = false,
  bold = false,
  style,
  children,
  ...props
}) => {
  const colorMap = getColorMap();
  const textStyles = [
    typography[variant],
    { color: colorMap[color] },
    center && styles.center,
    bold && styles.bold,
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
  },
});
