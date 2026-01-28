// app/onboarding/Slide5Tips.tsx - VERSION 2 (Professional)

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const themeNames = ["Original", "Material", "Sharp", "Minimal", "Retro", "Dusk", "Ocean"];

const settingsCategories = [
  {
    title: "Appearance",
    items: [
      { icon: "color-palette", name: "8 Themes", desc: "Light & dark options" },
      { icon: "text", name: "11 Fonts", desc: "From Inter to JetBrains" },
      { icon: "flash", name: "12 Animations", desc: "Slide, bounce, elastic" },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: "finger-print", name: "Biometrics", desc: "Face ID / Touch ID" },
      { icon: "keypad", name: "PIN Code", desc: "4-6 digit backup" },
      { icon: "time", name: "Auto-lock", desc: "1-30 min or never" },
      { icon: "camera-outline", name: "Screenshots", desc: "Block sensitive data" },
    ],
  },
];

export default function Slide5Tips() {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme.isDark ? "white" : "black"}
        bounces={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.header}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
              },
            ]}
          >
            Personalize Everything
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontRegular,
              },
            ]}
          >
            Make Passify uniquely yours with extensive customization options
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300, delay: 150 }}
          style={[
            styles.themesShowcase,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.shapes.radiusLg,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeMd,
              marginBottom: 12,
            }}
          >
            Available Themes
          </Text>
          <View style={styles.themesRow}>
            {themeNames.map((name, index) => (
              <MotiView
                key={name}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 200,
                  delay: 200 + index * 40,
                }}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: theme.colors.accentMuted,
                    borderRadius: theme.shapes.radiusSm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontFamily: theme.typography.fontBold,
                    fontSize: 11,
                  }}
                >
                  {name}
                </Text>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {settingsCategories.map((category, catIndex) => (
          <MotiView
            key={category.title}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 300 + catIndex * 100 }}
            style={[
              styles.categoryCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.surfaceBorder,
                borderRadius: theme.shapes.radiusLg,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeMd,
                marginBottom: 14,
              }}
            >
              {category.title}
            </Text>
            <View style={styles.itemsGrid}>
              {category.items.map((item, itemIndex) => (
                <View
                  key={item.name}
                  style={[
                    styles.settingItem,
                    {
                      backgroundColor: theme.colors.background,
                      borderRadius: theme.shapes.radiusMd,
                    },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={20} color={theme.colors.accent} />
                  <Text
                    style={{
                      color: theme.colors.textPrimary,
                      fontFamily: theme.typography.fontBold,
                      fontSize: theme.typography.sizeSm,
                      marginTop: 6,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textMuted,
                      fontFamily: theme.typography.fontRegular,
                      fontSize: 10,
                      textAlign: "center",
                    }}
                  >
                    {item.desc}
                  </Text>
                </View>
              ))}
            </View>
          </MotiView>
        ))}

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300, delay: 600 }}
          style={[
            styles.accessNote,
            {
              backgroundColor: theme.colors.accentMuted,
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
        >
          <Ionicons name="settings" size={20} color={theme.colors.accent} />
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeSm + 1,
              flex: 1,
            }}
          >
            Access all settings from the main screen's Settings button
          </Text>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  themesShowcase: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  themesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  settingItem: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  accessNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginTop: 6,
  },
});
