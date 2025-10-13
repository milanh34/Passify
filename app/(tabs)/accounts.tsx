import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useLocalSearchParams, useNavigation, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, AnimatePresence } from "moti";
import { MotiPressable } from "moti/interactions";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { useAnimation } from "../../src/context/AnimationContext";
import FAB from "../../src/components/FAB";
import FormModal from "../../src/components/FormModal";
import SchemaModal from "../../src/components/SchemaModal";
import DeleteModal from "../../src/components/DeleteModal";

type Account = { id: string; name: string; [k: string]: any };

export default function AccountsScreen() {
  const { platform, key: platformKey } = useLocalSearchParams<{ platform: string; key: string }>();
  const nav = useNavigation();
  const { colors, fontConfig, fontsLoaded } = useTheme();
  const { database, schemas, addAccount, updateAccount, deleteAccount, updatePlatformSchema } = useDb();
  const { PAGE_ANIMATION, CARD_ANIMATION } = useAnimation();
  const insets = useSafeAreaInsets();

  const accounts: Account[] = useMemo(() => (platformKey ? database[String(platformKey)] || [] : []), [database, platformKey]);
  
  const schema = useMemo(() => {
    if (!platformKey) return ["name", "password"];
    const platformSchema = schemas[String(platformKey)];
    return platformSchema && Array.isArray(platformSchema) && platformSchema.length > 0 
      ? platformSchema 
      : ["name", "password"];
  }, [schemas, platformKey]);

  const [accModal, setAccModal] = useState<{ visible: boolean; editing?: Account }>({ visible: false });
  const [schemaModal, setSchemaModal] = useState(false);
  const [visiblePw, setVisiblePw] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; item?: any }>({ visible: false });
  const [animationKey, setAnimationKey] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey(prev => prev + 1);
      setExpandedCards(new Set());
      setVisiblePw({});
    }, [])
  );

  useEffect(() => {
    const handleSettingsPress = () => {
      setSchemaModal(true);
    };

    nav.setOptions({
      headerShown: true,
      title: platform || "Accounts",
      headerTransparent: true,
      headerStyle: { height: 60 + insets.top },
      headerTitleStyle: { color: colors.text, fontFamily: fontConfig.bold },
      headerLeft: () => (
        <Pressable
          onPress={() => nav.goBack()}
          style={{ 
            marginLeft: 15, 
            backgroundColor: colors.card, 
            padding: 8, 
            borderRadius: 10, 
            borderWidth: 1, 
            borderColor: colors.cardBorder,
          }}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSettingsPress}
          style={{ 
            marginRight: 15, 
            backgroundColor: colors.card, 
            padding: 8, 
            borderRadius: 10, 
            borderWidth: 1, 
            borderColor: colors.cardBorder,
          }}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      ),
    });
  }, [platform, colors, fontConfig, insets, nav, schema]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bg[0] }} />;

  // Show toast notification (NO vibrations)
  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const copyToClipboard = async (text: string, key: string) => {
    await Clipboard.setStringAsync(text || "");
    setCopiedField(key);
    setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1000);
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const confirmDelete = (item: any) => setDeleteModal({ visible: true, item });

  const executeDelete = () => {
    if (deleteModal.item && platformKey) {
      deleteAccount(String(platformKey), deleteModal.item.id);
      displayToast("Account deleted successfully");
    }
  };

  const onSaveAccount = (data: Record<string, any>) => {
    if (!platformKey) return;
    
    if (accModal.editing) {
      updateAccount(String(platformKey), accModal.editing.id, { ...accModal.editing, ...data });
      displayToast("Changes saved successfully");
    } else {
      const payload: any = {};
      schema.forEach((f) => {
        if (f !== "id") payload[f] = data[f] || "";
      });
      addAccount(String(platformKey), payload);
      displayToast("Account added successfully");
    }
    
    setAccModal({ visible: false });
  };

  const handleSaveSchema = (fields: string[]) => {
    if (platformKey && fields && fields.length > 0) {
      updatePlatformSchema(String(platformKey), fields);
      displayToast("Schema updated successfully");
    }
    setSchemaModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <LinearGradient colors={colors.bg} style={{ flex: 1 }}>
        <MotiView
          key={animationKey}
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
            renderItem={({ item, index }) => {
              const isExpanded = expandedCards.has(item.id);
              
              return (
                <MotiView
                  key={`${item.id}-${animationKey}`}
                  from={CARD_ANIMATION.from}
                  animate={CARD_ANIMATION.animate}
                  transition={{
                    type: CARD_ANIMATION.type,
                    duration: CARD_ANIMATION.duration,
                    delay: index * CARD_ANIMATION.staggerDelay,
                  }}
                >
                  {/* Animated card with scale effect */}
                  <MotiView
                    animate={{
                      scale: isExpanded ? 1 : 0.975,
                    }}
                    transition={{
                      type: "timing",
                      duration: 250,
                    }}
                  >
                    <Pressable
                      onPress={() => toggleCard(item.id)}
                      style={[
                        styles.card, 
                        { 
                          backgroundColor: colors.card, 
                          borderColor: isExpanded ? colors.accent : colors.cardBorder,
                          borderWidth: isExpanded ? 2 : 1,
                        }
                      ]}
                      android_ripple={{ color: colors.accent + "22" }}
                    >
                      <View style={styles.rowBetween}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
                            {item.name || "Untitled"}
                          </Text>
                          {!isExpanded && (
                            <Text style={{ color: colors.subtext, fontFamily: fontConfig.regular, fontSize: 12, marginTop: 4 }}>
                              Tap to view details
                            </Text>
                          )}
                        </View>
                        <View style={styles.actions}>
                          <Pressable 
                            onPress={(e) => {
                              e.stopPropagation();
                              setAccModal({ visible: true, editing: item });
                            }} 
                            style={styles.iconBtn} 
                            android_ripple={{ color: colors.accent + "22" }}
                          >
                            <Ionicons name="create-outline" size={20} color={colors.accent} />
                          </Pressable>
                          <Pressable 
                            onPress={(e) => {
                              e.stopPropagation();
                              confirmDelete(item);
                            }} 
                            style={styles.iconBtn} 
                            android_ripple={{ color: colors.danger + "22" }}
                          >
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                          </Pressable>
                          <MotiView
                            animate={{
                              rotate: isExpanded ? "180deg" : "0deg",
                            }}
                            transition={{
                              type: "timing",
                              duration: 300,
                            }}
                          >
                            <Ionicons 
                              name="chevron-down" 
                              size={20} 
                              color={colors.subtext}
                              style={{ marginLeft: 4 }}
                            />
                          </MotiView>
                        </View>
                      </View>

                      {/* Enhanced expand/collapse animation */}
                      <AnimatePresence>
                        {isExpanded && (
                          <MotiView
                            from={{ 
                              opacity: 0, 
                              height: 0,
                              translateY: -10,
                            }}
                            animate={{ 
                              opacity: 1, 
                              height: "auto",
                              translateY: 0,
                            }}
                            exit={{ 
                              opacity: 0, 
                              height: 0,
                              translateY: -10,
                            }}
                            transition={{ 
                              type: "timing", 
                              duration: 300,
                            }}
                          >
                            {schema.map((field, fieldIndex) => {
                              if (field === "id" || field === "name") return null;
                              const value = item[field] ?? "";
                              const isPassword = field.toLowerCase().includes("password");
                              const fieldKey = `${item.id}-${field}`;
                              const isCopied = copiedField === fieldKey;

                              return (
                                <MotiView
                                  key={field}
                                  from={{ opacity: 0, translateX: -20 }}
                                  animate={{ opacity: 1, translateX: 0 }}
                                  transition={{
                                    type: "timing",
                                    duration: 250,
                                    delay: fieldIndex * 50,
                                  }}
                                >
                                  <View style={[styles.fieldRow, { borderTopColor: colors.cardBorder }]}>
                                    <Text style={[styles.fieldLabel, { color: colors.subtext, fontFamily: fontConfig.bold }]}>
                                      {field}
                                    </Text>
                                    <View style={styles.rowBetween}>
                                      <Text style={{ color: colors.text, fontFamily: fontConfig.regular, flex: 1 }}>
                                        {isPassword ? (visiblePw[item.id] ? String(value) : "••••••••") : String(value)}
                                      </Text>
                                      <View style={styles.fieldActions}>
                                        {isPassword && (
                                          <Pressable 
                                            onPress={(e) => {
                                              e.stopPropagation();
                                              setVisiblePw((p) => ({ ...p, [item.id]: !p[item.id] }));
                                            }} 
                                            android_ripple={{ color: colors.accent + "22" }}
                                          >
                                            <Ionicons name={visiblePw[item.id] ? "eye-off" : "eye"} size={20} color={colors.accent} />
                                          </Pressable>
                                        )}
                                        <Pressable 
                                          onPress={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(String(value), fieldKey);
                                          }} 
                                          android_ripple={{ color: colors.accent + "22" }}
                                        >
                                          <Ionicons name={isCopied ? "checkmark-circle" : "copy-outline"} size={20} color={isCopied ? colors.success : colors.accent} />
                                        </Pressable>
                                      </View>
                                    </View>
                                  </View>
                                </MotiView>
                              );
                            })}
                          </MotiView>
                        )}
                      </AnimatePresence>
                    </Pressable>
                  </MotiView>
                </MotiView>
              );
            }}
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
          
          {/* Toast Notification */}
          <AnimatePresence>
            {showToast && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 20 }}
                transition={{ type: "timing", duration: 300 }}
                style={[styles.toast, { 
                  backgroundColor: colors.success || colors.accent,
                  bottom: insets.bottom + 90,
                }]}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.toastText, { fontFamily: fontConfig.bold }]}>
                  {toastMessage}
                </Text>
              </MotiView>
            )}
          </AnimatePresence>

          <FAB onPress={() => setAccModal({ visible: true })} icon="add" color={colors.fab} />
          <FormModal
            visible={accModal.visible}
            onClose={() => setAccModal({ visible: false })}
            onSubmit={onSaveAccount}
            title={accModal.editing ? "Edit Account" : "Add Account"}
            fields={schema.filter((f) => f !== "id").map((f) => ({ 
              name: f, 
              label: f.charAt(0).toUpperCase() + f.slice(1), 
              secure: false
            }))}
            initialData={accModal.editing || {}}
          />
          <SchemaModal
            visible={schemaModal}
            currentSchema={schema}
            onClose={() => setSchemaModal(false)}
            onSave={handleSaveSchema}
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
  card: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    overflow: "hidden" 
  },
  rowBetween: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  actions: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 
  },
  iconBtn: { 
    padding: 8, 
    borderRadius: 10 
  },
  cardTitle: { 
    fontSize: 18 
  },
  fieldRow: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1 
  },
  fieldLabel: { 
    fontSize: 12, 
    textTransform: "uppercase", 
    marginBottom: 6 
  },
  fieldActions: { 
    flexDirection: "row", 
    gap: 12 
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
  },
});
