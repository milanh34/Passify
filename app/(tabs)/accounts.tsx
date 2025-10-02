import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import SchemaModal from "../../src/components/SchemaModal";
import { useTheme } from "../../src/context/ThemeContext";

type Account = { id: string; name: string; [k: string]: any };

export default function AccountsScreen() {
  const { platform, key: platformKey } = useLocalSearchParams<{ platform: string; key: string }>();
  const nav = useNavigation();
  const { colors } = useTheme();
  const { database, schemas, addAccount, updateAccount, deleteAccount, updatePlatformSchema } = useDb();

  const accounts: Account[] = useMemo(() => (platformKey ? database[String(platformKey)] || [] : []), [database, platformKey]);
  const schema = useMemo(() => (platformKey ? schemas[String(platformKey)] || ["name", "password"] : ["name", "password"]), [schemas, platformKey]);

  const [accModal, setAccModal] = useState<{ visible: boolean; editing?: Account }>({ visible: false });
  const [schemaModal, setSchemaModal] = useState(false);
  const [visiblePw, setVisiblePw] = useState<Record<string, boolean>>({});

  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      title: platform || "Accounts",
      headerRight: () => (
        <TouchableOpacity onPress={() => setSchemaModal(true)} style={{ marginRight: 12 }}>
          <Ionicons name="options-outline" size={22} color={colors.active} />
        </TouchableOpacity>
      ),
      headerStyle: { backgroundColor: colors.headerBg },
      headerTitleStyle: { color: colors.text, fontWeight: "800" },
      headerShadowVisible: false,
    });
  }, [platform, colors]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text || "");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openAdd = () => setAccModal({ visible: true });
  const openEdit = (a: Account) => setAccModal({ visible: true, editing: a });

  const onSaveAccount = (data: Record<string, string>) => {
    if (!platformKey) return;
    if (accModal.editing) {
      const updated = { ...accModal.editing, ...data };
      updateAccount(String(platformKey), accModal.editing.id, updated);
    } else {
      const payload: any = {};
      schema.forEach((f) => {
        if (f !== "id") payload[f] = data[f] || "";
      });
      addAccount(String(platformKey), payload);
    }
  };

  const onDelete = (id: string, name: string) =>
    Alert.alert("Delete Account", `Delete "${name || "this account"}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => platformKey && deleteAccount(String(platformKey), id) },
    ]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <FlatList
        data={accounts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name || "Untitled"}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <Ionicons name="pencil" size={18} color={colors.subtext} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id, item.name)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>

            {schema.map((field) => {
              if (field === "id" || field === "name") return null;
              const value = item[field] ?? "";
              const isPassword = field.toLowerCase().includes("password");
              return (
                <View key={field} style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: colors.subtext }]}>{field}</Text>
                  <View style={styles.rowBetween}>
                    <Text style={{ color: colors.text, flexShrink: 1 }}>
                      {isPassword ? (visiblePw[item.id] ? value : "••••••••") : String(value)}
                    </Text>
                    <View style={styles.fieldActions}>
                      {isPassword ? (
                        <TouchableOpacity onPress={() => setVisiblePw((p) => ({ ...p, [item.id]: !p[item.id] }))}>
                          <Ionicons name={visiblePw[item.id] ? "eye-off-outline" : "eye-outline"} size={22} color={colors.active} />
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity onPress={() => copyToClipboard(String(value))}>
                        <Ionicons name="copy-outline" size={20} color={colors.subtext} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: colors.subtext, textAlign: "center", marginTop: 24 }}>No accounts yet</Text>}
      />

      <FAB icon="options" onPress={() => setSchemaModal(true)} style={{ bottom: 100 }} color={colors.fab} />
      <FAB icon="add" onPress={openAdd} color={colors.fab} />

      <FormModal
        visible={accModal.visible}
        onClose={() => setAccModal({ visible: false })}
        onSubmit={onSaveAccount}
        title={accModal.editing ? "Edit Account" : "Add Account"}
        fields={schema
          .filter((f) => f !== "id")
          .map((f) => ({ name: f, label: f.charAt(0).toUpperCase() + f.slice(1), secure: f.toLowerCase() === "password" }))}
        initialData={accModal.editing || {}}
      />

      <SchemaModal
        visible={schemaModal}
        initialSchema={schema}
        onClose={() => setSchemaModal(false)}
        onSave={(fields) => {
          if (platformKey) updatePlatformSchema(String(platformKey), fields);
          setSchemaModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 6,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { padding: 8, borderRadius: 12 },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  fieldRow: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(127,127,127,0.25)" },
  fieldLabel: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 6 },
  fieldActions: { flexDirection: "row", gap: 16 },
});
