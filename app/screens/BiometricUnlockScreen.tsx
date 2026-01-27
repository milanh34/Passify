// app/screens/BiometricUnlockScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";
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
  const theme = useAppTheme();
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
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: theme.animations.durationNormal }}
        style={styles.header}
      >
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: theme.colors.accentMuted,
              borderColor: theme.colors.accent,
              borderWidth: theme.shapes.borderThick,
              borderRadius: 48,
            },
          ]}
        >
          <Ionicons name="key" size={48} color={theme.colors.accent} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeHero,
            },
          ]}
        >
          Passify
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeLg,
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
          transition={{ type: "timing", duration: theme.animations.durationNormal }}
          style={[
            styles.lockoutBanner,
            {
              backgroundColor: theme.colors.error + "15",
              borderColor: theme.colors.error,
              borderWidth: theme.shapes.borderThick,
              borderRadius: theme.components.card.radius,
              padding: theme.spacing.lg,
              marginHorizontal: theme.spacing.xl,
            },
          ]}
        >
          <Ionicons name="lock-closed" size={24} color={theme.colors.error} />
          <View style={styles.lockoutBannerText}>
            <Text
              style={[
                styles.lockoutTitle,
                {
                  color: theme.colors.error,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeLg,
                },
              ]}
            >
              Too Many Failed Attempts
            </Text>
            <Text
              style={[
                styles.lockoutCountdown,
                {
                  color: theme.colors.error,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeMd,
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
            style={({ pressed }) => [
              styles.fallbackButton,
              {
                borderColor: isLockedOut ? theme.colors.error : theme.colors.surfaceBorder,
                borderWidth: theme.shapes.borderThin,
                borderRadius: theme.shapes.radiusMd,
                opacity: isLockedOut ? 0.6 : pressed ? 0.8 : 1,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.xl,
              },
            ]}
            android_ripple={{ color: theme.colors.accentMuted }}
          >
            <Ionicons
              name="keypad-outline"
              size={20}
              color={isLockedOut ? theme.colors.error : theme.colors.textSecondary}
            />
            <Text
              style={{
                color: isLockedOut ? theme.colors.error : theme.colors.textSecondary,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeMd,
              }}
            >
              {isLockedOut ? `Locked (${lockoutRemaining})` : "Use PIN Instead"}
            </Text>
          </Pressable>
        )}

        {!canUseBiometric && isPINConfigured && (
          <Pressable
            onPress={() => !isLockedOut && setShowPINModal(true)}
            disabled={isLockedOut}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: isLockedOut
                  ? theme.colors.surfaceBorder
                  : theme.colors.buttonPrimary,
                borderRadius: theme.components.button.radius,
                paddingVertical: theme.spacing.lg,
                paddingHorizontal: theme.spacing.xxl,
                opacity: isLockedOut ? 0.6 : pressed ? 0.8 : 1,
              },
            ]}
            android_ripple={{ color: theme.colors.background }}
          >
            <Ionicons
              name={isLockedOut ? "lock-closed-outline" : "keypad-outline"}
              size={24}
              color={theme.colors.textInverse}
            />
            <Text
              style={{
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeXl,
                color: theme.colors.textInverse,
              }}
            >
              {isLockedOut ? `Locked (${lockoutRemaining})` : "Enter PIN to Unlock"}
            </Text>
          </Pressable>
        )}

        {!canUseBiometric && !isPINConfigured && (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeMd,
                textAlign: "center",
                lineHeight: 22,
              }}
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
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeSm,
            }}
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
    justifyContent: "center",
    alignItems: "center",
  },
  title: {},
  subtitle: {
    textAlign: "center",
  },
  lockoutBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  lockoutBannerText: {
    flex: 1,
  },
  lockoutTitle: {
    marginBottom: 4,
  },
  lockoutCountdown: {},
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
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    maxWidth: 320,
  },
  errorState: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 32,
  },
  lastUnlockContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
