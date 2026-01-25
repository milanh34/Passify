// app/screens/BiometricUnlockScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import { authenticateWithBiometric } from "../../src/utils/biometricAuth";
import { verifyPINWithDetails, getPINLockoutStatus } from "../../src/utils/pinCode";
import { formatRemainingTime } from "../../src/utils/pinAttemptTracker";
import {
  preventScreenCapture,
  allowScreenCapture,
  getScreenshotAllowed,
} from "../../src/utils/screenSecurity";
import BiometricPrompt from "../../src/components/BiometricPrompt";
import PINInputModal from "../../src/components/PINInputModal";
import Toast from "../../src/components/Toast";
import { log } from "@/src/utils/logger";

export default function BiometricUnlockScreen() {
  const { colors, fontConfig } = useTheme();
  const { unlock, biometricCapability, preferences, isPINConfigured } = useAuth();
  const insets = useSafeAreaInsets();

  const [showPINModal, setShowPINModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("error");

  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState("");

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    checkLockoutStatus();
  }, []);

  useEffect(() => {
    preventScreenCapture();

    return () => {
      getScreenshotAllowed().then((allowed) => {
        if (allowed) {
          allowScreenCapture();
        }
      });
    };
  }, []);

  const checkLockoutStatus = useCallback(async () => {
    try {
      const status = await getPINLockoutStatus();
      setIsLockedOut(status.isLockedOut);
      if (status.isLockedOut) {
        setLockoutRemaining(status.remainingFormatted);
      }
    } catch (error) {
      log.error("Failed to check lockout status:", error);
    }
  }, []);

  useEffect(() => {
    if (
      preferences.biometricEnabled &&
      biometricCapability?.isAvailable &&
      !isAuthenticating &&
      !isLockedOut
    ) {
      handleBiometricAuth();
    }
  }, [isLockedOut]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isLockedOut) {
      interval = setInterval(async () => {
        const status = await getPINLockoutStatus();
        if (!status.isLockedOut) {
          setIsLockedOut(false);
          setLockoutRemaining("");
        } else {
          setLockoutRemaining(status.remainingFormatted);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLockedOut]);

  const handleBiometricAuth = async () => {
    if (!biometricCapability?.isAvailable) {
      showToastMessage("Biometric authentication not available", "error");
      setShowPINModal(true);
      return;
    }

    setIsAuthenticating(true);
    const result = await authenticateWithBiometric();
    setIsAuthenticating(false);

    if (result.success) {
      await unlock("biometric");
    } else {
      if (result.error === "Authentication cancelled") {
        if (isPINConfigured) {
          setShowPINModal(true);
        } else {
          showToastMessage("Authentication required to continue", "warning");
        }
      } else {
        showToastMessage(result.error || "Authentication failed", "error");
        if (isPINConfigured) {
          setTimeout(() => {
            setShowPINModal(true);
          }, 500);
        }
      }
    }
  };

  const handlePINSubmit = async (pin: string): Promise<boolean> => {
    const result = await verifyPINWithDetails(pin);

    if (result.success) {
      await unlock("pin");
      setShowPINModal(false);
      return true;
    }

    if (result.isLockedOut) {
      setIsLockedOut(true);
      setLockoutRemaining(formatRemainingTime(result.lockoutRemainingMs || 0));
      showToastMessage(result.lockoutMessage || "Too many attempts", "error");
    }

    return false;
  };

  const handleUsePIN = () => {
    if (!isPINConfigured) {
      showToastMessage("No PIN configured. Please use biometric.", "warning");
      return;
    }

    if (isLockedOut) {
      showToastMessage(`Locked out. Try again in ${lockoutRemaining}`, "error");
      return;
    }

    setShowPINModal(true);
  };

  const canUseBiometric = preferences.biometricEnabled && biometricCapability?.isAvailable;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg[0],
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        barStyle={colors.bg[0] === "#000000" ? "light-content" : "dark-content"}
        backgroundColor={colors.bg[0]}
      />

      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.header}
      >
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.accent + "15",
              borderColor: colors.accent,
            },
          ]}
        >
          <Ionicons name="key" size={48} color={colors.accent} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: fontConfig.bold,
            },
          ]}
        >
          Passify
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.subtext,
              fontFamily: fontConfig.regular,
            },
          ]}
        >
          Your passwords are protected
        </Text>
      </MotiView>

      {isLockedOut && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300 }}
          style={[
            styles.lockoutBanner,
            {
              backgroundColor: colors.danger + "15",
              borderColor: colors.danger,
            },
          ]}
        >
          <Ionicons name="lock-closed" size={24} color={colors.danger} />
          <View style={styles.lockoutBannerText}>
            <Text
              style={[
                styles.lockoutTitle,
                {
                  color: colors.danger,
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              Too Many Failed Attempts
            </Text>
            <Text
              style={[
                styles.lockoutCountdown,
                {
                  color: colors.danger,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              Try again in {lockoutRemaining}
            </Text>
          </View>
        </MotiView>
      )}

      {canUseBiometric && !isLockedOut && (
        <View style={styles.biometricContainer}>
          <BiometricPrompt
            biometricType={biometricCapability!.biometricType}
            onPress={handleBiometricAuth}
            isLoading={isAuthenticating}
          />
        </View>
      )}

      <View style={styles.fallbackContainer}>
        {canUseBiometric && isPINConfigured && (
          <Pressable
            onPress={handleUsePIN}
            disabled={isAuthenticating}
            style={[
              styles.fallbackButton,
              {
                borderColor: isLockedOut ? colors.danger : colors.cardBorder,
                opacity: isLockedOut ? 0.6 : 1,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <Ionicons
              name="keypad-outline"
              size={20}
              color={isLockedOut ? colors.danger : colors.subtext}
            />
            <Text
              style={[
                styles.fallbackText,
                {
                  color: isLockedOut ? colors.danger : colors.subtext,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              {isLockedOut ? `Locked (${lockoutRemaining})` : "Use PIN Instead"}
            </Text>
          </Pressable>
        )}

        {!canUseBiometric && isPINConfigured && (
          <Pressable
            onPress={() => !isLockedOut && setShowPINModal(true)}
            disabled={isLockedOut}
            style={[
              styles.primaryButton,
              {
                backgroundColor: isLockedOut ? colors.cardBorder : colors.accent,
              },
            ]}
            android_ripple={{ color: colors.bg[0] }}
          >
            <Ionicons
              name={isLockedOut ? "lock-closed-outline" : "keypad-outline"}
              size={24}
              color="#fff"
            />
            <Text
              style={[
                styles.primaryButtonText,
                {
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              {isLockedOut ? `Locked (${lockoutRemaining})` : "Enter PIN to Unlock"}
            </Text>
          </Pressable>
        )}

        {!canUseBiometric && !isPINConfigured && (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle" size={48} color={colors.danger} />
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.text,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              No authentication method configured.{"\n"}
              Please reinstall the app.
            </Text>
          </View>
        )}
      </View>

      {preferences.lastUnlockTime > 0 && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          delay={800}
          style={styles.lastUnlockContainer}
        >
          <Text
            style={[
              styles.lastUnlockText,
              {
                color: colors.subtext,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            Last unlocked: {new Date(preferences.lastUnlockTime).toLocaleString()}
          </Text>
        </MotiView>
      )}

      <PINInputModal
        visible={showPINModal}
        onSubmit={handlePINSubmit}
        onCancel={canUseBiometric ? () => setShowPINModal(false) : undefined}
        title="Enter PIN"
        subtitle="Enter your PIN to unlock Passify"
        mode="unlock"
      />

      <Toast visible={showToast} message={toastMessage} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 40,
  },
  header: {
    alignItems: "center",
    gap: 16,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  lockoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 20,
  },
  lockoutBannerText: {
    flex: 1,
  },
  lockoutTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  lockoutCountdown: {
    fontSize: 14,
  },
  biometricContainer: {
    alignItems: "center",
  },
  fallbackContainer: {
    gap: 16,
    alignItems: "center",
  },
  fallbackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  fallbackText: {
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    maxWidth: 320,
  },
  primaryButtonText: {
    fontSize: 18,
    color: "#fff",
  },
  errorState: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  lastUnlockContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  lastUnlockText: {
    fontSize: 12,
  },
});
