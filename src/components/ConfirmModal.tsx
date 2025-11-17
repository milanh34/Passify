// src/components/ConfirmModal.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";


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
  const { colors, fontConfig } = useTheme();


  const iconName =
    type === "danger"
      ? "alert-circle"
      : type === "warning"
      ? "warning"
      : "information-circle";


  const iconColor =
    type === "danger"
      ? colors.danger
      : type === "warning"
      ? "#FF9800"
      : colors.accent;


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
            transition={{ type: "timing", duration: 200 }}
            style={[
              styles.modalContainer,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${iconColor}15` },
              ]}
            >
              <Ionicons name={iconName} size={48} color={iconColor} />
            </View>


            <Text
              style={[
                styles.title,
                { color: colors.text, fontFamily: fontConfig.bold },
              ]}
            >
              {title}
            </Text>


            <Text
              style={[
                styles.message,
                { color: colors.subtext, fontFamily: fontConfig.regular },
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
                    backgroundColor: pressed
                      ? `${colors.cardBorder}40`
                      : colors.bg[0],
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: colors.text, fontFamily: fontConfig.bold },
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
                    backgroundColor: pressed
                      ? `${iconColor}CC`
                      : iconColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#FFFFFF", fontFamily: fontConfig.bold },
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
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
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
    paddingVertical: 14,
    borderRadius: 12,
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
