// src/components/SchemaModal.tsx

import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { useDb } from "../context/DbContext";

type SchemaField = {
  id: string;
  value: string;
};

interface SchemaModalProps {
  visible: boolean;
  currentSchema: string[];
  platformKey: string;
  onClose: () => void;
  onSave: (fields: string[]) => void;
}

const SUGGESTED_FIELDS = [
  { name: "email", icon: "mail-outline", label: "Email" },
  { name: "username", icon: "person-outline", label: "Username" },
  { name: "password", icon: "lock-closed-outline", label: "Password" },
  { name: "phone", icon: "call-outline", label: "Phone" },
  { name: "dob", icon: "calendar-outline", label: "Date of Birth" },
  { name: "pin", icon: "keypad-outline", label: "PIN" },
  { name: "recovery_email", icon: "mail-outline", label: "Recovery Email" },
  { name: "security_question", icon: "help-circle-outline", label: "Security Question" },
  { name: "notes", icon: "document-text-outline", label: "Notes" },
];

export default function SchemaModal({
  visible,
  currentSchema,
  platformKey,
  onClose,
  onSave,
}: SchemaModalProps) {
  const theme = useAppTheme();
  const { platformsMetadata, updatePlatformDisplayField } = useDb();
  const insets = useSafeAreaInsets();
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDisplayField, setSelectedDisplayField] = useState<string>("name");

  useEffect(() => {
    if (visible && platformKey) {
      const currentDisplayField = platformsMetadata[platformKey]?.displayField || "name";
      setSelectedDisplayField(currentDisplayField);
    }
  }, [visible, platformKey, platformsMetadata]);

  useEffect(() => {
    if (visible && currentSchema) {
      setFields(
        currentSchema.map((value, index) => ({
          id: `${index}-${Date.now()}`,
          value,
        }))
      );
      setShowSuggestions(false);
    }
  }, [visible, currentSchema]);

  const updateField = useCallback((id: string, newValue: string) => {
    setFields((currentFields) =>
      currentFields.map((field) => (field.id === id ? { ...field, value: newValue } : field))
    );
  }, []);

  const addField = useCallback((fieldName?: string) => {
    const newField: SchemaField = {
      id: `new-${Date.now()}-${Math.random()}`,
      value: fieldName || "",
    };
    setFields((currentFields) => [...currentFields, newField]);
    setShowSuggestions(false);
  }, []);

  const removeField = useCallback((id: string) => {
    setFields((currentFields) => currentFields.filter((field) => field.id !== id));
  }, []);

  const moveFieldUp = useCallback((index: number) => {
    if (index <= 0) return;
    setFields((currentFields) => {
      const newFields = [...currentFields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      return newFields;
    });
  }, []);

  const moveFieldDown = useCallback((index: number) => {
    setFields((currentFields) => {
      if (index >= currentFields.length - 1) return currentFields;
      const newFields = [...currentFields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      return newFields;
    });
  }, []);

  const handleSave = () => {
    const validFields = fields
      .map((f) => f.value.trim().toLowerCase().replace(/\s+/g, "_"))
      .filter(Boolean);

    const finalFields = validFields.length > 0 ? validFields : ["name", "password"];
    const uniqueFields = Array.from(new Set(finalFields));

    if (platformKey && selectedDisplayField) {
      updatePlatformDisplayField(platformKey, selectedDisplayField);
    }

    onSave(uniqueFields);
    onClose();
  };

  const getFieldIcon = (fieldName: string): string => {
    const lower = fieldName.toLowerCase();
    if (lower.includes("email") || lower.includes("mail")) return "mail-outline";
    if (lower.includes("password") || lower.includes("secret")) return "lock-closed-outline";
    if (lower.includes("phone") || lower.includes("mobile")) return "call-outline";
    if (lower.includes("user")) return "person-outline";
    if (lower.includes("date") || lower.includes("dob") || lower.includes("birth"))
      return "calendar-outline";
    if (lower.includes("pin")) return "keypad-outline";
    if (lower.includes("note")) return "document-text-outline";
    if (lower.includes("question")) return "help-circle-outline";
    if (lower === "name") return "text-outline";
    return "create-outline";
  };

  const availableSuggestions = SUGGESTED_FIELDS.filter(
    (suggestion) => !fields.some((f) => f.value.toLowerCase() === suggestion.name)
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.header,
              {
                paddingTop: insets.top + 12,
                borderBottomColor: theme.colors.surfaceBorder,
                backgroundColor: theme.colors.background,
                height: insets.top + theme.components.header.height,
              },
            ]}
          >
            <Pressable
              onPress={onClose}
              style={[
                styles.headerButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.components.header.backButtonRadius,
                  width: theme.components.header.backButtonSize,
                  height: theme.components.header.backButtonSize,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={theme.colors.textPrimary} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Edit Schema
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                ]}
              >
                {fields.length} field{fields.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <Pressable
              onPress={handleSave}
              style={[
                styles.headerButton,
                styles.saveButton,
                {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.components.header.backButtonRadius,
                  width: theme.components.header.backButtonSize,
                  height: theme.components.header.backButtonSize,
                },
              ]}
            >
              <Ionicons name="checkmark" size={22} color={theme.colors.textInverse} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 100, gap: theme.spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: theme.colors.accentMuted,
                  borderColor: theme.colors.accent + "30",
                  borderRadius: theme.shapes.radiusMd,
                  padding: theme.spacing.lg,
                },
              ]}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} />
              <Text
                style={[
                  styles.infoText,
                  { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
                ]}
              >
                Define the fields for this platform. Drag to reorder, or tap the arrows to move
                fields up/down.
              </Text>
            </View>

            <View style={[styles.section, { gap: theme.spacing.md }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list-outline" size={18} color={theme.colors.accent} />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  Schema Fields
                </Text>
              </View>

              <View
                style={[
                  styles.fieldsCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.components.card.radius,
                  },
                ]}
              >
                {fields.length === 0 ? (
                  <View style={[styles.emptyState, { padding: theme.spacing.xxl }]}>
                    <Ionicons name="document-outline" size={40} color={theme.colors.textMuted} />
                    <Text
                      style={[
                        styles.emptyText,
                        { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                      ]}
                    >
                      No fields yet. Add some fields to define your schema.
                    </Text>
                  </View>
                ) : (
                  fields.map((field, index) => (
                    <MotiView
                      key={field.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{
                        type: "timing",
                        duration: theme.animations.durationNormal,
                        delay: index * 30,
                      }}
                      style={[
                        styles.fieldRow,
                        index < fields.length - 1 && {
                          borderBottomWidth: theme.shapes.borderThin,
                          borderBottomColor: theme.colors.surfaceBorder,
                        },
                        { padding: theme.spacing.md },
                      ]}
                    >
                      <View
                        style={[
                          styles.fieldNumber,
                          {
                            backgroundColor: theme.colors.accentMuted,
                            borderRadius: theme.shapes.radiusSm,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.fieldNumberText,
                            { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                          ]}
                        >
                          {index + 1}
                        </Text>
                      </View>

                      <Ionicons
                        name={getFieldIcon(field.value) as any}
                        size={20}
                        color={theme.colors.accent}
                        style={styles.fieldIcon}
                      />

                      <TextInput
                        value={field.value}
                        onChangeText={(v) => updateField(field.id, v)}
                        placeholder="Field name"
                        placeholderTextColor={theme.colors.textMuted}
                        autoCapitalize="none"
                        style={[
                          styles.fieldInput,
                          {
                            color: theme.colors.textPrimary,
                            fontFamily: theme.typography.fontRegular,
                            fontSize: theme.typography.sizeMd,
                          },
                        ]}
                      />

                      <View style={styles.fieldActions}>
                        <Pressable
                          onPress={() => moveFieldUp(index)}
                          disabled={index === 0}
                          style={[
                            styles.actionBtn,
                            {
                              opacity: index === 0 ? 0.3 : 1,
                              borderRadius: theme.shapes.radiusSm,
                            },
                          ]}
                        >
                          <Ionicons name="chevron-up" size={18} color={theme.colors.textMuted} />
                        </Pressable>
                        <Pressable
                          onPress={() => moveFieldDown(index)}
                          disabled={index === fields.length - 1}
                          style={[
                            styles.actionBtn,
                            {
                              opacity: index === fields.length - 1 ? 0.3 : 1,
                              borderRadius: theme.shapes.radiusSm,
                            },
                          ]}
                        >
                          <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
                        </Pressable>
                        <Pressable
                          onPress={() => removeField(field.id)}
                          style={[styles.actionBtn, { borderRadius: theme.shapes.radiusSm }]}
                        >
                          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                        </Pressable>
                      </View>
                    </MotiView>
                  ))
                )}
              </View>
            </View>

            <View style={[styles.section, { gap: theme.spacing.md }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="eye-outline" size={18} color={theme.colors.accent} />
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  Card Display Field
                </Text>
              </View>
              <Text
                style={[
                  styles.displayFieldHint,
                  { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                ]}
              >
                Choose which field to show on collapsed account cards
              </Text>
              <View
                style={[
                  styles.displayFieldContainer,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.radiusMd,
                    padding: theme.spacing.sm,
                  },
                ]}
              >
                {fields
                  .filter((f) => f.value.trim() !== "" && f.value.toLowerCase() !== "password")
                  .map((field) => {
                    const fieldName = field.value.trim().toLowerCase().replace(/\s+/g, "_");
                    const isSelected = selectedDisplayField === fieldName;
                    return (
                      <Pressable
                        key={field.id}
                        onPress={() => setSelectedDisplayField(fieldName)}
                        style={[
                          styles.displayFieldOption,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.accentMuted
                              : theme.colors.background,
                            borderColor: isSelected
                              ? theme.colors.accent
                              : theme.colors.surfaceBorder,
                            borderRadius: theme.shapes.radiusSm,
                          },
                        ]}
                      >
                        <Ionicons
                          name={getFieldIcon(field.value) as any}
                          size={16}
                          color={isSelected ? theme.colors.accent : theme.colors.textMuted}
                        />
                        <Text
                          style={[
                            styles.displayFieldOptionText,
                            {
                              color: isSelected ? theme.colors.accent : theme.colors.textPrimary,
                              fontFamily: isSelected
                                ? theme.typography.fontBold
                                : theme.typography.fontRegular,
                            },
                          ]}
                        >
                          {field.value.charAt(0).toUpperCase() +
                            field.value.slice(1).replace(/_/g, " ")}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                        )}
                      </Pressable>
                    );
                  })}
              </View>
            </View>

            <View style={[styles.section, { gap: theme.spacing.md }]}>
              <Pressable
                onPress={() => addField()}
                style={[
                  styles.addButton,
                  {
                    backgroundColor: theme.colors.accent,
                    borderColor: theme.colors.accent,
                    borderRadius: theme.components.button.radius,
                    height: theme.components.button.height,
                  },
                ]}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.colors.textInverse} />
                <Text
                  style={[
                    styles.addButtonText,
                    { fontFamily: theme.typography.fontBold, color: theme.colors.textInverse },
                  ]}
                >
                  Add Custom Field
                </Text>
              </Pressable>

              {availableSuggestions.length > 0 && (
                <>
                  <Pressable
                    onPress={() => setShowSuggestions(!showSuggestions)}
                    style={[
                      styles.suggestionsToggle,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.surfaceBorder,
                        borderRadius: theme.shapes.radiusMd,
                        padding: theme.spacing.md,
                      },
                    ]}
                  >
                    <Ionicons name="bulb-outline" size={18} color={theme.colors.accent} />
                    <Text
                      style={[
                        styles.suggestionsToggleText,
                        {
                          color: theme.colors.textPrimary,
                          fontFamily: theme.typography.fontRegular,
                        },
                      ]}
                    >
                      Suggested Fields ({availableSuggestions.length})
                    </Text>
                    <Ionicons
                      name={showSuggestions ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>

                  {showSuggestions && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ type: "timing", duration: theme.animations.durationNormal }}
                      style={[
                        styles.suggestionsContainer,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.surfaceBorder,
                          borderRadius: theme.shapes.radiusMd,
                        },
                      ]}
                    >
                      {availableSuggestions.map((suggestion) => (
                        <Pressable
                          key={suggestion.name}
                          onPress={() => addField(suggestion.name)}
                          style={[
                            styles.suggestionItem,
                            {
                              borderColor: theme.colors.surfaceBorder,
                              padding: theme.spacing.md,
                            },
                          ]}
                          android_ripple={{ color: theme.colors.accentMuted }}
                        >
                          <Ionicons
                            name={suggestion.icon as any}
                            size={18}
                            color={theme.colors.accent}
                          />
                          <Text
                            style={[
                              styles.suggestionText,
                              {
                                color: theme.colors.textPrimary,
                                fontFamily: theme.typography.fontRegular,
                              },
                            ]}
                          >
                            {suggestion.label}
                          </Text>
                          <Ionicons name="add" size={18} color={theme.colors.accent} />
                        </Pressable>
                      ))}
                    </MotiView>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          <View
            style={[
              styles.bottomBar,
              {
                paddingBottom: insets.bottom + theme.spacing.lg,
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.surfaceBorder,
                padding: theme.spacing.lg,
                gap: theme.spacing.md,
              },
            ]}
          >
            <Pressable
              onPress={onClose}
              style={[
                styles.bottomButton,
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.components.button.radius,
                  height: theme.components.button.height,
                },
              ]}
            >
              <Ionicons name="close-outline" size={20} color={theme.colors.textPrimary} />
              <Text
                style={[
                  styles.bottomButtonText,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[
                styles.bottomButton,
                styles.submitButton,
                {
                  backgroundColor: theme.colors.buttonPrimary,
                  borderRadius: theme.components.button.radius,
                  height: theme.components.button.height,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.textInverse}
              />
              <Text
                style={[
                  styles.bottomButtonText,
                  { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
                ]}
              >
                Save Schema
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  saveButton: {
    borderWidth: 0,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
  },
  fieldsCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldNumberText: {
    fontSize: 12,
  },
  fieldIcon: {
    width: 24,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fieldActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 15,
  },
  suggestionsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  suggestionsToggleText: {
    flex: 1,
    fontSize: 14,
  },
  suggestionsContainer: {
    borderWidth: 1,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  bottomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  bottomButtonText: {
    fontSize: 15,
  },
  displayFieldHint: {
    fontSize: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  displayFieldContainer: {
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  displayFieldOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  displayFieldOptionText: {
    fontSize: 13,
  },
});
