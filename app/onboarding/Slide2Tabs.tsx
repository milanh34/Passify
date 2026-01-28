// app/onboarding/Slide2Tabs.tsx - VERSION 2 (Professional)

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const tabs = [
  {
    icon: "grid",
    name: "Manage",
    tagline: "Organize",
    description: "Create platforms, add accounts, search instantly",
  },
  {
    icon: "swap-horizontal",
    name: "Transfer",
    tagline: "Import & Export",
    description: "Bulk import from text, export for backup",
  },
  {
    icon: "lock-closed",
    name: "Encoder",
    tagline: "Encrypt",
    description: "Create secure encrypted image backups",
  },
  {
    icon: "key",
    name: "Decoder",
    tagline: "Restore",
    description: "Recover data from encrypted images",
  },
];

export default function Slide2Tabs() {
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
            Streamlined Workflow
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
            Four specialized tabs for every password management need
          </Text>
        </MotiView>

        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <MotiView
              key={tab.name}
              from={{ opacity: 0, translateX: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "timing",
                duration: 400,
                delay: 150 + index * 100,
              }}
            >
              <View
                style={[
                  styles.tabCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.radiusLg,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tabIconContainer,
                    {
                      backgroundColor: theme.colors.accentMuted,
                      borderRadius: theme.shapes.radiusMd,
                    },
                  ]}
                >
                  <Ionicons name={tab.icon as any} size={28} color={theme.colors.accent} />
                </View>
                <View style={styles.tabInfo}>
                  <View style={styles.tabHeader}>
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontBold,
                        fontSize: theme.typography.sizeLg,
                      }}
                    >
                      {tab.name}
                    </Text>
                    <View
                      style={[
                        styles.taglineBadge,
                        {
                          backgroundColor: theme.colors.accent + "15",
                          borderRadius: theme.shapes.radiusSm,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.accent,
                          fontFamily: theme.typography.fontBold,
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {tab.tagline}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontRegular,
                      fontSize: theme.typography.sizeSm + 1,
                      marginTop: 4,
                    }}
                  >
                    {tab.description}
                  </Text>
                </View>
              </View>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300, delay: 600 }}
          style={[
            styles.bottomCard,
            {
              backgroundColor: theme.colors.accentMuted,
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
        >
          <Ionicons name="navigate" size={20} color={theme.colors.accent} />
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeSm + 1,
              flex: 1,
            }}
          >
            Swipe or tap to switch between tabs seamlessly
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
    paddingVertical: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  tabsContainer: {
    gap: 12,
  },
  tabCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    gap: 14,
  },
  tabIconContainer: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInfo: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taglineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bottomCard: {
    marginTop: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
