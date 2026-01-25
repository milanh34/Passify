// src/components/PasswordGeneratorModal.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../context/ThemeContext";
import {
  generatePassword,
  generatePassphrase,
  PasswordOptions,
  GeneratedPassword,
  PASSWORD_PRESETS,
  DEFAULT_PASSWORD_OPTIONS,
} from "../utils/passwordGenerator";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { log } from "../utils/logger";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const [passwordVisible, setPasswordVisible] = useState(true);

  const shouldGenerateRef = useRef(false);
  const isGeneratingRef = useRef(false);

  const generateWithParams = useCallback(
    async (
      genMode: "password" | "passphrase",
      genOptions: PasswordOptions,
      genPassphraseWords: number
    ) => {
      if (isGeneratingRef.current) return;

      isGeneratingRef.current = true;
      setIsGenerating(true);
      setCopied(false);

      try {
        let result: GeneratedPassword;
        if (genMode === "passphrase") {
          result = await generatePassphrase(genPassphraseWords);
        } else {
          result = await generatePassword(genOptions);
        }
        setGenerated(result);
        setPasswordVisible(true);
      } catch (error: any) {
        log.error("Password generation error:", error);
      } finally {
        setIsGenerating(false);
        isGeneratingRef.current = false;
      }
    },
    []
  );

  const handleGenerate = useCallback(() => {
    generateWithParams(mode, options, passphraseWords);
  }, [mode, options, passphraseWords, generateWithParams]);

  useEffect(() => {
    if (visible) {
      setGenerated(null);
      setCopied(false);
      setPasswordVisible(true);

      const timer = setTimeout(() => {
        generateWithParams(mode, options, passphraseWords);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [visible]);

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
    }
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PASSWORD_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setOptions(preset.options);
      setMode("password");
      generateWithParams("password", preset.options, passphraseWords);
    }
  };

  const handleModeChange = (newMode: "password" | "passphrase") => {
    setMode(newMode);
    generateWithParams(newMode, options, passphraseWords);
  };

  const updateOptionAndGenerate = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K]
  ) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    generateWithParams(mode, newOptions, passphraseWords);
  };

  const updateOption = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSliderComplete = () => {
    handleGenerate();
  };

  const handleLengthChange = (value: number) => {
    updateOption("length", Math.round(value));
  };

  const handleLengthComplete = (value: number) => {
    const newOptions = { ...options, length: Math.round(value) };
    setOptions(newOptions);
    generateWithParams(mode, newOptions, passphraseWords);
  };

  const handlePassphraseWordsChange = (value: number) => {
    setPassphraseWords(Math.round(value));
  };

  const handlePassphraseWordsComplete = (value: number) => {
    const newWords = Math.round(value);
    setPassphraseWords(newWords);
    generateWithParams(mode, options, newWords);
  };

  const maskPassword = (password: string): string => {
    return "•".repeat(Math.min(password.length, 24));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              maxHeight: SCREEN_HEIGHT * 0.85,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: colors.accent + "20" }]}>
                <Ionicons name="key" size={24} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
                  Password Generator
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.muted, fontFamily: fontConfig.regular }]}
                >
                  Create a secure password
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.bg[0] }]}
            >
              <Ionicons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            <View style={styles.section}>
              <View style={styles.modeToggle}>
                <Pressable
                  onPress={() => handleModeChange("password")}
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
                  onPress={() => handleModeChange("passphrase")}
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
            </View>

            <View style={styles.section}>
              <Text
                style={[styles.sectionLabel, { color: colors.muted, fontFamily: fontConfig.bold }]}
              >
                GENERATED PASSWORD
              </Text>
              <View
                style={[
                  styles.passwordBox,
                  {
                    backgroundColor: colors.bg[0],
                    borderColor: generated ? colors.accent : colors.cardBorder,
                  },
                ]}
              >
                {isGenerating ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={colors.accent} />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: colors.muted, fontFamily: fontConfig.regular },
                      ]}
                    >
                      Generating...
                    </Text>
                  </View>
                ) : generated ? (
                  <View style={styles.passwordContent}>
                    <Text
                      style={[
                        styles.passwordText,
                        { color: colors.text, fontFamily: fontConfig.bold },
                      ]}
                      selectable={passwordVisible}
                    >
                      {passwordVisible ? generated.password : maskPassword(generated.password)}
                    </Text>
                    <Pressable
                      onPress={() => setPasswordVisible(!passwordVisible)}
                      style={[styles.eyeButton, { backgroundColor: colors.cardBorder + "50" }]}
                    >
                      <Ionicons
                        name={passwordVisible ? "eye-off" : "eye"}
                        size={20}
                        color={colors.text}
                      />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.loadingBox}>
                    <Ionicons name="key-outline" size={28} color={colors.muted} />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: colors.muted, fontFamily: fontConfig.regular },
                      ]}
                    >
                      Tap Regenerate
                    </Text>
                  </View>
                )}
              </View>

              {generated && !isGenerating && (
                <View style={styles.strengthBox}>
                  <PasswordStrengthIndicator
                    password={generated.password}
                    showSuggestions={false}
                  />
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Ionicons name="shield-checkmark" size={14} color={colors.muted} />
                      <Text
                        style={[
                          styles.statText,
                          { color: colors.muted, fontFamily: fontConfig.regular },
                        ]}
                      >
                        {generated.entropy} bits entropy
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="text" size={14} color={colors.muted} />
                      <Text
                        style={[
                          styles.statText,
                          { color: colors.muted, fontFamily: fontConfig.regular },
                        ]}
                      >
                        {generated.password.length} chars
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.actionRow}>
                <Pressable
                  onPress={handleGenerate}
                  disabled={isGenerating}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.accent + "15",
                      borderColor: colors.accent,
                      opacity: isGenerating ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons name="refresh" size={18} color={colors.accent} />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: colors.accent, fontFamily: fontConfig.bold },
                    ]}
                  >
                    Regenerate
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleCopy}
                  disabled={!generated || isGenerating}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: copied ? colors.accent : colors.accent + "15",
                      borderColor: colors.accent,
                      opacity: !generated || isGenerating ? 0.6 : 1,
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
                      styles.actionBtnText,
                      { color: copied ? "#fff" : colors.accent, fontFamily: fontConfig.bold },
                    ]}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {mode === "password" && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: colors.muted, fontFamily: fontConfig.bold },
                  ]}
                >
                  QUICK PRESETS
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.presetsRow}
                >
                  {PASSWORD_PRESETS.map((preset) => (
                    <Pressable
                      key={preset.id}
                      onPress={() => handlePresetSelect(preset.id)}
                      style={[
                        styles.presetCard,
                        { backgroundColor: colors.bg[0], borderColor: colors.cardBorder },
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
                          { color: colors.muted, fontFamily: fontConfig.regular },
                        ]}
                      >
                        {preset.description}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <Pressable
                onPress={() => setShowAdvanced(!showAdvanced)}
                style={[
                  styles.advancedHeader,
                  { backgroundColor: colors.bg[0], borderColor: colors.cardBorder },
                ]}
              >
                <Text
                  style={[
                    styles.advancedTitle,
                    { color: colors.text, fontFamily: fontConfig.bold },
                  ]}
                >
                  {mode === "password" ? "Advanced Options" : "Passphrase Options"}
                </Text>
                <Ionicons
                  name={showAdvanced ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.accent}
                />
              </Pressable>

              {showAdvanced && (
                <View
                  style={[
                    styles.optionsBox,
                    { backgroundColor: colors.bg[0], borderColor: colors.cardBorder },
                  ]}
                >
                  {mode === "password" ? (
                    <>
                      <View style={styles.optionItem}>
                        <View style={styles.optionLabelRow}>
                          <Text
                            style={[
                              styles.optionLabel,
                              { color: colors.text, fontFamily: fontConfig.regular },
                            ]}
                          >
                            Length
                          </Text>
                          <View style={[styles.badge, { backgroundColor: colors.accent + "20" }]}>
                            <Text
                              style={[
                                styles.badgeText,
                                { color: colors.accent, fontFamily: fontConfig.bold },
                              ]}
                            >
                              {options.length}
                            </Text>
                          </View>
                        </View>
                        <Slider
                          style={styles.slider}
                          minimumValue={8}
                          maximumValue={64}
                          step={1}
                          value={options.length}
                          onValueChange={handleLengthChange}
                          onSlidingComplete={handleLengthComplete}
                          minimumTrackTintColor={colors.accent}
                          maximumTrackTintColor={colors.cardBorder}
                          thumbTintColor={colors.accent}
                        />
                      </View>

                      {[
                        { key: "includeUppercase" as const, label: "Uppercase (A-Z)" },
                        { key: "includeLowercase" as const, label: "Lowercase (a-z)" },
                        { key: "includeNumbers" as const, label: "Numbers (0-9)" },
                        { key: "includeSymbols" as const, label: "Symbols (!@#$)" },
                        { key: "excludeSimilar" as const, label: "Exclude Similar (i,l,1,O,0)" },
                      ].map((item) => (
                        <View
                          key={item.key}
                          style={[styles.toggleItem, { borderTopColor: colors.cardBorder }]}
                        >
                          <Text
                            style={[
                              styles.toggleLabel,
                              { color: colors.text, fontFamily: fontConfig.regular },
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Switch
                            value={options[item.key]}
                            onValueChange={(value) => updateOptionAndGenerate(item.key, value)}
                            trackColor={{ false: colors.cardBorder, true: colors.accent + "60" }}
                            thumbColor={options[item.key] ? colors.accent : colors.card}
                          />
                        </View>
                      ))}
                    </>
                  ) : (
                    <View style={styles.optionItem}>
                      <View style={styles.optionLabelRow}>
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: colors.text, fontFamily: fontConfig.regular },
                          ]}
                        >
                          Number of Words
                        </Text>
                        <View style={[styles.badge, { backgroundColor: colors.accent + "20" }]}>
                          <Text
                            style={[
                              styles.badgeText,
                              { color: colors.accent, fontFamily: fontConfig.bold },
                            ]}
                          >
                            {passphraseWords}
                          </Text>
                        </View>
                      </View>
                      <Slider
                        style={styles.slider}
                        minimumValue={3}
                        maximumValue={8}
                        step={1}
                        value={passphraseWords}
                        onValueChange={handlePassphraseWordsChange}
                        onSlidingComplete={handlePassphraseWordsComplete}
                        minimumTrackTintColor={colors.accent}
                        maximumTrackTintColor={colors.cardBorder}
                        thumbTintColor={colors.accent}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { borderTopColor: colors.cardBorder, backgroundColor: colors.card },
            ]}
          >
            <Pressable
              onPress={handleUsePassword}
              disabled={!generated || isGenerating}
              style={[
                styles.useButton,
                {
                  backgroundColor: generated && !isGenerating ? colors.accent : colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={[styles.useButtonText, { fontFamily: fontConfig.bold }]}>
                Use This Password
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
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
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 16,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modeToggle: {
    flexDirection: "row",
    gap: 10,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  modeButtonText: {
    fontSize: 14,
  },
  passwordBox: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    height: 100,
    justifyContent: "center",
    overflow: "hidden",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  passwordContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passwordText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 66,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
  },
  strengthBox: {
    gap: 10,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 14,
  },
  presetsRow: {
    marginHorizontal: -4,
  },
  presetCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 100,
  },
  presetName: {
    fontSize: 13,
    marginBottom: 2,
  },
  presetDesc: {
    fontSize: 10,
  },
  advancedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  advancedTitle: {
    fontSize: 14,
  },
  optionsBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  optionItem: {
    gap: 8,
  },
  optionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLabel: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
  },
  slider: {
    width: "100%",
    height: 36,
  },
  toggleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 13,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  useButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
