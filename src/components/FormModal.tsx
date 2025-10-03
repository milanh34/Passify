import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";

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
  const { colors, fontConfig } = useTheme();
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) setData(initialData as any);
  }, [visible, initialData]);

  const handleSave = () => onSubmit(data);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.backdrop}>
        <MotiView
          from={{ translateY: 100, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <Pressable
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={[colors.accent, colors.accent2 ?? colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientHeader}
            />
            <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
              {title}
            </Text>
            {fields.map((f) => (
              <View key={f.name} style={{ marginBottom: 12 }}>
                <Text
                  style={{ color: colors.subtext, fontFamily: fontConfig.bold, marginBottom: 6 }}
                >
                  {f.label}
                </Text>
                <TextInput
                  value={data[f.name] ?? ""}
                  onChangeText={(v) => setData((d) => ({ ...d, [f.name]: v }))}
                  placeholder={f.label}
                  placeholderTextColor={colors.muted}
                  secureTextEntry={f.secure}
                  style={{
                    backgroundColor: "rgba(127,127,127,0.12)",
                    color: colors.text,
                    padding: 12,
                    borderRadius: 10,
                    fontFamily: fontConfig.regular,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                  }}
                />
              </View>
            ))}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.btn, { backgroundColor: colors.danger }]}
              >
                <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.btn, { backgroundColor: colors.accent }]}
              >
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
  card: { width: "100%", borderRadius: 16, padding: 20, gap: 8, borderWidth: 1 },
  gradientHeader: { height: 6, width: "100%", position: "absolute", top: 0, left: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { fontSize: 20, marginBottom: 8 },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  btnTxt: { color: "#fff" },
});
