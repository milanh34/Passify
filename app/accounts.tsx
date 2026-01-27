// app/accounts.tsx

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useLocalSearchParams, useNavigation, useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDb } from "../src/context/DbContext";
import { useAuth } from "../src/context/AuthContext";
import { useInactivityTracker } from "../src/utils/inactivityTracker";
import { useAppTheme } from "../src/themes/hooks/useAppTheme";
import FAB from "../src/components/FAB";
import FormModal from "../src/components/FormModal";
import SchemaModal from "../src/components/SchemaModal";
import DeleteModal from "../src/components/DeleteModal";
import Toast from "../src/components/Toast";
import SearchBar from "../src/components/SearchBar";
import AccountSortModal from "../src/components/AccountSortModal";
import PlatformIcon from "../src/components/PlatformIcon";
import { searchAccounts, debounceSearch } from "../src/utils/searchAccounts";
import { sortAccounts, AccountSortOption } from "../src/utils/sortAccounts";
import {
  isPlatformSupportedForConnections,
  getPrimaryEmail,
  countConnectedPlatforms,
} from "../src/utils/connectedAccounts";
import { sortFieldsByOrder, isSensitiveField, isPasswordField } from "../src/utils/fieldOrder";
import { formatDate, getDateFormat, DateFormatOption } from "../src/utils/dateFormat";
import { formatPhone, getPhoneFormat, PhoneFormatOption } from "../src/utils/phoneFormat";
import { getFieldType } from "../src/utils/formValidation";
import { log } from "@/src/utils/logger";

const ACCOUNT_SORT_PREFERENCE_KEY = "@PM:account_sort_preference";

type Account = {
  id: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
  [k: string]: any;
};

