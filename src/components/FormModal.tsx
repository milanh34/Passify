import React, { useState, useEffect } from "react";
import { View, Text, Modal, TextInput, StyleSheet, Button, useColorScheme, Pressable } from "react-native";

type Field = { name: string; label: string; secure?: boolean };

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  title: string;
  fields: Field[];
  initialData?: Record<string, string>;
}

export default function FormModal({ visible, onClose, onSubmit, title, fields, initialData }: FormModalProps) {
  const scheme = useColorScheme();
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setFormData(initialData || {});
    }
  }, [visible, initialData]);

  const handleSave = () => {
    onSubmit(formData);
    onClose();
  };

  const cardBg = scheme === "dark" ? "#1f2937" : "#fff";
  const text = scheme === "dark" ? "#f9fafb" : "#111827";
  const inputBg = scheme === "dark" ? "#374151" : "#f3f4f6";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor: cardBg }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: text }]}>{title}</Text>
          {fields.map((field) => (
            <View key={field.name} style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: text }]}
                value={formData[field.name] || ""}
                onChangeText={(val) => setFormData((prev) => ({ ...prev, [field.name]: val }))}
                secureTextEntry={field.secure}
                placeholderTextColor={scheme === "dark" ? "#9ca3af" : "#6b7280"}
              />
            </View>
          ))}
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={onClose} color="#ef4444" />
            <Button title="Save" onPress={handleSave} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "90%", borderRadius: 16, padding: 20, elevation: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { borderRadius: 8, padding: 12, fontSize: 16 },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 20, marginTop: 10 },
});
