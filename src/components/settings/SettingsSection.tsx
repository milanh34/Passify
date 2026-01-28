// src/components/settings/SettingsSection.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { useAppTheme } from "../../themes/hooks/useAppTheme";

interface SettingsSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function SettingsSection({
  title,
  icon,
  children,
  defaultExpanded = false,
}: SettingsSectionProps) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.surfaceBorder,
            borderRadius: theme.shapes.cardRadius,
          },
        ]}
        android_ripple={{ color: theme.colors.accentMuted }}
      >
        <View style={styles.headerLeft}>
          <Ionicons name={icon} size={22} color={theme.colors.accent} />
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
            ]}
          >
            {title}
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme.colors.accent}
        />
      </Pressable>

      <AnimatePresence>
        {expanded && (
          <MotiView
            from={{ opacity: 0, translateY: -20, scale: 0.95 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal }}
            style={styles.content}
          >
            {children}
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  content: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
});
