// app/onboarding/Slide1Welcome.tsx - VERSION 2 (Professional)

import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Slide1Welcome() {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        indicatorStyle={theme.isDark ? "white" : "black"}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            style={[
              styles.logoContainer,
              {
                shadowColor: theme.colors.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              },
            ]}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: 150 }}
          >
            <Text
              style={[
                styles.brandName,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                },
              ]}
            >
              Passify
            </Text>
            <Text
              style={[
                styles.tagline,
                {
                  color: theme.colors.accent,
                  fontFamily: theme.typography.fontRegular,
                },
              ]}
            >
              Privacy-First Password Security
            </Text>
          </MotiView>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
          style={styles.valueProposition}
        >
          <Text
            style={[
              styles.headline,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
              },
            ]}
          >
            Your Credentials.{"\n"}Your Device.{"\n"}Your Control.
          </Text>
        </MotiView>

        <View style={[styles.statsRow, { marginTop: theme.spacing.xxl }]}>
          <StatItem value="256" label="bit AES" icon="shield-checkmark" theme={theme} delay={400} />
          <StatItem value="0" label="Servers" icon="cloud-offline" theme={theme} delay={500} />
          <StatItem value="200+" label="Platforms" icon="layers" theme={theme} delay={600} />
        </View>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400, delay: 700 }}
          style={[
            styles.trustBadge,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.shapes.radiusLg,
            },
          ]}
        >
          <View style={styles.trustContent}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.accent} />
            <View style={styles.trustText}>
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd,
                }}
              >
                100% Offline
              </Text>
              <Text
                style={{
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeSm,
                }}
              >
                No data ever leaves your device
              </Text>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}

function StatItem({
  value,
  label,
  icon,
  theme,
  delay,
}: {
  value: string;
  label: string;
  icon: string;
  theme: ReturnType<typeof useAppTheme>;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
      style={[
        styles.statItem,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.shapes.radiusMd,
          borderWidth: theme.shapes.borderThin,
          borderColor: theme.colors.surfaceBorder,
        },
      ]}
    >
      <Ionicons name={icon as any} size={20} color={theme.colors.accent} />
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.fontBold,
          fontSize: theme.typography.sizeXl,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: theme.colors.textSecondary,
          fontFamily: theme.typography.fontRegular,
          fontSize: theme.typography.sizeSm,
        }}
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  appIcon: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  brandName: {
    fontSize: 36,
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  valueProposition: {
    alignItems: "center",
  },
  headline: {
    fontSize: 28,
    lineHeight: 38,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  trustBadge: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
  },
  trustContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  trustText: {
    flex: 1,
  },
});
