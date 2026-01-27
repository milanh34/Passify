// src/themes/components/ThemedView.tsx

import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useGlobalTheme } from "../../context/GlobalThemeContext";

interface ThemedViewProps extends ViewProps {
  variant?: "background" | "surface" | "elevated";
}

export function ThemedView({ variant = "background", style, ...props }: ThemedViewProps) {
  const { theme } = useGlobalTheme();

  const backgroundColor = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    elevated: theme.colors.surfaceElevated,
  }[variant];

  return <View style={[{ backgroundColor }, style]} {...props} />;
}
