// src/components/FormModal.tsx

import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import PasswordGeneratorModal from "./PasswordGeneratorModal";

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
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [activePasswordField, setActivePasswordField] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      setData(initialData as any);
      setVisibleFields({});
    }
  }, [visible, initialData]);

  const handleSave = () => onSubmit(data);

  const handleOpenGenerator = (fieldName: string) => {
    setActivePasswordField(fieldName);
    setShowPasswordGenerator(true);
  };

  const handleSelectPassword = (password: string) => {
    if (activePasswordField) {
      setData((d) => ({ ...d, [activePasswordField]: password }));
    }
    setShowPasswordGenerator(false);
    setActivePasswordField(null);
  };

  const toggleFieldVisibility = (fieldName: string) => {
    setVisibleFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const isPasswordField = (fieldName: string) => {
    const lower = fieldName.toLowerCase();
    return lower.includes("password") || lower.includes("secret") || lower.includes("pin");
  };

  return (
    <>
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
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.modalCard,
                  borderColor: colors.modalBorder,
                },
              ]}
            >
              <Text
                style={[styles.title, { color: colors.modalText, fontFamily: fontConfig.bold }]}
              >
                {title}
              </Text>
              {fields.map((f) => {
                const isPassword = isPasswordField(f.name) || f.secure;
                const isVisible = visibleFields[f.name];

                return (
                  <View key={f.name} style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        color: colors.modalSubtext,
                        fontFamily: fontConfig.bold,
                        marginBottom: 6,
                      }}
                    >
                      {f.label}
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        {
                          backgroundColor: "rgba(127,127,127,0.12)",
                          borderColor: colors.modalBorder,
                        },
                      ]}
                    >
                      <TextInput
                        value={data[f.name] ?? ""}
                        onChangeText={(v) => setData((d) => ({ ...d, [f.name]: v }))}
                        placeholder={f.label}
                        placeholderTextColor={colors.muted}
                        secureTextEntry={isPassword && !isVisible}
                        style={[
                          styles.input,
                          {
                            color: colors.modalText,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      />
                      {isPassword && (
                        <View style={styles.inputActions}>
                          <Pressable
                            onPress={() => toggleFieldVisibility(f.name)}
                            style={styles.inputIconButton}
                          >
                            <Ionicons
                              name={isVisible ? "eye-off-outline" : "eye-outline"}
                              size={20}
                              color={colors.muted}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => handleOpenGenerator(f.name)}
                            style={[
                              styles.generateButton,
                              { backgroundColor: colors.accent + "20" },
                            ]}
                          >
                            <Ionicons name="key" size={16} color={colors.accent} />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
              <View style={styles.buttonRow}>
                <MotiPressable
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.btn, { backgroundColor: colors.muted }]}
                  >
                    <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Cancel</Text>
                  </TouchableOpacity>
                </MotiPressable>
                <MotiPressable
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.btn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.btnTxt, { fontFamily: fontConfig.bold }]}>Save</Text>
                  </TouchableOpacity>
                </MotiPressable>
              </View>
            </View>
          </MotiView>
        </MotiView>
      </Modal>

      <PasswordGeneratorModal
        visible={showPasswordGenerator}
        onClose={() => {
          setShowPasswordGenerator(false);
          setActivePasswordField(null);
        }}
        onSelect={handleSelectPassword}
        initialPassword={activePasswordField ? data[activePasswordField] : ""}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "90%",
    borderRadius: 20,
    padding: 24,
    gap: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  title: { fontSize: 20, marginBottom: 8, textAlign: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    padding: 12,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    gap: 4,
  },
  inputIconButton: {
    padding: 8,
  },
  generateButton: {
    padding: 8,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  btnTxt: { color: "#fff" },
});
