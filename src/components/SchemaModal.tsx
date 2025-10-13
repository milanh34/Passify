import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Define a type for a field with a stable ID
type SchemaField = {
  id: string;
  value: string;
};

export default function SchemaModal({ 
  visible, 
  currentSchema, // CHANGED: Accept currentSchema instead of initialSchema
  onClose, 
  onSave 
}: { 
  visible: boolean; 
  currentSchema: string[]; // CHANGED: Renamed prop
  onClose: () => void; 
  onSave: (fields: string[]) => void; 
}) {
  const { colors, fontConfig } = useTheme();
  const [fields, setFields] = useState<SchemaField[]>([]);

  useEffect(() => {
    if (visible && currentSchema) { // ADDED: Check if currentSchema exists
      // Convert the initial schema strings into objects with stable IDs
      setFields(currentSchema.map((value, index) => ({ id: `${index}-${Date.now()}`, value })));
    }
  }, [visible, currentSchema]); // CHANGED: Use currentSchema

  const update = (id: string, newValue: string) => {
    setFields((currentFields) =>
      currentFields.map((field) => (field.id === id ? { ...field, value: newValue } : field))
    );
  };

  const addField = () => {
    setFields((currentFields) => [...currentFields, { id: `new-${Date.now()}`, value: "" }]);
  };

  const remove = (id: string) => {
    setFields((currentFields) => currentFields.filter((field) => field.id !== id));
  };

  const handleSave = () => {
    // Convert back to an array of strings before saving
    const validFields = fields.map(f => f.value.trim()).filter(Boolean);
    if (validFields.length > 0) {
      onSave(validFields);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView 
        from={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <MotiView 
          from={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }} 
          transition={{ type: "timing", duration: 220 }}
        >
          <View style={[styles.card, { backgroundColor: colors.modalCard, borderColor: colors.modalBorder }]}>
            <Text style={[styles.title, { color: colors.modalText, fontFamily: fontConfig.bold }]}>
              Edit Schema
            </Text>
            {fields.map((field) => (
              <View key={field.id} style={styles.row}>
                <TextInput
                  value={field.value}
                  onChangeText={(v) => update(field.id, v)}
                  placeholder="field name (e.g., email)"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, { 
                    color: colors.modalText, 
                    fontFamily: fontConfig.regular, 
                    borderColor: colors.modalBorder 
                  }]}
                />
                <TouchableOpacity onPress={() => remove(field.id)} style={styles.del}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
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
              <TouchableOpacity onPress={handleSave} style={[styles.btn, { backgroundColor: colors.accent }]}>
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
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "95%", borderRadius: 20, padding: 24, gap: 12, overflow: "hidden", borderWidth: 1 },
  title: { fontSize: 20, textAlign: "center", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: "rgba(127,127,127,0.12)", borderWidth: 1 },
  del: { padding: 8, borderRadius: 10 },
  add: { marginTop: 8, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  actions: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff", fontSize: 16 },
});
