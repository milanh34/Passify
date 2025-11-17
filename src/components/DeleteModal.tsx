// src/components/DeleteModal.tsx

import React from "react";
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { useTheme } from "../context/ThemeContext";


interface DeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}


export default function DeleteModal({ visible, onClose, onConfirm, title, description }: DeleteModalProps) {
  const { colors, fontConfig } = useTheme();


  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "timing", duration: 220 }}>
          <View style={[styles.card, { backgroundColor: colors.modalCard, borderColor: colors.modalBorder }]}>
            <Text style={[styles.title, { color: colors.danger, fontFamily: fontConfig.bold }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.modalSubtext, fontFamily: fontConfig.regular }]}>{description}</Text>
            <View style={styles.buttonRow}>
              <MotiPressable animate={{ scale: 1 }} transition={{ type: "spring" }} whileTap={{ scale: 0.95 }}>
                <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Cancel</Text>
                </TouchableOpacity>
              </MotiPressable>
              <MotiPressable animate={{ scale: 1 }} transition={{ type: "spring" }} whileTap={{ scale: 0.95 }}>
                <TouchableOpacity onPress={() => { onConfirm(); onClose(); }} style={[styles.btn, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Delete</Text>
                </TouchableOpacity>
              </MotiPressable>
            </View>
          </View>
        </MotiView>
      </MotiView>
    </Modal>
  );
}


const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "90%", borderRadius: 20, padding: 24, gap: 12, overflow: "hidden", borderWidth: 1 },
  title: { fontSize: 22, textAlign: 'center' },
  description: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  buttonRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 12 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff", fontSize: 16 },
});
