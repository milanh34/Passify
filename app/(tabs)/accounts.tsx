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
import { useAuth } from "../../src/context/AuthContext"; // 🔐 AUTH: Import useAuth
import { useInactivityTracker } from "../../src/utils/inactivityTracker"; // 🔐 AUTH: Import inactivity tracker
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import SchemaModal from "../../src/components/SchemaModal";
import DeleteModal from "../../src/components/DeleteModal";
import Toast from "../../src/components/Toast";
import SearchBar from "../../src/components/SearchBar";
import AccountSortModal from "../../src/components/AccountSortModal";
import PlatformIcon from "../../src/components/PlatformIcon";
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
  platformsMetadata,
  addAccount,
  updateAccount,
  deleteAccount,
  updatePlatformSchema,
} = useDb();
  const insets = useSafeAreaInsets();

  // 🔐 AUTH: Get auth state and initialize inactivity tracker
  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

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

      // 🔐 AUTH: Update activity when screen is focused
      if (isAuthEnabled) {
        updateActivity();
      }
    }, [matchedIdsParam, searchQueryParam, isAuthEnabled, updateActivity])
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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  // Handle sort selection
  const handleSortSelect = async (option: AccountSortOption) => {
    setSortOption(option);
    try {
      await AsyncStorage.setItem(ACCOUNT_SORT_PREFERENCE_KEY, option);
    } catch (error) {
      console.error("Failed to save account sort preference:", error);
    }
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  // Dismiss highlight banner
  const dismissHighlightBanner = () => {
    setShowHighlightBanner(false);
    setHighlightedAccountIds(new Set());
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  // Toggle selection or expand card
  const handleCardPress = (accountId: string) => {
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }

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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  // Deselect all
  const deselectAllAccounts = () => {
    setSelectedAccounts(new Set());
    setIsSelectionMode(false);
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  // Exit selection mode
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedAccounts(new Set());
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  useEffect(() => {
    const handleSettingsPress = () => {
      setSchemaModal(true);
      // 🔐 AUTH: Update activity on user interaction
      if (isAuthEnabled) {
        updateActivity();
      }
    };

    // 🎨 ICONS: Get platform icon data
    const platformMeta = platformKey
      ? platformsMetadata[String(platformKey)]
      : null;
    const platformIcon = platformMeta?.icon || null;
    const platformIconColor = platformMeta?.iconColor || null;

    nav.setOptions({
      headerShown: true,
      title: platform || "Accounts",
      headerTransparent: true,
      headerStyle: { height: 60 + insets.top },
      headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold },

      // 🎨 ICONS: Custom header title with icon
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <PlatformIcon
            platformName={platform || "Accounts"}
            iconKey={platformIcon}
            iconColor={platformIconColor}
            size={32}
          />
          <Text
            style={{
              color: colors.text,
              fontFamily: fontConfig.bold,
              fontSize: 18,
            }}
            numberOfLines={1}
          >
            {platform || "Accounts"}
          </Text>
        </View>
      ),

      headerLeft: () => (
        <Pressable
          onPress={() => {
            nav.goBack();
            // 🔐 AUTH: Update activity on user interaction
            if (isAuthEnabled) {
              updateActivity();
            }
          }}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginRight: 15,
          }}
        >
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
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text
                  style={{
                    color: colors.accent,
                    fontFamily: fontConfig.bold,
                    fontSize: 13,
                  }}
                >
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
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text
                  style={{
                    color: colors.accent,
                    fontFamily: fontConfig.bold,
                    fontSize: 13,
                  }}
                >
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
    platformKey,
    platformsMetadata,
    colors,
    fontConfig,
    insets,
    nav,
    schema,
    isSelectionMode,
    selectedAccounts,
    sortedAccounts.length,
    isAuthEnabled,
    updateActivity,
  ]);


  if (!fontsLoaded)
    return <View style={[styles.root, { backgroundColor: colors.bg[0] }]} />;

  const copyToClipboard = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text || "");
    setCopiedField(key);
    setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1000);
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
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
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleSaveSchema = (fields: string[]) => {
    if (platformKey && fields && fields.length > 0) {
      updatePlatformSchema(String(platformKey), fields);
      displayToast("Schema updated successfully", "success");
    }

    setSchemaModal(false);
    // 🔐 AUTH: Update activity on user interaction
    if (isAuthEnabled) {
      updateActivity();
    }
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
              onPress={() => {
                setSortModalVisible(true);
                // 🔐 AUTH: Update activity on user interaction
                if (isAuthEnabled) {
                  updateActivity();
                }
              }}
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
        key={animationKey}
        data={sortedAccounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 120 }}
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
          const isHighlighted = highlightedAccountIds.has(item.id);

          return (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 300,
                delay: index * 50,
              }}
            >
              <Pressable
                onPress={() => handleCardPress(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                delayLongPress={500}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: isHighlighted
                      ? colors.accent
                      : selectedAccounts.has(item.id)
                      ? colors.accent
                      : colors.cardBorder,
                    borderWidth: isHighlighted || selectedAccounts.has(item.id) ? 2 : 1,
                  },
                ]}
                android_ripple={{ color: colors.accent + "22" }}
              >
                {/* Selection indicator */}
                {isSelectionMode && (
                  <View style={styles.selectionIndicator}>
                    <Ionicons
                      name={
                        selectedAccounts.has(item.id)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={24}
                      color={
                        selectedAccounts.has(item.id)
                          ? colors.accent
                          : colors.muted
                      }
                    />
                  </View>
                )}

                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons name="person-circle" size={28} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: colors.text, fontFamily: fontConfig.bold },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name || "Unnamed Account"}
                      </Text>
                      {isHighlighted && (
                        <Text
                          style={[
                            styles.matchBadge,
                            { color: colors.accent, fontFamily: fontConfig.regular },
                          ]}
                        >
                          <Ionicons name="search" size={12} /> Matched
                        </Text>
                      )}
                    </View>
                  </View>

                  {!isSelectionMode && (
                    <View style={styles.cardHeaderRight}>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={colors.muted}
                      />
                    </View>
                  )}
                </View>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && !isSelectionMode && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "timing", duration: 200 }}
                    >
                      <View style={[styles.cardBody, { borderTopColor: colors.cardBorder }]}>
                        {schema
                          .filter((f) => f !== "id" && f !== "name")
                          .map((fieldName) => {
                            const value = item[fieldName];
                            const fieldKey = `${item.id}-${fieldName}`;
                            const isPassword = fieldName.toLowerCase().includes("password");
                            const isPwVisible = visiblePw[fieldKey];

                            return (
                              <View key={fieldName} style={styles.fieldRow}>
                                <Text
                                  style={[
                                    styles.fieldLabel,
                                    { color: colors.subtext, fontFamily: fontConfig.regular },
                                  ]}
                                >
                                  {fieldName.charAt(0).toUpperCase() +
                                    fieldName.slice(1).replace(/_/g, " ")}
                                </Text>
                                <View style={styles.fieldValueContainer}>
                                  <Text
                                    style={[
                                      styles.fieldValue,
                                      {
                                        color: colors.text,
                                        fontFamily: fontConfig.regular,
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {isPassword && !isPwVisible ? "••••••••" : value || "—"}
                                  </Text>
                                  <View style={styles.fieldActions}>
                                    {isPassword && (
                                      <Pressable
                                        onPress={() => {
                                          setVisiblePw((prev) => ({
                                            ...prev,
                                            [fieldKey]: !prev[fieldKey],
                                          }));
                                          // 🔐 AUTH: Update activity on user interaction
                                          if (isAuthEnabled) {
                                            updateActivity();
                                          }
                                        }}
                                        style={styles.iconButton}
                                        android_ripple={{ color: colors.accent + "33" }}
                                      >
                                        <Ionicons
                                          name={isPwVisible ? "eye-off-outline" : "eye-outline"}
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
                                        name={
                                          copiedField === fieldKey
                                            ? "checkmark"
                                            : "copy-outline"
                                        }
                                        size={18}
                                        color={
                                          copiedField === fieldKey ? colors.accent : colors.muted
                                        }
                                      />
                                    </Pressable>
                                  </View>
                                </View>
                              </View>
                            );
                          })}

                        {/* Edit/Delete Buttons */}
                        <View style={styles.cardActions}>
                          <Pressable
                            onPress={() => {
                              setAccModal({ visible: true, editing: item });
                              // 🔐 AUTH: Update activity on user interaction
                              if (isAuthEnabled) {
                                updateActivity();
                              }
                            }}
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: colors.accent + "15",
                                borderColor: colors.accent + "30",
                              },
                            ]}
                            android_ripple={{ color: colors.accent + "33" }}
                          >
                            <Ionicons name="create-outline" size={18} color={colors.accent} />
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: colors.accent, fontFamily: fontConfig.bold },
                              ]}
                            >
                              Edit
                            </Text>
                          </Pressable>

                          <Pressable
                            onPress={() => {
                              setDeleteModal({ visible: true, item });
                              // 🔐 AUTH: Update activity on user interaction
                              if (isAuthEnabled) {
                                updateActivity();
                              }
                            }}
                            style={[
                              styles.actionButton,
                              {
                                backgroundColor: colors.danger + "15",
                                borderColor: colors.danger + "30",
                              },
                            ]}
                            android_ripple={{ color: colors.danger + "33" }}
                          >
                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                            <Text
                              style={[
                                styles.actionButtonText,
                                { color: colors.danger, fontFamily: fontConfig.bold },
                              ]}
                            >
                              Delete
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    </MotiView>
                  )}
                </AnimatePresence>
              </Pressable>
            </MotiView>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={debouncedQuery.trim() ? "search-outline" : "person-add-outline"}
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
                : "No accounts yet. Tap + to add one!"}
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
            onPress={() => {
              setAccModal({ visible: true });
              // 🔐 AUTH: Update activity on user interaction
              if (isAuthEnabled) {
                updateActivity();
              }
            }}
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
            label: f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " "),
          }))}
        initialData={accModal.editing || {}}
      />

      <SchemaModal
        visible={schemaModal}
        currentSchema={schema}
        onSave={handleSaveSchema}
        onClose={() => setSchemaModal(false)}
      />

      <DeleteModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false })}
        onConfirm={executeDelete}
        title={
          deleteModal.item?.type === "multiple"
            ? "Delete Accounts?"
            : "Delete Account?"
        }
        description={
          deleteModal.item?.type === "multiple"
            ? `Are you sure you want to delete ${deleteModal.item.count} account(s)? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone.`
        }
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
  root: { flex: 1 },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  highlightBannerText: {
    flex: 1,
    fontSize: 13,
  },
  highlightBannerClose: {
    padding: 4,
  },
  searchSortRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
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
    paddingHorizontal: 22,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardHeaderRight: {
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 18,
  },
  matchBadge: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  cardBody: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  fieldRow: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  fieldValue: {
    fontSize: 15,
    flex: 1,
  },
  fieldActions: {
    flexDirection: "row",
    gap: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
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
