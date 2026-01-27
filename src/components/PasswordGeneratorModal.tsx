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
import { useAppTheme } from "../themes/hooks/useAppTheme";
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
  const theme = useAppTheme();

  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [generated, setGenerated] = useState<GeneratedPassword | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mode, setMode] = useState<"password" | "passphrase">("password");
  const [passphraseWords, setPassphraseWords] = useState(4);
  const [passwordVisible, setPasswordVisible] = useState(true);

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
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.shapes.modalRadius,
              maxHeight: SCREEN_HEIGHT * 0.85,
              ...theme.shadows.lg,
            },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.surfaceBorder,
                padding: theme.spacing.lg,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor: theme.colors.accentMuted,
                    borderRadius: theme.shapes.radiusMd,
                  },
                ]}
              >
                <Ionicons name="key" size={24} color={theme.colors.accent} />
              </View>
              <View>
                <Text
                  style={[
                    styles.title,
                    { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  Password Generator
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                  ]}
                >
                  Create a secure password
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { padding: theme.spacing.lg }]}
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
                      backgroundColor:
                        mode === "password" ? theme.colors.accent : theme.colors.background,
                      borderColor: theme.colors.accent,
                      borderRadius: theme.shapes.buttonRadius,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed"
                    size={16}
                    color={mode === "password" ? theme.colors.textInverse : theme.colors.accent}
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      {
                        color: mode === "password" ? theme.colors.textInverse : theme.colors.accent,
                        fontFamily: theme.typography.fontBold,
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
                      backgroundColor:
                        mode === "passphrase" ? theme.colors.accent : theme.colors.background,
                      borderColor: theme.colors.accent,
                      borderRadius: theme.shapes.buttonRadius,
                    },
                  ]}
                >
                  <Ionicons
                    name="text"
                    size={16}
                    color={mode === "passphrase" ? theme.colors.textInverse : theme.colors.accent}
                  />
                  <Text
                    style={[
                      styles.modeButtonText,
                      {
                        color:
                          mode === "passphrase" ? theme.colors.textInverse : theme.colors.accent,
                        fontFamily: theme.typography.fontBold,
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
                style={[
                  styles.sectionLabel,
                  { color: theme.colors.textMuted, fontFamily: theme.typography.fontBold },
                ]}
              >
                GENERATED PASSWORD
              </Text>
              <View
                style={[
                  styles.passwordBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: generated ? theme.colors.accent : theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.cardRadius,
                    borderWidth: theme.shapes.borderThick,
                  },
                ]}
              >
                {isGenerating ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={theme.colors.accent} />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
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
                        { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                      ]}
                      selectable={passwordVisible}
                    >
                      {passwordVisible ? generated.password : maskPassword(generated.password)}
                    </Text>
                    <Pressable
                      onPress={() => setPasswordVisible(!passwordVisible)}
                      style={[
                        styles.eyeButton,
                        {
                          backgroundColor: theme.colors.surfaceBorder + "50",
                          borderRadius: theme.shapes.radiusSm,
                        },
                      ]}
                    >
                      <Ionicons
                        name={passwordVisible ? "eye-off" : "eye"}
                        size={20}
                        color={theme.colors.textPrimary}
                      />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.loadingBox}>
                    <Ionicons name="key-outline" size={28} color={theme.colors.textMuted} />
                    <Text
                      style={[
                        styles.loadingText,
                        { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
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
                      <Ionicons name="shield-checkmark" size={14} color={theme.colors.textMuted} />
                      <Text
                        style={[
                          styles.statText,
                          {
                            color: theme.colors.textMuted,
                            fontFamily: theme.typography.fontRegular,
                          },
                        ]}
                      >
                        {generated.entropy} bits entropy
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="text" size={14} color={theme.colors.textMuted} />
                      <Text
                        style={[
                          styles.statText,
                          {
                            color: theme.colors.textMuted,
                            fontFamily: theme.typography.fontRegular,
                          },
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
                      backgroundColor: theme.colors.accentMuted,
                      borderColor: theme.colors.accent,
                      borderRadius: theme.shapes.buttonRadius,
                      opacity: isGenerating ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons name="refresh" size={18} color={theme.colors.accent} />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
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
                      backgroundColor: copied ? theme.colors.accent : theme.colors.accentMuted,
                      borderColor: theme.colors.accent,
                      borderRadius: theme.shapes.buttonRadius,
                      opacity: !generated || isGenerating ? 0.6 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={copied ? "checkmark" : "copy"}
                    size={18}
                    color={copied ? theme.colors.textInverse : theme.colors.accent}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      {
                        color: copied ? theme.colors.textInverse : theme.colors.accent,
                        fontFamily: theme.typography.fontBold,
                      },
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
                    { color: theme.colors.textMuted, fontFamily: theme.typography.fontBold },
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
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.surfaceBorder,
                          borderRadius: theme.shapes.radiusMd,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetName,
                          {
                            color: theme.colors.textPrimary,
                            fontFamily: theme.typography.fontBold,
                          },
                        ]}
                      >
                        {preset.name}
                      </Text>
                      <Text
                        style={[
                          styles.presetDesc,
                          {
                            color: theme.colors.textMuted,
                            fontFamily: theme.typography.fontRegular,
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

            <View style={styles.section}>
              <Pressable
                onPress={() => setShowAdvanced(!showAdvanced)}
                style={[
                  styles.advancedHeader,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.radiusMd,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.advancedTitle,
                    { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  {mode === "password" ? "Advanced Options" : "Passphrase Options"}
                </Text>
                <Ionicons
                  name={showAdvanced ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.accent}
                />
              </Pressable>

              {showAdvanced && (
                <View
                  style={[
                    styles.optionsBox,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.surfaceBorder,
                      borderRadius: theme.shapes.radiusMd,
                    },
                  ]}
                >
                  {mode === "password" ? (
                    <>
                      <View style={styles.optionItem}>
                        <View style={styles.optionLabelRow}>
                          <Text
                            style={[
                              styles.optionLabel,
                              {
                                color: theme.colors.textPrimary,
                                fontFamily: theme.typography.fontRegular,
                              },
                            ]}
                          >
                            Length
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: theme.colors.accentMuted,
                                borderRadius: theme.shapes.radiusSm,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                {
                                  color: theme.colors.accent,
                                  fontFamily: theme.typography.fontBold,
                                },
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
                          minimumTrackTintColor={theme.colors.accent}
                          maximumTrackTintColor={theme.colors.surfaceBorder}
                          thumbTintColor={theme.colors.accent}
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
                          style={[
                            styles.toggleItem,
                            { borderTopColor: theme.colors.surfaceBorder },
                          ]}
                        >
                          <Text
                            style={[
                              styles.toggleLabel,
                              {
                                color: theme.colors.textPrimary,
                                fontFamily: theme.typography.fontRegular,
                              },
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Switch
                            value={options[item.key]}
                            onValueChange={(value) => updateOptionAndGenerate(item.key, value)}
                            trackColor={{
                              false: theme.colors.surfaceBorder,
                              true: theme.colors.accent + "60",
                            }}
                            thumbColor={
                              options[item.key] ? theme.colors.accent : theme.colors.surface
                            }
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
                            {
                              color: theme.colors.textPrimary,
                              fontFamily: theme.typography.fontRegular,
                            },
                          ]}
                        >
                          Number of Words
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: theme.colors.accentMuted,
                              borderRadius: theme.shapes.radiusSm,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
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
                        minimumTrackTintColor={theme.colors.accent}
                        maximumTrackTintColor={theme.colors.surfaceBorder}
                        thumbTintColor={theme.colors.accent}
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
              {
                borderTopColor: theme.colors.surfaceBorder,
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.lg,
              },
            ]}
          >
            <Pressable
              onPress={handleUsePassword}
              disabled={!generated || isGenerating}
              style={[
                styles.useButton,
                {
                  backgroundColor:
                    generated && !isGenerating
                      ? theme.colors.buttonPrimary
                      : theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.buttonRadius,
                  height: theme.components.button.height,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.textInverse} />
              <Text
                style={[
                  styles.useButtonText,
                  { fontFamily: theme.typography.fontBold, color: theme.colors.textInverse },
                ]}
              >
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
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
    borderWidth: 1.5,
  },
  modeButtonText: {
    fontSize: 14,
  },
  passwordBox: {
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
    borderWidth: 1,
  },
  advancedTitle: {
    fontSize: 14,
  },
  optionsBox: {
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
    borderTopWidth: 1,
  },
  useButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  useButtonText: {
    fontSize: 16,
  },
});
