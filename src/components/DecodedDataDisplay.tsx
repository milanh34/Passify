import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useTheme } from "../context/ThemeContext";
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
  const { colors, fontConfig } = useTheme();
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

  // Sort platforms alphabetically
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
          { color: colors.text, fontFamily: fontConfig.bold },
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
              duration: 300,
              delay: platformIndex * 50,
            }}
          >
            <Pressable
              onPress={() => togglePlatform(platformId)}
              style={[
                styles.platformCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              android_ripple={{ color: colors.accent + "22" }}
            >
              <View style={styles.platformHeader}>
                <View style={styles.platformLeft}>
                  <Ionicons
                    name="folder"
                    size={24}
                    color={colors.accent}
                  />
                  <View style={styles.platformInfo}>
                    <Text
                      style={[
                        styles.platformName,
                        { color: colors.text, fontFamily: fontConfig.bold },
                      ]}
                    >
                      {platformName}
                    </Text>
                    <Text
                      style={[
                        styles.accountCount,
                        { color: colors.muted, fontFamily: fontConfig.regular },
                      ]}
                    >
                      {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isPlatformExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={colors.muted}
                />
              </View>

              {/* Expanded Accounts */}
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
                            backgroundColor: colors.bg[0],
                            borderColor: colors.cardBorder,
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => toggleAccount(accountKey)}
                          style={styles.accountHeader}
                          android_ripple={{ color: colors.accent + "15" }}
                        >
                          <Text
                            style={[
                              styles.accountName,
                              { color: colors.text, fontFamily: fontConfig.bold },
                            ]}
                          >
                            {account.name || `Account ${accountIndex + 1}`}
                          </Text>
                          <Ionicons
                            name={isAccountExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={colors.muted}
                          />
                        </Pressable>

                        {/* Expanded Account Details */}
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
                                          { color: colors.muted, fontFamily: fontConfig.regular },
                                        ]}
                                      >
                                        {fieldName.charAt(0).toUpperCase() +
                                          fieldName.slice(1).replace(/_/g, " ")}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.fieldValue,
                                          { color: colors.text, fontFamily: fontConfig.regular },
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
                                          style={styles.iconButton}
                                          android_ripple={{ color: colors.accent + "33" }}
                                        >
                                          <Ionicons
                                            name={isVisible ? "eye-off" : "eye"}
                                            size={18}
                                            color={colors.muted}
                                          />
                                        </Pressable>
                                      )}
                                      <Pressable
                                        onPress={() => copyToClipboard(value, fieldKey)}
                                        style={styles.iconButton}
                                        android_ripple={{ color: colors.accent + "33" }}
                                      >
                                        <Ionicons
                                          name={copiedField === fieldKey ? "checkmark" : "copy-outline"}
                                          size={18}
                                          color={
                                            copiedField === fieldKey ? colors.accent : colors.muted
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
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
    borderRadius: 12,
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
    borderRadius: 8,
  },
});
