import React from "react";
import { Modal, Pressable, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.backdrop}>
        <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "timing" }}>
          <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={[colors.danger, colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientHeader} />
            <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.subtext, fontFamily: fontConfig.regular }]}>{description}</Text>
            <View style={styles.buttonRow}>
              <MotiPressable animate={{ scale: 1 }} transition={{ type: 'spring' }} whileTap={{ scale: 0.95 }}>
                <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Cancel</Text>
                </TouchableOpacity>
              </MotiPressable>
              <MotiPressable animate={{ scale: 1 }} transition={{ type: 'spring' }} whileTap={{ scale: 0.95 }}>
                <TouchableOpacity onPress={() => { onConfirm(); onClose(); }} style={[styles.btn, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Delete</Text>
                </TouchableOpacity>
              </MotiPressable>
            </View>
          </Pressable>
        </MotiView>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "95%", maxWidth: 420, borderRadius: 20, padding: 24, gap: 12 },
  gradientHeader: { height: 8, width: "100%", position: "absolute", top: 0, left: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 22, textAlign: "center" },
  description: { fontSize: 16, textAlign: "center", lineHeight: 22 },
  buttonRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 12 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff", fontSize: 16 },
});
