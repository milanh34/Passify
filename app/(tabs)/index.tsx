import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  
  const confirmDelete = (item: any) => setDeleteModal({ visible: true, item: item });
  const executeDelete = () => { if (deleteModal.item) deletePlatform(deleteModal.item.key); };

  if (isDbLoading || !fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: colors.bg[0] }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Manage</Text>
        <MotiPressable onPress={() => router.push("/settings")} animate={{ scale: 1 }} transition={{ type: 'spring' }} whileTap={{ scale: 0.95 }}>
          <View style={[styles.settingsBtn, { borderColor: colors.cardBorder }]}>
            <Ionicons name="color-palette-outline" size={18} color={colors.accent} />
            <Text style={{ color: colors.subtext, fontFamily: fontConfig.bold }}>Theme</Text>
          </View>
        </MotiPressable>
      </View>

      <FlatList
        data={platforms}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        renderItem={({ item, index }) => (
          <MotiView from={{ opacity: 0, scale: 0.9, translateY: 20 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} transition={{ type: "timing", duration: 350, delay: index * 80 }}>
            <MotiPressable onPress={() => router.push({ pathname: "/(tabs)/accounts", params: { platform: item.name, key: item.key } })} animate={{ scale: 1 }} transition={{ type: 'spring' }} whileTap={{ scale: 0.98 }}>
              <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>{item.name}</Text>
                  <Text style={{ color: colors.subtext, fontFamily: fontConfig.regular }}>{item.count} accounts</Text>
                </View>
                <View style={styles.actions}>
                  <MotiPressable animate={{ scale: 1 }} transition={{ type: 'spring' }} whileTap={{ scale: 0.9 }}>
                    <TouchableOpacity onPress={() => setPlatformModal({ visible: true, editing: item })} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color={colors.subtext} />
                    </TouchableOpacity>
                  </MotiPressable>
                  <MotiPressable animate={{ scale: 1 }} transition={{ type: 'spring' }} whileTap={{ scale: 0.9 }}>
                    <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </MotiPressable>
                </View>
              </View>
            </MotiPressable>
          </MotiView>
        )}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: "center", marginTop: 24, fontFamily: fontConfig.regular }}>No platforms yet</Text>}
      />

      <FAB onPress={() => setPlatformModal({ visible: true })} icon="add" color={colors.fab} />
      <FormModal visible={platformModal.visible} onClose={() => setPlatformModal({ visible: false })} onSubmit={savePlatform} title={platformModal.editing ? "Edit Platform" : "Add Platform"} fields={[{ name: "name", label: "Platform Name" }]} initialData={platformModal.editing ? { name: platformModal.editing.name } : {}} />
      <DeleteModal visible={deleteModal.visible} onClose={() => setDeleteModal({ visible: false })} onConfirm={executeDelete} title="Delete Platform?" description={`Are you sure you want to delete "${deleteModal.item?.name}" and all associated accounts? This action cannot be undone.`} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingVertical: 10 },
  title: { fontSize: 32 },
  settingsBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  card: { borderRadius: 20, marginBottom: 16, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 10, flexDirection: "row", overflow: 'hidden' },
  cardContent: { flex: 1, padding: 20 },
  cardTitle: { fontSize: 18 },
  actions: { flexDirection: "row", alignItems: "center", paddingRight: 10 },
  iconBtn: { padding: 8, borderRadius: 12 },
});
