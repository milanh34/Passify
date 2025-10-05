import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";

export default function SchemaModal({
  visible,
  initialSchema,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialSchema: string[];
  onClose: () => void;
  onSave: (fields: string[]) => void;
}) {
  const { colors, fontConfig } = useTheme();
  const [fields, setFields] = useState<string[]>([]);

  useEffect(() => {
    if (visible) setFields(initialSchema);
  }, [visible, initialSchema]);

  const update = (i: number, v: string) => setFields((arr) => arr.map((f, idx) => (idx === i ? v : f)));
  const addField = () => setFields((arr) => [...arr, ""]);
  const remove = (i: number) => setFields((arr) => arr.filter((_, idx) => idx !== i));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.backdrop}>
        <MotiView from={{ translateY: 100, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} transition={{ type: "timing", duration: 300 }}>
          <Pressable style={[styles.card, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={[colors.accent, colors.accent2 ?? colors.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientHeader} />
            <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Edit Schema</Text>
            {fields.map((f, i) => (
              <View key={`${i}-${f}`} style={styles.row}>
                <TextInput value={f} onChangeText={(v) => update(i, v)} placeholder="field name (e.g., dateOfBirth)" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]} />
                <TouchableOpacity onPress={() => remove(i)} style={styles.del}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addField} style={[styles.add, { backgroundColor: colors.accent }]}>
              <Ionicons name="add" size={20} color="#fff" />
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
          </Pressable>
        </MotiView>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "95%", maxWidth: 420, borderRadius: 20, padding: 22, gap: 12 },
  gradientHeader: { height: 6, width: "100%", position: "absolute", top: 0, left: 0, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 20, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "rgba(127,127,127,0.12)" },
  del: { padding: 8 },
  add: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  actions: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 6 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff" },
});
