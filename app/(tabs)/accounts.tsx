import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import SchemaModal from "../../src/components/SchemaModal";
import DeleteModal from "../../src/components/DeleteModal";
import { PAGE_ANIMATION, CARD_ANIMATION } from "../../src/config/animations"; // IMPORT ANIMATIONS

type Account = { id: string; name: string; [k: string]: any };

export default function AccountsScreen() {
  const { platform, key: platformKey } = useLocalSearchParams<{ platform: string; key: string }>();
  const nav = useNavigation();
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const { database, schemas, addAccount, updateAccount, deleteAccount, updatePlatformSchema } = useDb();
  const insets = useSafeAreaInsets();

  const accounts: Account[] = useMemo(() => (platformKey ? database[String(platformKey)] || [] : []), [database, platformKey]);
  const schema = useMemo(() => (platformKey ? schemas[String(platformKey)] || ["name", "password"] : ["name", "password"]), [schemas, platformKey]);

  const [accModal, setAccModal] = useState<{ visible: boolean; editing?: Account }>({ visible: false });
  const [schemaModal, setSchemaModal] = useState(false);
  const [visiblePw, setVisiblePw] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; item?: any }>({ visible: false });
  
  // Add animation key for page re-animation
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation every time page is focused
  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      title: platform || "Accounts",
      headerTransparent: true,
      headerStyle: { height: 60 + insets.top },
      headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold },
      headerLeft: () => (
        <Pressable
          onPress={() => nav.goBack()}
          style={{ marginLeft: 15, backgroundColor: colors.card, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder }}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => setSchemaModal(true)}
          style={{ marginRight: 15, backgroundColor: colors.card, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder }}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      ),
    });
  }, [platform, colors, fontConfig, insets]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bg[0] }} />;

  const copyToClipboard = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text || "");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedField(key);
    setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1000);
  };

  const confirmDelete = (item: any) => setDeleteModal({ visible: true, item });

  const executeDelete = () => {
    if (deleteModal.item && platformKey) deleteAccount(String(platformKey), deleteModal.item.id);
  };

  const onSaveAccount = (data: Record<string, any>) => {
    if (!platformKey) return;
    if (accModal.editing) {
      updateAccount(String(platformKey), accModal.editing.id, { ...accModal.editing, ...data });
    } else {
      const payload: any = {};
      schema.forEach((f) => {
        if (f !== "id") payload[f] = data[f] || "";
      });
      addAccount(String(platformKey), payload);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <LinearGradient colors={colors.bg} style={{ flex: 1 }}>
        <MotiView
          key={animationKey} // Force re-animation on every visit
          from={PAGE_ANIMATION.from}
          animate={PAGE_ANIMATION.animate}
          transition={{
            type: PAGE_ANIMATION.type,
            duration: PAGE_ANIMATION.duration,
          }}
          style={[styles.root, { paddingTop: insets.top + 80 }]}
        >
          <FlatList
            data={accounts}
            keyExtractor={(a) => a.id}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            renderItem={({ item, index }) => (
              <MotiView
                key={`${item.id}-${animationKey}`} // Force re-animation with key change
                from={CARD_ANIMATION.from}
                animate={CARD_ANIMATION.animate}
                transition={{
                  type: CARD_ANIMATION.type,
                  duration: CARD_ANIMATION.duration,
                  delay: index * CARD_ANIMATION.staggerDelay,
                }}
              >
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                      {item.name || "Untitled"}
                    </Text>
                    <View style={styles.actions}>
                      <Pressable onPress={() => setAccModal({ visible: true, editing: item })} style={styles.iconBtn} android_ripple={{ color: colors.accent + "22" }}>
                        <Ionicons name="create-outline" size={20} color={colors.accent} />
                      </Pressable>
                      <Pressable onPress={() => confirmDelete(item)} style={styles.iconBtn} android_ripple={{ color: colors.danger + "22" }}>
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </Pressable>
                    </View>
                  </View>

                  {schema.map((field) => {
                    if (field === "id" || field === "name") return null;
                    const value = item[field] ?? "";
                    const isPassword = field.toLowerCase().includes("password");
                    const fieldKey = `${item.id}-${field}`;
                    const isCopied = copiedField === fieldKey;

                    return (
                      <View key={field} style={[styles.fieldRow, { borderTopColor: colors.cardBorder }]}>
                        <Text style={[styles.fieldLabel, { color: colors.subtext, fontFamily: fontConfig.bold }]}>{field}</Text>
                        <View style={styles.rowBetween}>
                          <Text style={{ color: colors.text, fontFamily: fontConfig.regular, flex: 1 }}>
                            {isPassword ? (visiblePw[item.id] ? String(value) : "••••••••") : String(value)}
                          </Text>
                          <View style={styles.fieldActions}>
                            {isPassword && (
                              <Pressable onPress={() => setVisiblePw((p) => ({ ...p, [item.id]: !p[item.id] }))} android_ripple={{ color: colors.accent + "22" }}>
                                <Ionicons name={visiblePw[item.id] ? "eye-off" : "eye"} size={20} color={colors.accent} />
                              </Pressable>
                            )}
                            <Pressable onPress={() => copyToClipboard(String(value), fieldKey)} android_ripple={{ color: colors.accent + "22" }}>
                              <Ionicons name={isCopied ? "checkmark-circle" : "copy-outline"} size={20} color={isCopied ? colors.success : colors.accent} />
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </MotiView>
            )}
            ListEmptyComponent={
              <MotiView
                key={`empty-${animationKey}`}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 300 }}
              >
                <Text style={{ color: colors.subtext, textAlign: "center", marginTop: 50, fontFamily: fontConfig.regular }}>
                  No accounts yet
                </Text>
              </MotiView>
            }
          />
          <FAB onPress={() => setAccModal({ visible: true })} icon="add" color={colors.fab} />
          <FormModal
            visible={accModal.visible}
            onClose={() => setAccModal({ visible: false })}
            onSubmit={onSaveAccount}
            title={accModal.editing ? "Edit Account" : "Add Account"}
            fields={schema.filter((f) => f !== "id").map((f) => ({ name: f, label: f.charAt(0).toUpperCase() + f.slice(1), secure: f.toLowerCase() === "password" }))}
            initialData={accModal.editing || {}}
          />
          <SchemaModal
            visible={schemaModal}
            currentSchema={schema}
            onClose={() => setSchemaModal(false)}
            onSave={(fields) => {
              if (platformKey) updatePlatformSchema(String(platformKey), fields);
              setSchemaModal(false);
            }}
          />
          <DeleteModal
            visible={deleteModal.visible}
            onClose={() => setDeleteModal({ visible: false })}
            onConfirm={executeDelete}
            title="Delete Account?"
            description={`Are you sure you want to delete the "${deleteModal.item?.name || "this"}" account? This action cannot be undone.`}
          />
        </MotiView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 18 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, overflow: "hidden" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconBtn: { padding: 8, borderRadius: 10 },
  cardTitle: { fontSize: 18 },
  fieldRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  fieldLabel: { fontSize: 12, textTransform: "uppercase", marginBottom: 6 },
  fieldActions: { flexDirection: "row", gap: 12 },
});
