// src/components/FormModal.tsx

import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { useTheme } from "../context/ThemeContext";


type Field = { name: string; label: string; secure?: boolean };


export default function FormModal({ visible, onClose, onSubmit, title, fields, initialData = {} }: { visible: boolean; onClose: () => void; onSubmit: (data: Record<string, string>) => void; title: string; fields: Field[]; initialData?: Record<string, any>; }) {
  const { colors, fontConfig } = useTheme();
  const [data, setData] = useState<Record<string, string>>({});


  useEffect(() => { if (visible) setData(initialData as any); }, [visible, initialData]);


  const handleSave = () => onSubmit(data);


  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "timing", duration: 220 }}>
          <View style={[styles.card, { backgroundColor: colors.modalCard, borderColor: colors.modalBorder }]}>
            <Text style={[styles.title, { color: colors.modalText, fontFamily: fontConfig.bold }]}>{title}</Text>
            {fields.map((f) => (
              <View key={f.name} style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.modalSubtext, fontFamily: fontConfig.bold, marginBottom: 6 }}>{f.label}</Text>
                <TextInput
                  value={data[f.name] ?? ""}
                  onChangeText={(v) => setData((d) => ({ ...d, [f.name]: v }))}
                  placeholder={f.label}
                  placeholderTextColor={colors.muted}
                  secureTextEntry={f.secure}
                  style={{ backgroundColor: "rgba(127,127,127,0.12)", color: colors.modalText, padding: 12, borderRadius: 10, fontFamily: fontConfig.regular, borderWidth: 1, borderColor: colors.modalBorder }}
                />
              </View>
            ))}
            <View style={styles.buttonRow}>
              <MotiPressable animate={{ scale: 1 }} transition={{ type: "spring" }} whileTap={{ scale: 0.95 }}>
                <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Cancel</Text>
                </TouchableOpacity>
              </MotiPressable>
              <MotiPressable animate={{ scale: 1 }} transition={{ type: "spring" }} whileTap={{ scale: 0.95 }}>
                <TouchableOpacity onPress={handleSave} style={[styles.btn, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Save</Text>
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
  card: { width: "90%", borderRadius: 20, padding: 24, gap: 8, overflow: "hidden", borderWidth: 1 },
  title: { fontSize: 20, marginBottom: 8, textAlign: "center" },
  buttonRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 8 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff" },
});
