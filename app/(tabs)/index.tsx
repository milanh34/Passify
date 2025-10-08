import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
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

export default function ManageScreen() {
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const router = useRouter();
  const { database, isDbLoading, addPlatform, updatePlatformName, deletePlatform } = useDb();
  const insets = useSafeAreaInsets();

  const [platformModal, setPlatformModal] = useState<{ visible: boolean; editing?: { key: string; name: string } }>({ visible: false });
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; item?: any }>({ visible: false });

  const platforms = Object.keys(database).map((key) => ({
    key,
    name: key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    count: database[key].length,
  }));

  const savePlatform = (data: Record<string, string>) => {
    const name = data.name?.trim();
    if (!name) return;
    if (platformModal.editing) updatePlatformName(platformModal.editing.key, name);
    else addPlatform(name);
  };

  const confirmDelete = (item: any) => setDeleteModal({ visible: true, item });
  const executeDelete = () => {
    if (deleteModal.item) deletePlatform(deleteModal.item.key);
  };

  if (isDbLoading || !fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: colors.bg[0] }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Manage</Text>
        <MotiPressable whileTap={{ scale: 0.95 }}>
          <Pressable
            onPress={() => router.push("/customize")}
            style={[styles.settingsBtn, { borderColor: colors.cardBorder }]}
            android_ripple={{ color: colors.accent + "33" }}
          >
            <Ionicons name="color-palette-outline" size={18} color={colors.accent} />
            <Text style={{ color: colors.subtext, fontFamily: fontConfig.bold }}>Theme</Text>
          </Pressable>
        </MotiPressable>
      </View>

      <FlatList
        data={platforms}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, scale: 0.96, translateY: 16 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 320, delay: index * 70 }}
          >
            <MotiPressable whileTap={{ scale: 0.98 }}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/accounts",
                    params: { platform: item.name, key: item.key },
                  })
                }
                onLongPress={() => {}}
                android_ripple={{ color: colors.accent + "22" }}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                    {item.name}
                  </Text>
                  <Text style={{ color: colors.subtext, fontFamily: fontConfig.regular }}>{item.count} accounts</Text>
                </View>
                <View style={styles.actions}>
                  <MotiPressable whileTap={{ scale: 0.92 }}>
                    <Pressable
                      onPress={() => setPlatformModal({ visible: true, editing: item })}
                      style={styles.iconBtn}
                      android_ripple={{ color: colors.accent + "33" }}
                    >
                      <Ionicons name="pencil" size={18} color={colors.subtext} />
                    </Pressable>
                  </MotiPressable>
                  <MotiPressable whileTap={{ scale: 0.92 }}>
                    <Pressable
                      onPress={() => confirmDelete(item)}
                      style={styles.iconBtn}
                      android_ripple={{ color: colors.danger + "33" }}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </Pressable>
                  </MotiPressable>
                </View>
              </Pressable>
            </MotiPressable>
          </MotiView>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.subtext, textAlign: "center", marginTop: 24, fontFamily: fontConfig.regular }}>
            No platforms yet
          </Text>
        }
      />

      <FAB onPress={() => setPlatformModal({ visible: true })} icon="add" color={colors.fab} />

      <FormModal
        visible={platformModal.visible}
        onClose={() => setPlatformModal({ visible: false })}
        onSubmit={savePlatform}
        title={platformModal.editing ? "Edit Platform" : "Add Platform"}
        fields={[{ name: "name", label: "Platform Name" }]}
        initialData={platformModal.editing ? { name: platformModal.editing.name } : {}}
      />

      <DeleteModal
        visible={deleteModal.visible}
        onClose={() => setDeleteModal({ visible: false })}
        onConfirm={executeDelete}
        title="Delete Platform?"
        description={`Are you sure you want to delete "${deleteModal.item?.name}" and all associated accounts? This action cannot be undone.`}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingVertical: 10 },
  title: { fontSize: 30 },
  settingsBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden" },
  cardTitle: { fontSize: 18 },
  actions: { flexDirection: "row", alignItems: "center", paddingRight: 6, gap: 6 },
  iconBtn: { padding: 8, borderRadius: 10 },
});
