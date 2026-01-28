// src/components/settings/DisplaySection.tsx

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import {
  getDateFormat,
  setDateFormat,
  DateFormatOption,
  DATE_FORMAT_OPTIONS,
} from "../../utils/dateFormat";
import {
  getPhoneFormat,
  setPhoneFormat,
  PhoneFormatOption,
  PHONE_FORMAT_OPTIONS,
} from "../../utils/phoneFormat";
import SettingsSection from "./SettingsSection";

interface DisplaySectionProps {
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export default function DisplaySection({ showToast }: DisplaySectionProps) {
  const theme = useAppTheme();
  const [dateFormat, setDateFormatState] = useState<DateFormatOption>("DD/MM/YYYY");
  const [phoneFormat, setPhoneFormatState] = useState<PhoneFormatOption>("PLAIN");
  const [showDateFormats, setShowDateFormats] = useState(false);
  const [showPhoneFormats, setShowPhoneFormats] = useState(false);

  useEffect(() => {
    getDateFormat().then(setDateFormatState);
    getPhoneFormat().then(setPhoneFormatState);
  }, []);

  const handleDateFormatChange = async (format: DateFormatOption) => {
    await setDateFormat(format);
    setDateFormatState(format);
    showToast("Date format updated", "success");
  };

  const handlePhoneFormatChange = async (format: PhoneFormatOption) => {
    await setPhoneFormat(format);
    setPhoneFormatState(format);
    showToast("Phone format updated", "success");
  };

  const getCurrentDateLabel = () => {
    const option = DATE_FORMAT_OPTIONS.find((o) => o.id === dateFormat);
    return option?.label || dateFormat;
  };

  const getCurrentPhoneLabel = () => {
    const option = PHONE_FORMAT_OPTIONS.find((o) => o.id === phoneFormat);
    return option?.label || phoneFormat;
  };

  return (
    <SettingsSection title="Display Options" icon="options">
      <View style={styles.collapsibleContainer}>
        <Pressable
          onPress={() => setShowDateFormats(!showDateFormats)}
          style={[
            styles.collapsibleHeader,
            {
              backgroundColor: theme.colors.surface,
              borderColor: showDateFormats ? theme.colors.accent : theme.colors.surfaceBorder,
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
          android_ripple={{ color: theme.colors.accentMuted }}
        >
          <View style={styles.collapsibleLeft}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.accent} />
            <View style={styles.collapsibleTextContainer}>
              <Text
                style={[
                  styles.collapsibleTitle,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Date Format
              </Text>
              <Text
                style={[
                  styles.collapsibleValue,
                  { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                ]}
              >
                {getCurrentDateLabel()}
              </Text>
            </View>
          </View>
          <Ionicons
            name={showDateFormats ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.accent}
          />
        </Pressable>

        <AnimatePresence>
          {showDateFormats && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: theme.animations.durationNormal }}
              style={styles.collapsibleContent}
            >
              <View style={styles.cardGrid}>
                {DATE_FORMAT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => handleDateFormatChange(option.id)}
                    style={[
                      styles.formatCard,
                      {
                        backgroundColor:
                          dateFormat === option.id
                            ? theme.colors.accentMuted
                            : theme.colors.surface,
                        borderColor:
                          dateFormat === option.id
                            ? theme.colors.accent
                            : theme.colors.surfaceBorder,
                        borderRadius: theme.shapes.radiusMd,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formatLabel,
                        {
                          color:
                            dateFormat === option.id
                              ? theme.colors.accent
                              : theme.colors.textPrimary,
                          fontFamily:
                            dateFormat === option.id
                              ? theme.typography.fontBold
                              : theme.typography.fontRegular,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.formatExample,
                        {
                          color:
                            dateFormat === option.id ? theme.colors.accent : theme.colors.textMuted,
                          fontFamily: theme.typography.fontRegular,
                        },
                      ]}
                    >
                      {option.id.replace(/-/g, "/").toLowerCase()}
                    </Text>
                    {dateFormat === option.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={theme.colors.accent}
                        style={styles.checkIcon}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>

      <View style={[styles.collapsibleContainer, { marginTop: 12 }]}>
        <Pressable
          onPress={() => setShowPhoneFormats(!showPhoneFormats)}
          style={[
            styles.collapsibleHeader,
            {
              backgroundColor: theme.colors.surface,
              borderColor: showPhoneFormats ? theme.colors.accent : theme.colors.surfaceBorder,
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
          android_ripple={{ color: theme.colors.accentMuted }}
        >
          <View style={styles.collapsibleLeft}>
            <Ionicons name="call-outline" size={20} color={theme.colors.accent} />
            <View style={styles.collapsibleTextContainer}>
              <Text
                style={[
                  styles.collapsibleTitle,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Phone Format
              </Text>
              <Text
                style={[
                  styles.collapsibleValue,
                  { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                ]}
              >
                {getCurrentPhoneLabel()}
              </Text>
            </View>
          </View>
          <Ionicons
            name={showPhoneFormats ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.accent}
          />
        </Pressable>

        <AnimatePresence>
          {showPhoneFormats && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "timing", duration: theme.animations.durationNormal }}
              style={styles.collapsibleContent}
            >
              <View style={styles.cardGrid}>
                {PHONE_FORMAT_OPTIONS.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => handlePhoneFormatChange(option.id)}
                    style={[
                      styles.formatCard,
                      {
                        backgroundColor:
                          phoneFormat === option.id
                            ? theme.colors.accentMuted
                            : theme.colors.surface,
                        borderColor:
                          phoneFormat === option.id
                            ? theme.colors.accent
                            : theme.colors.surfaceBorder,
                        borderRadius: theme.shapes.radiusMd,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formatLabel,
                        {
                          color:
                            phoneFormat === option.id
                              ? theme.colors.accent
                              : theme.colors.textPrimary,
                          fontFamily:
                            phoneFormat === option.id
                              ? theme.typography.fontBold
                              : theme.typography.fontRegular,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.formatExample,
                        {
                          color:
                            phoneFormat === option.id
                              ? theme.colors.accent
                              : theme.colors.textMuted,
                          fontFamily: theme.typography.fontRegular,
                        },
                      ]}
                    >
                      {option.id === "PLAIN"
                        ? "1234567890"
                        : option.id === "DASHED"
                          ? "123-456-7890"
                          : "(123) 456-7890"}
                    </Text>
                    {phoneFormat === option.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={theme.colors.accent}
                        style={styles.checkIcon}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  collapsibleContainer: {},
  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
  },
  collapsibleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  collapsibleTextContainer: {
    flex: 1,
  },
  collapsibleTitle: {
    fontSize: 15,
  },
  collapsibleValue: {
    fontSize: 12,
    marginTop: 2,
  },
  collapsibleContent: {
    marginTop: 12,
    overflow: "hidden",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  formatCard: {
    width: "48%",
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    justifyContent: "center",
    position: "relative",
  },
  formatLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  formatExample: {
    fontSize: 11,
  },
  checkIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
