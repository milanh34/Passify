import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { useAuth } from "../../src/context/AuthContext";
import { useInactivityTracker } from "../../src/utils/inactivityTracker";
import { useAnimation } from "../../src/context/AnimationContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import DeleteModal from "../../src/components/DeleteModal";
import Toast from "../../src/components/Toast";
import SearchBar from "../../src/components/SearchBar";
import SortModal from "../../src/components/SortModal";
import PlatformIcon from "../../src/components/PlatformIcon";
import { toTitleCase } from "@/src/utils/transferParser";
import { searchPlatforms, debounce } from "../../src/utils/searchFilter";
import { sortPlatforms, SortOption } from "../../src/utils/sortPlatforms";
import AsyncStorage from "@react-native-async-storage/async-storage";


const SORT_PREFERENCE_KEY = "@PM:sort_preference";


export default function ManageScreen() {
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const router = useRouter();
  const {
    database,
    platformsMetadata,
    isDbLoading,
    addPlatform,
    updatePlatformName,
    deletePlatform,
  } = useDb();
  const insets = useSafeAreaInsets();


  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);


  const { TAB_ANIMATION } = useAnimation();


  const [animationKey, setAnimationKey] = useState(0);


  const [platformModal, setPlatformModal] = useState<{
    visible: boolean;
    editing?: { key: string; name: string };
  }>({ visible: false });
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    item?: any;
  }>({ visible: false });


  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);


  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");


  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");


  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [sortModalVisible, setSortModalVisible] = useState(false);


  const [refreshing, setRefreshing] = useState(false);


  useFocusEffect(
    useCallback(() => {
      setAnimationKey((prev) => prev + 1);


      const loadSortPreference = async () => {
        try {
          const saved = await AsyncStorage.getItem(SORT_PREFERENCE_KEY);
          if (saved) {
            setSortOption(saved as SortOption);
          }
        } catch (error) {
          console.error("Failed to load sort preference:", error);
        }
      };
      loadSortPreference();


      setIsSelectionMode(false);
      setSelectedPlatforms(new Set());


      if (isAuthEnabled) {
        updateActivity();
      }
    }, [isAuthEnabled, updateActivity])
  );


  const debouncedSetQuery = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedQuery(query);
      }, 300),
    []
  );


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSetQuery(text);
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


  const handleSortSelect = async (option: SortOption) => {
    setSortOption(option);
    try {
      await AsyncStorage.setItem(SORT_PREFERENCE_KEY, option);
    } catch (error) {
      console.error("Failed to save sort preference:", error);
    }
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    handleClearSearch();
    setIsSelectionMode(false);
    setSelectedPlatforms(new Set());
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  const platforms = useMemo(() => {
    return Object.keys(database).map((key) => {
      const accounts = database[key];
      const platformName =
        accounts.length > 0 && accounts[0].platform
          ? accounts[0].platform
          : toTitleCase(key.replace(/_/g, " "));
      return {
        key,
        name: platformName,
        count: accounts.length,
        createdAt: platformsMetadata?.[key]?.createdAt || 0,
        icon: platformsMetadata?.[key]?.icon || null,
        iconColor: platformsMetadata?.[key]?.iconColor || null,
      };
    });
  }, [database, platformsMetadata]);


  const searchResults = useMemo(() => {
    return searchPlatforms(platforms, database, debouncedQuery);
  }, [platforms, database, debouncedQuery]);


  const sortedPlatforms = useMemo(() => {
    const platformsToSort = searchResults.map((result) => result.platform);
    return sortPlatforms(platformsToSort, sortOption, platformsMetadata);
  }, [searchResults, sortOption, platformsMetadata]);


  const searchMatchMap = useMemo(() => {
    const map = new Map<
      string,
      { matchType: "platform" | "account"; matchedAccounts?: any[] }
    >();
    searchResults.forEach((result) => {
      map.set(result.platform.key, {
        matchType: result.matchType,
        matchedAccounts: result.matchedAccounts,
      });
    });
    return map;
  }, [searchResults]);


  const savePlatform = (data: Record<string, any>) => {
    const name = data.name?.trim();
    if (!name) return;


    if (platformModal.editing) {
      updatePlatformName(platformModal.editing.key, name);
      showToastMessage("Platform updated successfully");
    } else {
      addPlatform(name);
      showToastMessage("Platform added successfully");
    }
    setPlatformModal({ visible: false });
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const handleLongPress = (platformKey: string) => {
    setIsSelectionMode(true);
    setSelectedPlatforms(new Set([platformKey]));
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const handlePlatformPress = (platformKey: string, platformName: string) => {
    if (isAuthEnabled) {
      updateActivity();
    }


    if (!isSelectionMode) {
      const matchInfo = searchMatchMap.get(platformKey);
      const hasMatchedAccounts =
        debouncedQuery.trim() &&
        matchInfo?.matchType === "account" &&
        matchInfo.matchedAccounts &&
        matchInfo.matchedAccounts.length > 0;


      if (hasMatchedAccounts) {
        const matchedIds = matchInfo.matchedAccounts!.map((acc) => acc.id);
        router.push({
          pathname: "/(tabs)/accounts",
          params: {
            platform: platformName,
            key: platformKey,
            matchedAccountIds: JSON.stringify(matchedIds),
            searchQuery: debouncedQuery,
          },
        });
      } else {
        router.push({
          pathname: "/(tabs)/accounts",
          params: { platform: platformName, key: platformKey },
        });
      }
    } else {
      setSelectedPlatforms((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(platformKey)) {
          newSet.delete(platformKey);
        } else {
          newSet.add(platformKey);
        }
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
        return newSet;
      });
    }
  };


  const selectAllPlatforms = () => {
    const allKeys = sortedPlatforms.map((p) => p.key);
    setSelectedPlatforms(new Set(allKeys));
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const deselectAllPlatforms = () => {
    setSelectedPlatforms(new Set());
    setIsSelectionMode(false);
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const handleDeleteSelected = () => {
    setDeleteModal({
      visible: true,
      item: {
        type: "multiple",
        keys: Array.from(selectedPlatforms),
        count: selectedPlatforms.size,
      },
    });
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPlatforms(new Set());
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  const executeDelete = () => {
    if (deleteModal.item?.type === "multiple") {
      const count = deleteModal.item.count;
      deleteModal.item.keys.forEach((key: string) => {
        deletePlatform(key);
      });
      exitSelectionMode();
      showToastMessage(`Successfully deleted ${count} platform(s)`, "success");
    } else if (deleteModal.item?.key) {
      deletePlatform(deleteModal.item.key);
      showToastMessage("Platform deleted successfully", "success");
    }
    setDeleteModal({ visible: false });
    if (isAuthEnabled) {
      updateActivity();
    }
  };


  if (isDbLoading || !fontsLoaded) {
    return (
      <View
        style={{
          ...styles.root,
          backgroundColor: colors.bg[0],
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }


  return (
    <View
      style={{
        ...styles.root,
        backgroundColor: colors.bg[0],
        paddingTop: insets.top,
      }}
    >
      <MotiView
        key={animationKey}
        from={TAB_ANIMATION.from}
        animate={TAB_ANIMATION.animate}
        transition={{
          type: TAB_ANIMATION.type,
          duration: TAB_ANIMATION.duration,
        }}
        style={{ flex: 1 }}
      >
        <View style={styles.headerRow}>
          <Text
            style={{
              ...styles.title,
              color: colors.text,
              fontFamily: fontConfig.bold,
            }}
          >
            {isSelectionMode ? `${selectedPlatforms.size} Selected` : "Manage"}
          </Text>
          {isSelectionMode ? (
            selectedPlatforms.size === sortedPlatforms.length ? (
              <Pressable
                onPress={deselectAllPlatforms}
                style={[
                  styles.selectAllBtn,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.card,
                  },
                ]}
                android_ripple={{ color: colors.accent + "33" }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text
                  style={{
                    ...styles.selectAllText,
                    color: colors.accent,
                    fontFamily: fontConfig.bold,
                  }}
                >
                  Deselect All
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={selectAllPlatforms}
                style={[
                  styles.selectAllBtn,
                  {
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.card,
                  },
                ]}
                android_ripple={{ color: colors.accent + "33" }}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text
                  style={{
                    ...styles.selectAllText,
                    color: colors.accent,
                    fontFamily: fontConfig.bold,
                  }}
                >
                  Select All
                </Text>
              </Pressable>
            )
          ) : (
            <Pressable
              onPress={() => router.push("/customize")}
              style={[
                styles.settingsBtn,
                {
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.card,
                },
              ]}
              android_ripple={{ color: colors.accent + "33" }}
            >
              <Ionicons
                name="color-palette-outline"
                size={18}
                color={colors.accent}
              />
              <Text
                style={{
                  ...styles.settingsBtnText,
                  color: colors.accent,
                  fontFamily: fontConfig.regular,
                }}
              >
                Customize
              </Text>
            </Pressable>
          )}
        </View>


        {!isSelectionMode && (
          <View style={styles.searchSortRow}>
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={handleSearchChange}
                onClear={handleClearSearch}
                suggestions={platforms.map((p) => p.name)}
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
        )}


        {!isSelectionMode && debouncedQuery.trim() && (
          <Text
            style={{
              ...styles.resultCount,
              color: colors.muted,
              fontFamily: fontConfig.regular,
            }}
          >
            Showing {sortedPlatforms.length} of {platforms.length} platforms
          </Text>
        )}


        <FlatList
          data={sortedPlatforms}
          keyExtractor={(i) => i.key}
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
            const matchInfo = searchMatchMap.get(item.key);
            const showAccountMatchIndicator =
              debouncedQuery.trim() &&
              matchInfo?.matchType === "account" &&
              matchInfo.matchedAccounts &&
              matchInfo.matchedAccounts.length > 0;


            return (
              <Pressable
                onPress={() => handlePlatformPress(item.key, item.name)}
                onLongPress={() => handleLongPress(item.key)}
                delayLongPress={500}
                android_ripple={{ color: colors.accent + "22" }}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: selectedPlatforms.has(item.key)
                      ? colors.accent
                      : colors.cardBorder,
                    borderWidth: selectedPlatforms.has(item.key) ? 2 : 1,
                  },
                ]}
              >
                {isSelectionMode && (
                  <View style={styles.selectionIndicator}>
                    <Ionicons
                      name={
                        selectedPlatforms.has(item.key)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={24}
                      color={
                        selectedPlatforms.has(item.key)
                          ? colors.accent
                          : colors.muted
                      }
                    />
                  </View>
                )}


                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <PlatformIcon
                      platformName={item.name}
                      iconKey={item.icon}
                      iconColor={item.iconColor}
                      size={48}
                    />
                    <View style={styles.cardInfo}>
                      <Text
                        style={{
                          ...styles.cardTitle,
                          color: colors.text,
                          fontFamily: fontConfig.bold,
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          ...styles.cardSubtitle,
                          color: colors.subtext,
                          fontFamily: fontConfig.regular,
                        }}
                      >
                        {item.count} account{item.count !== 1 ? "s" : ""}
                      </Text>
                      {showAccountMatchIndicator && (
                        <Text
                          style={{
                            ...styles.matchIndicator,
                            color: colors.accent,
                            fontFamily: fontConfig.regular,
                          }}
                        >
                          <Ionicons
                            name="search"
                            size={12}
                            color={colors.accent}
                          />{" "}
                          {matchInfo.matchedAccounts!.length} matching account
                          {matchInfo.matchedAccounts!.length !== 1 ? "s" : ""}
                        </Text>
                      )}
                    </View>
                  </View>


                  {!isSelectionMode && (
                    <View style={styles.actions}>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setPlatformModal({
                            visible: true,
                            editing: item,
                          });
                          if (isAuthEnabled) {
                            updateActivity();
                          }
                        }}
                        style={styles.iconBtn}
                        android_ripple={{ color: colors.accent + "33" }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={colors.text}
                        />
                      </Pressable>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            visible: true,
                            item,
                          });
                          if (isAuthEnabled) {
                            updateActivity();
                          }
                        }}
                        style={styles.iconBtn}
                        android_ripple={{ color: colors.danger + "33" }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={colors.danger}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  debouncedQuery.trim()
                    ? "search-outline"
                    : "folder-open-outline"
                }
                size={64}
                color={colors.muted}
              />
              <Text
                style={{
                  ...styles.emptyText,
                  color: colors.subtext,
                  fontFamily: fontConfig.regular,
                }}
              >
                {debouncedQuery.trim()
                  ? "No platforms or accounts match your search."
                  : "No platforms yet. Tap + to add one!"}
              </Text>
            </View>
          }
        />
      </MotiView>


      {isSelectionMode && selectedPlatforms.size > 0 ? (
        <>
          <View style={{ ...styles.fabContainer, bottom: insets.bottom + 90 }}>
            <FAB
              onPress={handleDeleteSelected}
              icon="trash"
              color={colors.danger}
            />
          </View>
          <View style={{ ...styles.fabContainer, bottom: insets.bottom + 20 }}>
            <FAB
              onPress={exitSelectionMode}
              icon="close"
              color={colors.cardBorder}
            />
          </View>
        </>
      ) : (
        <View style={{ ...styles.fabContainer, bottom: insets.bottom + 20 }}>
          <FAB
            onPress={() => {
              setPlatformModal({ visible: true });
              if (isAuthEnabled) {
                updateActivity();
              }
            }}
            icon="add"
            color={colors.fab}
          />
        </View>
      )}


      <FormModal
        visible={platformModal.visible}
        onClose={() => setPlatformModal({ visible: false })}
        onSubmit={savePlatform}
        title={platformModal.editing ? "Edit Platform" : "Add Platform"}
        fields={[{ name: "name", label: "Platform Name" }]}
        initialData={
          platformModal.editing ? { name: platformModal.editing.name } : {}
        }
      />
      <DeleteModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false })}
        onConfirm={executeDelete}
        title={
          deleteModal.item?.type === "multiple"
            ? "Delete Platforms?"
            : "Delete Platform?"
        }
        description={
          deleteModal.item?.type === "multiple"
            ? `Are you sure you want to delete ${deleteModal.item.count} platform(s)? This will remove all associated accounts.`
            : `Are you sure you want to delete "${deleteModal.item?.name}" and all associated accounts? This action cannot be undone.`
        }
      />
      <SortModal
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 16,
    paddingVertical: 10,
  },
  title: { fontSize: 30 },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingsBtnText: {
    fontSize: 14,
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectAllText: {
    fontSize: 14,
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
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: { fontSize: 18 },
  cardSubtitle: { fontSize: 14, marginTop: 4 },
  matchIndicator: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: { padding: 8, borderRadius: 10 },
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
