// src/components/DeleteModal.tsx

import React from "react";
import { Modal, Pressable, View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";

interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export default function DeleteModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
}: DeleteModalProps) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "timing", duration: theme.animations.durationNormal }}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.surfaceBorder,
                borderRadius: theme.components.modal.radius,
                padding: theme.components.modal.padding,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: theme.colors.error, fontFamily: theme.typography.fontBold },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
              ]}
            >
              {description}
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.btn,
                  {
                    backgroundColor: theme.colors.textMuted,
                    borderRadius: theme.components.button.radius,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Text style={[styles.btnTxt, { fontFamily: theme.typography.fontBold }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.btn,
                  {
                    backgroundColor: theme.colors.error,
                    borderRadius: theme.components.button.radius,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Text style={[styles.btnTxt, { fontFamily: theme.typography.fontBold }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </MotiView>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "90%",
    gap: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  title: { fontSize: 22, textAlign: "center" },
  description: { fontSize: 16, textAlign: "center", lineHeight: 22 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
  },
  btn: { paddingHorizontal: 24, paddingVertical: 12 },
  btnTxt: { color: "#fff", fontSize: 16 },
});
