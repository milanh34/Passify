import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, Button, useColorScheme } from "react-native";

type Field = { name: string; label: string; secure?: boolean };

export default function FormModal({
  visible,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => void;
  title: string;
  fields: Field[];
  initialData?: Record<string, any>;
}) {
  const scheme = useColorScheme();
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) setData(initialData as any);
  }, [visible, initialData]);

  const bg = scheme === "dark" ? "#0f172a" : "#fff";
  const text = scheme === "dark" ? "#e6edff" : "#0f172a";
  const input = scheme === "dark" ? "#1f2937" : "#f1f5f9";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: bg }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: text }]}>{title}</Text>
          {fields.map((f) => (
            <View key={f.name} style={{ marginBottom: 12 }}>
              <Text style={{ color: text, fontWeight: "700", marginBottom: 6 }}>{f.label}</Text>
              <TextInput
                value={data[f.name] ?? ""}
                onChangeText={(v) => setData((d) => ({ ...d, [f.name]: v }))}
                placeholder={f.label}
                placeholderTextColor="#94a3b8"
                secureTextEntry={f.secure}
                style={{ backgroundColor: input, color: text, padding: 12, borderRadius: 10 }}
              />
            </View>
          ))}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 14 }}>
            <Button title="Cancel" color="#ef4444" onPress={onClose} />
            <Button title="Save" onPress={() => onSubmit(data)} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "100%", borderRadius: 16, padding: 20, gap: 8 },
  title: { fontSize: 20, fontWeight: "900", marginBottom: 8 },
});
