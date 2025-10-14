import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  const { colors, fontConfig } = useTheme();

  if (!visible) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 50 }}
      transition={{ type: "timing", duration: 300 }}
      style={[
        styles.toast,
        { backgroundColor: colors.accent, borderColor: colors.accent2 },
      ]}
    >
      <Ionicons name="checkmark-circle" size={24} color="#fff" />
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
