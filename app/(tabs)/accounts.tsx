import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, useColorScheme, Platform, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import { Ionicons } from "@expo/vector-icons";

type Account = { id: string; name: string; email?: string; username?: string; password: string };

export default function AccountsScreen() {
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const { platform, key: platformKey } = useLocalSearchParams<{ platform: string; key: string }>();
  
  const { database, addAccount, updateAccount, deleteAccount, updatePlatformName } = useDb();
  const accounts: Account[] = platformKey ? database[String(platformKey)] ?? [] : [];

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [platformModalVisible, setPlatformModalVisible] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setPlatformModalVisible(true)} style={{ marginRight: 15 }}>
          <Ionicons name="cog-outline" size={24} color={scheme === 'dark' ? '#fff' : '#000'} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, scheme]);

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setEditingAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (accountId: string, name: string) => {
    Alert.alert("Delete Account", `Are you sure you want to delete the account "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => platformKey && deleteAccount(String(platformKey), accountId) },
    ]);
  };
  
  const handleSaveAccount = (data: Record<string, string>) => {
    if (!platformKey) return;
    const accountData = {
      id: editingAccount?.id || '',
      name: data.name || 'No Name',
      email: data.email,
      username: data.username,
      password: data.password || 'password'
    };
    if (editingAccount) {
      updateAccount(String(platformKey), editingAccount.id, accountData);
    } else {
      addAccount(String(platformKey), accountData);
    }
  };

  const handleSavePlatform = (data: { name: string }) => {
    if (platformKey) {
      updatePlatformName(String(platformKey), data.name);
      navigation.setOptions({ title: data.name }); // Update header immediately
    }
  };

  const togglePassword = (id: string) => setVisiblePasswords(p => ({ ...p, [id]: !p[id] }));

  const bg = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const cardBg = scheme === "dark" ? "#1f2937" : "#fff";
  const accent = scheme === "dark" ? "#22d3ee" : "#4f46e5";

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: text }]}>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleOpenEditModal(item)}><Ionicons name="pencil" size={20} color={sub} /></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}><Ionicons name="trash-outline" size={22} color="#ef4444" /></TouchableOpacity>
              </View>
            </View>
            {item.email && <Text style={{ color: sub }}>{item.email}</Text>}
            {item.username && <Text style={{ color: sub }}>@{item.username}</Text>}
            <View style={styles.passwordRow}>
              <Text style={{ color: sub }}>{visiblePasswords[item.id] ? item.password : '********'}</Text>
              <TouchableOpacity onPress={() => togglePassword(item.id)}>
                <Ionicons name={visiblePasswords[item.id] ? "eye-off-outline" : "eye-outline"} size={22} color={accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <FAB onPress={handleOpenAddModal} />
      <FormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSaveAccount}
        title={editingAccount ? "Edit Account" : "Add New Account"}
        fields={[
          { name: "name", label: "Account Name" },
          { name: "email", label: "Email" },
          { name: "username", label: "Username" },
          { name: "password", label: "Password", secure: true },
        ]}
        initialData={editingAccount || {}}
      />
      <FormModal
        visible={platformModalVisible}
        onClose={() => setPlatformModalVisible(false)}
        onSubmit={handleSavePlatform}
        title="Edit Platform Name"
        fields={[{ name: "name", label: "New Platform Name" }]}
        initialData={{ name: platform || '' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  card: { borderRadius: 16, padding: 20, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  passwordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(128,128,128,0.3)'},
});
