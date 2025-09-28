import { View, Text, StyleSheet, Switch, useColorScheme, Platform } from "react-native";
import { useState } from "react";

export default function Settings() {
  const scheme = useColorScheme();
  const [hints, setHints] = useState(true);
  const bg = scheme === "dark" ? "#0f172a" : "#f8fafc";
  const card = scheme === "dark" ? "#0b1220" : "#ffffff";
  const text = scheme === "dark" ? "#e5e7eb" : "#0f172a";
  const sub = scheme === "dark" ? "rgba(229,231,235,0.75)" : "rgba(15,23,42,0.65)";
  const border = scheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: text }]}>Settings</Text>

      <View style={[styles.row, { backgroundColor: card, borderColor: border }]}>
        <Text style={[styles.rowTitle, { color: text }]}>Hints</Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: sub, fontSize: 12, marginBottom: 4 }}>
            Show helpful tips in UI
          </Text>
          <Switch value={hints} onValueChange={setHints} />
        </View>
      </View>

      <View style={[styles.row, { backgroundColor: card, borderColor: border }]}>
        <Text style={[styles.rowTitle, { color: text }]}>Theme</Text>
        <Text style={{ color: sub }}>{scheme === "dark" ? "Dark" : "Light"} (system)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: Platform.select({ ios: 64, android: 48, default: 48 }), paddingHorizontal: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  row: {
    borderRadius: 16, padding: 16, borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  rowTitle: { fontSize: 16, fontWeight: "800" },
});
