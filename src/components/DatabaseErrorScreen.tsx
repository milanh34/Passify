// src/components/DatabaseErrorScreen.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../themes/hooks/useAppTheme";

interface DatabaseErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export default function DatabaseErrorScreen({ error, onRetry }: DatabaseErrorScreenProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + theme.spacing.xxl,
          paddingBottom: insets.bottom + theme.spacing.xxl,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + "20" }]}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        </View>

        <Text
          style={[
            styles.title,
            { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
          ]}
        >
          Database Error
        </Text>

        <Text
          style={[
            styles.description,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
          ]}
        >
          We couldn't load your encrypted data. This might happen if:
        </Text>

        <View style={styles.reasonsList}>
          <Text
            style={[
              styles.reason,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
            ]}
          >
            • The app was updated and needs to migrate data
          </Text>
          <Text
            style={[
              styles.reason,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
            ]}
          >
            • The encryption key was reset
          </Text>
          <Text
            style={[
              styles.reason,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
            ]}
          >
            • The data was corrupted
          </Text>
        </View>

        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
        >
          <Text
            style={[
              styles.errorLabel,
              { color: theme.colors.textMuted, fontFamily: theme.typography.fontBold },
            ]}
          >
            Error Details:
          </Text>
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.error, fontFamily: theme.typography.fontRegular },
            ]}
            selectable
          >
            {error}
          </Text>
        </View>

        <Pressable
          onPress={onRetry}
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.colors.buttonPrimary,
              borderRadius: theme.components.button.radius,
              height: theme.components.button.height,
            },
          ]}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.textInverse} />
          <Text
            style={[
              styles.retryButtonText,
              { fontFamily: theme.typography.fontBold, color: theme.colors.textInverse },
            ]}
          >
            Try Again
          </Text>
        </Pressable>

        <Text
          style={[
            styles.hint,
            { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
          ]}
        >
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
    paddingHorizontal: 32,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
