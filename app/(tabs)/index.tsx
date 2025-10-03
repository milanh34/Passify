import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";

export default function PlatformListScreen() {
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const router = useRouter();
  const { database, isDbLoading, addPlatform, updatePlatformName, deletePlatform } = useDb();

  const [platformModal, setPlatformModal] = useState<{ visible: boolean; editing?: { key: string; name: string } }>({ visible: false });

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

  if (isDbLoading || !fontsLoaded) {
    return <View style={[styles.root, { backgroundColor: colors.bg[0] }]} />;
  }

  return (
    <LinearGradient colors={colors.bg} style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>Platforms</Text>
        <TouchableOpacity onPress={() => router.push("/settings")} style={[styles.settingsBtn, { borderColor: colors.cardBorder }]}>
          <Ionicons name="color-palette-outline" size={18} color={colors.accent} />
          <Text style={{ color: colors.subtext, fontFamily: fontConfig.bold }}>Theme</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={platforms}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
          <MotiView from={{ opacity: 0, scale: 0.95, translateY: 16 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} transition={{ type: "timing", duration: 300, delay: index * 80 }}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push({ pathname: "/(tabs)/accounts", params: { platform: item.name, key: item.key } })} activeOpacity={0.9}>
                <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>{item.name}</Text>
                <Text style={{ color: colors.subtext, fontFamily: fontConfig.regular }}>{item.count} accounts</Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => setPlatformModal({ visible: true, editing: item })} style={styles.iconBtn}>
                  <Ionicons name="pencil" size={18} color={colors.subtext} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert("Delete Platform", `Delete "${item.name}" and all accounts?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => deletePlatform(item.key) }])} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>
        )}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: "center", marginTop: 24, fontFamily: fontConfig.regular }}>No platforms yet</Text>}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 28 },
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
  cardTitle: { fontSize: 18 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 8, borderRadius: 12 },
});
