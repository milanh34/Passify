// app/onboarding/Slide6GetStarted.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import OnboardingSlide from "../../src/components/OnboardingSlide";
import { Ionicons } from "@expo/vector-icons";

export default function Slide6GetStarted() {
  const { colors, fontConfig } = useTheme();

  return (
    <OnboardingSlide slideIndex={5}>
      <View style={styles.container}>
        <View style={[styles.successIcon, { backgroundColor: `${colors.accent}15` }]}>
          <Ionicons name="checkmark-circle" size={80} color={colors.accent} />
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
          You're All Set!
        </Text>

        <Text
          style={[styles.description, { color: colors.subtext, fontFamily: fontConfig.regular }]}
        >
          Use your master password to encrypt all your data into a single secure image.
        </Text>

        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: `${colors.accent}10`,
              borderColor: `${colors.accent}30`,
            },
          ]}
        >
          <Ionicons name="information-circle" size={24} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.text, fontFamily: fontConfig.regular }]}>
            Your data stays on your device. Nothing is synced to external servers.
          </Text>
        </View>

        <Text style={[styles.cta, { color: colors.accent, fontFamily: fontConfig.bold }]}>
          Tap "Let's Go!" to start securing your passwords
        </Text>
      </View>
    </OnboardingSlide>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  cta: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});
