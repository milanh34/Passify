// app/settings.tsx

import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Linking } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAnimation } from "../src/context/AnimationContext";
import { useAuth } from "../src/context/AuthContext";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import Toast from "../src/components/Toast";
import ConfirmModal from "../src/components/ConfirmModal";
import PINInputModal from "../src/components/PINInputModal";
import { storePIN, changePIN, isPINSet, removePIN } from "../src/utils/pinCode";
import { authenticateWithBiometric, getBiometricTypeName } from "../src/utils/biometricAuth";
import { InactivityTimeout, getTimeoutLabel } from "../src/utils/inactivityTracker";
import { getScreenshotAllowed, setScreenshotAllowed } from "../src/utils/screenSecurity";
import { resetOnboarding } from "../src/utils/onboardingState";

export default function Settings() {
  const { mode, font, changeTheme, changeFont, colors, THEMES, FONTS, fontConfig, fontsLoaded } =
    useTheme();
  const { currentAnimation, changeAnimation, ANIMATION_PRESETS } = useAnimation();
  const {
    preferences,
    biometricCapability,
    isPINConfigured,
    setBiometricEnabled,
    setInactivityTimeout,
    refreshBiometricCapability,
    checkPINStatus,
  } = useAuth();

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"setup" | "change">("setup");
  const [oldPIN, setOldPIN] = useState("");
  const [showOldPINModal, setShowOldPINModal] = useState(false);
  const [screenshotAllowed, setScreenshotAllowedState] = useState(false);
  const [showReplayTutorialModal, setShowReplayTutorialModal] = useState(false);
  const [showRemovePINModal, setShowRemovePINModal] = useState(false);

  useEffect(() => {
    setRenderKey((prev) => prev + 1);
  }, [colors, fontConfig]);

  useEffect(() => {
    refreshBiometricCapability();
    checkPINStatus();
  }, []);

  useEffect(() => {
    const loadScreenshotSetting = async () => {
      const allowed = await getScreenshotAllowed();
      setScreenshotAllowedState(allowed);
    };
    loadScreenshotSetting();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value && !biometricCapability?.isAvailable) {
      showToastMessage("Biometric authentication is not available on this device", "error");
      return;
    }

    if (value && !isPINConfigured) {
      showToastMessage("Please set up a PIN first as a fallback", "warning");
      return;
    }

    await setBiometricEnabled(value);
    showToastMessage(
      value ? "Biometric authentication enabled" : "Biometric authentication disabled",
      "success"
    );
  };

  const handleSetupPIN = () => {
    setPinModalMode("setup");
    setPinModalVisible(true);
  };

  const handleChangePIN = () => {
    setShowOldPINModal(true);
  };

  const handleOldPINSubmit = async (pin: string): Promise<boolean> => {
    const isValid = await isPINSet();
    if (!isValid) return false;

    const { verifyPIN } = await import("../src/utils/pinCode");
    const verified = await verifyPIN(pin);

    if (verified) {
      setOldPIN(pin);
      setShowOldPINModal(false);
      setPinModalMode("change");
      setPinModalVisible(true);
      return true;
    }

    return false;
  };

  const handlePINSubmit = async (pin: string): Promise<boolean> => {
    try {
      if (pinModalMode === "setup") {
        const success = await storePIN(pin);
        if (success) {
          await checkPINStatus();
          setPinModalVisible(false);
          showToastMessage("PIN set successfully", "success");
          return true;
        } else {
          showToastMessage("Failed to set PIN", "error");
          return false;
        }
      } else {
        const result = await changePIN(oldPIN, pin);
        if (result.success) {
          setPinModalVisible(false);
          setOldPIN("");
          showToastMessage("PIN changed successfully", "success");
          return true;
        } else {
          showToastMessage(result.error || "Failed to change PIN", "error");
          return false;
        }
      }
    } catch (error: any) {
      showToastMessage(error.message || "An error occurred", "error");
      return false;
    }
  };

  const handleRemovePIN = () => {
    setShowRemovePINModal(true);
  };

  const confirmRemovePIN = async () => {
    const success = await removePIN();
    if (success) {
      await checkPINStatus();
      await setBiometricEnabled(false);
      showToastMessage("PIN removed successfully", "success");
    } else {
      showToastMessage("Failed to remove PIN", "error");
    }
    setShowRemovePINModal(false);
  };

  const handleTimeoutChange = async (minutes: InactivityTimeout) => {
    await setInactivityTimeout(minutes);
    showToastMessage(`Auto-lock timeout set to ${getTimeoutLabel(minutes)}`, "success");
  };

  const handleTestBiometric = async () => {
    if (!biometricCapability?.isAvailable) {
      showToastMessage("Biometric authentication is not available", "error");
      return;
    }

    const result = await authenticateWithBiometric();
    if (result.success) {
      showToastMessage("Biometric authentication successful!", "success");
    } else {
      showToastMessage(result.error || "Authentication failed", "error");
    }
  };

  const handleScreenshotToggle = async (value: boolean) => {
    await setScreenshotAllowed(value);
    setScreenshotAllowedState(value);
    showToastMessage(
      value ? "Screenshots enabled - Less secure" : "Screenshots blocked for security",
      value ? "warning" : "success"
    );
  };

  const handleReplayTutorial = () => {
    setShowReplayTutorialModal(true);
  };

  const confirmReplayTutorial = async () => {
    setShowReplayTutorialModal(false);
    await resetOnboarding();
    router.replace("/onboarding");
  };

  if (!fontsLoaded) {
    return <LinearGradient colors={colors.bg} style={[styles.root, { paddingTop: insets.top }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        key={`header-${renderKey}`}
        style={[
          styles.header,
          { paddingTop: insets.top + 12, borderBottomColor: colors.cardBorder },
        ]}
      >
        <Pressable
          onPress={router.back}
          style={[
            styles.backButton,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 16 }}
      >
        <View style={styles.section} key={`color-section-${renderKey}`}>
          <Pressable
            onPress={() => toggleSection("theme")}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons
                name="color-palette"
                size={22}
                color={colors.accent}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                Color Theme
              </Text>
            </View>
            <Ionicons
              name={expandedSection === "theme" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </Pressable>

          <AnimatePresence>
            {expandedSection === "theme" && (
              <MotiView
                key={`theme-${renderKey}`}
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 250 }}
              >
                <View style={styles.grid}>
                  <ThemeOption
                    label="System"
                    active={mode === "system"}
                    onPress={() => changeTheme("system")}
                    colors={colors}
                    fontConfig={fontConfig}
                  />
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <ThemeOption
                      key={key}
                      label={theme.name}
                      active={mode === key}
                      onPress={() => changeTheme(key as any)}
                      colors={colors}
                      preview={[theme.accent, theme.accent2, theme.subtext]}
                      fontConfig={fontConfig}
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <View style={[styles.section, { marginTop: 20 }]} key={`font-section-${renderKey}`}>
          <Pressable
            onPress={() => toggleSection("font")}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="text" size={22} color={colors.accent} style={{ marginRight: 12 }} />
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                Font Family
              </Text>
            </View>
            <Ionicons
              name={expandedSection === "font" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </Pressable>
          <AnimatePresence>
            {expandedSection === "font" && (
              <MotiView
                key={`font-${renderKey}`}
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 250 }}
              >
                <View style={styles.grid}>
                  {Object.entries(FONTS).map(([key, f]) => (
                    <FontOption
                      key={key}
                      label={f.label}
                      active={font === key}
                      onPress={() => changeFont(key as any)}
                      colors={colors}
                      sampleFamily={f.bold}
                      fontConfig={fontConfig}
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <View style={[styles.section, { marginTop: 20 }]} key={`animation-section-${renderKey}`}>
          <Pressable
            onPress={() => toggleSection("animation")}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="flash" size={22} color={colors.accent} style={{ marginRight: 12 }} />
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                Animation Style
              </Text>
            </View>
            <Ionicons
              name={expandedSection === "animation" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </Pressable>
          <AnimatePresence>
            {expandedSection === "animation" && (
              <MotiView
                key={`animation-${renderKey}`}
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 250 }}
              >
                <View style={styles.grid}>
                  {ANIMATION_PRESETS.map((preset) => (
                    <AnimationOption
                      key={preset.id}
                      label={preset.name}
                      icon={getAnimationIcon(preset.id)}
                      active={currentAnimation === preset.id}
                      onPress={() => changeAnimation(preset.id)}
                      colors={colors}
                      fontConfig={fontConfig}
                    />
                  ))}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <View style={[styles.section, { marginTop: 20 }]} key={`security-section-${renderKey}`}>
          <Pressable
            onPress={() => toggleSection("security")}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={colors.accent}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                Security & Privacy
              </Text>
            </View>
            <Ionicons
              name={expandedSection === "security" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </Pressable>
          <AnimatePresence>
            {expandedSection === "security" && (
              <MotiView
                key={`security-${renderKey}`}
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 250 }}
                style={styles.securityContent}
              >
                <View style={[styles.securityRow, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.securityLeft}>
                    <Ionicons name="finger-print" size={24} color={colors.accent} />
                    <View style={styles.securityTextContainer}>
                      <Text
                        style={[
                          styles.securityTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Biometric Authentication
                      </Text>
                      <Text
                        style={[
                          styles.securitySubtitle,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        {biometricCapability?.isAvailable
                          ? `Use ${getBiometricTypeName(biometricCapability.biometricType)}`
                          : "Not available on this device"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={preferences.biometricEnabled}
                    onValueChange={handleBiometricToggle}
                    disabled={!biometricCapability?.isAvailable || !isPINConfigured}
                    trackColor={{
                      false: colors.cardBorder,
                      true: colors.accent + "60",
                    }}
                    thumbColor={preferences.biometricEnabled ? colors.accent : colors.card}
                  />
                </View>

                {biometricCapability?.isAvailable && (
                  <Pressable
                    onPress={handleTestBiometric}
                    style={[
                      styles.securityButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    android_ripple={{ color: colors.accent + "22" }}
                  >
                    <Ionicons name="scan-outline" size={20} color={colors.accent} />
                    <Text
                      style={[
                        styles.securityButtonText,
                        { color: colors.text, fontFamily: fontConfig.regular },
                      ]}
                    >
                      Test Biometric
                    </Text>
                  </Pressable>
                )}

                <View style={[styles.securityRow, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.securityLeft}>
                    <Ionicons name="keypad" size={24} color={colors.accent} />
                    <View style={styles.securityTextContainer}>
                      <Text
                        style={[
                          styles.securityTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        PIN Code
                      </Text>
                      <Text
                        style={[
                          styles.securitySubtitle,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        {isPINConfigured ? "PIN is configured" : "No PIN set"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.securityButtonGroup}>
                  {!isPINConfigured ? (
                    <Pressable
                      onPress={handleSetupPIN}
                      style={[styles.securityButton, { backgroundColor: colors.accent, flex: 1 }]}
                      android_ripple={{ color: colors.bg[0] }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#fff" />
                      <Text
                        style={[
                          styles.securityButtonText,
                          { color: "#fff", fontFamily: fontConfig.bold },
                        ]}
                      >
                        Set Up PIN
                      </Text>
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={handleChangePIN}
                        style={[
                          styles.securityButton,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            flex: 1,
                          },
                        ]}
                        android_ripple={{ color: colors.accent + "22" }}
                      >
                        <Ionicons name="create-outline" size={20} color={colors.accent} />
                        <Text
                          style={[
                            styles.securityButtonText,
                            {
                              color: colors.text,
                              fontFamily: fontConfig.regular,
                            },
                          ]}
                        >
                          Change PIN
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={handleRemovePIN}
                        style={[
                          styles.securityButton,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.cardBorder,
                            flex: 1,
                          },
                        ]}
                        android_ripple={{ color: colors.danger + "22" }}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                        <Text
                          style={[
                            styles.securityButtonText,
                            {
                              color: colors.danger,
                              fontFamily: fontConfig.regular,
                            },
                          ]}
                        >
                          Remove PIN
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>

                <View style={[styles.securityRow, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.securityLeft}>
                    <Ionicons name="timer-outline" size={24} color={colors.accent} />
                    <View style={styles.securityTextContainer}>
                      <Text
                        style={[
                          styles.securityTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Auto-lock Timeout
                      </Text>
                      <Text
                        style={[
                          styles.securitySubtitle,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        {getTimeoutLabel(preferences.inactivityTimeout)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.timeoutGrid}>
                  {([1, 5, 10, 30, 0] as const).map((minutes) => (
                    <Pressable
                      key={minutes}
                      onPress={() => handleTimeoutChange(minutes as InactivityTimeout)}
                      style={[
                        styles.timeoutButton,
                        {
                          backgroundColor:
                            preferences.inactivityTimeout === minutes
                              ? colors.accent + "15"
                              : colors.card,
                          borderWidth: preferences.inactivityTimeout === minutes ? 2 : 1,
                          borderColor:
                            preferences.inactivityTimeout === minutes
                              ? colors.accent
                              : colors.cardBorder,
                        },
                      ]}
                      android_ripple={{ color: colors.accent + "22" }}
                    >
                      <Text
                        style={[
                          styles.timeoutButtonText,
                          {
                            color:
                              preferences.inactivityTimeout === minutes
                                ? colors.accent
                                : colors.text,
                            fontFamily: fontConfig.bold,
                          },
                        ]}
                      >
                        {getTimeoutLabel(minutes as InactivityTimeout)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {preferences.lastUnlockTime > 0 && (
                  <View
                    style={[
                      styles.infoBox,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <Ionicons name="information-circle-outline" size={20} color={colors.subtext} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.infoText,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        Last unlocked: {new Date(preferences.lastUnlockTime).toLocaleString()}
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        Method: {preferences.lastUnlockMethod === "biometric" ? "Biometric" : "PIN"}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={[styles.securityRow, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.securityLeft}>
                    <Ionicons name="camera-outline" size={24} color={colors.accent} />
                    <View style={styles.securityTextContainer}>
                      <Text
                        style={[
                          styles.securityTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Block Screenshots
                      </Text>
                      <Text
                        style={[
                          styles.securitySubtitle,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        {screenshotAllowed
                          ? "Screenshots allowed (less secure)"
                          : "Screenshots blocked on sensitive screens"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={!screenshotAllowed}
                    onValueChange={(value) => handleScreenshotToggle(!value)}
                    trackColor={{
                      false: colors.cardBorder,
                      true: colors.accent + "60",
                    }}
                    thumbColor={!screenshotAllowed ? colors.accent : colors.card}
                  />
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <View style={[styles.section, { marginTop: 20 }]} key={`tutorial-section-${renderKey}`}>
          <Pressable
            onPress={() => toggleSection("tutorial")}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="school" size={22} color={colors.accent} style={{ marginRight: 12 }} />
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                Tutorial & Help
              </Text>
            </View>
            <Ionicons
              name={expandedSection === "tutorial" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </Pressable>
          <AnimatePresence>
            {expandedSection === "tutorial" && (
              <MotiView
                key={`tutorial-${renderKey}`}
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 250 }}
                style={styles.securityContent}
              >
                <View style={[styles.securityRow, { borderBottomColor: colors.cardBorder }]}>
                  <View style={styles.securityLeft}>
                    <Ionicons name="play-circle" size={24} color={colors.accent} />
                    <View style={styles.securityTextContainer}>
                      <Text
                        style={[
                          styles.securityTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Replay Tutorial
                      </Text>
                      <Text
                        style={[
                          styles.securitySubtitle,
                          {
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          },
                        ]}
                      >
                        Go through the onboarding slides again
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={handleReplayTutorial}
                  style={[
                    styles.securityButton,
                    {
                      backgroundColor: colors.accent,
                    },
                  ]}
                  android_ripple={{ color: colors.bg[0] }}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text
                    style={[
                      styles.securityButtonText,
                      { color: "#fff", fontFamily: fontConfig.bold },
                    ]}
                  >
                    Start Tutorial
                  </Text>
                </Pressable>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
        <View style={[styles.section, { marginTop: 20 }]} key={`legal-section-${renderKey}`}>
          <Pressable
            onPress={() => toggleSection("legal")}
            style={[
              styles.sectionHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.headerLeft}>
              <Ionicons
                name="document-text"
                size={22}
                color={colors.accent}
                style={{ marginRight: 12 }}
              />
              <Text
                style={[styles.sectionTitle, { color: colors.text, fontFamily: fontConfig.bold }]}
              >
                Legal
              </Text>
            </View>
            <Ionicons
              name={expandedSection === "legal" ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </Pressable>
          <AnimatePresence>
            {expandedSection === "legal" && (
              <MotiView
                key={`legal-${renderKey}`}
                from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: -20, scale: 0.95 }}
                transition={{ type: "timing", duration: 250 }}
                style={styles.securityContent}
              >
                <Pressable
                  onPress={() => router.push("/legal?type=privacy")}
                  style={[
                    styles.legalItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  android_ripple={{ color: colors.accent + "22" }}
                >
                  <View style={styles.legalItemLeft}>
                    <Ionicons name="shield-checkmark" size={24} color={colors.accent} />
                    <View style={styles.legalItemText}>
                      <Text
                        style={[
                          styles.legalItemTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Privacy Policy
                      </Text>
                      <Text
                        style={[
                          styles.legalItemSubtitle,
                          { color: colors.subtext, fontFamily: fontConfig.regular },
                        ]}
                      >
                        How we handle your data (we don't!)
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/legal?type=terms")}
                  style={[
                    styles.legalItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  android_ripple={{ color: colors.accent + "22" }}
                >
                  <View style={styles.legalItemLeft}>
                    <Ionicons name="document-text-outline" size={24} color={colors.accent} />
                    <View style={styles.legalItemText}>
                      <Text
                        style={[
                          styles.legalItemTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Terms of Service
                      </Text>
                      <Text
                        style={[
                          styles.legalItemSubtitle,
                          { color: colors.subtext, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Rules for using Passify
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </Pressable>
                <Pressable
                  onPress={() => router.push("/legal?type=licenses")}
                  style={[
                    styles.legalItem,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  android_ripple={{ color: colors.accent + "22" }}
                >
                  <View style={styles.legalItemLeft}>
                    <Ionicons name="code-slash" size={24} color={colors.accent} />
                    <View style={styles.legalItemText}>
                      <Text
                        style={[
                          styles.legalItemTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                      >
                        Open Source Licenses
                      </Text>
                      <Text
                        style={[
                          styles.legalItemSubtitle,
                          { color: colors.subtext, fontFamily: fontConfig.regular },
                        ]}
                      >
                        Third-party libraries we use
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </Pressable>
                <View
                  style={[
                    styles.versionBox,
                    {
                      backgroundColor: colors.bg[0],
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.versionLabel,
                      { color: colors.muted, fontFamily: fontConfig.regular },
                    ]}
                  >
                    App Version
                  </Text>
                  <Text
                    style={[
                      styles.versionNumber,
                      { color: colors.text, fontFamily: fontConfig.bold },
                    ]}
                  >
                    1.0.0
                  </Text>
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 12,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.subtext,
            fontFamily: fontConfig.regular,
            opacity: 0.75,
          }}
        >
          Passify · Made by{" "}
          <Text
            style={{
              color: colors.accent,
              fontFamily: fontConfig.bold,
            }}
            onPress={() => Linking.openURL("https://github.com/milanh34")}
          >
            Milan Haria
          </Text>
        </Text>
      </View>

      <PINInputModal
        visible={showOldPINModal}
        onSubmit={handleOldPINSubmit}
        onCancel={() => setShowOldPINModal(false)}
        title="Enter Current PIN"
        subtitle="Enter your current PIN to change it"
        mode="unlock"
      />

      <PINInputModal
        visible={pinModalVisible}
        onSubmit={handlePINSubmit}
        onCancel={() => {
          setPinModalVisible(false);
          setOldPIN("");
        }}
        title={pinModalMode === "setup" ? "Set Up PIN" : "Enter New PIN"}
        subtitle={pinModalMode === "setup" ? "Create a 4-6 digit PIN" : "Enter your new PIN"}
        mode={pinModalMode}
      />

      <ConfirmModal
        visible={showReplayTutorialModal}
        title="Replay Tutorial?"
        message="This will take you through the onboarding slides again. Ready to learn the ropes?"
        confirmText="Start Tutorial"
        cancelText="Cancel"
        type="info"
        onConfirm={confirmReplayTutorial}
        onCancel={() => setShowReplayTutorialModal(false)}
      />

      <ConfirmModal
        visible={showRemovePINModal}
        title="Remove PIN?"
        message="This will disable PIN authentication. Biometric authentication will also be disabled if enabled."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmRemovePIN}
        onCancel={() => setShowRemovePINModal(false)}
      />

      <Toast visible={showToast} message={toastMessage} type={toastType} />
    </LinearGradient>
  );
}

function getAnimationIcon(id: string): string {
  const iconMap: Record<string, string> = {
    slideright: "arrow-forward",
    slideleft: "arrow-back",
    slidebottom: "arrow-up",
    fade: "eye-off-outline",
    scalefade: "contract-outline",
    scalefadeout: "expand-outline",
    slidescale: "resize-outline",
    rotateslide: "sync-outline",
    bounce: "ellipse-outline",
    elastic: "radio-button-on-outline",
    professional: "star-outline",
  };
  return iconMap[id] || "flash-outline";
}

function ThemeOption({
  label,
  active,
  onPress,
  colors,
  preview = [] as string[],
  fontConfig,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active ? colors.accent + "15" : colors.card,
          borderWidth: active ? 2 : 0,
          borderColor: active ? colors.accent : "transparent",
        },
      ]}
      android_ripple={{ color: colors.accent + "33" }}
    >
      {preview.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            gap: 5,
            marginBottom: 10,
            width: "100%",
          }}
        >
          {preview.map((c: string, i: number) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 12,
                backgroundColor: c,
                borderRadius: 6,
              }}
            />
          ))}
        </View>
      )}
      <Text
        style={{
          color: active ? colors.accent : colors.text,
          fontFamily: fontConfig.bold,
          fontSize: 13,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FontOption({ label, active, onPress, colors, sampleFamily, fontConfig }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active ? colors.accent + "15" : colors.card,
          borderWidth: active ? 2 : 0,
          borderColor: active ? colors.accent : "transparent",
        },
      ]}
      android_ripple={{ color: colors.accent + "33" }}
    >
      <Text
        style={{
          fontFamily: sampleFamily,
          fontSize: 28,
          marginBottom: 8,
          color: active ? colors.accent : colors.text,
        }}
      >
        Aa
      </Text>
      <Text
        style={{
          color: active ? colors.accent : colors.text,
          fontSize: 11,
          textAlign: "center",
          fontFamily: fontConfig.regular,
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function AnimationOption({ label, icon, active, onPress, colors, fontConfig }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: active ? colors.accent + "15" : colors.card,
          borderWidth: active ? 2 : 0,
          borderColor: active ? colors.accent : "transparent",
        },
      ]}
      android_ripple={{ color: colors.accent + "33" }}
    >
      <Ionicons
        name={icon as any}
        size={32}
        color={active ? colors.accent : colors.text}
        style={{ marginBottom: 8 }}
      />
      <Text
        style={{
          color: active ? colors.accent : colors.text,
          fontFamily: fontConfig.bold,
          fontSize: 11,
          textAlign: "center",
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, borderRadius: 12, borderWidth: 1 },
  headerTitle: { fontSize: 20, flex: 1, textAlign: "center" },
  section: { borderRadius: 16, overflow: "hidden", marginHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 18 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  card: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 90,
  },
  securityContent: {
    paddingTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 8,
    gap: 12,
  },
  securityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  securityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  securityTextContainer: { flex: 1 },
  securityTitle: { fontSize: 16, marginBottom: 2 },
  securitySubtitle: { fontSize: 13 },
  securityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  securityButtonText: { fontSize: 14 },
  securityButtonGroup: { flexDirection: "row", gap: 8 },
  timeoutGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: "30%",
    alignItems: "center",
  },
  timeoutButtonText: { fontSize: 13 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: { fontSize: 12, lineHeight: 18 },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  legalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  legalItemText: {
    flex: 1,
  },
  legalItemTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  legalItemSubtitle: {
    fontSize: 13,
  },
  versionBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 8,
  },
  versionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 18,
  },
});
