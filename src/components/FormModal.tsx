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
import { useAppTheme } from "../themes/hooks/useAppTheme";
import PasswordGeneratorModal from "./PasswordGeneratorModal";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import DatePickerModal from "./DatePickerModal";
import { getFieldType, validateField } from "../utils/formValidation";
import { getDateFormat, DateFormatOption } from "../utils/dateFormat";

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
  const theme = useAppTheme();
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
  const [currentDateFormat, setCurrentDateFormat] = useState<DateFormatOption>("DD/MM/YYYY");

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
      const aOrder =
        Object.entries(order).find(([key]) => a.name.toLowerCase().includes(key))?.[1] || 6;
      const bOrder =
        Object.entries(order).find(([key]) => b.name.toLowerCase().includes(key))?.[1] || 6;
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
      getDateFormat().then(setCurrentDateFormat);
    }
  }, [visible, initialData]);

  const handleFieldChange = (fieldName: string, value: string) => {
    setData((d) => ({ ...d, [fieldName]: value }));
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

    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Name is required";
      isValid = false;
    }

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

  const getKeyboardType = (
    fieldName: string
  ): "default" | "email-address" | "phone-pad" | "numeric" => {
    const fieldType = getFieldType(fieldName);
    switch (fieldType) {
      case "email":
        return "email-address";
      case "phone":
        return "phone-pad";
      default:
        return "default";
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
      case "email":
        return "example@email.com";
      case "phone":
        return "+1 234-567-8900";
      case "date":
        return "DD/MM/YYYY";
      case "password":
        return "Enter password";
      default:
        return `Enter ${field.label.toLowerCase()}`;
    }
  };

  const getFieldIcon = (fieldName: string): string => {
    const fieldType = getFieldType(fieldName);
    switch (fieldType) {
      case "email":
        return "mail-outline";
      case "phone":
        return "call-outline";
      case "date":
        return "calendar-outline";
      case "password":
        return "lock-closed-outline";
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
        transition={{
          type: "timing",
          duration: theme.animations.durationNormal,
          delay: index * theme.animations.listItemStagger,
        }}
        style={styles.fieldContainer}
      >
        <View style={styles.labelRow}>
          <View style={styles.labelLeft}>
            <Ionicons
              name={getFieldIcon(field.name) as any}
              size={16}
              color={error ? theme.colors.error : theme.colors.accent}
            />
            <Text
              style={[
                styles.label,
                {
                  color: error ? theme.colors.error : theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                },
              ]}
            >
              {field.label}
              {isRequired && <Text style={{ color: theme.colors.error }}> *</Text>}
            </Text>
          </View>

          {isPassword && (
            <Pressable
              onPress={() => handleOpenGenerator(field.name)}
              style={[
                styles.generateButton,
                {
                  backgroundColor: theme.colors.accentMuted,
                  borderColor: theme.colors.accent + "40",
                  borderRadius: theme.shapes.radiusSm,
                },
              ]}
            >
              <Ionicons name="key" size={14} color={theme.colors.accent} />
              <Text
                style={[
                  styles.generateButtonText,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                ]}
              >
                Generate
              </Text>
            </Pressable>
          )}
        </View>

        {isDate ? (
          <Pressable
            onPress={() => handleOpenDatePicker(field.name)}
            style={[
              styles.inputContainer,
              styles.dateInputContainer,
              {
                backgroundColor: theme.colors.background,
                borderColor: error
                  ? theme.colors.error
                  : wasRecentlyGenerated
                    ? theme.colors.accent
                    : theme.colors.surfaceBorder,
                borderWidth:
                  error || wasRecentlyGenerated
                    ? theme.shapes.borderThick
                    : theme.shapes.borderThin,
                borderRadius: theme.shapes.radiusMd,
                minHeight: theme.components.input.height,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
            <Text
              style={[
                styles.dateText,
                {
                  color: currentValue ? theme.colors.textPrimary : theme.colors.textMuted,
                  fontFamily: theme.typography.fontRegular,
                },
              ]}
            >
              {currentValue || "Select date"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : (
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.background,
                borderColor: error
                  ? theme.colors.error
                  : wasRecentlyGenerated
                    ? theme.colors.accent
                    : theme.colors.surfaceBorder,
                borderWidth:
                  error || wasRecentlyGenerated
                    ? theme.shapes.borderThick
                    : theme.shapes.borderThin,
                borderRadius: theme.shapes.radiusMd,
                minHeight: theme.components.input.height,
              },
            ]}
          >
            <TextInput
              value={currentValue}
              onChangeText={(v) => handleFieldChange(field.name, v)}
              onBlur={() => handleFieldBlur(field.name)}
              placeholder={getPlaceholder(field)}
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry={isPassword && !isVisible}
              keyboardType={getKeyboardType(field.name)}
              autoCapitalize={getAutoCapitalize(field.name)}
              autoCorrect={!isPassword && fieldType !== "email"}
              style={[
                styles.input,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeMd,
                },
              ]}
            />

            {isPassword && currentValue.length > 0 && (
              <Pressable
                onPress={() => toggleFieldVisibility(field.name)}
                style={styles.inputIconButton}
              >
                <Ionicons
                  name={isVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            )}
          </View>
        )}

        {error && (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationFast }}
            style={styles.errorContainer}
          >
            <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
            <Text
              style={[
                styles.errorText,
                { color: theme.colors.error, fontFamily: theme.typography.fontRegular },
              ]}
            >
              {error}
            </Text>
          </MotiView>
        )}

        {isPassword && currentValue.length > 0 && !error && (
          <PasswordStrengthIndicator
            password={currentValue}
            showSuggestions={currentValue.length < 12}
          />
        )}

        {wasRecentlyGenerated && (
          <MotiView
            from={{ opacity: 0, translateY: -5 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: theme.animations.durationFast }}
            style={styles.generatedIndicator}
          >
            <Ionicons name="checkmark-circle" size={14} color={theme.colors.accent} />
            <Text
              style={[
                styles.generatedText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontRegular },
              ]}
            >
              Password generated successfully
            </Text>
          </MotiView>
        )}

        {fieldType === "email" && !error && !touched[field.name] && (
          <Text
            style={[
              styles.hint,
              { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
            ]}
          >
            Enter a valid email address
          </Text>
        )}
        {fieldType === "phone" && !error && !touched[field.name] && (
          <Text
            style={[
              styles.hint,
              { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
            ]}
          >
            Include country code for international numbers
          </Text>
        )}
      </MotiView>
    );
  };

  return (
    <>
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
                  {title}
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                  ]}
                >
                  {organizedFields.length} field{organizedFields.length !== 1 ? "s" : ""}
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
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={theme.colors.accent}
                  />
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                    ]}
                  >
                    Account Details
                  </Text>
                </View>

                <View
                  style={[
                    styles.fieldsCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.surfaceBorder,
                      borderRadius: theme.shapes.cardRadius,
                      padding: theme.spacing.cardPadding,
                    },
                  ]}
                >
                  {organizedFields.map((field, index) => renderField(field, index))}
                </View>
              </View>

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
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.accent} />
                <Text
                  style={[
                    styles.infoText,
                    { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
                  ]}
                >
                  Your data is encrypted and stored securely on this device only.
                </Text>
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
                    borderRadius: theme.shapes.buttonRadius,
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
                    borderRadius: theme.shapes.buttonRadius,
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
                  Save Account
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
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

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => {
          setShowDatePicker(false);
          setActiveDateField(null);
        }}
        onSelect={handleSelectDate}
        initialDate={activeDateField ? data[activeDateField] : ""}
        format={currentDateFormat}
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
    borderWidth: 1,
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
    borderWidth: 1,
  },
  generateButtonText: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  dateInputContainer: {
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
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
});
