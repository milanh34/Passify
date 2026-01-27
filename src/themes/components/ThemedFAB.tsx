// src/themes/components/ThemedFAB.tsx

import React from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "../../context/GlobalThemeContext";

interface ThemedFABProps extends Omit<PressableProps, "children"> {
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  position?: { bottom: number; right: number };
}

export function ThemedFAB({
  icon = "add",
  variant = "primary",
  size = "md",
  position = { bottom: 24, right: 20 },
  disabled,
  style,
  ...props
}: ThemedFABProps) {
  const { theme } = useGlobalTheme();
  const { components, colors, shadows, animations } = theme;

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return colors.buttonPrimary;
      case "secondary":
        return colors.surface;
      case "danger":
        return colors.buttonDanger;
      default:
        return colors.buttonPrimary;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "primary":
        return colors.textInverse;
      case "secondary":
        return colors.accent;
      case "danger":
        return colors.textInverse;
      default:
        return colors.textInverse;
    }
  };

  const sizes = {
    sm: { size: 44, icon: 20, radius: components.fab.radius * 0.8 },
    md: { size: components.fab.size, icon: components.fab.iconSize, radius: components.fab.radius },
    lg: { size: 68, icon: 30, radius: components.fab.radius * 1.2 },
  };

  const sizeConfig = sizes[size];

  return (
    <MotiView
      style={[
        styles.container,
        {
          bottom: position.bottom,
          right: position.right,
        },
      ]}
    >
      <Pressable
        disabled={disabled}
        style={({ pressed }) => [
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius: sizeConfig.radius,
            backgroundColor: getBackgroundColor(),
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: pressed ? animations.fabPress.scale : 1 }],
            ...shadows.lg,
          },
          style as any,
        ]}
        android_ripple={{ color: colors.accentMuted }}
        {...props}
      >
        <Ionicons name={icon} size={sizeConfig.icon} color={getIconColor()} />
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 100,
  },
});
