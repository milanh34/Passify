// src/components/DatabaseErrorScreen.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DatabaseErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export default function DatabaseErrorScreen({ error, onRetry }: DatabaseErrorScreenProps) {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg[0],
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.danger + "20" }]}>
          <Ionicons name="alert-circle" size={64} color={colors.danger} />
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
          Database Error
        </Text>

        <Text
          style={[styles.description, { color: colors.subtext, fontFamily: fontConfig.regular }]}
        >
          We couldn't load your encrypted data. This might happen if:
        </Text>

        <View style={styles.reasonsList}>
          <Text style={[styles.reason, { color: colors.subtext, fontFamily: fontConfig.regular }]}>
            • The app was updated and needs to migrate data
          </Text>
          <Text style={[styles.reason, { color: colors.subtext, fontFamily: fontConfig.regular }]}>
            • The encryption key was reset
          </Text>
          <Text style={[styles.reason, { color: colors.subtext, fontFamily: fontConfig.regular }]}>
            • The data was corrupted
          </Text>
        </View>

        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.errorLabel, { color: colors.muted, fontFamily: fontConfig.bold }]}>
            Error Details:
          </Text>
          <Text
            style={[styles.errorText, { color: colors.danger, fontFamily: fontConfig.regular }]}
            selectable
          >
            {error}
          </Text>
        </View>

        <Pressable
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={[styles.retryButtonText, { fontFamily: fontConfig.bold }]}>Try Again</Text>
        </Pressable>

        <Text style={[styles.hint, { color: colors.muted, fontFamily: fontConfig.regular }]}>
          If this persists, you may need to restore from a backup image using the Decoder.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  reasonsList: {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    gap: 4,
  },
  reason: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    alignSelf: "stretch",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  errorLabel: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
