import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import { useTheme } from "../../src/context/ThemeContext";

export default function PlatformListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { database, isDbLoading, addPlatform, updatePlatformName, deletePlatform } = useDb();

  const [platformModal, setPlatformModal] = useState<{ visible: boolean; editing?: { key: string; name: string } }>({ visible: false });

  const platforms = Object.keys(database).map((key) => ({
    key,
    name: key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    count: database[key].length,
  }));

  const openAdd = () => setPlatformModal({ visible: true });
  const openEditName = (item: { key: string; name: string }) => setPlatformModal({ visible: true, editing: item });
  const onDelete = (key: string, name: string) =>
    Alert.alert("Delete Platform", `Delete "${name}" and all accounts?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePlatform(key) },
    ]);

  const savePlatform = (data: Record<string, string>) => {
    const name = data.name?.trim();
    if (!name) return;
    if (platformModal.editing) {
      updatePlatformName(platformModal.editing.key, name);
    } else {
      addPlatform(name);
    }
  };

  if (isDbLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Platforms</Text>
        <TouchableOpacity onPress={() => router.push("/settings")} style={[styles.settingsBtn, { borderColor: colors.cardBorder }]}>
          <Ionicons name="color-palette-outline" size={18} color={colors.active} />
          <Text style={{ color: colors.subtext, fontWeight: "700" }}>Theme</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={platforms}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: "/(tabs)/accounts", params: { platform: item.name, key: item.key } })}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              <Text style={{ color: colors.subtext }}>{item.count} accounts</Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditName(item)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={18} color={colors.subtext} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.key, item.name)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: "center", marginTop: 24 }}>No platforms yet</Text>}
      />

      <FAB onPress={openAdd} icon="add" color={colors.fab} />

      <FormModal
        visible={platformModal.visible}
        onClose={() => setPlatformModal({ visible: false })}
        onSubmit={savePlatform}
        title={platformModal.editing ? "Edit Platform" : "Add Platform"}
        fields={[{ name: "name", label: "Platform Name" }]}
        initialData={platformModal.editing ? { name: platformModal.editing.name } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800" },
  settingsBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 6,
    flexDirection: "row",
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 8, borderRadius: 12 },
});
