import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const [fields, setFields] = useState<string[]>([]);

  useEffect(() => {
    if (visible) setFields(initialSchema);
  }, [visible, initialSchema]);

  const update = (i: number, v: string) => setFields((arr) => arr.map((f, idx) => (idx === i ? v : f)));
  const addField = () => setFields((arr) => [...arr, ""]);
  const remove = (i: number) => setFields((arr) => arr.filter((_, idx) => idx !== i));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Edit Schema</Text>
          {fields.map((f, i) => (
            <View key={i} style={styles.row}>
              <TextInput value={f} onChangeText={(v) => update(i, v)} placeholder="field name (e.g., dateOfBirth)" style={styles.input} />
              <TouchableOpacity onPress={() => remove(i)} style={styles.del}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addField} style={styles.add}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800" }}>Add Field</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: "#ef4444" }]}>
              <Text style={styles.btnTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(fields)} style={[styles.btn, { backgroundColor: "#22c55e" }]}>
              <Text style={styles.btnTxt}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "100%", borderRadius: 16, padding: 20, backgroundColor: "#0b1220", gap: 12 },
  title: { fontSize: 20, fontWeight: "900", color: "#e6edff" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, backgroundColor: "#111827", color: "#e6edff", padding: 12, borderRadius: 10 },
  del: { padding: 8 },
  add: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#6366f1", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 6 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnTxt: { color: "#fff", fontWeight: "800" },
});
