import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import { Ionicons } from "@expo/vector-icons";

export default function PlatformListScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const { database, isDbLoading, addPlatform, updatePlatformName, deletePlatform } = useDb();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<{ key: string; name: string } | null>(null);

  const platforms = React.useMemo(() => Object.keys(database).map(key => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
    count: database[key].length
  })), [database]);

  const handleOpenAddModal = () => {
    setEditingPlatform(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (platform: { key: string; name: string }) => {
    setEditingPlatform(platform);
    setModalVisible(true);
  };

  const handleDelete = (key: string, name: string) => {
    Alert.alert("Delete Platform", `Are you sure you want to delete "${name}" and all its accounts?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePlatform(key) },
    ]);
  };

  const handleSavePlatform = (data: { name: string }) => {
    if (editingPlatform) {
      updatePlatformName(editingPlatform.key, data.name);
    } else {
      addPlatform(data.name);
    }
  };

  const bg = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const cardBg = scheme === "dark" ? "#1f2937" : "#fff";
  const accent = scheme === "dark" ? "#22d3ee" : "#4f46e5";

  if (isDbLoading) return <View style={[styles.root, { backgroundColor: bg }]}><Text style={{ color: text }}>Loading...</Text></View>;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <FlatList
        data={platforms}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={<Text style={[styles.title, { color: text }]}>Your Platforms</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: "/(tabs)/accounts", params: { platform: item.name, key: item.key } })}
          >
            <View>
              <Text style={[styles.cardTitle, { color: text }]}>{item.name}</Text>
              <Text style={[styles.cardSub, { color: sub }]}>{item.count} accounts</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleOpenEditModal(item)}><Ionicons name="pencil" size={20} color={sub} /></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.key, item.name)}><Ionicons name="trash-outline" size={22} color="#ef4444" /></TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <FAB onPress={handleOpenAddModal} />
      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSavePlatform}
        title={editingPlatform ? "Edit Platform" : "Add New Platform"}
        fields={[{ name: "name", label: "Platform Name" }]}
        initialData={editingPlatform ? { name: editingPlatform.name } : {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.OS === 'android' ? 30 : 50, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { fontSize: 14, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 20, alignItems: 'center' },
});
