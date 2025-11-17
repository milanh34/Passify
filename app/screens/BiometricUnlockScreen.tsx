// app/screens/BiometricUnlockScreen.tsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import { authenticateWithBiometric } from "../../src/utils/biometricAuth";
import { verifyPIN } from "../../src/utils/pinCode";
import BiometricPrompt from "../../src/components/BiometricPrompt";
import PINInputModal from "../../src/components/PINInputModal";
import Toast from "../../src/components/Toast";

export default function BiometricUnlockScreen() {
  const { colors, fontConfig } = useTheme();
  const { unlock, biometricCapability, preferences, isPINConfigured } = useAuth();
  const insets = useSafeAreaInsets();

  const [showPINModal, setShowPINModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("error");

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
    if (preferences.biometricEnabled && biometricCapability?.isAvailable && !isAuthenticating) {
      handleBiometricAuth();
    }
  }, []);

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
    const isValid = await verifyPIN(pin);
    if (isValid) {
      await unlock("pin");
      setShowPINModal(false);
      return true;
    }
    return false;
  };

  const handleUsePIN = () => {
    if (!isPINConfigured) {
      showToastMessage("No PIN configured. Please use biometric.", "warning");
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

      {canUseBiometric && (
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
                borderColor: colors.cardBorder,
              },
            ]}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <Ionicons name="keypad-outline" size={20} color={colors.subtext} />
            <Text
              style={[
                styles.fallbackText,
                {
                  color: colors.subtext,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              Use PIN Instead
            </Text>
          </Pressable>
        )}

        {!canUseBiometric && isPINConfigured && (
          <Pressable
            onPress={() => setShowPINModal(true)}
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.accent,
              },
            ]}
            android_ripple={{ color: colors.bg[0] }}
          >
            <Ionicons name="keypad-outline" size={24} color="#fff" />
            <Text
              style={[
                styles.primaryButtonText,
                {
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              Enter PIN to Unlock
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
