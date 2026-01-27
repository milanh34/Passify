// app/onboarding/Slide6GetStarted.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

export default function Slide6GetStarted() {
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
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              damping: theme.animations.springDamping,
              stiffness: theme.animations.springStiffness,
            }}
            style={[
              styles.successIcon,
              {
                backgroundColor: theme.colors.accentMuted,
                width: 120,
                height: 120,
                borderRadius: 60,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.accent} />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 200 }}
          >
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeHero,
                  marginBottom: theme.spacing.lg,
                },
              ]}
            >
              You're All Set!
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 300 }}
          >
            <Text
              style={[
                styles.description,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeLg,
                  lineHeight: 24,
                  marginBottom: theme.spacing.xxl,
                },
              ]}
            >
              Use your master password to encrypt all your data into a single secure image.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 400 }}
            style={[
              styles.infoBox,
              {
                backgroundColor: theme.colors.accentMuted,
                borderColor: theme.colors.accent,
                borderWidth: theme.shapes.borderThin,
                borderRadius: theme.shapes.radiusMd,
                padding: theme.spacing.lg,
              },
            ]}
          >
            <Ionicons name="information-circle" size={24} color={theme.colors.accent} />
            <Text
              style={[
                styles.infoText,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeSm + 1,
                  lineHeight: 20,
                },
              ]}
            >
              Your data stays on your device. Nothing is synced to external servers.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal, delay: 500 }}
          >
            <Text
              style={[
                styles.cta,
                {
                  color: theme.colors.accent,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd,
                  marginTop: theme.spacing.xl,
                },
              ]}
            >
              Tap "Let's Go!" to start securing your passwords
            </Text>
          </MotiView>
        </View>
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
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    alignItems: "center",
    paddingBottom: 20,
  },
  successIcon: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  infoText: {
    flex: 1,
  },
  cta: {
    textAlign: "center",
  },
});
