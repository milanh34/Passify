// src/components/settings/SecuritySection.tsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import { authenticateWithBiometric, getBiometricTypeName } from "../../utils/biometricAuth";
import { storePIN, changePIN, removePIN, verifyPIN } from "../../utils/pinCode";
import { InactivityTimeout, getTimeoutLabel } from "../../utils/inactivityTracker";
import { getScreenshotAllowed, setScreenshotAllowed } from "../../utils/screenSecurity";
import SettingsSection from "./SettingsSection";
import PINInputModal from "../PINInputModal";
import ConfirmModal from "../ConfirmModal";

interface SecuritySectionProps {
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export default function SecuritySection({ showToast }: SecuritySectionProps) {
  const theme = useAppTheme();
  const {
    preferences,
    biometricCapability,
    isPINConfigured,
    setBiometricEnabled,
    setInactivityTimeout,
    refreshBiometricCapability,
    checkPINStatus,
  } = useAuth();

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<"setup" | "change">("setup");
  const [oldPIN, setOldPIN] = useState("");
  const [showOldPINModal, setShowOldPINModal] = useState(false);
  const [showRemovePINModal, setShowRemovePINModal] = useState(false);
  const [screenshotAllowed, setScreenshotAllowedState] = useState(false);

  useEffect(() => {
    refreshBiometricCapability();
    checkPINStatus();
    getScreenshotAllowed().then(setScreenshotAllowedState);
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (value && !biometricCapability?.isAvailable) {
      showToast("Biometric authentication not available", "error");
      return;
    }
    if (value && !isPINConfigured) {
      showToast("Please set up a PIN first", "warning");
      return;
    }
    await setBiometricEnabled(value);
    showToast(value ? "Biometric enabled" : "Biometric disabled", "success");
  };

  const handleTestBiometric = async () => {
    if (!biometricCapability?.isAvailable) {
      showToast("Biometric not available", "error");
      return;
    }
    const result = await authenticateWithBiometric();
    showToast(
      result.success ? "Authentication successful!" : result.error || "Failed",
      result.success ? "success" : "error"
    );
  };

  const handleSetupPIN = () => {
    setPinModalMode("setup");
    setPinModalVisible(true);
  };

  const handleChangePIN = () => setShowOldPINModal(true);

  const handleOldPINSubmit = async (pin: string): Promise<boolean> => {
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
          showToast("PIN set successfully", "success");
          return true;
        }
      } else {
        const result = await changePIN(oldPIN, pin);
        if (result.success) {
          setPinModalVisible(false);
          setOldPIN("");
          showToast("PIN changed successfully", "success");
          return true;
        }
        showToast(result.error || "Failed to change PIN", "error");
      }
    } catch (error: any) {
      showToast(error.message || "An error occurred", "error");
    }
    return false;
  };

  const confirmRemovePIN = async () => {
    const success = await removePIN();
    if (success) {
      await checkPINStatus();
      await setBiometricEnabled(false);
      showToast("PIN removed", "success");
    } else {
      showToast("Failed to remove PIN", "error");
    }
    setShowRemovePINModal(false);
  };

  const handleTimeoutChange = async (minutes: InactivityTimeout) => {
    await setInactivityTimeout(minutes);
    showToast(`Auto-lock: ${getTimeoutLabel(minutes)}`, "success");
  };

  const handleScreenshotToggle = async (value: boolean) => {
    await setScreenshotAllowed(value);
    setScreenshotAllowedState(value);
    showToast(value ? "Screenshots enabled" : "Screenshots blocked", value ? "warning" : "success");
  };

  const SectionCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.surfaceBorder,
          borderRadius: theme.shapes.radiusMd,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const SettingRow = ({
    icon,
    title,
    subtitle,
    rightElement,
    showBorder = true,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    rightElement?: React.ReactNode;
    showBorder?: boolean;
  }) => (
    <View
      style={[
        styles.settingRow,
        showBorder && { borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceBorder },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.accentMuted }]}>
        <Ionicons name={icon as any} size={20} color={theme.colors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.settingSubtitle,
            { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {rightElement}
    </View>
  );

  return (
    <SettingsSection title="Security & Privacy" icon="shield-checkmark">
      <Text
        style={[
          styles.groupLabel,
          { color: theme.colors.textSecondary, fontFamily: theme.typography.fontBold },
        ]}
      >
        Authentication
      </Text>
      <SectionCard>
        <SettingRow
          icon="finger-print"
          title="Biometric"
          subtitle={
            biometricCapability?.isAvailable
              ? getBiometricTypeName(biometricCapability.biometricType)
              : "Not available"
          }
          rightElement={
            <Switch
              value={preferences.biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricCapability?.isAvailable || !isPINConfigured}
              trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent + "60" }}
              thumbColor={preferences.biometricEnabled ? theme.colors.accent : theme.colors.surface}
            />
          }
        />
        <SettingRow
          icon="keypad"
          title="PIN Code"
          subtitle={isPINConfigured ? "Configured" : "Not set"}
          showBorder={false}
        />
      </SectionCard>

      <View style={styles.actionRow}>
        {!isPINConfigured ? (
          <Pressable
            onPress={handleSetupPIN}
            style={[
              styles.actionButton,
              styles.actionButtonFull,
              { backgroundColor: theme.colors.accent, borderRadius: theme.shapes.radiusMd },
            ]}
          >
            <Ionicons name="add-circle-outline" size={18} color={theme.colors.textInverse} />
            <Text
              style={[
                styles.actionButtonText,
                { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
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
                styles.actionButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Ionicons name="create-outline" size={18} color={theme.colors.accent} />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                ]}
              >
                Change
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowRemovePINModal(true)}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.error, fontFamily: theme.typography.fontBold },
                ]}
              >
                Remove
              </Text>
            </Pressable>
            {biometricCapability?.isAvailable && (
              <Pressable
                onPress={handleTestBiometric}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.radiusMd,
                  },
                ]}
              >
                <Ionicons name="scan-outline" size={18} color={theme.colors.textPrimary} />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  Test
                </Text>
              </Pressable>
            )}
          </>
        )}
      </View>

      <Text
        style={[
          styles.groupLabel,
          { color: theme.colors.textSecondary, fontFamily: theme.typography.fontBold },
        ]}
      >
        Auto-lock Timeout
      </Text>
      <View style={styles.timeoutGrid}>
        {([1, 5, 10, 30, 0] as InactivityTimeout[]).map((minutes) => {
          const isActive = preferences.inactivityTimeout === minutes;
          return (
            <Pressable
              key={minutes}
              onPress={() => handleTimeoutChange(minutes)}
              style={[
                styles.timeoutButton,
                {
                  backgroundColor: isActive ? theme.colors.accentMuted : theme.colors.surface,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? theme.colors.accent : theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Text
                style={{
                  color: isActive ? theme.colors.accent : theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: 13,
                }}
              >
                {getTimeoutLabel(minutes)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={[
          styles.groupLabel,
          { color: theme.colors.textSecondary, fontFamily: theme.typography.fontBold },
        ]}
      >
        Privacy
      </Text>
      <SectionCard>
        <SettingRow
          icon="camera-outline"
          title="Block Screenshots"
          subtitle={screenshotAllowed ? "Screenshots allowed" : "Screenshots blocked"}
          showBorder={false}
          rightElement={
            <Switch
              value={!screenshotAllowed}
              onValueChange={(value) => handleScreenshotToggle(!value)}
              trackColor={{ false: theme.colors.surfaceBorder, true: theme.colors.accent + "60" }}
              thumbColor={!screenshotAllowed ? theme.colors.accent : theme.colors.surface}
            />
          }
        />
      </SectionCard>

      <PINInputModal
        visible={showOldPINModal}
        onSubmit={handleOldPINSubmit}
        onCancel={() => setShowOldPINModal(false)}
        title="Enter Current PIN"
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
        mode={pinModalMode}
      />

      <ConfirmModal
        visible={showRemovePINModal}
        title="Remove PIN?"
        message="This will disable PIN and biometric authentication."
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmRemovePIN}
        onCancel={() => setShowRemovePINModal(false)}
      />
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    fontSize: 11,
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
  },
  actionButtonFull: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 13,
  },
  timeoutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: "18%",
    alignItems: "center",
  },
});
