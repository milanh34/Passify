// src/components/PasswordGeneratorModal.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Slider from "@react-native-community/slider";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../context/ThemeContext";
import {
  generatePassword,
  generatePassphrase,
  evaluatePasswordStrength,
  PasswordOptions,
  GeneratedPassword,
  PASSWORD_PRESETS,
  DEFAULT_PASSWORD_OPTIONS,
} from "../utils/passwordGenerator";

interface PasswordGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (password: string) => void;
  initialPassword?: string;
}

export default function PasswordGeneratorModal({
  visible,
  onClose,
  onSelect,
  initialPassword = "",
}: PasswordGeneratorModalProps) {
  const { colors, fontConfig } = useTheme();

  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [generated, setGenerated] = useState<GeneratedPassword | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mode, setMode] = useState<"password" | "passphrase">("password");
  const [passphraseWords, setPassphraseWords] = useState(4);

  useEffect(() => {
    if (visible) {
      handleGenerate();
    }
  }, [visible]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setCopied(false);

    try {
      let result: GeneratedPassword;

      if (mode === "passphrase") {
        result = await generatePassphrase(passphraseWords);
      } else {
        result = await generatePassword(options);
      }

      setGenerated(result);
    } catch (error: any) {
      console.error("Password generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [options, mode, passphraseWords]);

  const handleCopy = async () => {
    if (generated?.password) {
      await Clipboard.setStringAsync(generated.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUsePassword = () => {
    if (generated?.password) {
      onSelect(generated.password);
      onClose();
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PASSWORD_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setOptions(preset.options);
      setMode("password");
      setTimeout(() => handleGenerate(), 100);
    }
  };

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const getStrengthBarWidth = () => {
    if (!generated) return "0%";
    return `${(generated.strength.score / 4) * 100}%`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 50 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 250 }}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="key" size={24} color={colors.accent} />
              <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
                Password Generator
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.bg[0] }]}
            >
              <Ionicons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.modeToggle}>
              <Pressable
                onPress={() => {
                  setMode("password");
                  setTimeout(() => handleGenerate(), 100);
                }}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: mode === "password" ? colors.accent : colors.bg[0],
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={mode === "password" ? "#fff" : colors.accent}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: mode === "password" ? "#fff" : colors.accent,
                      fontFamily: fontConfig.bold,
                    },
                  ]}
                >
                  Password
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode("passphrase");
                  setTimeout(() => handleGenerate(), 100);
                }}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: mode === "passphrase" ? colors.accent : colors.bg[0],
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Ionicons
                  name="text"
                  size={16}
                  color={mode === "passphrase" ? "#fff" : colors.accent}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    {
                      color: mode === "passphrase" ? "#fff" : colors.accent,
                      fontFamily: fontConfig.bold,
                    },
                  ]}
                >
                  Passphrase
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.passwordDisplay,
                {
                  backgroundColor: colors.bg[0],
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text
                  style={[styles.passwordText, { color: colors.text, fontFamily: fontConfig.bold }]}
                  selectable
                >
                  {generated?.password || "Generating..."}
                </Text>
              )}
            </View>

            {generated && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: colors.subtext, fontFamily: fontConfig.regular },
                    ]}
                  >
                    Strength:
                  </Text>
                  <Text
                    style={[
                      styles.strengthValue,
                      {
                        color: generated.strength.color,
                        fontFamily: fontConfig.bold,
                      },
                    ]}
                  >
                    {generated.strength.label}
                  </Text>
                  <Text
                    style={[
                      styles.entropyText,
                      { color: colors.muted, fontFamily: fontConfig.regular },
                    ]}
                  >
                    ({generated.entropy} bits)
                  </Text>
                </View>
                <View style={[styles.strengthBarBg, { backgroundColor: colors.cardBorder }]}>
                  <MotiView
                    animate={{ width: getStrengthBarWidth() }}
                    transition={{ type: "timing", duration: 300 }}
                    style={[styles.strengthBarFill, { backgroundColor: generated.strength.color }]}
                  />
                </View>
              </View>
            )}

            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleGenerate}
                disabled={isGenerating}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.bg[0],
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Ionicons name="refresh" size={18} color={colors.accent} />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: colors.accent, fontFamily: fontConfig.bold },
                  ]}
                >
                  Regenerate
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCopy}
                disabled={!generated}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: copied ? colors.accent : colors.bg[0],
                    borderColor: colors.accent,
                  },
                ]}
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy"}
                  size={18}
                  color={copied ? "#fff" : colors.accent}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: copied ? "#fff" : colors.accent,
                      fontFamily: fontConfig.bold,
                    },
                  ]}
                >
                  {copied ? "Copied!" : "Copy"}
                </Text>
              </Pressable>
            </View>

            {mode === "password" && (
              <View style={styles.presetsSection}>
                <Text
                  style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
                >
                  Quick Presets
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsScroll}
                >
                  {PASSWORD_PRESETS.map((preset) => (
                    <Pressable
                      key={preset.id}
                      onPress={() => handlePresetSelect(preset.id)}
                      style={[
                        styles.presetButton,
                        {
                          backgroundColor: colors.bg[0],
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetName,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        {preset.name}
                      </Text>
                      <Text
                        style={[
                          styles.presetDesc,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        {preset.description}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <Pressable onPress={() => setShowAdvanced(!showAdvanced)} style={styles.advancedToggle}>
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                {mode === "password" ? "Options" : "Passphrase Options"}
              </Text>
              <Ionicons
                name={showAdvanced ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.accent}
              />
            </Pressable>

            {showAdvanced && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "timing", duration: 200 }}
                style={styles.optionsContainer}
              >
                {mode === "password" ? (
                  <>
                    <View style={styles.optionRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Length: {options.length}
                      </Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={8}
                        maximumValue={64}
                        step={1}
                        value={options.length}
                        onValueChange={(value) => updateOption("length", Math.round(value))}
                        onSlidingComplete={() => handleGenerate()}
                        minimumTrackTintColor={colors.accent}
                        maximumTrackTintColor={colors.cardBorder}
                        thumbTintColor={colors.accent}
                      />
                    </View>

                    <View style={styles.toggleRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Uppercase (A-Z)
                      </Text>
                      <Switch
                        value={options.includeUppercase}
                        onValueChange={(value) => {
                          updateOption("includeUppercase", value);
                          setTimeout(() => handleGenerate(), 100);
                        }}
                        trackColor={{
                          false: colors.cardBorder,
                          true: colors.accent + "60",
                        }}
                        thumbColor={options.includeUppercase ? colors.accent : colors.card}
                      />
                    </View>

                    <View style={styles.toggleRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Lowercase (a-z)
                      </Text>
                      <Switch
                        value={options.includeLowercase}
                        onValueChange={(value) => {
                          updateOption("includeLowercase", value);
                          setTimeout(() => handleGenerate(), 100);
                        }}
                        trackColor={{
                          false: colors.cardBorder,
                          true: colors.accent + "60",
                        }}
                        thumbColor={options.includeLowercase ? colors.accent : colors.card}
                      />
                    </View>

                    <View style={styles.toggleRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Numbers (0-9)
                      </Text>
                      <Switch
                        value={options.includeNumbers}
                        onValueChange={(value) => {
                          updateOption("includeNumbers", value);
                          setTimeout(() => handleGenerate(), 100);
                        }}
                        trackColor={{
                          false: colors.cardBorder,
                          true: colors.accent + "60",
                        }}
                        thumbColor={options.includeNumbers ? colors.accent : colors.card}
                      />
                    </View>

                    <View style={styles.toggleRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Symbols (!@#$...)
                      </Text>
                      <Switch
                        value={options.includeSymbols}
                        onValueChange={(value) => {
                          updateOption("includeSymbols", value);
                          setTimeout(() => handleGenerate(), 100);
                        }}
                        trackColor={{
                          false: colors.cardBorder,
                          true: colors.accent + "60",
                        }}
                        thumbColor={options.includeSymbols ? colors.accent : colors.card}
                      />
                    </View>

                    <View style={styles.toggleRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Exclude Similar (i, l, 1, O, 0)
                      </Text>
                      <Switch
                        value={options.excludeSimilar}
                        onValueChange={(value) => {
                          updateOption("excludeSimilar", value);
                          setTimeout(() => handleGenerate(), 100);
                        }}
                        trackColor={{
                          false: colors.cardBorder,
                          true: colors.accent + "60",
                        }}
                        thumbColor={options.excludeSimilar ? colors.accent : colors.card}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.optionRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          { color: colors.text, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Word Count: {passphraseWords}
                      </Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={3}
                        maximumValue={8}
                        step={1}
                        value={passphraseWords}
                        onValueChange={(value) => setPassphraseWords(Math.round(value))}
                        onSlidingComplete={() => handleGenerate()}
                        minimumTrackTintColor={colors.accent}
                        maximumTrackTintColor={colors.cardBorder}
                        thumbTintColor={colors.accent}
                      />
                    </View>
                  </>
                )}
              </MotiView>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={handleUsePassword}
              disabled={!generated}
              style={[
                styles.useButton,
                {
                  backgroundColor: generated ? colors.accent : colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={[styles.useButtonText, { fontFamily: fontConfig.bold }]}>
                Use This Password
              </Text>
            </Pressable>
          </View>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modeToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 14,
  },
  passwordDisplay: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  passwordText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 13,
  },
  strengthValue: {
    fontSize: 13,
  },
  entropyText: {
    fontSize: 11,
  },
  strengthBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
  },
  presetsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  presetsScroll: {
    gap: 10,
  },
  presetButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
  },
  presetName: {
    fontSize: 13,
    marginBottom: 2,
  },
  presetDesc: {
    fontSize: 11,
  },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingVertical: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionRow: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  useButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
