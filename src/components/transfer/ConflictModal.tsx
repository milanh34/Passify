// src/components/transfer/ConflictModal.tsx

import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../themes/hooks/useAppTheme";

type ConflictResolution = "update" | "skip";

interface ConflictModalProps {
  visible: boolean;
  conflict: {
    platformName: string;
    existingAccount: any;
    newAccount: any;
    identifierField: string;
  } | null;
  onDecision: (action: ConflictResolution, applyToAll: boolean) => void;
}

export default function ConflictModal({ visible, conflict, onDecision }: ConflictModalProps) {
  const theme = useAppTheme();

  if (!conflict) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.modalBackdrop}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: theme.animations.durationNormal }}
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.accent,
              borderRadius: theme.components.modal.radius,
              padding: theme.components.modal.padding,
              ...theme.shadows.lg,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Ionicons name="warning" size={32} color={theme.colors.accent} />
            <Text
              style={[
                styles.modalTitle,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Account Already Exists
            </Text>
          </View>

          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalText,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
              ]}
            >
              An account with {conflict.identifierField}{" "}
              <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.fontBold }}>
                {conflict.newAccount[conflict.identifierField]}
              </Text>{" "}
              already exists in {conflict.platformName}.
            </Text>

            <View
              style={[
                styles.comparisonBox,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.accentMuted,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Text
                style={[
                  styles.comparisonTitle,
                  { color: theme.colors.accentSecondary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Existing Account:
              </Text>
              <Text
                style={[
                  styles.comparisonText,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontRegular },
                ]}
              >
                Name: {conflict.existingAccount.name}
              </Text>
            </View>

            <Text
              style={[
                styles.modalQuestion,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              What would you like to do?
            </Text>
          </View>

          <View style={styles.modalButtons}>
            <Pressable
              onPress={() => onDecision("skip", false)}
              style={[
                styles.modalButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.accent,
                  borderRadius: theme.components.button.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                ]}
              >
                Skip
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onDecision("update", false)}
              style={[
                styles.modalButton,
                {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.components.button.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
                ]}
              >
                Update
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalFooter}>
            <Pressable onPress={() => onDecision("skip", true)} style={styles.applyAllButton}>
              <Text
                style={[
                  styles.applyAllText,
                  { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
                ]}
              >
                Skip All Remaining
              </Text>
            </Pressable>

            <Pressable onPress={() => onDecision("update", true)} style={styles.applyAllButton}>
              <Text
                style={[
                  styles.applyAllText,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                ]}
              >
                Update All Remaining
              </Text>
            </Pressable>
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderWidth: 2,
  },
  modalHeader: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, textAlign: "center" },
  modalContent: { gap: 16, marginBottom: 24 },
  modalText: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  comparisonBox: {
    padding: 16,
    borderWidth: 1,
  },
  comparisonTitle: { fontSize: 14, marginBottom: 8 },
  comparisonText: { fontSize: 13, lineHeight: 20 },
  modalQuestion: { fontSize: 16, textAlign: "center", marginTop: 8 },
  modalButtons: { flexDirection: "row", gap: 12, marginBottom: 16 },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  modalButtonText: { fontSize: 16 },
  modalFooter: { gap: 8 },
  applyAllButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  applyAllText: { fontSize: 14 },
});
