// app/onboarding/Slide6GetStarted.tsx - VERSION 2 (Professional)

import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const quickStartSteps = [
  { number: "1", text: "Add your first platform" },
  { number: "2", text: "Store your credentials" },
  { number: "3", text: "Create an encrypted backup" },
];

export default function Slide6GetStarted() {
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
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 180 }}
          style={styles.successContainer}
        >
          <View
            style={[
              styles.successCircle,
              {
                backgroundColor: theme.colors.accentMuted,
                borderColor: theme.colors.accent,
              },
            ]}
          >
            <Ionicons name="rocket" size={60} color={theme.colors.accent} />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 200 }}
          style={styles.textContainer}
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
            Ready to Secure Your Digital Life
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
            Your privacy-first password vault is set up and ready to protect your credentials
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300, delay: 350 }}
          style={[
            styles.quickStartCard,
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
              marginBottom: 16,
            }}
          >
            Quick Start
          </Text>
          {quickStartSteps.map((step, index) => (
            <MotiView
              key={step.number}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", duration: 250, delay: 450 + index * 80 }}
              style={styles.stepRow}
            >
              <View
                style={[
                  styles.stepNumber,
                  {
                    backgroundColor: theme.colors.accent,
                    borderRadius: theme.shapes.radiusLg,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.textInverse,
                    fontFamily: theme.typography.fontBold,
                    fontSize: 13,
                  }}
                >
                  {step.number}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeMd,
                  flex: 1,
                }}
              >
                {step.text}
              </Text>
            </MotiView>
          ))}
        </MotiView>

        <View style={styles.trustIndicators}>
          <TrustBadge icon="shield-checkmark" text="AES-256" theme={theme} delay={700} />
          <TrustBadge icon="cloud-offline" text="Offline" theme={theme} delay={750} />
          <TrustBadge icon="code-slash" text="Open Source" theme={theme} delay={800} />
        </View>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 300, delay: 900 }}
        >
          <Text
            style={[
              styles.ctaText,
              {
                color: theme.colors.accent,
                fontFamily: theme.typography.fontBold,
              },
            ]}
          >
            Tap "Let's Go!" to begin
          </Text>
        </MotiView>
      </ScrollView>
    </View>
  );
}

function TrustBadge({
  icon,
  text,
  theme,
  delay,
}: {
  icon: string;
  text: string;
  theme: ReturnType<typeof useAppTheme>;
  delay: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 200, delay }}
      style={[
        styles.trustBadge,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
          borderRadius: theme.shapes.radiusMd,
        },
      ]}
    >
      <Ionicons name={icon as any} size={18} color={theme.colors.accent} />
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontFamily: theme.typography.fontBold,
          fontSize: 11,
        }}
      >
        {text}
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
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successContainer: {
    marginBottom: 28,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  quickStartCard: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  trustIndicators: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  ctaText: {
    fontSize: 15,
    textAlign: "center",
  },
});
