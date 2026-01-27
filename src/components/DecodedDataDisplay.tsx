// src/components/DecodedDataDisplay.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../themes/hooks/useAppTheme";
import { toTitleCase } from "../utils/transferParser";
import * as Clipboard from "expo-clipboard";

interface DecodedDataDisplayProps {
  decodedData: {
    database: Record<string, any[]>;
    schemas: Record<string, string[]>;
  };
  onCopyField?: (value: string) => void;
}

export default function DecodedDataDisplay({ decodedData, onCopyField }: DecodedDataDisplayProps) {
  const theme = useAppTheme();
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePlatform = (platformId: string) => {
    setExpandedPlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
      } else {
        newSet.add(platformId);
      }
      return newSet;
    });
  };

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text || "");
    setCopiedField(key);
    setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1000);
    if (onCopyField) onCopyField(text);
  };

  const togglePasswordVisibility = (fieldKey: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const sortedPlatforms = Object.keys(decodedData.database).sort((a, b) => {
    const nameA = toTitleCase(a.replace(/_/g, " "));
    const nameB = toTitleCase(b.replace(/_/g, " "));
    return nameA.localeCompare(nameB);
  });

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
        ]}
      >
        Decoded Accounts
      </Text>

      {sortedPlatforms.map((platformId, platformIndex) => {
        const accounts = decodedData.database[platformId];
        const platformName = toTitleCase(platformId.replace(/_/g, " "));
        const isPlatformExpanded = expandedPlatforms.has(platformId);
        const schema = decodedData.schemas[platformId] || ["name", "password"];

        return (
          <MotiView
            key={platformId}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: theme.animations.durationNormal,
              delay: platformIndex * 50,
            }}
          >
            <Pressable
              onPress={() => togglePlatform(platformId)}
              style={[
                styles.platformCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.components.card.radius,
                  padding: theme.components.card.padding,
                },
              ]}
              android_ripple={{ color: theme.colors.accentMuted }}
            >
              <View style={styles.platformHeader}>
                <View style={styles.platformLeft}>
                  <Ionicons name="folder" size={24} color={theme.colors.accent} />
                  <View style={styles.platformInfo}>
                    <Text
                      style={[
                        styles.platformName,
                        { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                      ]}
                    >
                      {platformName}
                    </Text>
                    <Text
                      style={[
                        styles.accountCount,
                        { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                      ]}
                    >
                      {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isPlatformExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.textMuted}
                />
              </View>

              {isPlatformExpanded && (
                <View style={styles.accountsList}>
                  {accounts.map((account: any, accountIndex: number) => {
                    const accountKey = `${platformId}-${account.id || accountIndex}`;
                    const isAccountExpanded = expandedAccounts.has(accountKey);

                    return (
                      <View
                        key={accountKey}
                        style={[
                          styles.accountCard,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.surfaceBorder,
                            borderRadius: theme.shapes.radiusMd,
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => toggleAccount(accountKey)}
                          style={styles.accountHeader}
                          android_ripple={{ color: theme.colors.accentMuted }}
                        >
                          <Text
                            style={[
                              styles.accountName,
                              {
                                color: theme.colors.textPrimary,
                                fontFamily: theme.typography.fontBold,
                              },
                            ]}
                          >
                            {account.name || `Account ${accountIndex + 1}`}
                          </Text>
                          <Ionicons
                            name={isAccountExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={theme.colors.textMuted}
                          />
                        </Pressable>

                        {isAccountExpanded && (
                          <View style={styles.accountDetails}>
                            {schema
                              .filter((field) => field !== "id" && field !== "name")
                              .map((fieldName) => {
                                const value = account[fieldName];
                                if (!value) return null;

                                const fieldKey = `${accountKey}-${fieldName}`;
                                const isPassword = fieldName.toLowerCase().includes("password");
                                const isVisible = visiblePasswords[fieldKey];

                                return (
                                  <View key={fieldName} style={styles.fieldRow}>
                                    <View style={styles.fieldInfo}>
                                      <Text
                                        style={[
                                          styles.fieldLabel,
                                          {
                                            color: theme.colors.textMuted,
                                            fontFamily: theme.typography.fontRegular,
                                          },
                                        ]}
                                      >
                                        {fieldName.charAt(0).toUpperCase() +
                                          fieldName.slice(1).replace(/_/g, " ")}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.fieldValue,
                                          {
                                            color: theme.colors.textPrimary,
                                            fontFamily: theme.typography.fontRegular,
                                          },
                                        ]}
                                        selectable
                                      >
                                        {isPassword && !isVisible ? "••••••••" : value}
                                      </Text>
                                    </View>
                                    <View style={styles.fieldActions}>
                                      {isPassword && (
                                        <Pressable
                                          onPress={() => togglePasswordVisibility(fieldKey)}
                                          style={[
                                            styles.iconButton,
                                            { borderRadius: theme.shapes.radiusSm },
                                          ]}
                                          android_ripple={{ color: theme.colors.accentMuted }}
                                        >
                                          <Ionicons
                                            name={isVisible ? "eye-off" : "eye"}
                                            size={18}
                                            color={theme.colors.textMuted}
                                          />
                                        </Pressable>
                                      )}
                                      <Pressable
                                        onPress={() => copyToClipboard(value, fieldKey)}
                                        style={[
                                          styles.iconButton,
                                          { borderRadius: theme.shapes.radiusSm },
                                        ]}
                                        android_ripple={{ color: theme.colors.accentMuted }}
                                      >
                                        <Ionicons
                                          name={
                                            copiedField === fieldKey ? "checkmark" : "copy-outline"
                                          }
                                          size={18}
                                          color={
                                            copiedField === fieldKey
                                              ? theme.colors.accent
                                              : theme.colors.textMuted
                                          }
                                        />
                                      </Pressable>
                                    </View>
                                  </View>
                                );
                              })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </Pressable>
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  platformCard: {
    borderWidth: 1,
    marginBottom: 12,
  },
  platformHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 18,
  },
  accountCount: {
    fontSize: 14,
    marginTop: 2,
  },
  accountsList: {
    marginTop: 16,
    gap: 8,
  },
  accountCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  accountName: {
    fontSize: 16,
    flex: 1,
  },
  accountDetails: {
    padding: 12,
    paddingTop: 0,
    gap: 12,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
  },
  fieldActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
});
