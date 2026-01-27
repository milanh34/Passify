// src/themes/components/ThemedHeader.tsx

import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { ThemedText } from "./ThemedText";

interface ThemedHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export function ThemedHeader({
  title,
  subtitle,
  onBack,
  rightElement,
  transparent = false,
}: ThemedHeaderProps) {
  const { theme } = useGlobalTheme();
  const insets = useSafeAreaInsets();
  const { components, colors, spacing, shadows } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          height: insets.top + components.header.height,
          backgroundColor: transparent ? "transparent" : colors.background,
          borderBottomColor: transparent ? "transparent" : colors.surfaceBorder,
          borderBottomWidth: transparent ? 0 : 1,
        },
      ]}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={[
            styles.backButton,
            {
              width: components.header.backButtonSize,
              height: components.header.backButtonSize,
              borderRadius: components.header.backButtonRadius,
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            },
          ]}
          android_ripple={{ color: colors.accentMuted }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={{ width: components.header.backButtonSize }} />
      )}

      <View style={styles.titleContainer}>
        <ThemedText
          variant="primary"
          weight="bold"
          style={{ fontSize: components.header.titleSize }}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="muted" size="sm">
            {subtitle}
          </ThemedText>
        )}
      </View>

      <View style={{ minWidth: components.header.backButtonSize }}>{rightElement}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
});
