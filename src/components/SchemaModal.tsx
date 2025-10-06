import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { useTheme } from "../context/ThemeContext";

export default function SchemaModal({ visible, initialSchema, onClose, onSave }: { visible: boolean; initialSchema: string[]; onClose: () => void; onSave: (fields: string[]) => void; }) {
  const { colors, fontConfig } = useTheme();
  const [fields, setFields] = useState<string[]>([]);

  useEffect(() => { if (visible) setFields(initialSchema); }, [visible, initialSchema]);

  const update = (i: number, v: string) => setFields((arr) => arr.map((f, idx) => (idx === i ? v : f)));
  const addField = () => setFields((arr) => [...arr, ""]);
  const remove = (i: number) => setFields((arr) => arr.filter((_, idx) => idx !== i));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "timing", duration: 220 }}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Edit Schema</Text>
            {fields.map((f, i) => (
              <View key={`${i}-${f}`} style={styles.row}>
                <TextInput value={f} onChangeText={(v) => update(i, v)} placeholder="field name (e.g., dateOfBirth)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]} />
                <TouchableOpacity onPress={() => remove(i)} style={[styles.del, { backgroundColor: "rgba(127,127,127,0.12)" }]}>
                  <Text style={{ color: colors.danger, fontFamily: fontConfig.bold }}>Del</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addField} style={[styles.add, { backgroundColor: colors.accent }]}>
              <Text style={{ color: "#fff", fontFamily: fontConfig.bold }}>Add Field</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSave(fields)} style={[styles.btn, { backgroundColor: colors.accent }]}>
                <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "90%", maxWidth: 520, borderRadius: 20, padding: 24, gap: 12, overflow: "hidden" },
  title: { fontSize: 20, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "rgba(127,127,127,0.12)" },
  del: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  add: { marginTop: 8, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  actions: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 6 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff" },
});
