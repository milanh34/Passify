// src/components/FAB.tsx

import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../themes/hooks/useAppTheme";

export default function FAB({
  onPress,
  icon = "add",
  style,
  color,
}: {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  color?: string;
}) {
  const theme = useAppTheme();

  const backgroundColor = color || theme.colors.buttonPrimary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        {
          width: theme.components.fab.size,
          height: theme.components.fab.size,
          borderRadius: theme.components.fab.radius,
          backgroundColor,
          transform: [{ scale: pressed ? theme.animations.fabPressScale : 1 }],
          ...theme.shadows.lg,
        },
        style,
      ]}
      onPress={onPress}
      android_ripple={{ color: theme.colors.accentMuted }}
    >
      <Ionicons
        name={icon as any}
        size={theme.components.fab.iconSize}
        color={theme.colors.textInverse}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
