// src/components/settings/TutorialSection.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import { resetOnboarding } from "../../utils/onboardingState";
import SettingsSection from "./SettingsSection";
import ConfirmModal from "../ConfirmModal";

export default function TutorialSection() {
  const theme = useAppTheme();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleReplay = async () => {
    setShowModal(false);
    await resetOnboarding();
    router.replace("/onboarding");
  };

  return (
    <SettingsSection title="Tutorial & Help" icon="school">
      <View style={[styles.row, { borderBottomColor: theme.colors.surfaceBorder }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="play-circle" size={24} color={theme.colors.accent} />
          <View>
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Replay Tutorial
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
              ]}
            >
              Go through the onboarding again
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => setShowModal(true)}
        style={[
          styles.button,
          { backgroundColor: theme.colors.accent, borderRadius: theme.shapes.buttonRadius },
        ]}
        android_ripple={{ color: theme.colors.background }}
      >
        <Ionicons name="refresh" size={20} color={theme.colors.textInverse} />
        <Text
          style={[
            styles.buttonText,
            { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
          ]}
        >
          Start Tutorial
        </Text>
      </Pressable>

      <ConfirmModal
        visible={showModal}
        title="Replay Tutorial?"
        message="This will take you through the onboarding slides again."
        confirmText="Start"
        cancelText="Cancel"
        type="info"
        onConfirm={handleReplay}
        onCancel={() => setShowModal(false)}
      />
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowLeft: {
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
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
  },
});
