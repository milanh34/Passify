import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export default function Toast({
  message,
  visible,
  type = "success",
  duration = 3000,
}: ToastProps) {
  const { colors, fontConfig } = useTheme();

  // Get colors and icons based on type
  const getToastStyle = () => {
    switch (type) {
      case "error":
        return {
          bgColor: "#EF4444",
          borderColor: "#DC2626",
          icon: "alert-circle" as const,
        };
      case "warning":
        return {
          bgColor: "#F59E0B",
          borderColor: "#D97706",
          icon: "warning" as const,
        };
      case "info":
        return {
          bgColor: "#3B82F6",
          borderColor: "#2563EB",
          icon: "information-circle" as const,
        };
      case "success":
      default:
        return {
          bgColor: colors.accent,
          borderColor: colors.accent2 || colors.accent,
          icon: "checkmark-circle" as const,
        };
    }
  };

  const { bgColor, borderColor, icon } = getToastStyle();

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{
            opacity: 0,
            translateY: 50,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            translateY: 50,
            scale: 0.9,
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 150,
          }}
          style={[
            styles.toast,
            {
              backgroundColor: bgColor,
              borderColor: borderColor,
            },
          ]}
        >
          <Ionicons name={icon} size={24} color="#fff" style={styles.icon} />
          <Text
            style={[styles.toastText, { fontFamily: fontConfig.regular }]}
            numberOfLines={3}
          >
            {message}
          </Text>
        </MotiView>
      )}
    </AnimatePresence>
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
    zIndex: 9999,
  },
  icon: {
    flexShrink: 0,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
});
