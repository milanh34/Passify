// src/components/ConfirmModal.tsx

import React from "react";
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";

const { width } = Dimensions.get("window");

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "info" | "warning" | "danger";
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
}: ConfirmModalProps) {
  const theme = useAppTheme();

  const iconName =
    type === "danger" ? "alert-circle" : type === "warning" ? "warning" : "information-circle";

  const iconColor =
    type === "danger"
      ? theme.colors.error
      : type === "warning"
        ? theme.colors.warning
        : theme.colors.accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.darkOverlay}>
        <BlurView
          intensity={Platform.OS === "ios" ? 30 : 10}
          tint="dark"
          style={styles.blurOverlay}
        >
          <Pressable style={styles.backdrop} onPress={onCancel} />

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal }}
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.surfaceBorder,
                borderRadius: theme.components.modal.radius,
                padding: theme.components.modal.padding,
                ...theme.shadows.lg,
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons name={iconName} size={48} color={iconColor} />
            </View>

            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              {title}
            </Text>

            <Text
              style={[
                styles.message,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
              ]}
            >
              {message}
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor: pressed ? theme.colors.accentMuted : theme.colors.background,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.components.button.radius,
                    height: theme.components.button.height,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  {cancelText}
                </Text>
              </Pressable>

              <Pressable
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.button,
                  styles.confirmButton,
                  {
                    backgroundColor: pressed ? `${iconColor}CC` : iconColor,
                    borderRadius: theme.components.button.radius,
                    height: theme.components.button.height,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#FFFFFF", fontFamily: theme.typography.fontBold },
                  ]}
                >
                  {confirmText}
                </Text>
              </Pressable>
            </View>
          </MotiView>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  darkOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  blurOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: width - 48,
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  buttonText: {
    fontSize: 15,
  },
});