export default function AccountsScreen() {
  const {
    platform,
    key: platformKey,
    matchedAccountIds: matchedIdsParam,
    searchQuery: searchQueryParam,
    highlightAccountId,
    expandAccountId,
    fromConnectedAccounts,
    navId,
  } = useLocalSearchParams<{
    platform: string;
    key: string;
    matchedAccountIds?: string;
    searchQuery?: string;
    highlightAccountId?: string;
    expandAccountId?: string;
    fromConnectedAccounts?: string;
    navId?: string;
  }>();

  const nav = useNavigation();
  const theme = useAppTheme();
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
  const { isAuthEnabled } = useAuth();
  const router = useRouter();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

  const lastNavIdRef = useRef<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollPositionRef = useRef<number>(0);
  const navigatedToConnectedRef = useRef(false);
  const isInitialMountRef = useRef(true);

  const [dateFormat, setDateFormatState] = useState<DateFormatOption>("DD/MM/YYYY");
  const [phoneFormat, setPhoneFormatState] = useState<PhoneFormatOption>("PLAIN");

  const accounts: Account[] = useMemo(
    () => (platformKey ? database[String(platformKey)] || [] : []),
    [database, platformKey]
  );

  const schema = useMemo(() => {
    if (!platformKey) return ["name", "password"];
    const platformSchema = schemas[String(platformKey)];
    return platformSchema && Array.isArray(platformSchema) && platformSchema.length > 0
      ? platformSchema
      : ["name", "password"];
  }, [schemas, platformKey]);

  const displayField = useMemo(() => {
    if (!platformKey) return "name";
    return platformsMetadata[String(platformKey)]?.displayField || "name";
  }, [platformKey, platformsMetadata]);

  const isConnectionSupportedPlatform = useMemo(() => {
    return platformKey ? isPlatformSupportedForConnections(String(platformKey)) : false;
  }, [platformKey]);

  const platformMeta = platformKey ? platformsMetadata[String(platformKey)] : null;
  const platformIcon = platformMeta?.icon || null;
  const platformIconColor = platformMeta?.iconColor || null;

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
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOption, setSortOption] = useState<AccountSortOption>("recent_added");
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [highlightedAccountIds, setHighlightedAccountIds] = useState<Set<string>>(new Set());
  const [showHighlightBanner, setShowHighlightBanner] = useState(false);

  useEffect(() => {
    nav.setOptions({
      headerShown: false,
    });
  }, [nav]);

  useFocusEffect(
    useCallback(() => {
      const previousScrollPosition = scrollPositionRef.current;
      const isReturningFromConnected = navigatedToConnectedRef.current;

      if (isReturningFromConnected) {
        navigatedToConnectedRef.current = false;
        setVisiblePw({});

        if (previousScrollPosition > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({
                offset: previousScrollPosition,
                animated: false,
              });
            }, 50);
          });
        }

        if (isAuthEnabled) {
          updateActivity();
        }
        return;
      }

      setAnimationKey((prev) => prev + 1);
      setVisiblePw({});
      setIsSelectionMode(false);
      setSelectedAccounts(new Set());

      const loadSortPreference = async () => {
        try {
          const saved = await AsyncStorage.getItem(ACCOUNT_SORT_PREFERENCE_KEY);
          if (saved) {
            setSortOption(saved as AccountSortOption);
          }
        } catch (error) {
          log.error("Failed to load account sort preference:", error);
        }
      };
      loadSortPreference();

      getDateFormat().then(setDateFormatState);
      getPhoneFormat().then(setPhoneFormatState);

      if (expandAccountId) {
        setExpandedCards(new Set([expandAccountId]));
      }

      if (highlightAccountId) {
        setHighlightedAccountIds(new Set([highlightAccountId]));
        setShowHighlightBanner(true);
      } else if (matchedIdsParam && searchQueryParam) {
        try {
          const ids = JSON.parse(matchedIdsParam);
          setHighlightedAccountIds(new Set(ids));
          setShowHighlightBanner(true);
        } catch (error) {
          log.error("Failed to parse matched account IDs:", error);
        }
      } else if (!fromConnectedAccounts) {
        setHighlightedAccountIds(new Set());
        setShowHighlightBanner(false);
      }

      if (
        !isInitialMountRef.current &&
        previousScrollPosition > 0 &&
        !highlightAccountId &&
        !expandAccountId
      ) {
        scrollPositionRef.current = 0;
      }
      isInitialMountRef.current = false;

      if (isAuthEnabled) {
        updateActivity();
      }
    }, [
      matchedIdsParam,
      searchQueryParam,
      highlightAccountId,
      expandAccountId,
      fromConnectedAccounts,
      isAuthEnabled,
      updateActivity,
    ])
  );

  const debouncedSetQuery = useMemo(
    () =>
      debounceSearch((query: string) => {
        setDebouncedQuery(query);
      }, 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSetQuery(text);
    if (highlightedAccountIds.size > 0) {
      setHighlightedAccountIds(new Set());
      setShowHighlightBanner(false);
    }
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleSortSelect = async (option: AccountSortOption) => {
    setSortOption(option);
    try {
      await AsyncStorage.setItem(ACCOUNT_SORT_PREFERENCE_KEY, option);
    } catch (error) {
      log.error("Failed to save account sort preference:", error);
    }
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    handleClearSearch();
    setIsSelectionMode(false);
    setSelectedAccounts(new Set());
    setExpandedCards(new Set());
    setVisiblePw({});
    setHighlightedAccountIds(new Set());
    setShowHighlightBanner(false);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const accountNames = useMemo(() => {
    return accounts.map((acc) => acc.name).filter((name) => name && name.trim());
  }, [accounts]);

  const dismissHighlightBanner = () => {
    setShowHighlightBanner(false);
    setHighlightedAccountIds(new Set());
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const filteredAccounts = useMemo(() => {
    return searchAccounts(accounts, debouncedQuery);
  }, [accounts, debouncedQuery]);

  const sortedAccounts = useMemo(() => {
    return sortAccounts(filteredAccounts, sortOption, displayField);
  }, [filteredAccounts, sortOption, displayField]);

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

  const handleLongPress = (accountId: string) => {
    setIsSelectionMode(true);
    setSelectedAccounts(new Set([accountId]));
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleCardPress = (accountId: string) => {
    if (isAuthEnabled) {
      updateActivity();
    }

    if (!isSelectionMode) {
      toggleCard(accountId);
    } else {
      setSelectedAccounts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(accountId)) {
          newSet.delete(accountId);
        } else {
          newSet.add(accountId);
        }

        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }

        return newSet;
      });
    }
  };

  const selectAllAccounts = useCallback(() => {
    const allIds = sortedAccounts.map((acc) => acc.id);
    setSelectedAccounts(new Set(allIds));
    if (isAuthEnabled) {
      updateActivity();
    }
  }, [sortedAccounts, isAuthEnabled, updateActivity]);

  const deselectAllAccounts = useCallback(() => {
    setSelectedAccounts(new Set());
    setIsSelectionMode(false);
    if (isAuthEnabled) {
      updateActivity();
    }
  }, [isAuthEnabled, updateActivity]);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedAccounts(new Set());
    if (isAuthEnabled) {
      updateActivity();
    }
  }, [isAuthEnabled, updateActivity]);

  const handleDeleteSelected = () => {
    setDeleteModal({
      visible: true,
      item: {
        type: "multiple",
        ids: Array.from(selectedAccounts),
        count: selectedAccounts.size,
      },
    });
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleBackPress = useCallback(() => {
    nav.goBack();
  }, [nav]);

  const handleSettingsPress = useCallback(() => {
    setSchemaModal(true);
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text || "");
    setCopiedField(key);
    setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1000);
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
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleViewConnectedPlatforms = (account: any) => {
    const primaryEmail = getPrimaryEmail(account);

    if (!primaryEmail || !platformKey) return;
    navigatedToConnectedRef.current = true;

    router.push({
      pathname: "/connected-accounts",
      params: {
        email: primaryEmail.value,
        sourcePlatform: String(platformKey),
        sourceAccountId: account.id,
        sourceAccountName: account.name || "Account",
      },
    });

    if (isAuthEnabled) {
      updateActivity();
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.customHeader,
          {
            paddingTop: insets.top + 12,
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.surfaceBorder,
            height: insets.top + theme.components.header.height,
          },
        ]}
      >
        <Pressable
          onPress={handleBackPress}
          style={[
            styles.headerButton,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.components.header.backButtonRadius,
              borderWidth: theme.shapes.borderThin,
              borderColor: theme.colors.surfaceBorder,
            },
          ]}
          android_ripple={{ color: theme.colors.accentMuted, borderless: false }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <PlatformIcon
            platformName={platform || "Accounts"}
            iconKey={platformIcon}
            iconColor={platformIconColor}
            size={32}
          />
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeXl,
              },
            ]}
            numberOfLines={1}
          >
            {platform || "Accounts"}
          </Text>
        </View>

        <View style={styles.headerRightContainer}>
          {isSelectionMode ? (
            selectedAccounts.size === sortedAccounts.length ? (
              <Pressable
                onPress={deselectAllAccounts}
                style={[
                  styles.headerActionButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.shapes.radiusMd,
                    borderWidth: theme.shapes.borderThin,
                    borderColor: theme.colors.surfaceBorder,
                  },
                ]}
                android_ripple={{ color: theme.colors.accentMuted, borderless: false }}
              >
                <Ionicons name="close-circle-outline" size={18} color={theme.colors.accent} />
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontFamily: theme.typography.fontBold,
                    fontSize: theme.typography.sizeSm,
                  }}
                >
                  Deselect
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={selectAllAccounts}
                style={[
                  styles.headerActionButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.shapes.radiusMd,
                    borderWidth: theme.shapes.borderThin,
                    borderColor: theme.colors.surfaceBorder,
                  },
                ]}
                android_ripple={{ color: theme.colors.accentMuted, borderless: false }}
              >
                <Ionicons name="checkmark-done-outline" size={18} color={theme.colors.accent} />
                <Text
                  style={{
                    color: theme.colors.accent,
                    fontFamily: theme.typography.fontBold,
                    fontSize: theme.typography.sizeSm,
                  }}
                >
                  Select All
                </Text>
              </Pressable>
            )
          ) : (
            <Pressable
              onPress={handleSettingsPress}
              style={[
                styles.headerButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.shapes.radiusMd,
                  borderWidth: theme.shapes.borderThin,
                  borderColor: theme.colors.surfaceBorder,
                },
              ]}
              android_ripple={{ color: theme.colors.accentMuted, borderless: false }}
            >
              <Ionicons name="settings-outline" size={20} color={theme.colors.textPrimary} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {showHighlightBanner && highlightedAccountIds.size > 0 && (
          <View
            style={[
              styles.highlightBanner,
              {
                backgroundColor: theme.colors.accentMuted,
                borderColor: theme.colors.accent + "40",
                borderRadius: theme.shapes.radiusMd,
              },
            ]}
          >
            <Ionicons
              name={highlightAccountId ? "link" : "search"}
              size={18}
              color={theme.colors.accent}
            />
            <Text
              style={[
                styles.highlightBannerText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontRegular },
              ]}
            >
              {highlightAccountId
                ? "Navigated from Connected Platforms"
                : `Showing ${highlightedAccountIds.size} account(s) matching "${searchQueryParam}"`}
            </Text>
            <Pressable onPress={dismissHighlightBanner} style={styles.highlightBannerClose}>
              <Ionicons name="close-circle" size={20} color={theme.colors.accent} />
            </Pressable>
          </View>
        )}

        {!isSelectionMode && (
          <>
            <View style={styles.searchSortRow}>
              <View style={styles.searchContainer}>
                <SearchBar
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onClear={handleClearSearch}
                  placeholder="Search accounts..."
                  suggestions={accountNames}
                />
              </View>
              <Pressable
                onPress={() => {
                  setSortModalVisible(true);
                  if (isAuthEnabled) {
                    updateActivity();
                  }
                }}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.radiusMd,
                  },
                ]}
                android_ripple={{ color: theme.colors.accentMuted }}
              >
                <Ionicons name="funnel-outline" size={20} color={theme.colors.accent} />
              </Pressable>
            </View>

            {debouncedQuery.trim() && (
              <Text
                style={[
                  styles.resultCount,
                  { color: theme.colors.textMuted, fontFamily: theme.typography.fontRegular },
                ]}
              >
                Showing {sortedAccounts.length} of {accounts.length} accounts
              </Text>
            )}
          </>
        )}

        <FlatList
          ref={flatListRef}
          key={animationKey}
          data={sortedAccounts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.screenPadding,
            paddingBottom: insets.bottom + 120,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            scrollPositionRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.accent}
              colors={[theme.colors.accent]}
            />
          }
          renderItem={({ item, index }) => {
            const isExpanded = expandedCards.has(item.id);
            const isHighlighted = highlightedAccountIds.has(item.id);

            const sortedFields = sortFieldsByOrder(
              schema.filter(
                (f) => f !== "id" && f !== "name" && f !== "createdAt" && f !== "updatedAt"
              )
            );

            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  duration: theme.animations.durationNormal,
                  delay: index * theme.animations.listItemStagger,
                }}
              >
                <Pressable
                  onPress={() => handleCardPress(item.id)}
                  onLongPress={() => handleLongPress(item.id)}
                  delayLongPress={500}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: isHighlighted
                        ? theme.colors.accent
                        : selectedAccounts.has(item.id)
                          ? theme.colors.accent
                          : theme.colors.surfaceBorder,
                      borderWidth:
                        isHighlighted || selectedAccounts.has(item.id)
                          ? theme.shapes.borderThick
                          : theme.shapes.borderThin,
                      borderRadius: theme.components.card.radius,
                      padding: theme.components.card.padding,
                    },
                  ]}
                  android_ripple={{ color: theme.colors.accentMuted }}
                >
                  {isSelectionMode && (
                    <View style={styles.selectionIndicator}>
                      <Ionicons
                        name={
                          selectedAccounts.has(item.id) ? "checkmark-circle" : "ellipse-outline"
                        }
                        size={24}
                        color={
                          selectedAccounts.has(item.id)
                            ? theme.colors.accent
                            : theme.colors.textMuted
                        }
                      />
                    </View>
                  )}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Ionicons name="person-circle" size={28} color={theme.colors.accent} />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            {
                              color: theme.colors.textPrimary,
                              fontFamily: theme.typography.fontBold,
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {item[displayField] || item.name || "Unnamed Account"}
                        </Text>
                        {isHighlighted && (
                          <Text
                            style={[
                              styles.matchBadge,
                              {
                                color: theme.colors.accent,
                                fontFamily: theme.typography.fontRegular,
                              },
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
                          color={theme.colors.textMuted}
                        />
                      </View>
                    )}
                  </View>
                  <AnimatePresence>
                    {isExpanded && !isSelectionMode && (
                      <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "timing", duration: theme.animations.durationFast }}
                      >
                        <View
                          style={[styles.cardBody, { borderTopColor: theme.colors.surfaceBorder }]}
                        >
                          {sortedFields.map((fieldName) => {
                            const value = item[fieldName];
                            const fieldKey = `${item.id}-${fieldName}`;
                            const isPassword = isPasswordField(fieldName);
                            const isPwVisible = visiblePw[fieldKey];
                            const fieldType = getFieldType(fieldName);
                            const isSensitive = isSensitiveField(fieldName);

                            let displayValue = value || "—";
                            if (fieldType === "date" && value) {
                              displayValue = formatDate(value, dateFormat);
                            } else if (fieldType === "phone" && value) {
                              displayValue = formatPhone(value, phoneFormat);
                            }

                            return (
                              <View key={fieldName} style={styles.fieldRow}>
                                <View style={styles.fieldLabelRow}>
                                  <Ionicons
                                    name={
                                      fieldType === "email"
                                        ? "mail-outline"
                                        : fieldType === "phone"
                                          ? "call-outline"
                                          : fieldType === "date"
                                            ? "calendar-outline"
                                            : isPassword
                                              ? "lock-closed-outline"
                                              : "text-outline"
                                    }
                                    size={14}
                                    color={
                                      isSensitive ? theme.colors.accent : theme.colors.textMuted
                                    }
                                  />
                                  <Text
                                    style={[
                                      styles.fieldLabel,
                                      {
                                        color: theme.colors.textSecondary,
                                        fontFamily: theme.typography.fontRegular,
                                      },
                                    ]}
                                  >
                                    {fieldName.charAt(0).toUpperCase() +
                                      fieldName.slice(1).replace(/_/g, " ")}
                                  </Text>
                                </View>
                                <View style={styles.fieldValueContainer}>
                                  <Text
                                    style={[
                                      styles.fieldValue,
                                      {
                                        color: theme.colors.textPrimary,
                                        fontFamily: theme.typography.fontRegular,
                                      },
                                    ]}
                                    selectable={!isPassword || isPwVisible}
                                  >
                                    {isPassword && !isPwVisible ? "••••••••" : displayValue}
                                  </Text>
                                  <View style={styles.fieldActions}>
                                    {isPassword && (
                                      <Pressable
                                        onPress={() => {
                                          setVisiblePw((prev) => ({
                                            ...prev,
                                            [fieldKey]: !prev[fieldKey],
                                          }));
                                          if (isAuthEnabled) {
                                            updateActivity();
                                          }
                                        }}
                                        style={styles.iconButton}
                                        android_ripple={{
                                          color: theme.colors.accentMuted,
                                        }}
                                      >
                                        <Ionicons
                                          name={isPwVisible ? "eye-off-outline" : "eye-outline"}
                                          size={18}
                                          color={theme.colors.textMuted}
                                        />
                                      </Pressable>
                                    )}
                                    <Pressable
                                      onPress={() =>
                                        copyToClipboard(
                                          isPassword && !isPwVisible ? value : displayValue,
                                          fieldKey
                                        )
                                      }
                                      style={styles.iconButton}
                                      android_ripple={{
                                        color: theme.colors.accentMuted,
                                      }}
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
                              </View>
                            );
                          })}
                          <View style={styles.cardActions}>
                            <Pressable
                              onPress={() => {
                                setAccModal({ visible: true, editing: item });
                                if (isAuthEnabled) {
                                  updateActivity();
                                }
                              }}
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: theme.colors.accentMuted,
                                  borderColor: theme.colors.accent,
                                  borderRadius: theme.components.button.radius,
                                },
                              ]}
                              android_ripple={{ color: theme.colors.accentMuted }}
                            >
                              <Ionicons
                                name="create-outline"
                                size={18}
                                color={theme.colors.accent}
                              />
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  {
                                    color: theme.colors.accent,
                                    fontFamily: theme.typography.fontBold,
                                  },
                                ]}
                              >
                                Edit
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                setDeleteModal({ visible: true, item });
                                if (isAuthEnabled) {
                                  updateActivity();
                                }
                              }}
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: theme.colors.error + "15",
                                  borderColor: theme.colors.error + "30",
                                  borderRadius: theme.components.button.radius,
                                },
                              ]}
                              android_ripple={{ color: theme.colors.error + "33" }}
                            >
                              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                              <Text
                                style={[
                                  styles.actionButtonText,
                                  {
                                    color: theme.colors.error,
                                    fontFamily: theme.typography.fontBold,
                                  },
                                ]}
                              >
                                Delete
                              </Text>
                            </Pressable>
                          </View>
                          {isConnectionSupportedPlatform &&
                            (() => {
                              const primaryEmail = getPrimaryEmail(item);
                              if (!primaryEmail) return null;
                              const connectedCount = countConnectedPlatforms(
                                database,
                                primaryEmail.value,
                                String(platformKey)
                              );
                              return (
                                <Pressable
                                  onPress={() => handleViewConnectedPlatforms(item)}
                                  style={[
                                    styles.connectedPlatformsButton,
                                    {
                                      backgroundColor:
                                        connectedCount > 0
                                          ? theme.colors.accentMuted
                                          : theme.colors.surface,
                                      borderColor:
                                        connectedCount > 0
                                          ? theme.colors.accent + "40"
                                          : theme.colors.surfaceBorder,
                                      borderRadius: theme.shapes.radiusMd,
                                    },
                                  ]}
                                  android_ripple={{ color: theme.colors.accentMuted }}
                                >
                                  <View style={styles.connectedPlatformsLeft}>
                                    <Ionicons
                                      name="link"
                                      size={20}
                                      color={
                                        connectedCount > 0
                                          ? theme.colors.accent
                                          : theme.colors.textMuted
                                      }
                                    />
                                    <View>
                                      <Text
                                        style={[
                                          styles.connectedPlatformsText,
                                          {
                                            color:
                                              connectedCount > 0
                                                ? theme.colors.accent
                                                : theme.colors.textPrimary,
                                            fontFamily: theme.typography.fontBold,
                                          },
                                        ]}
                                      >
                                        View Connected Platforms
                                      </Text>
                                      {connectedCount > 0 && (
                                        <Text
                                          style={[
                                            styles.connectedPlatformsCount,
                                            {
                                              color: theme.colors.accent,
                                              fontFamily: theme.typography.fontRegular,
                                            },
                                          ]}
                                        >
                                          Used in {connectedCount} other platform
                                          {connectedCount !== 1 ? "s" : ""}
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                  <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={theme.colors.textMuted}
                                  />
                                </Pressable>
                              );
                            })()}
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
                color={theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
                ]}
              >
                {debouncedQuery.trim()
                  ? "No accounts match your search."
                  : "No accounts yet. Tap + to add one!"}
              </Text>
            </View>
          }
        />
      </View>

      {isSelectionMode && selectedAccounts.size > 0 ? (
        <>
          <View style={[styles.fabContainer, { bottom: insets.bottom + 90 }]}>
            <FAB onPress={handleDeleteSelected} icon="trash" color={theme.colors.error} />
          </View>
          <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
            <FAB onPress={exitSelectionMode} icon="close" color={theme.colors.surfaceBorder} />
          </View>
        </>
      ) : (
        <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
          <FAB
            onPress={() => {
              setAccModal({ visible: true });
              if (isAuthEnabled) {
                updateActivity();
              }
            }}
            icon="add"
            color={theme.colors.buttonPrimary}
          />
        </View>
      )}

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
        platformKey={String(platformKey)}
        onSave={handleSaveSchema}
        onClose={() => setSchemaModal(false)}
      />

      <DeleteModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false })}
        onConfirm={executeDelete}
        title={deleteModal.item?.type === "multiple" ? "Delete Accounts?" : "Delete Account?"}
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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  headerButton: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 12,
  },
  headerTitle: {},
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  highlightBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 18,
    marginBottom: 12,
    marginTop: 12,
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
    marginTop: 12,
  },
  searchContainer: {
    flex: 1,
  },
  sortButton: {
    width: 48,
    height: 48,
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
  connectedPlatformsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
  },
  connectedPlatformsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  connectedPlatformsText: {
    fontSize: 14,
  },
  connectedPlatformsCount: {
    fontSize: 12,
    marginTop: 2,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
