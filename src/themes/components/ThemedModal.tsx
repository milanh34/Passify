// src/themes/components/ThemedModal.tsx

import React from "react";
import { Modal, ModalProps, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { BlurView } from "expo-blur";
import { useGlobalTheme } from "../../context/GlobalThemeContext";
import { useThemedAnimation } from "../hooks/useThemedAnimation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ThemedModalProps extends Omit<ModalProps, "children"> {
  children: React.ReactNode;
  onClose?: () => void;
  fullWidth?: boolean;
  position?: "center" | "bottom";
}

export function ThemedModal({
  visible,
  onClose,
  fullWidth = false,
  position = "center",
  children,
  ...props
}: ThemedModalProps) {
  const { theme } = useGlobalTheme();
  const animations = useThemedAnimation();
  const { components, colors, shadows } = theme;

  const modalAnimation = animations.modalEntry;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...props}>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.isDark ? colors.overlay : colors.overlayHeavy,
            justifyContent: position === "center" ? "center" : "flex-end",
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <AnimatePresence>
          {visible && (
            <MotiView
              from={modalAnimation.from}
              animate={modalAnimation.animate}
              exit={modalAnimation.from}
              transition={modalAnimation.transition}
              style={[
                styles.content,
                {
                  backgroundColor: colors.surface,
                  borderRadius:
                    position === "bottom" ? components.modal.radius : components.modal.radius,
                  borderBottomLeftRadius: position === "bottom" ? 0 : components.modal.radius,
                  borderBottomRightRadius: position === "bottom" ? 0 : components.modal.radius,
                  padding: components.modal.padding,
                  maxWidth: fullWidth ? SCREEN_WIDTH : components.modal.maxWidth,
                  width: fullWidth ? "100%" : SCREEN_WIDTH - 40,
                  ...shadows.xl,
                },
              ]}
            >
              {children}
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  content: {
    overflow: "hidden",
  },
});
