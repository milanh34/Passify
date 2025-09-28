import { View, Text, StyleSheet, useColorScheme, Platform } from "react-native";

const cards = [
  { title: "Templates", desc: "Start from ready-made screens" },
  { title: "APIs", desc: "Connect backend & auth" },
  { title: "UI Kits", desc: "Compose beautiful components" },
];

export default function Explore() {
  const scheme = useColorScheme();
  const bg = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const card = scheme === "dark" ? "#0b1220" : "#ffffff";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const border = scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: text }]}>Explore</Text>
      <Text style={[styles.subtitle, { color: sub }]}>Quick ideas to expand your app.</Text>

      <View style={styles.grid}>
        {cards.map((c) => (
          <View key={c.title} style={[styles.tile, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.tileTitle, { color: text }]}>{c.title}</Text>
            <Text style={[styles.tileDesc, { color: sub }]}>{c.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }), paddingHorizontal: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 13, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "47.5%", borderRadius: 16, padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  tileTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  tileDesc: { fontSize: 12, lineHeight: 16 },
});
