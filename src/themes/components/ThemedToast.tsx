// src/themes/components/ThemedToast.tsx

import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { ThemedText } from "./ThemedText";

interface ThemedToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onHide?: () => void;
}

export function ThemedToast({
  message,
  visible,
  type = "success",
  duration = 3000,
  onHide,
}: ThemedToastProps) {
  const { theme } = useGlobalTheme();
  const [internalVisible, setInternalVisible] = useState(visible);
  const { components, colors, shadows, animations } = theme;

  useEffect(() => {
    setInternalVisible(visible);
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setInternalVisible(false);
        onHide?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  const getTypeConfig = () => {
    switch (type) {
      case "error":
        return { bg: colors.error, icon: "alert-circle" as const };
      case "warning":
        return { bg: colors.warning, icon: "warning" as const };
      case "info":
        return { bg: colors.info, icon: "information-circle" as const };
      case "success":
      default:
        return { bg: colors.success, icon: "checkmark-circle" as const };
    }
  };

  const { bg, icon } = getTypeConfig();
  const isTop = components.toast.position === "top";

  const transition =
    animations.springDefault.stiffness > 200
      ? { type: "timing" as const, duration: animations.durationNormal }
      : {
          type: "spring" as const,
          damping: animations.springDefault.damping,
          stiffness: animations.springDefault.stiffness,
        };

  return (
    <AnimatePresence>
      {internalVisible && (
        <MotiView
          from={{
            opacity: 0,
            translateY: isTop ? -50 : 50,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            translateY: isTop ? -50 : 50,
            scale: 0.9,
          }}
          transition={transition}
          style={[
            styles.container,
            {
              [isTop ? "top" : "bottom"]: components.toast.offset,
              backgroundColor: bg,
              borderRadius: components.toast.radius,
              padding: components.toast.padding,
              ...shadows.lg,
            },
          ]}
        >
          <Ionicons name={icon} size={24} color="#fff" />
          <ThemedText
            variant="inverse"
            size="md"
            style={{ flex: 1, color: "#fff" }}
            numberOfLines={3}
          >
            {message}
          </ThemedText>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 9999,
  },
});
