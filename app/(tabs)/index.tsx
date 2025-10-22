import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import DeleteModal from "../../src/components/DeleteModal";
import Toast from "../../src/components/Toast";
import { useAnimation } from "../../src/context/AnimationContext";
import { toTitleCase } from "@/src/utils/transferParser";

export default function ManageScreen() {
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const router = useRouter();
  const {
    database,
    isDbLoading,
    addPlatform,
    updatePlatformName,
    deletePlatform,
  } = useDb();
  const insets = useSafeAreaInsets();

  const [platformModal, setPlatformModal] = useState<{
    visible: boolean;
    editing?: { key: string; name: string };
  }>({ visible: false });
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    item?: any;
  }>({ visible: false });
  const [animationKey, setAnimationKey] = useState(0);
  const { TAB_ANIMATION } = useAnimation();

  // Multi-select state
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
      setIsSelectionMode(false);
      setSelectedPlatforms(new Set());
    }, [])
  );

  // Helper to show toast
  const showToastMessage = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const platforms = Object.keys(database).map((key) => {
    const accounts = database[key];
    const platformName =
      accounts.length > 0 && accounts[0].platform
        ? accounts[0].platform
        : toTitleCase(key.replace(/_/g, " "));

    return {
      key,
      name: platformName,
      count: accounts.length,
    };
  });

  const savePlatform = (data: Record<string, any>) => {
    const name = data.name?.trim();
    if (!name) return;

    if (platformModal.editing) {
      updatePlatformName(platformModal.editing.key, name);
    } else {
      addPlatform(name);
    }

    setPlatformModal({ visible: false });
  };

  // Long press handler to enter selection mode
  const handleLongPress = (platformKey: string) => {
    setIsSelectionMode(true);
    setSelectedPlatforms(new Set([platformKey]));
  };

  // Toggle selection in selection mode, or navigate normally
  const handlePlatformPress = (platformKey: string, platformName: string) => {
    if (!isSelectionMode) {
      // Normal tap - navigate to accounts
      router.push({
        pathname: "/(tabs)/accounts",
        params: { platform: platformName, key: platformKey },
      });
    } else {
      // Selection mode - toggle selection
      setSelectedPlatforms((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(platformKey)) {
          newSet.delete(platformKey);
        } else {
          newSet.add(platformKey);
        }

        // Exit selection mode if no items selected
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }

        return newSet;
      });
    }
  };

  // Select all platforms
  const selectAllPlatforms = () => {
    const allKeys = platforms.map((p) => p.key);
    setSelectedPlatforms(new Set(allKeys));
  };

  // Delete selected platforms
  const handleDeleteSelected = () => {
    setDeleteModal({
      visible: true,
      item: {
        type: "multiple",
        keys: Array.from(selectedPlatforms),
        count: selectedPlatforms.size,
      },
    });
  };

  // Exit selection mode
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPlatforms(new Set());
  };

  // Execute delete
  const executeDelete = () => {
    if (deleteModal.item?.type === "multiple") {
      // Delete multiple platforms
      const count = deleteModal.item.count;
      deleteModal.item.keys.forEach((key: string) => {
        deletePlatform(key);
      });
      exitSelectionMode();
      showToastMessage(`Successfully deleted ${count} platform(s)`, "success");
    } else if (deleteModal.item?.key) {
      // Delete single platform
      deletePlatform(deleteModal.item.key);
      showToastMessage("Platform deleted successfully", "success");
    }
    setDeleteModal({ visible: false });
  };

  if (isDbLoading || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg[0] }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <LinearGradient colors={colors.bg} style={{ flex: 1 }}>
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
          <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  { color: colors.text, fontFamily: fontConfig.bold },
                ]}
              >
                {isSelectionMode
                  ? `${selectedPlatforms.size} Selected`
                  : "Manage"}
              </Text>
              {isSelectionMode ? (
                // Show Select All / Deselect All based on selection
                selectedPlatforms.size === platforms.length ? (
                  <MotiPressable whileTap={{ scale: 0.95 }}>
                    <Pressable
                      onPress={exitSelectionMode}
                      style={[
                        styles.selectAllBtn,
                        {
                          borderColor: colors.accent,
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
                          color: colors.accent,
                          fontFamily: fontConfig.bold,
                          fontSize: 14,
                        }}
                      >
                        Deselect All
                      </Text>
                    </Pressable>
                  </MotiPressable>
                ) : (
                  <MotiPressable whileTap={{ scale: 0.95 }}>
                    <Pressable
                      onPress={selectAllPlatforms}
                      style={[
                        styles.selectAllBtn,
                        {
                          borderColor: colors.accent,
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
                          color: colors.accent,
                          fontFamily: fontConfig.bold,
                          fontSize: 14,
                        }}
                      >
                        Select All
                      </Text>
                    </Pressable>
                  </MotiPressable>
                )
              ) : (
                <MotiPressable whileTap={{ scale: 0.95 }}>
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
                        color: colors.text,
                        fontFamily: fontConfig.bold,
                        fontSize: 12,
                      }}
                    >
                      Theme
                    </Text>
                  </Pressable>
                </MotiPressable>
              )}
            </View>

            {/* Platform List */}
            <FlatList
              data={platforms}
              keyExtractor={(i) => i.key}
              contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
              renderItem={({ item, index }) => (
                <MotiView
                  from={{ opacity: 0, scale: 0.96, translateY: 16 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 320,
                    delay: index * 70,
                  }}
                >
                  <MotiPressable whileTap={{ scale: 0.98 }}>
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
                      {/* Selection indicator */}
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
                                : colors.subtext
                            }
                          />
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: colors.text, fontFamily: fontConfig.bold },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={{
                            color: colors.subtext,
                            fontFamily: fontConfig.regular,
                          }}
                        >
                          {item.count} account{item.count !== 1 ? "s" : ""}
                        </Text>
                      </View>

                      {/* Action buttons - only show when NOT in selection mode */}
                      {!isSelectionMode && (
                        <View style={styles.actions}>
                          <MotiPressable whileTap={{ scale: 0.92 }}>
                            <Pressable
                              onPress={() =>
                                setPlatformModal({
                                  visible: true,
                                  editing: item,
                                })
                              }
                              style={styles.iconBtn}
                              android_ripple={{ color: colors.accent + "33" }}
                            >
                              <Ionicons
                                name="pencil"
                                size={18}
                                color={colors.subtext}
                              />
                            </Pressable>
                          </MotiPressable>
                        </View>
                      )}
                    </Pressable>
                  </MotiPressable>
                </MotiView>
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    color: colors.subtext,
                    textAlign: "center",
                    marginTop: 50,
                    fontFamily: fontConfig.regular,
                  }}
                >
                  No platforms yet. Tap + to add one!
                </Text>
              }
            />

            {/* FAB buttons */}
            {isSelectionMode && selectedPlatforms.size > 0 ? (
              <>
                {/* Delete button when in selection mode */}
                <FAB
                  onPress={handleDeleteSelected}
                  icon="trash"
                  color="#EF4444"
                  style={{ position: "absolute", bottom: 24, right: 20 }}
                />
                {/* Cancel button */}
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 200 }}
                >
                  <FAB
                    onPress={exitSelectionMode}
                    icon="close"
                    color={colors.subtext}
                    style={{ position: "absolute", bottom: 100, right: 20 }}
                  />
                </MotiView>
              </>
            ) : (
              /* Normal add button */
              <FAB
                onPress={() => setPlatformModal({ visible: true })}
                icon="add"
                color={colors.fab}
              />
            )}

            {/* Modals */}
            <FormModal
              visible={platformModal.visible}
              onClose={() => setPlatformModal({ visible: false })}
              onSubmit={savePlatform}
              title={platformModal.editing ? "Edit Platform" : "Add Platform"}
              fields={[{ name: "name", label: "Platform Name" }]}
              initialData={
                platformModal.editing
                  ? { name: platformModal.editing.name }
                  : {}
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

            <Toast
              message={toastMessage}
              visible={showToast}
              type={toastType}
            />
          </View>
        </MotiView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
    position: "relative",
  },
  cardTitle: { fontSize: 18 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 6,
    gap: 6,
  },
  iconBtn: { padding: 8, borderRadius: 10 },
  selectionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
});
