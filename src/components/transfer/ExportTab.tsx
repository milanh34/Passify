// src/components/transfer/ExportTab.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useDb } from "../../context/DbContext";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { generateExportText, toTitleCase } from "../../utils/transferParser";
import Toast from "../Toast";
import * as Clipboard from "expo-clipboard";
import { log } from "@/src/utils/logger";

type Selection = {
  [platformId: string]: {
    selected: boolean;
    accounts: { [accountId: string]: boolean };
  };
};

export default function ExportTab() {
  const theme = useAppTheme();
  const { database, schemas, platformsMetadata } = useDb();

  const [selection, setSelection] = useState<Selection>({});
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");
  const [exportedText, setExportedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const platformIds = Object.keys(database).sort((a, b) => {
    const nameA = (database[a]?.[0]?.platform || toTitleCase(a.replace(/_/g, " "))).toLowerCase();
    const nameB = (database[b]?.[0]?.platform || toTitleCase(b.replace(/_/g, " "))).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [database]);

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const togglePlatform = (platformId: string) => {
    setSelection((prev) => {
      const newSelection = { ...prev };
      const isSelected = prev[platformId]?.selected || false;

      if (!newSelection[platformId]) {
        newSelection[platformId] = { selected: false, accounts: {} };
      }

      newSelection[platformId].selected = !isSelected;

      const accounts = database[platformId] || [];
      accounts.forEach((acc: any) => {
        newSelection[platformId].accounts[acc.id] = !isSelected;
      });

      return newSelection;
    });
  };

  const toggleAccount = (platformId: string, accountId: string) => {
    setSelection((prev) => {
      const newSelection = { ...prev };

      if (!newSelection[platformId]) {
        newSelection[platformId] = { selected: false, accounts: {} };
      }

      const isSelected = prev[platformId]?.accounts[accountId] || false;
      newSelection[platformId].accounts[accountId] = !isSelected;

      const accounts = database[platformId] || [];
      const allSelected = accounts.every((acc: any) => newSelection[platformId].accounts[acc.id]);
      newSelection[platformId].selected = allSelected;

      return newSelection;
    });
  };

  const toggleExpanded = (platformId: string) => {
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

  const getDisplayField = (platformId: string): string => {
    return platformsMetadata[platformId]?.displayField || "name";
  };

  const getAccountDisplayValue = (account: any, platformId: string): string => {
    const displayField = getDisplayField(platformId);
    return account[displayField] || account.name || "Unnamed Account";
  };

  const getSortedAccounts = (accounts: any[], platformId: string): any[] => {
    const displayField = getDisplayField(platformId);
    return [...accounts].sort((a, b) => {
      const valueA = (a[displayField] || a.name || "").toLowerCase();
      const valueB = (b[displayField] || b.name || "").toLowerCase();
      return valueA.localeCompare(valueB);
    });
  };

  const selectAll = () => {
    const newSelection: Selection = {};
    platformIds.forEach((platformId) => {
      const accounts = database[platformId] || [];
      const accountSelection: { [key: string]: boolean } = {};
      accounts.forEach((acc: any) => {
        accountSelection[acc.id] = true;
      });
      newSelection[platformId] = {
        selected: true,
        accounts: accountSelection,
      };
    });
    setSelection(newSelection);
  };

  const deselectAll = () => {
    setSelection({});
    setExportedText("");
  };

  const handleExport = async () => {
    const selectedData: any = {};

    const sortedPlatformIds = [...platformIds].sort((a, b) => {
      const nameA = (database[a]?.[0]?.platform || toTitleCase(a.replace(/_/g, " "))).toLowerCase();
      const nameB = (database[b]?.[0]?.platform || toTitleCase(b.replace(/_/g, " "))).toLowerCase();
      return nameA.localeCompare(nameB);
    });

    for (const platformId of sortedPlatformIds) {
      const platformSelection = selection[platformId];
      if (!platformSelection) continue;

      const rawAccounts = (database[platformId] || []).filter(
        (acc: any) => platformSelection.accounts[acc.id]
      );

      const selectedAccounts = getSortedAccounts(rawAccounts, platformId);

      if (selectedAccounts.length > 0) {
        const platformName =
          selectedAccounts[0]?.platform || toTitleCase(platformId.replace(/_/g, " "));
        selectedData[platformName] = selectedAccounts;
      }
    }

    if (Object.keys(selectedData).length === 0) {
      showToastMessage("Please select at least one account to export", "warning");
      return;
    }

    try {
      const exportText = generateExportText(selectedData, schemas);
      setExportedText(exportText);
      showToastMessage("Data exported successfully!", "success");
      setSelection({});
    } catch (error) {
      log.error("Export error:", error);
      showToastMessage("Export failed. Please try again", "error");
    }
  };

  const handleCopyExport = async () => {
    if (exportedText) {
      await Clipboard.setStringAsync(exportedText);
      showToastMessage("Copied to clipboard!", "info");
    }
  };

  const countSelected = () => {
    let count = 0;
    Object.values(selection).forEach((platform) => {
      count += Object.values(platform.accounts).filter(Boolean).length;
    });
    return count;
  };

  const selectedCount = countSelected();

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="cloud-upload" size={36} color={theme.colors.accent} />
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
            ]}
          >
            Export Data
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
            ]}
          >
            Select platforms and accounts to export
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={selectAll}
            style={[
              styles.selectButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accent,
                borderRadius: theme.shapes.radiusMd,
              },
            ]}
          >
            <Ionicons name="checkmark-done" size={16} color={theme.colors.accent} />
            <Text
              style={[
                styles.selectButtonText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
              ]}
            >
              Select All
            </Text>
          </Pressable>

          <Pressable
            onPress={deselectAll}
            style={[
              styles.selectButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accent,
                borderRadius: theme.shapes.radiusMd,
              },
            ]}
          >
            <Ionicons name="close-circle" size={16} color={theme.colors.accent} />
            <Text
              style={[
                styles.selectButtonText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
              ]}
            >
              Deselect All
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text
              style={[
                styles.loadingText,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
              ]}
            >
              Loading platforms...
            </Text>
          </View>
        ) : platformIds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={theme.colors.textMuted} />
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
              ]}
            >
              No platforms found. Add some accounts first!
            </Text>
          </View>
        ) : (
          platformIds.map((platformId) => {
            const rawAccounts = database[platformId] || [];
            const accounts = getSortedAccounts(rawAccounts, platformId);
            const platformName =
              accounts[0]?.platform || toTitleCase(platformId.replace(/_/g, " "));
            const isExpanded = expandedPlatforms.has(platformId);
            const isPlatformSelected = selection[platformId]?.selected || false;

            return (
              <MotiView
                key={platformId}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: theme.animations.durationNormal }}
                style={[
                  styles.platformCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isPlatformSelected
                      ? theme.colors.accent
                      : theme.colors.surfaceBorder,
                    borderRadius: theme.components.card.radius,
                    padding: theme.components.card.padding,
                  },
                ]}
              >
                <Pressable onPress={() => toggleExpanded(platformId)} style={styles.platformHeader}>
                  <View style={styles.platformLeft}>
                    <Pressable
                      onPress={() => togglePlatform(platformId)}
                      style={[
                        styles.checkbox,
                        {
                          borderColor: theme.colors.accent,
                          backgroundColor: isPlatformSelected ? theme.colors.accent : "transparent",
                          borderRadius: theme.shapes.radiusSm,
                        },
                      ]}
                    >
                      {isPlatformSelected && (
                        <Ionicons name="checkmark" size={16} color={theme.colors.textInverse} />
                      )}
                    </Pressable>

                    <View>
                      <Text
                        style={[
                          styles.platformName,
                          {
                            color: theme.colors.textPrimary,
                            fontFamily: theme.typography.fontBold,
                          },
                        ]}
                      >
                        {platformName}
                      </Text>
                      <Text
                        style={[
                          styles.platformCount,
                          {
                            color: theme.colors.textSecondary,
                            fontFamily: theme.typography.fontRegular,
                          },
                        ]}
                      >
                        {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.colors.accent}
                  />
                </Pressable>

                <AnimatePresence>
                  {isExpanded && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "timing", duration: theme.animations.durationNormal }}
                    >
                      <View style={styles.accountsList}>
                        {accounts.map((account: any, index: number) => {
                          const isSelected = selection[platformId]?.accounts[account.id] || false;

                          return (
                            <MotiView
                              key={account.id}
                              from={{ opacity: 0, translateX: -20 }}
                              animate={{ opacity: 1, translateX: 0 }}
                              transition={{
                                type: "timing",
                                duration: theme.animations.durationNormal,
                                delay: index * 50,
                              }}
                            >
                              <Pressable
                                onPress={() => toggleAccount(platformId, account.id)}
                                style={styles.accountItem}
                              >
                                <Pressable
                                  onPress={() => toggleAccount(platformId, account.id)}
                                  style={[
                                    styles.checkbox,
                                    styles.accountCheckbox,
                                    {
                                      borderColor: theme.colors.accent,
                                      backgroundColor: isSelected
                                        ? theme.colors.accent
                                        : "transparent",
                                      borderRadius: theme.shapes.radiusSm,
                                    },
                                  ]}
                                >
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark"
                                      size={14}
                                      color={theme.colors.textInverse}
                                    />
                                  )}
                                </Pressable>

                                <Text
                                  style={[
                                    styles.accountName,
                                    {
                                      color: theme.colors.textPrimary,
                                      fontFamily: theme.typography.fontRegular,
                                    },
                                  ]}
                                >
                                  {getAccountDisplayValue(account, platformId)}
                                </Text>
                              </Pressable>
                            </MotiView>
                          );
                        })}
                      </View>
                    </MotiView>
                  )}
                </AnimatePresence>
              </MotiView>
            );
          })
        )}

        {exportedText && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: theme.animations.durationNormal }}
            style={[
              styles.previewCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accent + "40",
                borderRadius: theme.components.card.radius,
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <Text
                style={[
                  styles.previewTitle,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Exported Data
              </Text>
              <Pressable
                onPress={handleCopyExport}
                style={[
                  styles.copyButton,
                  { backgroundColor: theme.colors.accent, borderRadius: theme.shapes.radiusMd },
                ]}
              >
                <Ionicons name="copy-outline" size={16} color={theme.colors.textInverse} />
                <Text
                  style={[
                    styles.copyButtonText,
                    { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
                  ]}
                >
                  Copy
                </Text>
              </Pressable>
            </View>
            <ScrollView style={styles.previewScroll} nestedScrollEnabled>
              <Text
                style={[
                  styles.previewText,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontRegular },
                ]}
              >
                {exportedText}
              </Text>
            </ScrollView>
          </MotiView>
        )}
      </ScrollView>

      {selectedCount > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: theme.animations.durationNormal }}
          style={styles.exportButtonContainer}
        >
          <Pressable
            onPress={handleExport}
            style={[
              styles.exportButton,
              {
                backgroundColor: theme.colors.buttonPrimary,
                borderRadius: theme.components.button.radius,
                ...theme.shadows.lg,
              },
            ]}
          >
            <Ionicons name="share-outline" size={20} color={theme.colors.textInverse} />
            <Text
              style={[
                styles.exportButtonText,
                { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
              ]}
            >
              Export {selectedCount} Account{selectedCount !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        </MotiView>
      )}

      <Toast message={toastMessage} visible={showToast} type={toastType} />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 30 },
  header: { alignItems: "center", marginVertical: 12, gap: 6 },
  title: { fontSize: 24, marginTop: 6 },
  subtitle: { fontSize: 13, textAlign: "center", paddingHorizontal: 20 },
  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  selectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
  },
  selectButtonText: { fontSize: 13 },
  emptyState: { alignItems: "center", marginTop: 60, gap: 16 },
  emptyText: { fontSize: 15, textAlign: "center" },
  platformCard: {
    marginBottom: 10,
    borderWidth: 1,
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
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  platformName: { fontSize: 17 },
  platformCount: { fontSize: 12, marginTop: 2 },
  accountsList: { marginTop: 12, gap: 8 },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  accountCheckbox: { width: 20, height: 20 },
  accountName: { fontSize: 14 },
  previewCard: {
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    maxHeight: 300,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: { fontSize: 16 },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  copyButtonText: { fontSize: 13 },
  previewScroll: {
    maxHeight: 220,
  },
  previewText: {
    fontSize: 12,
    lineHeight: 18,
  },
  exportButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  exportButtonText: { fontSize: 16 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 8,
  },
});
