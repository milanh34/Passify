// src/themes/components/ThemedText.tsx

import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useGlobalTheme } from "../../context/GlobalThemeContext";

interface ThemedTextProps extends TextProps {
  variant?: "primary" | "secondary" | "muted" | "inverse" | "accent" | "error";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "hero";
  weight?: "regular" | "bold";
  spacing?: "tight" | "normal" | "wide";
}

export function ThemedText({
  variant = "primary",
  size = "md",
  weight = "regular",
  spacing = "normal",
  style,
  ...props
}: ThemedTextProps) {
  const { theme } = useGlobalTheme();
  const { typography, colors } = theme;

  const color = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    inverse: colors.textInverse,
    accent: colors.accent,
    error: colors.error,
  }[variant];

  const fontSize = {
    xs: typography.sizeXs,
    sm: typography.sizeSm,
    md: typography.sizeMd,
    lg: typography.sizeLg,
    xl: typography.sizeXl,
    xxl: typography.sizeXxl,
    hero: typography.sizeHero,
  }[size];

  const fontFamily = weight === "bold" ? typography.fontBold : typography.fontRegular;

  const letterSpacing = {
    tight: typography.letterSpacingTight,
    normal: typography.letterSpacingNormal,
    wide: typography.letterSpacingWide,
  }[spacing];

  return (
    <Text
      style={[
        {
          color,
          fontSize,
          fontFamily,
          letterSpacing,
        },
        style,
      ]}
      {...props}
    />
  );
}
