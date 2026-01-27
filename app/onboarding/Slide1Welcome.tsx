// app/onboarding/Slide1Welcome.tsx

import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

export default function Slide1Welcome() {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 100 }}
          style={styles.container}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              damping: theme.animations.springDamping,
              stiffness: theme.animations.springStiffness,
            }}
            style={[
              styles.iconContainer,
              {
                borderRadius: theme.shapes.radiusXl,
              },
            ]}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </MotiView>

          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeXxl + 4,
              },
            ]}
          >
            Welcome to Passify
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeMd + 1,
              },
            ]}
          >
            Your secure and organized password manager. Store encrypted credentials across multiple
            platforms with powerful search and sorting capabilities.
          </Text>

          <View style={styles.featuresGrid}>
            <FeatureItem icon="lock-closed" label="Encrypted" theme={theme} delay={200} />
            <FeatureItem icon="search" label="Searchable" theme={theme} delay={300} />
            <FeatureItem icon="funnel" label="Sortable" theme={theme} delay={400} />
            <FeatureItem icon="layers" label="Multi-Platform" theme={theme} delay={500} />
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 600 }}
            style={[
              styles.securityNoteContainer,
              {
                backgroundColor: theme.colors.accentMuted,
                borderRadius: theme.shapes.radiusMd,
                padding: theme.spacing.md,
              },
            ]}
          >
            <Ionicons name="shield-checkmark" size={18} color={theme.colors.accent} />
            <Text
              style={[
                styles.securityNote,
                {
                  color: theme.colors.accent,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeSm,
                },
              ]}
            >
              All your data is encrypted and stored securely on your device
            </Text>
          </MotiView>
        </MotiView>
      </ScrollView>
    </View>
  );
}

function FeatureItem({
  icon,
  label,
  theme,
  delay,
}: {
  icon: string;
  label: string;
  theme: ReturnType<typeof useAppTheme>;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        damping: theme.animations.springDamping,
        stiffness: theme.animations.springStiffness,
        delay,
      }}
      style={[
        styles.featureItem,
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
          styles.featureIconBg,
          {
            backgroundColor: theme.colors.accentMuted,
            borderRadius: theme.shapes.radiusSm,
          },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={theme.colors.accent} />
      </View>
      <Text
        style={[
          styles.featureLabel,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontBold,
            fontSize: theme.typography.sizeSm,
          },
        ]}
      >
        {label}
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
    width: "45%",
    paddingVertical: 16,
  },
  featureIconBg: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    textAlign: "center",
  },
  securityNoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  securityNote: {
    flex: 1,
    lineHeight: 18,
  },
});
