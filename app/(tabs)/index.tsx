import * as React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useColorScheme, Platform, StyleSheet as RN } from "react-native";
import { Link, useRouter } from "expo-router";

type DB = Record<string, any[]>;

export default function PlatformListScreen() {
  const scheme = useColorScheme();
  const router = useRouter();
  const [data, setData] = React.useState<DB>({});

  React.useEffect(() => {
    const db = require("../../assets/database.json") as DB;
    setData(db);
  }, []);

  const platforms = React.useMemo(() => Object.keys(data), [data]);

  const bgTop = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const bgBottom = scheme === "dark" ? "#0b1220" : "#eef2ff";
  const card = scheme === "dark" ? "#0b1220" : "#ffffff";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const border = scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const accent = scheme === "dark" ? "#22d3ee" : "#4f46e5";

  return (
    <View style={styles.root}>
      <View style={[RN.absoluteFill, { backgroundColor: bgTop }]} />
      <View style={[styles.bgBottom, { backgroundColor: bgBottom }]} />

      <View style={styles.header}>
        <View style={[styles.pill, { backgroundColor: scheme === "dark" ? "rgba(34,211,238,0.12)" : "rgba(79,70,229,0.12)" }]}>
          <Text style={{ color: accent, fontWeight: "800", fontSize: 12 }}>Password Manager</Text>
        </View>
        <Text style={{ color: accent, fontWeight: "900", fontSize: 22 }}>◎</Text>
      </View>

      <Text style={[styles.title, { color: text }]}>Your Platforms</Text>
      <Text style={[styles.subtitle, { color: sub }]}>Tap a platform to view accounts.</Text>

      <FlatList
        data={platforms}
        keyExtractor={(k) => k}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => {
          const label = item.charAt(0).toUpperCase() + item.slice(1);
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: card, borderColor: border }]}
              activeOpacity={0.75}
              onPress={() =>
                router.push({ pathname: "/(tabs)/accounts", params: { platform: label, key: item } })
              }
            >
              <Text style={[styles.cardTitle, { color: text }]}>{label}</Text>
              <Text style={[styles.cardSub, { color: sub }]}>{data[item]?.length ?? 0} accounts</Text>
            </TouchableOpacity>
          );
        }}
      />

      <Link href="/encoder" asChild>
        <TouchableOpacity style={[styles.button, { backgroundColor: accent }]} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Go to Encoder</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }), paddingHorizontal: 20, gap: 12 },
  bgBottom: { position: "absolute", left: 0, right: 0, bottom: 0, height: "55%", borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  header: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 13, marginBottom: 12 },
  card: {
    borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth, marginBottom: 12,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardSub: { fontSize: 12, marginTop: 4 },
  button: { marginTop: 8, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignSelf: "flex-start" },
  buttonText: { color: "#fff", fontWeight: "800", letterSpacing: 0.4 },
});
