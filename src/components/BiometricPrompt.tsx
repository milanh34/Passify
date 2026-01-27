// src/components/BiometricPrompt.tsx

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { getBiometricIcon, getBiometricTypeName, BiometricType } from "../utils/biometricAuth";

interface BiometricPromptProps {
  biometricType: BiometricType;
  onPress: () => void;
  isLoading?: boolean;
}

export default function BiometricPrompt({
  biometricType,
  onPress,
  isLoading = false,
}: BiometricPromptProps) {
  const theme = useAppTheme();
  const iconName = getBiometricIcon(biometricType);
  const typeName = getBiometricTypeName(biometricType);

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: theme.animations.durationNormal }}
      style={styles.container}
    >
      <Pressable
        onPress={onPress}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.promptButton,
          {
            backgroundColor: theme.colors.accentMuted,
            borderColor: theme.colors.accent,
            borderWidth: theme.shapes.borderThick,
            borderRadius: theme.components.modal.radius,
            paddingVertical: theme.spacing.xxl + 16,
            paddingHorizontal: theme.spacing.xxl,
            gap: theme.spacing.lg,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        android_ripple={{ color: theme.colors.accentMuted }}
      >
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: isLoading ? 1.1 : 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: isLoading,
          }}
        >
          <Ionicons name={iconName as any} size={64} color={theme.colors.accent} />
        </MotiView>

        <Text
          style={[
            styles.promptTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeXl,
            },
          ]}
        >
          {isLoading ? "Authenticating..." : `Unlock with ${typeName}`}
        </Text>

        <Text
          style={[
            styles.promptSubtitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeMd,
            },
          ]}
        >
          {isLoading ? "Please wait" : `Tap to use ${typeName}`}
        </Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  promptButton: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  promptTitle: {
    textAlign: "center",
  },
  promptSubtitle: {
    textAlign: "center",
  },
});
