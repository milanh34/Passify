import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import {
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import SchemaModal from "../../src/components/SchemaModal";
import DeleteModal from "../../src/components/DeleteModal";
import Toast from "../../src/components/Toast";
import SearchBar from "../../src/components/SearchBar";
import AccountSortModal from "../../src/components/AccountSortModal";
import { searchAccounts, debounceSearch } from "../../src/utils/searchAccounts";
import { sortAccounts, AccountSortOption } from "../../src/utils/sortAccounts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCOUNT_SORT_PREFERENCE_KEY = "@PM:account_sort_preference";

type Account = { 
  id: string; 
  name: string; 
  createdAt?: number; 
  updatedAt?: number; 
  [k: string]: any 
};

export default function AccountsScreen() {
  const { 
    platform, 
    key: platformKey,
    matchedAccountIds: matchedIdsParam,
    searchQuery: searchQueryParam,
  } = useLocalSearchParams<{
    platform: string;
    key: string;
    matchedAccountIds?: string;
    searchQuery?: string;
  }>();

  const nav = useNavigation();
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const {
    database,
    schemas,
    addAccount,
    updateAccount,
    deleteAccount,
    updatePlatformSchema,
  } = useDb();
  const insets = useSafeAreaInsets();

  const accounts: Account[] = useMemo(
    () => (platformKey ? database[String(platformKey)] || [] : []),
    [database, platformKey]
  );

  const schema = useMemo(() => {
    if (!platformKey) return ["name", "password"];
    const platformSchema = schemas[String(platformKey)];
    return platformSchema &&
      Array.isArray(platformSchema) &&
      platformSchema.length > 0
      ? platformSchema
      : ["name", "password"];
  }, [schemas, platformKey]);

  const [accModal, setAccModal] = useState<{
    visible: boolean;
    editing?: Account;
  }>({ visible: false });

  const [schemaModal, setSchemaModal] = useState(false);
  const [visiblePw, setVisiblePw] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    item?: any;
  }>({ visible: false });

  const [animationKey, setAnimationKey] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");

  // Multi-select state
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Sort state
  const [sortOption, setSortOption] = useState<AccountSortOption>("recent_added");
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Highlight state for matched accounts from search
  const [highlightedAccountIds, setHighlightedAccountIds] = useState<Set<string>>(new Set());
  const [showHighlightBanner, setShowHighlightBanner] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setAnimationKey((prev) => prev + 1);
      setExpandedCards(new Set());
      setVisiblePw({});
      setIsSelectionMode(false);
      setSelectedAccounts(new Set());

      // Load sort preference
      const loadSortPreference = async () => {
        try {
          const saved = await AsyncStorage.getItem(ACCOUNT_SORT_PREFERENCE_KEY);
          if (saved) {
            setSortOption(saved as AccountSortOption);
          }
        } catch (error) {
          console.error("Failed to load account sort preference:", error);
        }
      };
      loadSortPreference();

      // Handle matched accounts from navigation params
      if (matchedIdsParam && searchQueryParam) {
        try {
          const ids = JSON.parse(matchedIdsParam);
          setHighlightedAccountIds(new Set(ids));
          setShowHighlightBanner(true);
        } catch (error) {
          console.error("Failed to parse matched account IDs:", error);
        }
      } else {
        setHighlightedAccountIds(new Set());
        setShowHighlightBanner(false);
      }
    }, [matchedIdsParam, searchQueryParam])
  );

  // Debounced search query update
  const debouncedSetQuery = useMemo(
    () =>
      debounceSearch((query: string) => {
        setDebouncedQuery(query);
      }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSetQuery(text);
    // Clear highlights when user starts searching locally
    if (highlightedAccountIds.size > 0) {
      setHighlightedAccountIds(new Set());
      setShowHighlightBanner(false);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
  };

  // Handle sort selection
  const handleSortSelect = async (option: AccountSortOption) => {
    setSortOption(option);
    try {
      await AsyncStorage.setItem(ACCOUNT_SORT_PREFERENCE_KEY, option);
    } catch (error) {
      console.error("Failed to save account sort preference:", error);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear search, highlights, and exit selection mode
    handleClearSearch();
    setIsSelectionMode(false);
    setSelectedAccounts(new Set());
    setExpandedCards(new Set());
    setVisiblePw({});
    setHighlightedAccountIds(new Set());
    setShowHighlightBanner(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  // Dismiss highlight banner
  const dismissHighlightBanner = () => {
    setShowHighlightBanner(false);
    setHighlightedAccountIds(new Set());
  };

  // Apply search filter
  const filteredAccounts = useMemo(() => {
    return searchAccounts(accounts, debouncedQuery);
  }, [accounts, debouncedQuery]);

  // Apply sort to filtered results
  const sortedAccounts = useMemo(() => {
    return sortAccounts(filteredAccounts, sortOption);
  }, [filteredAccounts, sortOption]);

  const displayToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // Long press to enter selection mode
  const handleLongPress = (accountId: string) => {
    setIsSelectionMode(true);
    setSelectedAccounts(new Set([accountId]));
  };

  // Toggle selection or expand card
  const handleCardPress = (accountId: string) => {
    if (!isSelectionMode) {
      // Normal tap - toggle card expansion
      toggleCard(accountId);
    } else {
      // Selection mode - toggle selection
      setSelectedAccounts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(accountId)) {
          newSet.delete(accountId);
        } else {
          newSet.add(accountId);
        }

        // Exit selection mode if no items selected
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }

        return newSet;
      });
    }
  };

  // Select all accounts (filtered results)
  const selectAllAccounts = () => {
    const allIds = sortedAccounts.map((acc) => acc.id);
    setSelectedAccounts(new Set(allIds));
  };

  // Deselect all
  const deselectAllAccounts = () => {
    setSelectedAccounts(new Set());
    setIsSelectionMode(false);
  };

  // Exit selection mode
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedAccounts(new Set());
  };

  // Delete selected accounts
  const handleDeleteSelected = () => {
    setDeleteModal({
      visible: true,
      item: {
        type: "multiple",
        ids: Array.from(selectedAccounts),
        count: selectedAccounts.size,
      },
    });
  };

  useEffect(() => {
    const handleSettingsPress = () => {
      setSchemaModal(true);
    };

    nav.setOptions({
      headerShown: true,
      title: platform || "Accounts",
      headerTransparent: true,
      headerStyle: { height: 60 + insets.top },
      headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold },
      headerLeft: () => (
        <Pressable
          onPress={() => nav.goBack()}
          style={{
            marginLeft: 15,
            backgroundColor: colors.card,
            padding: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginRight: 15 }}>
          {isSelectionMode ? (
            // Show Select All / Deselect All in selection mode
            selectedAccounts.size === sortedAccounts.length ? (
              <Pressable
                onPress={deselectAllAccounts}
                style={{
                  backgroundColor: colors.card,
                  padding: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                }}
                android_ripple={{ color: colors.accent + "22" }}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.accent} />
                <Text style={{ color: colors.accent, fontFamily: fontConfig.bold, fontSize: 13 }}>
                  Deselect All
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={selectAllAccounts}
                style={{
                  backgroundColor: colors.card,
                  padding: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                }}
                android_ripple={{ color: colors.accent + "22" }}
              >
                <Ionicons name="checkmark-done-outline" size={18} color={colors.accent} />
                <Text style={{ color: colors.accent, fontFamily: fontConfig.bold, fontSize: 13 }}>
                  Select All
                </Text>
              </Pressable>
            )
          ) : (
            // Normal settings button
            <Pressable
              onPress={handleSettingsPress}
              style={{
                backgroundColor: colors.card,
                padding: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.cardBorder,
              }}
              android_ripple={{ color: colors.accent + "22" }}
            >
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [
    platform,
    colors,
    fontConfig,
    insets,
    nav,
    schema,
    isSelectionMode,
    selectedAccounts,
    sortedAccounts.length,
  ]);

  if (!fontsLoaded)
    return <View style={[styles.root, { backgroundColor: colors.bg[0] }]} />;

  const copyToClipboard = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text || "");
    setCopiedField(key);
    setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1000);
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const executeDelete = () => {
    if (deleteModal.item?.type === "multiple" && platformKey) {
      const count = deleteModal.item.count;
      deleteModal.item.ids.forEach((id: string) => {
        deleteAccount(String(platformKey), id);
      });
      exitSelectionMode();
      displayToast(`Successfully deleted ${count} account(s)`, "success");
    }

    setDeleteModal({ visible: false });
  };

  const onSaveAccount = (data: Record<string, any>) => {
    if (!platformKey) return;

    if (accModal.editing) {
      updateAccount(String(platformKey), accModal.editing.id, {
        ...accModal.editing,
        ...data,
      });
      displayToast("Changes saved successfully", "success");
    } else {
      const payload: any = {};
      schema.forEach((f) => {
        if (f !== "id") payload[f] = data[f] || "";
      });
      addAccount(String(platformKey), payload);
      displayToast("Account added successfully", "success");
    }

    setAccModal({ visible: false });
  };

  const handleSaveSchema = (fields: string[]) => {
    if (platformKey && fields && fields.length > 0) {
      updatePlatformSchema(String(platformKey), fields);
      displayToast("Schema updated successfully", "success");
    }

    setSchemaModal(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg[0], paddingTop: insets.top + 60 }]}>
      {/* Highlight Banner */}
      {showHighlightBanner && highlightedAccountIds.size > 0 && (
        <View
          style={[
            styles.highlightBanner,
            { backgroundColor: colors.accent + "15", borderColor: colors.accent + "40" },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.accent} />
          <Text
            style={[
              styles.highlightBannerText,
              { color: colors.accent, fontFamily: fontConfig.regular },
            ]}
          >
            Showing {highlightedAccountIds.size} account(s) matching "{searchQueryParam}"
          </Text>
          <Pressable onPress={dismissHighlightBanner} style={styles.highlightBannerClose}>
            <Ionicons name="close-circle" size={20} color={colors.accent} />
          </Pressable>
        </View>
      )}

      {/* Search & Sort Bar */}
      {!isSelectionMode && (
        <>
          <View style={styles.searchSortRow}>
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearchChange}
                onClear={handleClearSearch}
                placeholder="Search accounts..."
              />
            </View>
            <Pressable
              onPress={() => setSortModalVisible(true)}
              style={[
                styles.sortButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              android_ripple={{ color: colors.accent + "22" }}
            >
              <Ionicons name="funnel-outline" size={20} color={colors.accent} />
            </Pressable>
          </View>

          {/* Result count */}
          {debouncedQuery.trim() && (
            <Text
              style={[
                styles.resultCount,
                { color: colors.muted, fontFamily: fontConfig.regular },
              ]}
            >
              Showing {sortedAccounts.length} of {accounts.length} accounts
            </Text>
          )}
        </>
      )}

      {/* Account List */}
      <FlatList
        data={sortedAccounts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        renderItem={({ item, index }) => {
          const isExpanded = expandedCards.has(item.id);
          const isSelected = selectedAccounts.has(item.id);
          const isHighlighted = highlightedAccountIds.has(item.id);

          return (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 200, delay: index * 50 }}
            >
              {/* Animated card with highlight */}
              <Pressable
                onPress={() => handleCardPress(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                delayLongPress={500}
                style={[
                  styles.card,
                  {
                    backgroundColor: isHighlighted 
                      ? colors.accent + "10" 
                      : colors.card,
                    borderColor: isSelected
                      ? colors.accent
                      : isExpanded
                      ? colors.accent
                      : isHighlighted
                      ? colors.accent + "60"
                      : colors.cardBorder,
                    borderWidth: isSelected ? 2 : isExpanded ? 2 : isHighlighted ? 2 : 1,
                  },
                ]}
                android_ripple={{ color: colors.accent + "22" }}
              >
                {/* Selection indicator */}
                {isSelectionMode && (
                  <View style={styles.selectionIndicator}>
                    <Ionicons
                      name={
                        isSelected
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={24}
                      color={isSelected ? colors.accent : colors.muted}
                    />
                  </View>
                )}

                <View style={styles.rowBetween}>
                  <View style={styles.cardTitleRow}>
                    {isHighlighted && (
                      <Ionicons 
                        name="search-circle" 
                        size={20} 
                        color={colors.accent} 
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: colors.text, fontFamily: fontConfig.bold },
                      ]}
                    >
                      {item.name || "Untitled"}
                    </Text>
                  </View>

                  {!isSelectionMode && (
                    <View style={styles.actions}>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setAccModal({ visible: true, editing: item });
                        }}
                        style={styles.iconBtn}
                        android_ripple={{ color: colors.accent + "22" }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={colors.text}
                        />
                      </Pressable>
                      
                      {/* Expand/Collapse Arrow */}
                      <View style={styles.iconBtn}>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color={colors.accent}
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Enhanced expand/collapse animation */}
                {isExpanded && !isSelectionMode && (
                  <AnimatePresence>
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "timing", duration: 200 }}
                    >
                      {schema.map((field, fieldIndex) => {
                        if (field === "id" || field === "name")
                          return null;

                        const value = item[field] ?? "";
                        const isPassword = field
                          .toLowerCase()
                          .includes("password");
                        const fieldKey = `${item.id}-${field}`;
                        const isCopied = copiedField === fieldKey;

                        return (
                          <View
                            key={fieldKey}
                            style={[
                              styles.fieldRow,
                              {
                                borderTopColor: colors.cardBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.fieldLabel,
                                {
                                  color: colors.subtext,
                                  fontFamily: fontConfig.regular,
                                },
                              ]}
                            >
                              {field}
                            </Text>
                            <View style={styles.rowBetween}>
                              <Text
                                style={[
                                  styles.fieldValue,
                                  {
                                    color: colors.text,
                                    fontFamily: fontConfig.regular,
                                  },
                                ]}
                              >
                                {isPassword
                                  ? visiblePw[item.id]
                                    ? String(value)
                                    : "••••••••"
                                  : String(value)}
                              </Text>
                              <View style={styles.fieldActions}>
                                {isPassword && (
                                  <Pressable
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      setVisiblePw((p) => ({
                                        ...p,
                                        [item.id]: !p[item.id],
                                      }));
                                    }}
                                    style={styles.iconBtn}
                                    android_ripple={{
                                      color: colors.accent + "22",
                                    }}
                                  >
                                    <Ionicons
                                      name={
                                        visiblePw[item.id]
                                          ? "eye-off"
                                          : "eye"
                                      }
                                      size={18}
                                      color={colors.text}
                                    />
                                  </Pressable>
                                )}
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(
                                      String(value),
                                      fieldKey
                                    );
                                  }}
                                  style={styles.iconBtn}
                                  android_ripple={{
                                    color: colors.accent + "22",
                                  }}
                                >
                                  <Ionicons
                                    name={
                                      isCopied
                                        ? "checkmark"
                                        : "copy-outline"
                                    }
                                    size={18}
                                    color={
                                      isCopied
                                        ? colors.accent
                                        : colors.text
                                    }
                                  />
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </MotiView>
                  </AnimatePresence>
                )}
              </Pressable>
            </MotiView>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={
                debouncedQuery.trim()
                  ? "search-outline"
                  : "document-text-outline"
              }
              size={64}
              color={colors.muted}
            />
            <Text
              style={[
                styles.emptyText,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              {debouncedQuery.trim()
                ? "No accounts match your search."
                : "No accounts yet"}
            </Text>
          </View>
        }
      />

      {/* FAB buttons */}
      {isSelectionMode && selectedAccounts.size > 0 ? (
        <>
          {/* Delete button when in selection mode */}
          <View style={[styles.fabContainer, { bottom: insets.bottom + 90 }]}>
            <FAB
              onPress={handleDeleteSelected}
              icon="trash"
              color={colors.danger}
            />
          </View>
          {/* Cancel button */}
          <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
            <FAB
              onPress={exitSelectionMode}
              icon="close"
              color={colors.cardBorder}
            />
          </View>
        </>
      ) : (
        /* Normal add button */
        <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
          <FAB
            onPress={() => setAccModal({ visible: true })}
            icon="add"
            color={colors.fab}
          />
        </View>
      )}

      {/* Modals */}
      <FormModal
        visible={accModal.visible}
        onClose={() => setAccModal({ visible: false })}
        onSubmit={onSaveAccount}
        title={accModal.editing ? "Edit Account" : "Add Account"}
        fields={schema
          .filter((f) => f !== "id")
          .map((f) => ({
            name: f,
            label: f.charAt(0).toUpperCase() + f.slice(1),
            secure: false,
          }))}
        initialData={accModal.editing || {}}
      />

      <SchemaModal
        visible={schemaModal}
        currentSchema={schema}
        onClose={() => setSchemaModal(false)}
        onSave={handleSaveSchema}
      />

      <DeleteModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false })}
        onConfirm={executeDelete}
        title="Delete Accounts?"
        description={`Are you sure you want to delete ${
          deleteModal.item?.count || 0
        } account(s)? This action cannot be undone.`}
      />

      <AccountSortModal
        visible={sortModalVisible}
        currentSort={sortOption}
        onSelect={handleSortSelect}
        onClose={() => setSortModalVisible(false)}
      />

      <Toast message={toastMessage} visible={showToast} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18 },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 8,
  },
  highlightBannerText: {
    flex: 1,
    fontSize: 14,
  },
  highlightBannerClose: {
    padding: 4,
  },
  searchSortRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
  },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resultCount: {
    fontSize: 13,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    flex: 1,
  },
  fieldRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  fieldLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 15,
    flex: 1,
  },
  fieldActions: {
    flexDirection: "row",
    gap: 12,
  },
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
  },
});
