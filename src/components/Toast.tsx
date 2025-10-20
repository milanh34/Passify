import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error";
}

export default function Toast({ message, visible, type = "success" }: ToastProps) {
  const { colors, fontConfig } = useTheme();

  if (!visible) return null;

  const isError = type === "error";
  const bgColor = isError ? "#EF4444" : colors.accent;
  const borderColor = isError ? "#DC2626" : colors.accent2;
  const icon = isError ? "alert-circle" : "checkmark-circle";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 50 }}
      transition={{ type: "timing", duration: 300 }}
      style={[
        styles.toast,
        { 
          backgroundColor: bgColor, 
          borderColor: borderColor 
        },
      ]}
    >
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={[styles.toastText, { fontFamily: fontConfig.regular }]}>
        {message}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
  },
});
