// src/components/settings/LegalSection.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import SettingsSection from "./SettingsSection";

const LEGAL_ITEMS = [
  {
    type: "privacy",
    icon: "shield-checkmark",
    title: "Privacy Policy",
    subtitle: "How we handle your data",
  },
  {
    type: "terms",
    icon: "document-text-outline",
    title: "Terms of Service",
    subtitle: "Rules for using Passify",
  },
  {
    type: "licenses",
    icon: "code-slash",
    title: "Open Source Licenses",
    subtitle: "Third-party libraries",
  },
] as const;

export default function LegalSection() {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <SettingsSection title="Legal" icon="document-text">
      {LEGAL_ITEMS.map((item) => (
        <Pressable
          key={item.type}
          onPress={() => router.push(`/legal?type=${item.type}`)}
          style={[
            styles.item,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
          android_ripple={{ color: theme.colors.accentMuted }}
        >
          <View style={styles.itemLeft}>
            <Ionicons name={item.icon as any} size={24} color={theme.colors.accent} />
            <View>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
        </Pressable>
      ))}

      <View
        style={[
          styles.versionBox,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.surfaceBorder,
            borderRadius: theme.shapes.radiusMd,
          },
        ]}
      >
        <Text
          style={[
            styles.versionLabel,
            { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
          ]}
        >
          App Version
        </Text>
        <Text
          style={[
            styles.versionNumber,
            { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
          ]}
        >
          {Constants.expoConfig?.version || "1.0.0"}
        </Text>
        {__DEV__ && (
          <Text
            style={[
              styles.devLabel,
              { color: theme.colors.error, fontFamily: theme.typography.fontRegular },
            ]}
          >
            Development Build
          </Text>
        )}
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  versionBox: {
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 8,
  },
  versionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 18,
  },
  devLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
