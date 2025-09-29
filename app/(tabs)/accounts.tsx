import * as React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, useColorScheme, Platform } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";

type Account = { id: string; name: string; email?: string; username?: string; password: string };

export default function AccountsScreen() {
  const scheme = useColorScheme();
  const params = useLocalSearchParams<{ platform: string; key: string }>();
  const navigation = useNavigation();
  const db = require("../../assets/database.json") as Record<string, Account[]>;
  const accounts: Account[] = params.key ? db[String(params.key)] ?? [] : [];

  React.useEffect(() => {
    if (params.platform) {
      navigation.setOptions?.({ title: params.platform });
    }
  }, [params.platform]);

  const [visibleMap, setVisibleMap] = React.useState<Record<string, boolean>>({});
  const toggle = (id: string) => setVisibleMap((m) => ({ ...m, [id]: !m[id] }));

  const bg = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const card = scheme === "dark" ? "#0b1220" : "#ffffff";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const border = scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const accent = scheme === "dark" ? "#22d3ee" : "#4f46e5";

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <FlatList
        data={accounts}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 0 }}
        renderItem={({ item }) => {
          const isVisible = !!visibleMap[item.id];
          return (
            <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.cardTitle, { color: text }]}>{item.name}</Text>
              {item.email ? <Text style={[styles.cardLine, { color: sub }]}>{item.email}</Text> : null}
              {item.username ? <Text style={[styles.cardLine, { color: sub }]}>@{item.username}</Text> : null}
              <View style={styles.row}>
                <Text style={[styles.cardLine, { color: sub }]}>{isVisible ? item.password : "********"}</Text>
                <TouchableOpacity onPress={() => toggle(item.id)} activeOpacity={0.7}>
                  <Text style={{ color: accent, fontWeight: "800" }}>{isVisible ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: sub, textAlign: "center", marginTop: 24 }}>No accounts found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }), paddingHorizontal: 20 },
  card: {
    borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, marginBottom: 12,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  cardLine: { fontSize: 13, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
