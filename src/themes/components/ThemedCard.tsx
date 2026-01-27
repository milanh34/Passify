// src/themes/components/ThemedCard.tsx

import React from "react";
import { View, ViewProps, Pressable, PressableProps, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { useThemedAnimation } from "../hooks/useThemedAnimation";

interface ThemedCardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined" | "selected";
  pressable?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  animated?: boolean;
  animationIndex?: number;
}

export function ThemedCard({
  variant = "default",
  pressable = false,
  onPress,
  onLongPress,
  animated = true,
  animationIndex = 0,
  style,
  children,
  ...props
}: ThemedCardProps) {
  const { theme } = useGlobalTheme();
  const animations = useThemedAnimation();
  const { components, colors, shadows, shapes } = theme;

  const getShadow = () => {
    if (variant === "elevated") return shadows.md;
    if (variant === "selected") return shadows.sm;
    return shadows[components.card.shadow] || shadows.none;
  };

  const cardStyle = [
    {
      backgroundColor: variant === "selected" ? colors.accentMuted : components.card.background,
      borderColor:
        variant === "selected"
          ? colors.accent
          : variant === "outlined"
            ? components.card.border
            : "transparent",
      borderWidth:
        variant === "outlined" || variant === "selected" ? components.card.borderWidth : 0,
      borderRadius: components.card.radius,
      padding: components.card.padding,
      ...getShadow(),
    },
    style,
  ];

  const content = animated ? (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        ...animations.cardExpand.transition,
        delay: animationIndex * animations.listItemStagger,
      }}
      style={cardStyle}
    >
      {children}
    </MotiView>
  ) : (
    <View style={cardStyle}>{children}</View>
  );

  if (pressable && (onPress || onLongPress)) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: colors.accentMuted }}
        {...props}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
