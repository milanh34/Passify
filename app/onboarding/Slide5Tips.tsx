// app/onboarding/Slide5Tips.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const customizations = [
  {
    icon: "color-palette",
    title: "Themes",
    description:
      "Choose from various color themes including light, dark, and custom schemes to match your style",
  },
  {
    icon: "text",
    title: "Fonts",
    description: "Select from multiple font families to match your reading preference",
  },
  {
    icon: "swap-horizontal",
    title: "Screen Transitions",
    description:
      "Customize transition effects between screens for a personalized navigation experience",
  },
  {
    icon: "finger-print",
    title: "Biometric & PIN",
    description:
      "Enable biometric authentication or PIN lock for additional security and quick access",
  },
];

export default function Slide5Tips() {
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
                  fontSize: theme.typography.sizeXxl + 2,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Personalize Your Experience
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
              Customize the app to suit your style and preferences:
            </Text>
          </MotiView>

          <View style={[styles.customizationsContainer, { gap: theme.spacing.md }]}>
            {customizations.map((item, index) => (
              <CustomizationCard
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                theme={theme}
                index={index}
              />
            ))}
          </View>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 500 }}
            style={[
              styles.noteContainer,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.shapes.radiusMd,
                borderWidth: theme.shapes.borderThin,
                borderColor: theme.colors.surfaceBorder,
                padding: theme.spacing.md,
                marginTop: theme.spacing.lg,
              },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={theme.colors.accent} />
            <Text
              style={[
                styles.note,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeSm,
                },
              ]}
            >
              Access all customization options from Settings anytime.
            </Text>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}

function CustomizationCard({
  icon,
  title,
  description,
  theme,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  theme: ReturnType<typeof useAppTheme>;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: theme.animations.durationNormal,
        delay: 100 + index * theme.animations.listItemStagger,
      }}
      style={[
        styles.customCard,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.shapes.radiusMd,
          borderWidth: theme.shapes.borderThin,
          borderColor: theme.colors.surfaceBorder,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.colors.accentMuted,
            borderRadius: theme.shapes.radiusSm,
          },
        ]}
      >
        <Ionicons name={icon as any} size={20} color={theme.colors.accent} />
      </View>
      <View style={styles.customContent}>
        <Text
          style={[
            styles.customTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeMd,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.customDescription,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeSm,
              lineHeight: 17,
            },
          ]}
        >
          {description}
        </Text>
      </View>
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
    paddingBottom: 20,
  },
  title: {},
  subtitle: {},
  customizationsContainer: {},
  customCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  customContent: {
    flex: 1,
    gap: 3,
  },
  customTitle: {},
  customDescription: {},
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  note: {
    flex: 1,
    lineHeight: 18,
  },
});
