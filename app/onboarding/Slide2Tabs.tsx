// app/onboarding/Slide2Tabs.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

export default function Slide2Tabs() {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.container, { paddingHorizontal: theme.spacing.xl }]}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal }}
          >
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeXxl + 4,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Explore the Four Tabs
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeMd,
                  marginBottom: theme.spacing.xl,
                },
              ]}
            >
              Each tab has a specific purpose:
            </Text>
          </MotiView>

          <TabCard
            icon="grid"
            title="Manage"
            description="Add, edit, delete, and organize your accounts. Search and sort your credentials by platform or creation date."
            theme={theme}
            delay={150}
          />

          <TabCard
            icon="swap-horizontal"
            title="Transfer"
            description="Import account data from external sources into the app. Export your credentials to text format for backup or migration."
            theme={theme}
            delay={300}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function TabCard({
  icon,
  title,
  description,
  theme,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  theme: ReturnType<typeof useAppTheme>;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -30 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: theme.animations.durationNormal, delay }}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.accentMuted,
          borderColor: theme.colors.accent,
          borderWidth: theme.shapes.borderThin,
          borderRadius: theme.components.card.radius,
          padding: theme.components.card.padding,
          marginBottom: theme.spacing.lg,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: theme.colors.accent + "30",
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
        >
          <Ionicons name={icon as any} size={28} color={theme.colors.accent} />
        </View>
        <Text
          style={[
            styles.cardTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeXl,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.cardDescription,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontRegular,
            fontSize: theme.typography.sizeSm + 1,
            lineHeight: 20,
          },
        ]}
      >
        {description}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {},
  subtitle: {},
  card: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {},
  cardDescription: {},
});
