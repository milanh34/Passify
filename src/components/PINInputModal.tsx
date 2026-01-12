// src/components/PINInputModal.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { useTheme } from "../context/ThemeContext";
import { validatePINFormat, getPINLockoutStatus } from "../utils/pinCode";
import { formatRemainingTime, getAttemptsUntilNextLockout } from "../utils/pinAttemptTracker";

interface PINInputModalProps {
  visible: boolean;
  onSubmit: (pin: string) => Promise<boolean>;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  mode?: "unlock" | "setup" | "change";
  minLength?: number;
  maxLength?: number;
}

export default function PINInputModal({
  visible,
  onSubmit,
  onCancel,
  title = "Enter PIN",
  subtitle = "Enter your PIN code",
  mode = "unlock",
  minLength = 4,
  maxLength = 6,
}: PINInputModalProps) {
  const { colors, fontConfig } = useTheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemainingMs, setLockoutRemainingMs] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      checkAndUpdateLockoutStatus();
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (isLockedOut && lockoutRemainingMs > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setLockoutRemainingMs((prev) => {
          const newRemaining = prev - 1000;
          if (newRemaining <= 0) {
            setIsLockedOut(false);
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return newRemaining;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isLockedOut]);

  const checkAndUpdateLockoutStatus = useCallback(async () => {
    try {
      const status = await getPINLockoutStatus();
      setIsLockedOut(status.isLockedOut);
      setLockoutRemainingMs(status.remainingMs);
      setFailedAttempts(status.failedAttempts);

      if (!status.isLockedOut) {
        const nextLockout = await getAttemptsUntilNextLockout();
        setAttemptsRemaining(nextLockout.attemptsRemaining);
      }
    } catch (error) {
      console.error("Failed to check lockout status:", error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setPin("");
      setError("");
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, [visible]);

  const handleNumberPress = (num: number) => {
    if (isLockedOut || isLoading || isVerifying) return;

    if (pin.length < maxLength) {
      const newPin = pin + num.toString();
      setPin(newPin);
      setError("");

      if (mode === "unlock" && newPin.length === maxLength) {
        handleSubmit(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isLockedOut || isLoading || isVerifying) return;
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleSubmit = async (pinToSubmit?: string) => {
    const currentPin = pinToSubmit || pin;

    if (isLockedOut) {
      setError(`Locked out. Wait ${formatRemainingTime(lockoutRemainingMs)}`);
      Vibration.vibrate(100);
      return;
    }

    if (currentPin.length < minLength) {
      setError(`PIN must be at least ${minLength} digits`);
      Vibration.vibrate(100);
      return;
    }

    const validation = validatePINFormat(currentPin);
    if (!validation.isValid) {
      setError(`PIN must be ${minLength}-${maxLength} digits`);
      Vibration.vibrate(100);
      return;
    }

    setIsVerifying(true);
    setIsLoading(true);

    try {
      const success = await onSubmit(currentPin);

      if (!success) {
        await checkAndUpdateLockoutStatus();

        if (isLockedOut) {
          setError(`Too many attempts. Wait ${formatRemainingTime(lockoutRemainingMs)}`);
        } else {
          const nextLockout = await getAttemptsUntilNextLockout();
          if (nextLockout.attemptsRemaining <= 3) {
            setError(`Incorrect PIN. ${nextLockout.attemptsRemaining} attempts remaining.`);
          } else {
            setError("Incorrect PIN. Try again.");
          }
        }

        setPin("");
        Vibration.vibrate([100, 50, 100]);
        setIsLoading(false);
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("PIN submit error:", error);
      setError("An error occurred. Please try again.");
      setPin("");
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const renderKeypad = () => {
    const keys = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ["", 0, "backspace"],
    ];

    const isDisabled = isLockedOut || isLoading || isVerifying;

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === "") {
                return <View key={keyIndex} style={styles.keyButton} />;
              }

              if (key === "backspace") {
                return (
                  <Pressable
                    key={keyIndex}
                    onPress={handleBackspace}
                    disabled={pin.length === 0 || isDisabled}
                    style={[
                      styles.keyButton,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        opacity: isDisabled ? 0.5 : 1,
                      },
                    ]}
                    android_ripple={{ color: colors.accent + "22" }}
                  >
                    <Ionicons
                      name="backspace-outline"
                      size={28}
                      color={pin.length === 0 || isDisabled ? colors.subtext : colors.text}
                    />
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={keyIndex}
                  onPress={() => handleNumberPress(key as number)}
                  disabled={pin.length >= maxLength || isDisabled}
                  style={[
                    styles.keyButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      opacity: isDisabled ? 0.5 : 1,
                    },
                  ]}
                  android_ripple={{ color: colors.accent + "22" }}
                >
                  <Text
                    style={[
                      styles.keyText,
                      {
                        color: isDisabled ? colors.subtext : colors.text,
                        fontFamily: fontConfig.bold,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderPINDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: maxLength }).map((_, index) => (
          <MotiView
            key={index}
            from={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: index < pin.length ? 1 : 0.8,
              opacity: index < pin.length ? 1 : 0.3,
            }}
            transition={{ type: "timing", duration: 150 }}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < pin.length ? colors.accent : colors.cardBorder,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderLockoutOverlay = () => {
    if (!isLockedOut) return null;

    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 200 }}
        style={styles.lockoutOverlay}
      >
        <View
          style={[
            styles.lockoutCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.danger,
            },
          ]}
        >
          <Ionicons name="lock-closed" size={48} color={colors.danger} />
          <Text
            style={[
              styles.lockoutTitle,
              {
                color: colors.danger,
                fontFamily: fontConfig.bold,
              },
            ]}
          >
            Too Many Attempts
          </Text>
          <Text
            style={[
              styles.lockoutSubtitle,
              {
                color: colors.subtext,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            Please wait before trying again
          </Text>

          <View style={[styles.countdownContainer, { backgroundColor: colors.danger + "15" }]}>
            <Ionicons name="time-outline" size={24} color={colors.danger} />
            <Text
              style={[
                styles.countdownText,
                {
                  color: colors.danger,
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              {formatRemainingTime(lockoutRemainingMs)}
            </Text>
          </View>

          <Text
            style={[
              styles.lockoutWarning,
              {
                color: colors.muted,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            {failedAttempts >= 15
              ? "⚠️ Continued failed attempts may result in data wipe"
              : `${failedAttempts} failed attempt${failedAttempts !== 1 ? "s" : ""}`}
          </Text>
        </View>
      </MotiView>
    );
  };

  const renderLoadingOverlay = () => {
    if (!isVerifying) return null;

    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 150 }}
        style={styles.loadingOverlay}
      >
        <View
          style={[
            styles.loadingCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.accent,
            },
          ]}
        >
          <ActivityIndicator size="large" color={colors.accent} />
          <Text
            style={[
              styles.loadingText,
              {
                color: colors.text,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            Verifying PIN...
          </Text>
        </View>
      </MotiView>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.bg[0] + "F5" }]}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.bg[0],
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <Ionicons name="lock-closed-outline" size={48} color={colors.accent} />
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontFamily: fontConfig.bold,
                },
              ]}
            >
              {title}
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
              {subtitle}
            </Text>
          </View>

          {renderPINDots()}

          <AnimatePresence>
            {error && !isLockedOut && (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: "timing", duration: 200 }}
                style={styles.errorContainer}
              >
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: colors.danger,
                      fontFamily: fontConfig.regular,
                    },
                  ]}
                >
                  {error}
                </Text>
              </MotiView>
            )}
          </AnimatePresence>

          {!isLockedOut &&
            attemptsRemaining > 0 &&
            attemptsRemaining <= 3 &&
            failedAttempts > 0 && (
              <View style={styles.attemptsWarning}>
                <Ionicons name="warning-outline" size={14} color={colors.accent} />
                <Text
                  style={[
                    styles.attemptsWarningText,
                    {
                      color: colors.accent,
                      fontFamily: fontConfig.regular,
                    },
                  ]}
                >
                  {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} until lockout
                </Text>
              </View>
            )}

          {renderKeypad()}

          <View style={styles.actions}>
            {mode !== "unlock" && (
              <Pressable
                onPress={() => handleSubmit()}
                disabled={pin.length < minLength || isLoading || isLockedOut}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      pin.length >= minLength && !isLoading && !isLockedOut
                        ? colors.accent
                        : colors.cardBorder,
                  },
                ]}
                android_ripple={{ color: colors.bg[0] }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.submitButtonText,
                      {
                        color: pin.length >= minLength && !isLockedOut ? "#fff" : colors.subtext,
                        fontFamily: fontConfig.bold,
                      },
                    ]}
                  >
                    Submit
                  </Text>
                )}
              </Pressable>
            )}

            {onCancel && (
              <Pressable onPress={onCancel} disabled={isLoading} style={styles.cancelButton}>
                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      color: colors.subtext,
                      fontFamily: fontConfig.regular,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            )}
          </View>

          {renderLockoutOverlay()}
          {renderLoadingOverlay()}
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 24,
    position: "relative",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  pinDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
  },
  attemptsWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  attemptsWarningText: {
    fontSize: 12,
  },
  keypad: {
    gap: 12,
  },
  keypadRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 28,
  },
  actions: {
    gap: 12,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitButtonText: {
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
  },
  lockoutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
  },
  lockoutCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    gap: 12,
    maxWidth: 300,
  },
  lockoutTitle: {
    fontSize: 20,
    textAlign: "center",
  },
  lockoutSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  countdownText: {
    fontSize: 24,
  },
  lockoutWarning: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  loadingCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
});
