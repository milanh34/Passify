// src/themes/components/ThemedButton.tsx

import React from "react";
import { Pressable, PressableProps, View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { ThemedText } from "./ThemedText";

interface ThemedButtonProps extends Omit<PressableProps, "children"> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function ThemedButton({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  children,
  ...props
}: ThemedButtonProps) {
  const { theme } = useGlobalTheme();
  const { components, colors, spacing, shapes } = theme;

  const getBackgroundColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case "primary":
        return colors.buttonPrimary;
      case "secondary":
        return colors.buttonSecondary;
      case "danger":
        return colors.buttonDanger;
      case "ghost":
        return "transparent";
      case "outline":
        return "transparent";
      default:
        return colors.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case "primary":
        return colors.textInverse;
      case "secondary":
        return colors.textPrimary;
      case "danger":
        return colors.textInverse;
      case "ghost":
        return colors.accent;
      case "outline":
        return colors.accent;
      default:
        return colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") return colors.accent;
    if (variant === "secondary") return colors.surfaceBorder;
    return "transparent";
  };

  const heights = { sm: 36, md: components.button.height, lg: 56 };
  const paddings = { sm: 12, md: components.button.paddingHorizontal, lg: 28 };
  const fontSizes = { sm: 12, md: components.button.fontSize, lg: 16 };
  const iconSizes = { sm: 16, md: 20, lg: 24 };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          backgroundColor: getBackgroundColor(),
          borderRadius: components.button.radius,
          borderWidth: variant === "outline" || variant === "secondary" ? shapes.borderThin : 0,
          borderColor: getBorderColor(),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? theme.animations.buttonPress.scale : 1 }],
          width: fullWidth ? "100%" : undefined,
        },
        style as any,
      ]}
      android_ripple={{ color: colors.accentMuted }}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <Ionicons name={icon} size={iconSizes[size]} color={getTextColor()} />
      )}
      <ThemedText
        variant="inverse"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
        weight="bold"
        style={{
          color: getTextColor(),
          letterSpacing: components.button.letterSpacing,
        }}
      >
        {children}
      </ThemedText>
      {icon && iconPosition === "right" && (
        <Ionicons name={icon} size={iconSizes[size]} color={getTextColor()} />
      )}
    </Pressable>
  );
}
