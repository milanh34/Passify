import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useDb } from "../../context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { MotiPressable } from "moti/interactions";
import { generateExportText } from "../../utils/transferParser";
import Toast from "../Toast";

type Selection = {
  [platformId: string]: {
    selected: boolean;
    accounts: { [accountId: string]: boolean };
  };
};

export default function ExportTab() {
  const { colors, fontConfig } = useTheme();
  const { database, schemas } = useDb();

  const [selection, setSelection] = useState<Selection>({});
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(
    new Set()
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const platformIds = Object.keys(database);

  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    setSelection((prev) => {
      const newSelection = { ...prev };
      const isSelected = prev[platformId]?.selected || false;

      if (!newSelection[platformId]) {
        newSelection[platformId] = { selected: false, accounts: {} };
      }

      newSelection[platformId].selected = !isSelected;

      // Also toggle all accounts
      const accounts = database[platformId] || [];
      accounts.forEach((acc: any) => {
        newSelection[platformId].accounts[acc.id] = !isSelected;
      });

      return newSelection;
    });
  };

  // Toggle account selection
  const toggleAccount = (platformId: string, accountId: string) => {
    setSelection((prev) => {
      const newSelection = { ...prev };

      if (!newSelection[platformId]) {
        newSelection[platformId] = { selected: false, accounts: {} };
      }

      const isSelected = prev[platformId]?.accounts[accountId] || false;
      newSelection[platformId].accounts[accountId] = !isSelected;

      // Check if all accounts are selected
      const accounts = database[platformId] || [];
      const allSelected = accounts.every(
        (acc: any) => newSelection[platformId].accounts[acc.id]
      );
      newSelection[platformId].selected = allSelected;

      return newSelection;
    });
  };

  // Toggle platform expansion
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

  // Select all
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

  // Deselect all
  const deselectAll = () => {
    setSelection({});
  };

  // Handle export
  const handleExport = async () => {
    // Filter selected data
    const selectedData: any = {};

    for (const platformId of platformIds) {
      const platformSelection = selection[platformId];
      if (!platformSelection) continue;

      const selectedAccounts = (database[platformId] || []).filter(
        (acc: any) => platformSelection.accounts[acc.id]
      );

      if (selectedAccounts.length > 0) {
        // Get platform name from first account or use ID
        const platformName =
          database[platformId][0]?.platform || platformId.replace(/_/g, " ");
        selectedData[platformName] = selectedAccounts;
      }
    }

    if (Object.keys(selectedData).length === 0) {
      Alert.alert("No Selection", "Please select at least one account to export.");
      return;
    }

    try {
      const exportText = generateExportText(selectedData, schemas);

      const result = await Share.share({
        message: exportText,
        title: "Export Password Data",
      });

      if (result.action === Share.sharedAction) {
        setToastMessage("Data exported successfully!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Export Failed", "An error occurred while exporting data.");
    }
  };

  // Count selected
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="cloud-download" size={40} color={colors.accent} />
          <Text
            style={[
              styles.title,
              { color: colors.text, fontFamily: fontConfig.bold },
            ]}
          >
            Export Data
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.subtext, fontFamily: fontConfig.regular },
            ]}
          >
            Select platforms and accounts to export
          </Text>
        </View>

        {/* Select All/Deselect All */}
        <View style={styles.buttonRow}>
          <Pressable
            onPress={selectAll}
            style={[
              styles.selectButton,
              { backgroundColor: colors.card, borderColor: colors.accent },
            ]}
          >
            <Ionicons name="checkmark-done" size={20} color={colors.accent} />
            <Text
              style={[
                styles.selectButtonText,
                { color: colors.accent, fontFamily: fontConfig.bold },
              ]}
            >
              Select All
            </Text>
          </Pressable>

          <Pressable
            onPress={deselectAll}
            style={[
              styles.selectButton,
              { backgroundColor: colors.card, borderColor: colors.accent },
            ]}
          >
            <Ionicons name="close-circle" size={20} color={colors.accent} />
            <Text
              style={[
                styles.selectButtonText,
                { color: colors.accent, fontFamily: fontConfig.bold },
              ]}
            >
              Deselect All
            </Text>
          </Pressable>
        </View>

        {/* Platform List */}
        {platformIds.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color={colors.muted} />
            <Text
              style={[
                styles.emptyText,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              No platforms found. Add some accounts first!
            </Text>
          </View>
        ) : (
          platformIds.map((platformId) => {
            const accounts = database[platformId] || [];
            const platformName = accounts[0]?.platform || platformId.replace(/_/g, " ");
            const isExpanded = expandedPlatforms.has(platformId);
            const isPlatformSelected = selection[platformId]?.selected || false;

            return (
              <MotiView
                key={platformId}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 200 }}
                style={[
                  styles.platformCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isPlatformSelected
                      ? colors.accent
                      : colors.accent + "30",
                  },
                ]}
              >
                {/* Platform Header */}
                <Pressable
                  onPress={() => toggleExpanded(platformId)}
                  style={styles.platformHeader}
                >
                  <View style={styles.platformLeft}>
                    <Pressable
                      onPress={() => togglePlatform(platformId)}
                      style={[
                        styles.checkbox,
                        {
                          borderColor: colors.accent,
                          backgroundColor: isPlatformSelected
                            ? colors.accent
                            : "transparent",
                        },
                      ]}
                    >
                      {isPlatformSelected && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </Pressable>

                    <View>
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
                          styles.platformCount,
                          { color: colors.subtext, fontFamily: fontConfig.regular },
                        ]}
                      >
                        {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={colors.accent}
                  />
                </Pressable>

                {/* Accounts List */}
                <AnimatePresence>
                  {isExpanded && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "timing", duration: 200 }}
                    >
                      <View style={styles.accountsList}>
                        {accounts.map((account: any, index: number) => {
                          const isSelected =
                            selection[platformId]?.accounts[account.id] || false;

                          return (
                            <MotiView
                              key={account.id}
                              from={{ opacity: 0, translateX: -20 }}
                              animate={{ opacity: 1, translateX: 0 }}
                              transition={{
                                type: "timing",
                                duration: 200,
                                delay: index * 50,
                              }}
                            >
                              <Pressable
                                onPress={() =>
                                  toggleAccount(platformId, account.id)
                                }
                                style={styles.accountItem}
                              >
                                <Pressable
                                  onPress={() =>
                                    toggleAccount(platformId, account.id)
                                  }
                                  style={[
                                    styles.checkbox,
                                    styles.accountCheckbox,
                                    {
                                      borderColor: colors.accent,
                                      backgroundColor: isSelected
                                        ? colors.accent
                                        : "transparent",
                                    },
                                  ]}
                                >
                                  {isSelected && (
                                    <Ionicons
                                      name="checkmark"
                                      size={14}
                                      color="#fff"
                                    />
                                  )}
                                </Pressable>

                                <Text
                                  style={[
                                    styles.accountName,
                                    {
                                      color: colors.text,
                                      fontFamily: fontConfig.regular,
                                    },
                                  ]}
                                >
                                  {account.name}
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
      </ScrollView>

      {/* Export Button */}
      {selectedCount > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.exportButtonContainer}
        >
          <Pressable
            onPress={handleExport}
            style={[
              styles.exportButton,
              { backgroundColor: colors.accent },
            ]}
          >
            <Ionicons name="share-outline" size={24} color="#fff" />
            <Text
              style={[
                styles.exportButtonText,
                { color: "#fff", fontFamily: fontConfig.bold },
              ]}
            >
              Export {selectedCount} Account{selectedCount !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        </MotiView>
      )}

      <Toast message={toastMessage} visible={showToast} />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: "center", marginVertical: 20, gap: 8 },
  title: { fontSize: 28, marginTop: 8 },
  subtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
  buttonRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  selectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  selectButtonText: { fontSize: 14 },
  emptyState: { alignItems: "center", marginTop: 60, gap: 16 },
  emptyText: { fontSize: 16, textAlign: "center" },
  platformCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  platformHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  platformLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  platformName: { fontSize: 18 },
  platformCount: { fontSize: 13, marginTop: 2 },
  accountsList: { marginTop: 12, gap: 8 },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  accountCheckbox: { width: 20, height: 20 },
  accountName: { fontSize: 15 },
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
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exportButtonText: { fontSize: 18 },
});
