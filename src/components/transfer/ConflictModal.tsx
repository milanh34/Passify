// src/components/transfer/ConflictModal.tsx

import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";


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


export default function ConflictModal({
  visible,
  conflict,
  onDecision,
}: ConflictModalProps) {
  const { colors, fontConfig } = useTheme();


  if (!conflict) return null;


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackdrop}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 200 }}
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.accent,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Ionicons name="warning" size={32} color={colors.accent} />
            <Text
              style={[
                styles.modalTitle,
                { color: colors.text, fontFamily: fontConfig.bold },
              ]}
            >
              Account Already Exists
            </Text>
          </View>


          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalText,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              An account with {conflict.identifierField}{" "}
              <Text
                style={{ color: colors.accent, fontFamily: fontConfig.bold }}
              >
                {conflict.newAccount[conflict.identifierField]}
              </Text>{" "}
              already exists in {conflict.platformName}.
            </Text>


            <View
              style={[
                styles.comparisonBox,
                {
                  backgroundColor: colors.bg[0] + "40",
                  borderColor: colors.accent + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.comparisonTitle,
                  { color: colors.accent2, fontFamily: fontConfig.bold },
                ]}
              >
                Existing Account:
              </Text>
              <Text
                style={[
                  styles.comparisonText,
                  { color: colors.text, fontFamily: fontConfig.regular },
                ]}
              >
                Name: {conflict.existingAccount.name}
              </Text>
            </View>


            <Text
              style={[
                styles.modalQuestion,
                { color: colors.text, fontFamily: fontConfig.bold },
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
                { backgroundColor: colors.card, borderColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: colors.accent, fontFamily: fontConfig.bold },
                ]}
              >
                Skip
              </Text>
            </Pressable>


            <Pressable
              onPress={() => onDecision("update", false)}
              style={[
                styles.modalButton,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: "#fff", fontFamily: fontConfig.bold },
                ]}
              >
                Update
              </Text>
            </Pressable>
          </View>


          <View style={styles.modalFooter}>
            <Pressable
              onPress={() => onDecision("skip", true)}
              style={styles.applyAllButton}
            >
              <Text
                style={[
                  styles.applyAllText,
                  { color: colors.subtext, fontFamily: fontConfig.regular },
                ]}
              >
                Skip All Remaining
              </Text>
            </Pressable>


            <Pressable
              onPress={() => onDecision("update", true)}
              style={styles.applyAllButton}
            >
              <Text
                style={[
                  styles.applyAllText,
                  { color: colors.accent, fontFamily: fontConfig.bold },
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
    borderRadius: 20,
    padding: 24,
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
    borderRadius: 12,
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
    borderRadius: 12,
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
