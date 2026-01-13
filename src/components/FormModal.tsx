// src/components/FormModal.tsx

import React, { useEffect, useState, useMemo } from "react";
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
  Dimensions,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import PasswordGeneratorModal from "./PasswordGeneratorModal";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import DatePickerModal from "./DatePickerModal";
import { getFieldType, validateField, ValidationResult } from "../utils/formValidation";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const insets = useSafeAreaInsets();
  
  const [data, setData] = useState<Record<string, string>>({});
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [activePasswordField, setActivePasswordField] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const [recentlyGenerated, setRecentlyGenerated] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);

  // Organize fields by type for better layout
  const organizedFields = useMemo(() => {
    const sorted = [...fields];
    const order: Record<string, number> = {
      name: 1,
      username: 2,
      email: 3,
      gmail: 3,
      phone: 4,
      mobile: 4,
      dob: 5,
      date: 5,
      password: 10,
      secret: 10,
    };
    
    sorted.sort((a, b) => {
      const aOrder = Object.entries(order).find(([key]) => a.name.toLowerCase().includes(key))?.[1] || 6;
      const bOrder = Object.entries(order).find(([key]) => b.name.toLowerCase().includes(key))?.[1] || 6;
      return aOrder - bOrder;
    });
    
    return sorted;
  }, [fields]);

  useEffect(() => {
    if (visible) {
      setData(initialData as any);
      setVisibleFields({});
      setRecentlyGenerated({});
      setErrors({});
      setTouched({});
    }
  }, [visible, initialData]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setData((d) => ({ ...d, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((e) => ({ ...e, [fieldName]: "" }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched((t) => ({ ...t, [fieldName]: true }));
    
    const value = data[fieldName] || "";
    const validation = validateField(fieldName, value);
    
    if (!validation.isValid && validation.error) {
      setErrors((e) => ({ ...e, [fieldName]: validation.error! }));
    } else {
      setErrors((e) => ({ ...e, [fieldName]: "" }));
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Check required field (name)
    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Name is required";
      isValid = false;
    }
    
    // Validate other fields
    organizedFields.forEach((field) => {
      const value = data[field.name] || "";
      const validation = validateField(field.name, value);
      
      if (!validation.isValid && validation.error) {
        newErrors[field.name] = validation.error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    setTouched(Object.fromEntries(organizedFields.map((f) => [f.name, true])));
    
    return isValid;
  };

  const handleSave = () => {
    if (validateAllFields()) {
      onSubmit(data);
    }
  };

  const handleOpenGenerator = (fieldName: string) => {
    setActivePasswordField(fieldName);
    setShowPasswordGenerator(true);
  };

  const handleSelectPassword = (password: string) => {
    if (activePasswordField) {
      setData((d) => ({ ...d, [activePasswordField]: password }));
      setVisibleFields((prev) => ({ ...prev, [activePasswordField]: true }));
      setRecentlyGenerated((prev) => ({ ...prev, [activePasswordField]: true }));
      
      setTimeout(() => {
        setRecentlyGenerated((prev) => ({ ...prev, [activePasswordField!]: false }));
      }, 3000);
    }
    setShowPasswordGenerator(false);
    setActivePasswordField(null);
  };

  const handleOpenDatePicker = (fieldName: string) => {
    setActiveDateField(fieldName);
    setShowDatePicker(true);
  };

  const handleSelectDate = (date: string) => {
    if (activeDateField) {
      setData((d) => ({ ...d, [activeDateField]: date }));
      setErrors((e) => ({ ...e, [activeDateField]: "" }));
    }
    setShowDatePicker(false);
    setActiveDateField(null);
  };

  const toggleFieldVisibility = (fieldName: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const getKeyboardType = (fieldName: string): "default" | "email-address" | "phone-pad" | "numeric" => {
    const fieldType = getFieldType(fieldName);
    switch (fieldType) {
      case "email": return "email-address";
      case "phone": return "phone-pad";
      default: return "default";
    }
  };

  const getAutoCapitalize = (fieldName: string): "none" | "sentences" | "words" => {
    const fieldType = getFieldType(fieldName);
    if (fieldType === "email" || fieldType === "password") return "none";
    if (fieldName.toLowerCase() === "name") return "words";
    return "sentences";
  };

  const getPlaceholder = (field: Field): string => {
    const fieldType = getFieldType(field.name);
    switch (fieldType) {
      case "email": return "example@email.com";
      case "phone": return "+1 234-567-8900";
      case "date": return "DD/MM/YYYY";
      case "password": return "Enter password";
      default: return `Enter ${field.label.toLowerCase()}`;
    }
  };

  const getFieldIcon = (fieldName: string): string => {
    const fieldType = getFieldType(fieldName);
    switch (fieldType) {
      case "email": return "mail-outline";
      case "phone": return "call-outline";
      case "date": return "calendar-outline";
      case "password": return "lock-closed-outline";
      default:
        if (fieldName.toLowerCase() === "name") return "person-outline";
        if (fieldName.toLowerCase().includes("user")) return "at-outline";
        return "text-outline";
    }
  };

  const renderField = (field: Field, index: number) => {
    const fieldType = getFieldType(field.name);
    const isPassword = fieldType === "password" || field.secure;
    const isDate = fieldType === "date";
    const isVisible = visibleFields[field.name];
    const wasRecentlyGenerated = recentlyGenerated[field.name];
    const currentValue = data[field.name] ?? "";
    const error = touched[field.name] ? errors[field.name] : "";
    const isRequired = field.name.toLowerCase() === "name";

    return (
      <MotiView
        key={field.name}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 200, delay: index * 50 }}
        style={styles.fieldContainer}
      >
        {/* Label Row */}
        <View style={styles.labelRow}>
          <View style={styles.labelLeft}>
            <Ionicons
              name={getFieldIcon(field.name) as any}
              size={16}
              color={error ? colors.danger : colors.accent}
            />
            <Text
              style={[
                styles.label,
                {
                  color: error ? colors.danger : colors.text,
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              {field.label}
              {isRequired && <Text style={{ color: colors.danger }}> *</Text>}
            </Text>
          </View>
          
          {isPassword && (
            <Pressable
              onPress={() => handleOpenGenerator(field.name)}
              style={[
                styles.generateButton,
                { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" },
              ]}
            >
              <Ionicons name="key" size={14} color={colors.accent} />
              <Text style={[styles.generateButtonText, { color: colors.accent, fontFamily: fontConfig.bold }]}>
                Generate
              </Text>
            </Pressable>
          )}
        </View>

        {/* Input Container */}
        {isDate ? (
          <Pressable
            onPress={() => handleOpenDatePicker(field.name)}
            style={[
              styles.inputContainer,
              styles.dateInputContainer,
              {
                backgroundColor: colors.bg[0],
                borderColor: error ? colors.danger : wasRecentlyGenerated ? colors.accent : colors.cardBorder,
                borderWidth: error || wasRecentlyGenerated ? 2 : 1,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.muted} />
            <Text
              style={[
                styles.dateText,
                {
                  color: currentValue ? colors.text : colors.muted,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              {currentValue || "Select date"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.muted} />
          </Pressable>
        ) : (
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.bg[0],
                borderColor: error ? colors.danger : wasRecentlyGenerated ? colors.accent : colors.cardBorder,
                borderWidth: error || wasRecentlyGenerated ? 2 : 1,
              },
            ]}
          >
            <TextInput
              value={currentValue}
              onChangeText={(v) => handleFieldChange(field.name, v)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={getPlaceholder(field)}
              placeholderTextColor={colors.muted}
              secureTextEntry={isPassword && !isVisible}
              keyboardType={getKeyboardType(field.name)}
              autoCapitalize={getAutoCapitalize(field.name)}
              autoCorrect={!isPassword && fieldType !== "email"}
              style={[
                styles.input,
                { color: colors.text, fontFamily: fontConfig.regular },
              ]}
            />
            
            {/* Eye button for password fields */}
            {isPassword && currentValue.length > 0 && (
              <Pressable
                onPress={() => toggleFieldVisibility(field.name)}
                style={styles.inputIconButton}
              >
                <Ionicons
                  name={isVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            )}
          </View>
        )}

        {/* Error Message */}
        {error && (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.errorContainer}
          >
            <Ionicons name="alert-circle" size={14} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger, fontFamily: fontConfig.regular }]}>
              {error}
            </Text>
          </MotiView>
        )}

        {/* Password Strength Indicator */}
        {isPassword && currentValue.length > 0 && !error && (
          <PasswordStrengthIndicator password={currentValue} showSuggestions={currentValue.length < 12} />
        )}

        {/* Recently Generated Indicator */}
        {wasRecentlyGenerated && (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.generatedIndicator}
          >
            <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
            <Text style={[styles.generatedText, { color: colors.accent, fontFamily: fontConfig.regular }]}>
              Password generated successfully
            </Text>
          </MotiView>
        )}

        {/* Field Hint */}
        {fieldType === "email" && !error && !touched[field.name] && (
          <Text style={[styles.hint, { color: colors.muted, fontFamily: fontConfig.regular }]}>
            Enter a valid email address
          </Text>
        )}
        {fieldType === "phone" && !error && !touched[field.name] && (
          <Text style={[styles.hint, { color: colors.muted, fontFamily: fontConfig.regular }]}>
            Include country code for international numbers
          </Text>
        )}
      </MotiView>
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={[styles.modalContainer, { backgroundColor: colors.bg[0] }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  paddingTop: insets.top + 12,
                  borderBottomColor: colors.cardBorder,
                  backgroundColor: colors.bg[0],
                },
              ]}
            >
              <Pressable
                onPress={onClose}
                style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
              
              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                  {title}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.muted, fontFamily: fontConfig.regular }]}>
                  {organizedFields.length} field{organizedFields.length !== 1 ? "s" : ""}
                </Text>
              </View>
              
              <Pressable
                onPress={handleSave}
                style={[styles.headerButton, styles.saveButton, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="checkmark" size={22} color="#fff" />
              </Pressable>
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + 100 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Fields Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                    Account Details
                  </Text>
                </View>
                
                <View
                  style={[
                    styles.fieldsCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  {organizedFields.map((field, index) => renderField(field, index))}
                </View>
              </View>

              {/* Info Box */}
              <View
                style={[
                  styles.infoBox,
                  { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
                <Text style={[styles.infoText, { color: colors.subtext, fontFamily: fontConfig.regular }]}>
                  Your data is encrypted and stored securely on this device only.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View
              style={[
                styles.bottomBar,
                {
                  paddingBottom: insets.bottom + 16,
                  backgroundColor: colors.card,
                  borderTopColor: colors.cardBorder,
                },
              ]}
            >
              <Pressable
                onPress={onClose}
                style={[
                  styles.bottomButton,
                  styles.cancelButton,
                  { backgroundColor: colors.bg[0], borderColor: colors.cardBorder },
                ]}
              >
                <Ionicons name="close-outline" size={20} color={colors.text} />
                <Text style={[styles.bottomButtonText, { color: colors.text, fontFamily: fontConfig.bold }]}>
                  Cancel
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleSave}
                style={[styles.bottomButton, styles.submitButton, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={[styles.bottomButtonText, { color: "#fff", fontFamily: fontConfig.bold }]}>
                  Save Account
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Password Generator Modal */}
      <PasswordGeneratorModal
        visible={showPasswordGenerator}
        onClose={() => {
          setShowPasswordGenerator(false);
          setActivePasswordField(null);
        }}
        onSelect={handleSelectPassword}
        initialPassword={activePasswordField ? data[activePasswordField] : ""}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => {
          setShowDatePicker(false);
          setActiveDateField(null);
        }}
        onSelect={handleSelectDate}
        initialDate={activeDateField ? data[activeDateField] : ""}
      />
    </>
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
    width: 44,
    height: 44,
    borderRadius: 12,
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
    gap: 20,
  },
  section: {
    gap: 12,
  },
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
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  generateButtonText: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 52,
  },
  dateInputContainer: {
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  inputIconButton: {
    padding: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 12,
  },
  generatedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  generatedText: {
    fontSize: 12,
  },
  hint: {
    fontSize: 11,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  bottomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  bottomButtonText: {
    fontSize: 15,
  },
});