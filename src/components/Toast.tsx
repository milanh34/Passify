// src/components/Toast.tsx

import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../themes/hooks/useAppTheme";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onHide?: () => void;
}

export default function Toast({
  message,
  visible,
  type = "success",
  duration = 3000,
  onHide,
}: ToastProps) {
  const theme = useAppTheme();
  const [internalVisible, setInternalVisible] = useState(visible);

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

  const getToastStyle = () => {
    switch (type) {
      case "error":
        return { bgColor: theme.colors.error, icon: "alert-circle" as const };
      case "warning":
        return { bgColor: theme.colors.warning, icon: "warning" as const };
      case "info":
        return { bgColor: theme.colors.info, icon: "information-circle" as const };
      case "success":
      default:
        return { bgColor: theme.colors.success, icon: "checkmark-circle" as const };
    }
  };

  const { bgColor, icon } = getToastStyle();
  const isTop = theme.components.toast.position === "top";

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
          transition={{
            type: "spring",
            damping: theme.animations.springDamping,
            stiffness: theme.animations.springStiffness,
          }}
          style={[
            styles.toast,
            {
              [isTop ? "top" : "bottom"]: theme.components.toast.offset,
              backgroundColor: bgColor,
              borderRadius: theme.components.toast.radius,
              paddingVertical: theme.components.toast.padding,
              paddingHorizontal: theme.components.toast.padding + 4,
              ...theme.shadows.lg,
            },
          ]}
        >
          <Ionicons name={icon} size={24} color="#fff" style={styles.icon} />
          <Text
            style={[styles.toastText, { fontFamily: theme.typography.fontRegular }]}
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
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
