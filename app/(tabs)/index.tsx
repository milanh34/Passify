import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import SchemaModal from "../../src/components/SchemaModal";
import { useThemeColors } from "../../src/context/ThemeContext";

export default function PlatformList() {
  const t = useThemeColors();
  const router = useRouter();
  const { database, schemas, isDbLoading, addPlatform, updatePlatformName, deletePlatform, updatePlatformSchema } = useDb();

  const [platformModal, setPlatformModal] = useState<{ visible: boolean; editing?: { key: string; name: string } }>({ visible: false });
  const [schemaModal, setSchemaModal] = useState<{ visible: boolean; key?: string }>({ visible: false });

  const platforms = Object.keys(database).map((key) => ({
    key,
    name: key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    count: database[key].length,
  }));

  const onAdd = () => setPlatformModal({ visible: true });
  const onEditName = (item: { key: string; name: string }) => setPlatformModal({ visible: true, editing: item });
  const onEditSchema = (key: string) => setSchemaModal({ visible: true, key });
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

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: t.text }]}>Platforms</Text>
        <TouchableOpacity onPress={() => router.push("/settings")} style={[styles.settingsBtn, { borderColor: t.border }]}>
          <Ionicons name="color-palette-outline" size={18} color={t.active} />
          <Text style={{ color: t.subtext, fontWeight: "700" }}>Theme</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={platforms}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.cardBorder, shadowColor: t.shadow }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: "/(tabs)/accounts", params: { platform: item.name, key: item.key } })}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardTitle, { color: t.text }]}>{item.name}</Text>
              <Text style={{ color: t.subtext }}>{item.count} accounts</Text>
              <Text style={[styles.schemaHint, { color: t.muted }]}>
                Fields: {(schemas[item.key] || []).join(", ") || "name, password"}
              </Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => onEditSchema(item.key)} style={styles.iconBtn}>
                <Ionicons name="options-outline" size={20} color={t.active} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onEditName(item)} style={styles.iconBtn}>
                <Ionicons name="pencil" size={18} color={t.subtext} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.key, item.name)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={t.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: t.muted, textAlign: "center", marginTop: 24 }}>No platforms yet</Text>}
      />

      <FAB onPress={onAdd} icon="add" color={t.fab} />

      <FormModal
        visible={platformModal.visible}
        onClose={() => setPlatformModal({ visible: false })}
        onSubmit={savePlatform}
        title={platformModal.editing ? "Edit Platform" : "Add Platform"}
        fields={[{ name: "name", label: "Platform Name" }]}
        initialData={platformModal.editing ? { name: platformModal.editing.name } : {}}
      />

      <SchemaModal
        visible={schemaModal.visible}
        initialSchema={(schemaModal.key && schemas[schemaModal.key]) || []}
        onClose={() => setSchemaModal({ visible: false })}
        onSave={(fields) => {
          if (schemaModal.key) updatePlatformSchema(schemaModal.key, fields);
          setSchemaModal({ visible: false });
        }}
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
  schemaHint: { fontSize: 11, marginTop: 6 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 8, borderRadius: 12 },
});
